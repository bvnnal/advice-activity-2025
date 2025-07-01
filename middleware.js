// middleware.js (ไว้ที่ root directory ของโปรเจกต์)
import { NextResponse } from 'next/server';

export function middleware(req) {
  const session = req.cookies.get('session_user');
  const url = req.nextUrl.clone();

  // ป้องกันเข้า /home โดยไม่ได้ login
  if (!session && url.pathname.startsWith('/home')) {
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/home/:path*'], // ใช้กับทุก path ที่ขึ้นต้นด้วย /home
};
