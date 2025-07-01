'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateAcc({ onSuccess }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCreateAcc = async () => {
    const { name, email, phone, password } = form;
    if (!name || !email || !phone || !password) {
      toast.error('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || 'ไม่สามารถสร้างบัญชีได้');
        return;
      }

      toast.success('สร้างบัญชีสำเร็จ 🎉');

      // ✅ เข้าสู่ระบบอัตโนมัติ
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!loginRes.ok) {
        toast.error('ไม่สามารถเข้าสู่ระบบอัตโนมัติ');
        router.push('/login');
        return;
      }

      // ✅ ไปหน้า home ทันที
      if (typeof onSuccess === 'function') {
        onSuccess(); // ถ้าจะปิด modal และให้หน้าหลักจัดการ redirect
      } else {
        router.push('/home'); // fallback
      }
    } catch (err) {
      console.error('Create account error:', err);
      toast.error('เกิดข้อผิดพลาดในการสร้างบัญชี');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white p-6 rounded-lg shadow">
      <h2 className="text-lg font-semibold mb-4 text-gray-800">สร้างบัญชีผู้ใช้</h2>
      {['name','phone','email','password'].map((field) => (
        <div key={field} className="mb-3">
          <label className="block text-sm text-gray-700 mb-1 capitalize">{field}</label>
          <input
            type={field === 'password' ? 'password' : field === 'email' ? 'email' : 'text'}
            name={field}
            value={form[field]}
            onChange={handleChange}
            className="w-full border rounded px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button
        onClick={handleCreateAcc}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? 'กำลังสร้างบัญชี...' : 'สร้างบัญชี'}
      </button>
    </div>
  );
}
