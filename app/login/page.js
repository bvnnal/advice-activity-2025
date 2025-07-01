'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateAcc from '../home/components/CreateAcc';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!email.trim() || !password.trim()) return setError('กรุณากรอกอีเมลและรหัสผ่าน');

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() }),
      });

      const data = await res.json();
      if (!res.ok) return setError(data.message || 'เข้าสู่ระบบไม่สำเร็จ');
      router.push('/home');
    } catch (err) {
      console.error('Login error:', err);
      setError('เกิดข้อผิดพลาดในระบบ');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-sm relative">
        <h2 className="text-xl font-bold text-center mb-4 text-blue-700">เข้าสู่ระบบ</h2>

        <input
          type="email"
          placeholder="อีเมล"
          className="w-full p-2 mb-3 border rounded"
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

        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}

        <button onClick={handleLogin} className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 mb-2">
          เข้าสู่ระบบ
        </button>
        <button onClick={() => setShowCreateModal(true)} className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700">
          สร้างบัญชี
        </button>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button
              onClick={() => setShowCreateModal(false)}
              className="absolute top-2 right-3 text-gray-600 hover:text-black"
            >
              ✖
            </button>
            <CreateAcc onSuccess={() => { setShowCreateModal(false); router.push('/login'); }} />
          </div>
        </div>
      )}
    </div>
  );
}
