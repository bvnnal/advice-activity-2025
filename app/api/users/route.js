export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import pool from '../../database/db';

// ✅ GET - ดึงข้อมูลผู้ใช้
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    let userId = Number(searchParams.get('userId'));

    if (!userId) {
      const cookieStore = await cookies(); // ✅ แก้ตรงนี้
      const cookieUserId = cookieStore.get('session_user')?.value;
      userId = Number(cookieUserId);
    }

    if (!Number.isInteger(userId) || userId <= 0) {
      return NextResponse.json({ message: 'userId ไม่ถูกต้อง' }, { status: 400 });
    }

    const [rows] = await pool.query(
      'SELECT id, name, email, phone, role FROM users WHERE id = ?',
      [userId]
    );

    if (rows.length === 0) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้งาน' }, { status: 404 });
    }

    return NextResponse.json(rows[0]);
  } catch (error) {
    console.error('❌ Error fetching user:', error.message);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้' }, { status: 500 });
  }
}


// ✅ POST - สร้างบัญชี
export async function POST(req) {
  try {
    const body = await req.json();
    const name = body.name?.trim() || 'ไม่ระบุชื่อ';
    const email = body.email?.trim();
    const phone = body.phone?.trim();
    const password = body.password?.trim();

    // 🛑 ตรวจสอบข้อมูลจำเป็น
    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณากรอกอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    // 🔍 ตรวจอีเมลซ้ำ
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return NextResponse.json({ message: 'อีเมลนี้ถูกใช้งานแล้ว' }, { status: 409 });
    }

    // ✅ เพิ่มผู้ใช้ใหม่
    const [result] = await pool.query(
      'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone, password, 'user']
    );

    return NextResponse.json({
      success: true,
      user_id: result.insertId,
      role: 'user',
    });

  } catch (error) {
    console.error('❌ Error creating user:', error.message);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการสร้างบัญชี' }, { status: 500 });
  }
}

// ✅ PUT - อัปเดตชื่อหรือรหัสผ่าน
export async function PUT(req) {
  try {
    const body = await req.json();
    const { id, name, password } = body;

    if (!id || !name?.trim()) {
      return NextResponse.json({ message: 'กรุณาระบุ id และชื่อผู้ใช้' }, { status: 400 });
    }

    const fields = ['name'];
    const values = [name.trim()];

    if (password?.trim()) {
      fields.push('password');
      values.push(password.trim());
    }

    const setClause = fields.map(f => `${f} = ?`).join(', ');
    values.push(id);

    const [result] = await pool.query(
      `UPDATE users SET ${setClause} WHERE id = ?`,
      values
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ message: 'ไม่พบผู้ใช้ที่ต้องการอัปเดต' }, { status: 404 });
    }

    return NextResponse.json({ success: true, updatedId: id });
  } catch (error) {
    console.error('❌ Error updating user:', error.message);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการอัปเดตข้อมูลผู้ใช้' }, { status: 500 });
  }
}
