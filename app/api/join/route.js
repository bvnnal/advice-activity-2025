import fs from 'fs';
import { writeFileSync } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import pool from '../../database/db';

const uploadDir = path.join(process.cwd(), 'public', 'uploads');
const allowedStatuses = ['รอดำเนินการ', 'ลงทะเบียนสำเร็จ', 'ยกเลิกการลงทะเบียน'];

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ✅ PUT - อัปเดตสถานะ
export async function PUT(req) {
  try {
    const body = await req.json();
    const { join_id, status } = body;

    if (!status || !allowedStatuses.includes(status)) {
      return NextResponse.json({ message: 'สถานะไม่ถูกต้อง' }, { status: 400 });
    }

    if (Array.isArray(join_id) && join_id.length > 0) {
      const placeholders = join_id.map(() => '?').join(',');
      await pool.query(
        `UPDATE joins SET status = ? WHERE id IN (${placeholders})`,
        [status, ...join_id]
      );
    } else if (typeof join_id === 'number') {
      await pool.query('UPDATE joins SET status = ? WHERE id = ?', [status, join_id]);
    } else {
      return NextResponse.json({ message: 'join_id ไม่ถูกต้อง' }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error updating status:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดตสถานะ' }, { status: 500 });
  }
}

// ✅ PATCH = PUT
export async function PATCH(req) {
  return PUT(req);
}

// ✅ GET - joins ของผู้ใช้
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = Number(searchParams.get('userId'));

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: 'userId ไม่ถูกต้อง' }, { status: 400 });
    }

    const [rows] = await pool.query('SELECT * FROM joins WHERE user_id = ?', [userId]);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('❌ Error fetching joins:', error);
    return NextResponse.json({ message: 'ไม่สามารถดึงข้อมูลการเข้าร่วมได้' }, { status: 500 });
  }
}

// ✅ POST - ลงทะเบียนกิจกรรม หรือ สมัคร หรือ ล็อกอิน
export async function POST(req) {
  try {
    const body = await req.json();

    // ✅ ลงทะเบียนผู้ใช้ใหม่
    if (body?.action === 'register') {
      const { name = '', email = '', phone = '', password = '' } = body;

      if (!email.trim() || !password.trim()) {
        return NextResponse.json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
      }

      const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email.trim()]);
      if (existing.length > 0) {
        return NextResponse.json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
      }

      await pool.query(
        'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
        [name.trim(), email.trim(), phone.trim(), password.trim(), 'user']
      );

      return NextResponse.json({ success: true, message: 'สร้างบัญชีสำเร็จ' });
    }

    // ✅ ล็อกอินผู้ใช้
    if (body?.action === 'login') {
      const { email = '', password = '' } = body;

      const [users] = await pool.query(
        'SELECT id, name, email, role, password FROM users WHERE email = ?',
        [email.trim()]
      );

      if (users.length === 0 || users[0].password !== password.trim()) {
        return NextResponse.json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 400 });
      }

      const user = users[0];
      return NextResponse.json({
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      });
    }

    // ✅ ลงทะเบียนกิจกรรม
    if (body?.action === 'join') {
      let { user_id, event_id, email = '', phone = '', image_base64 } = body;
      user_id = Number(user_id);
      event_id = Number(event_id);

      if (!user_id || !event_id || !email.trim() || !phone.trim()) {
        return NextResponse.json({ message: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 });
      }

      const [exists] = await pool.query(
        'SELECT id FROM joins WHERE user_id = ? AND event_id = ?',
        [user_id, event_id]
      );
      if (exists.length > 0) {
        return NextResponse.json({ message: 'คุณได้ลงทะเบียนกิจกรรมนี้แล้ว' }, { status: 409 });
      }

      let imageUrl = null;
      if (image_base64?.startsWith('data:image')) {
        try {
          const base64Data = image_base64.replace(/^data:image\/\w+;base64,/, '');
          const buffer = Buffer.from(base64Data, 'base64');
          const fileName = `join_${user_id}_${event_id}_${Date.now()}.jpg`;
          const filePath = path.join(uploadDir, fileName);
          writeFileSync(filePath, buffer);
          imageUrl = `/uploads/${fileName}`;
        } catch (err) {
          console.error('❌ Error saving image:', err);
          return NextResponse.json({ message: 'ไม่สามารถบันทึกรูปภาพได้' }, { status: 500 });
        }
      }

      await pool.query(
        'INSERT INTO joins (user_id, event_id, email, phone, image_url, status) VALUES (?, ?, ?, ?, ?, ?)',
        [user_id, event_id, email.trim(), phone.trim(), imageUrl, 'รอดำเนินการ']
      );

      return NextResponse.json({ success: true, image_url: imageUrl });
    }

    return NextResponse.json({ message: 'action ไม่ถูกต้องหรือไม่รองรับ' }, { status: 400 });

  } catch (error) {
    console.error('❌ Error in POST /api/join:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการประมวลผล' }, { status: 500 });
  }
}

// ✅ DELETE - ยกเลิกการเข้าร่วม
export async function DELETE(req) {
  try {
    const body = await req.json();
    const { user_id, event_id } = body;

    if (!Number.isInteger(user_id) || !Number.isInteger(event_id)) {
      return NextResponse.json({ message: 'Missing user_id หรือ event_id' }, { status: 400 });
    }

    await pool.query('DELETE FROM joins WHERE user_id = ? AND event_id = ?', [user_id, event_id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Error deleting join:', error);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการยกเลิกการเข้าร่วม' }, { status: 500 });
  }
}
