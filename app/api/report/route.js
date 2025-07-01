import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../database/db';

export async function GET(req) {
  const url = new URL(req.url);
  const role = url.searchParams.get('role') || 'user';
  const eventId = url.searchParams.get('eventId') || url.searchParams.get('event_id');
  let userId = url.searchParams.get('userId') || url.searchParams.get('user_id');
  const mode = url.searchParams.get('mode');

  const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

  try {
    // 📋 รายงานกิจกรรมที่เข้าร่วมของผู้ใช้คนเดียว (user + mode=user)
    if (role === 'user' && mode === 'user') {
      if (!userId) {
        const cookieStore = cookies(); // ✅ async-safe แล้ว
        userId = cookieStore.get('session_user')?.value;
      }

      if (!userId) return NextResponse.json({ message: 'ไม่ได้ระบุ userId' }, { status: 400 });

      const [rows] = await pool.query(
        `SELECT j.id AS id_ac, e.title AS name_ac, e.date_start, e.date_end, j.status
         FROM joins j
         JOIN events e ON j.event_id = e.id
         WHERE j.user_id = ?
         ORDER BY e.date_start DESC`,
        [userId]
      );

      return NextResponse.json(rows);
    }

    // 🧩 รายงานกิจกรรมเดียว (ผู้ใช้ทั่วไป)
    if (role === 'user' && eventId) {
      const [[event]] = await pool.query(
        `SELECT e.id, e.title, e.description, e.type, e.date_start, e.date_end, e.max_participants,
                (SELECT COUNT(*) FROM joins WHERE event_id = e.id AND status != 'ยกเลิก') AS current_participants
         FROM events e
         WHERE e.id = ?`,
        [eventId]
      );

      if (!event) return NextResponse.json({ message: 'ไม่พบกิจกรรม' }, { status: 404 });

      const [participants] = await pool.query(
        `SELECT u.name
         FROM joins j
         JOIN users u ON j.user_id = u.id
         WHERE j.event_id = ? AND j.status != 'ยกเลิก'`,
        [eventId]
      );

      return NextResponse.json({ ...event, participants });
    }

    // 📊 รายงานรวมของผู้ใช้คนเดียว (ผู้ใช้ทั่วไป)
    if (role === 'user' && userId && !eventId) {
      const [[summary]] = await pool.query(
        `SELECT
           (SELECT COUNT(*) FROM events WHERE CURDATE() <= date_end) AS open,
           (SELECT COUNT(*) FROM joins WHERE user_id = ? AND status != 'ยกเลิก') AS joined,
           (SELECT COUNT(*) FROM joins WHERE user_id = ? AND status = 'ลงทะเบียนสำเร็จ') AS confirmed,
           (SELECT COUNT(*) FROM events) AS total`,
        [userId, userId]
      );

      return NextResponse.json(summary);
    }

    // 🛠 รายงานกิจกรรมเดียว (แอดมิน)
    if (role === 'admin' && eventId) {
      const [[event]] = await pool.query(
        `SELECT e.id, e.title, e.type, e.description, e.date_start, e.date_end, e.max_participants,
                (SELECT COUNT(*) FROM joins WHERE event_id = e.id AND status != 'ยกเลิก') AS current_participants,
                (SELECT COUNT(*) FROM joins WHERE event_id = e.id AND status = 'ลงทะเบียนสำเร็จ') AS approved_count
         FROM events e
         WHERE e.id = ?`,
        [eventId]
      );

      if (!event) return NextResponse.json({ message: 'ไม่พบกิจกรรม' }, { status: 404 });

      const [reportRaw] = await pool.query(
        `SELECT j.id, u.name, u.email, u.phone, j.status, j.image_url, j.registered_at
         FROM joins j
         JOIN users u ON j.user_id = u.id
         WHERE j.event_id = ?
         ORDER BY j.registered_at DESC`,
        [eventId]
      );

      const report = reportRaw.map(row => ({
        id: row.id,
        name: row.name,
        email: row.email,
        phone: row.phone,
        status: row.status,
        registered_at: row.registered_at,
        image_url: row.image_url ? `${BASE_URL}${row.image_url}` : null,
      }));

      return NextResponse.json({ ...event, report });
    }

    // 📋 รายงานรวมทุกกิจกรรม (แอดมิน)
    if (role === 'admin' && !eventId) {
      const [events] = await pool.query(`
        SELECT e.id, e.title, e.type, e.date_start, e.date_end, e.max_participants,
          (SELECT COUNT(*) FROM joins WHERE event_id = e.id AND status != 'ยกเลิก') AS current_participants,
          (SELECT COUNT(*) FROM joins WHERE event_id = e.id AND status = 'ลงทะเบียนสำเร็จ') AS approved_count
        FROM events e
        ORDER BY e.date_start DESC
      `);

      return NextResponse.json({ summary: events });
    }

    return NextResponse.json({ message: 'พารามิเตอร์ไม่ถูกต้อง' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in /api/report:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' }, { status: 500 });
  }
}
