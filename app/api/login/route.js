// /app/api/login/route.js
import { NextResponse } from 'next/server';
import pool from '../../database/db';

export async function POST(req) {
  try {
    const body = await req.json();
    const email = body?.email?.trim().toLowerCase();
    const password = body?.password?.trim();

    if (!email || !password) {
      return NextResponse.json({ message: 'กรุณาระบุอีเมลและรหัสผ่าน' }, { status: 400 });
    }

    const [users] = await pool.query(
      'SELECT id, name, email, role, password FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return NextResponse.json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const user = users[0];

    if (user.password !== password) {
      return NextResponse.json({ message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    }

    const response = NextResponse.json({
      success: true,
      user_id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    });

    // ✅ ตั้ง session cookie (HttpOnly + 1 วัน)
    response.headers.set(
      'Set-Cookie',
      `session_user=${user.id}; Path=/; HttpOnly; Max-Age=86400; SameSite=Lax`
    );

    return response;

  } catch (error) {
    console.error('❌ Login error:', error.message);
    return NextResponse.json({ message: 'เกิดข้อผิดพลาดในการเข้าสู่ระบบ' }, { status: 500 });
  }
}
