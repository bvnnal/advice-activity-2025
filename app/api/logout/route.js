// app/api/logout/route.js

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({
      success: true,
      message: 'ออกจากระบบเรียบร้อยแล้ว',
    });

    // ✅ ลบ cookie โดยตั้งค่า maxAge: 0 ผ่าน response.cookies.set
    response.cookies.set('session_user', '', {
      path: '/',
      httpOnly: true,
      maxAge: 0,
    });

    return response;
  } catch (error) {
    console.error('❌ Error during logout:', error);
    return NextResponse.json(
      { success: false, message: 'เกิดข้อผิดพลาดในการออกจากระบบ' },
      { status: 500 }
    );
  }
}
