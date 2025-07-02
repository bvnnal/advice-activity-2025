import { NextResponse } from 'next/server';
import pool from '../../database/db';

// ✅ GET - ดึงข้อมูลกิจกรรม หรือคำแนะนำ
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const role = searchParams.get('role') || 'user';
    const search = searchParams.get('search')?.trim() || '';
    const suggest = searchParams.get('suggest')?.trim() || '';
    const expired = searchParams.get('expired') === 'true';
    const status = searchParams.get('status'); // ✅ new
    const isAdmin = role === 'admin';

    if (suggest) {
      const [rows] = await pool.query(
        `SELECT DISTINCT title FROM events WHERE title LIKE ? ORDER BY title LIMIT 10`,
        [`%${suggest}%`]
      );
      const keywords = rows.map(row => row.title);
      return NextResponse.json({ keywords });
    }
    let query = `
      SELECT 
        e.id, e.title, e.description, e.type, 
        e.date_start, e.date_end, e.max_participants,
        e.status,
        COUNT(j.id) AS current_participants
      FROM events e
      LEFT JOIN joins j ON j.event_id = e.id AND j.status = 'ลงทะเบียนสำเร็จ'
    `;

    const conditions = [];
    const values = [];

    if (status && status !== 'all') {
      conditions.push('e.status = ?');
      values.push(status);
    } else if (!isAdmin && !expired) {
      conditions.push('DATE(e.date_end) >= CURDATE()');
    }

    if (search) {
      conditions.push('(e.title LIKE ? OR e.description LIKE ? OR e.type LIKE ?)');
      values.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' GROUP BY e.id ORDER BY e.date_start ASC';

    const [rows] = await pool.query(query, values);
    return NextResponse.json(rows);

  } catch (error) {
    console.error('❌ Error fetching events:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลกิจกรรม' }, { status: 500 });
  }
}


// ✅ POST - สร้างกิจกรรม
export async function POST(req) {
  try {
    const body = await req.json();
    const { title, description, type, date_start, date_end, max_participants } = body;

    if (!title || !date_start || !date_end || !max_participants) {
      return NextResponse.json({
        message: 'กรุณากรอกข้อมูลกิจกรรมให้ครบถ้วน (title, date_start, date_end, max_participants)'
      }, { status: 400 });
    }

    const [result] = await pool.query(
      `INSERT INTO events (title, description, type, date_start, date_end, max_participants)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title.trim(), description?.trim(), type?.trim(), date_start, date_end, Number(max_participants)]
    );

    return NextResponse.json({ success: true, insertedId: result.insertId });
  } catch (err) {
    console.error('❌ Error inserting into DB:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการเพิ่มกิจกรรม' }, { status: 500 });
  }
}

// ✅ PUT - แก้ไขกิจกรรม
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, title, description, type, date_start, date_end, max_participants } = body;

    if (!id || !title || !date_start || !date_end || !max_participants) {
      return NextResponse.json({ message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
    }

    const [result] = await pool.query(
      `UPDATE events SET title = ?, description = ?, type = ?, date_start = ?, date_end = ?, max_participants = ? WHERE id = ?`,
      [title.trim(), description?.trim(), type?.trim(), date_start, date_end, Number(max_participants), id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่พบกิจกรรมที่ต้องการแก้ไข' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedId: id });
  } catch (err) {
    console.error('❌ Error updating event:', err);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการแก้ไขกิจกรรม' }, { status: 500 });
  }
}
