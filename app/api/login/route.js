import { NextResponse } from 'next/server';
import pool from "@/app/database/db"

export async function POST(request) {
    
    try {
        const body = await request.json();
        const {email,password} = body;
        
        if (rows.length === 0) {
            return NextResponse.json({ success: false, message: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' },{ status: 401 });
        }

        const user = rows[0];
        return NextResponse.json({success: true,userId: user.id,role: user.role,body,
            message: user.role === 'admin' ? 'แอดมินเข้าสู่ระบบแล้ว' : 'เข้าสู่ระบบสำเร็จ',
        }); 
        
        return NextResponse.json({ success: true, message: 'SUSCESS' }, { status: 200 });
    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาดในระบบ' }, { status: 500 });
    }
}

