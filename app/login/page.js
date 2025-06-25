'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        try {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (!res.ok) {
            setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
            return;
        }

        // ✅ ตรวจ role แล้ว redirect
        if (data.role === 'admin') {
            router.push('/home/admin');
        } else {
            router.push('/home/user');
        }
        } catch (err) {
        console.error('Login error:', err);
        setError('เกิดข้อผิดพลาดในระบบ');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded shadow-md w-full max-w-sm">
            <h2 className="text-xl font-bold text-center mb-4 text-blue-700">เข้าสู่ระบบ</h2>

            <input
            type="email"
            placeholder="อีเมล"
            className="w-full p-2 mb-4 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            />
            <input
            type="password"
            placeholder="รหัสผ่าน"
            className="w-full p-2 mb-4 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            />

            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

            <button
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
            onClick={handleLogin}
            >
            เข้าสู่ระบบ
            </button>
        </div>
        </div>
    );
}
