'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/users'); // ✅ ดึงจาก session (cookies)
        if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้');
        const userData = await res.json();
        setUser(userData);
        setName(userData.name || '');
      } catch (err) {
        alert('หมดเวลาเข้าสู่ระบบ โปรดเข้าสู่ระบบใหม่');
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleSave = async () => {
    if (!name.trim()) return alert('กรุณากรอกชื่อผู้ใช้');
    setSaving(true);
    try {
      const res = await fetch(`/api/users`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user.id, name: name.trim(), password }),
      });

      if (!res.ok) throw new Error('ไม่สามารถอัปเดตข้อมูลได้');
      alert('✅ บันทึกข้อมูลเรียบร้อยแล้ว');
    } catch (err) {
      alert('❌ เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="p-6 text-center">กำลังโหลดข้อมูลผู้ใช้...</p>;

  if (!user) return null;

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-xl font-bold mb-6">👤 แก้ไขข้อมูลผู้ใช้</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded-md focus:ring focus:ring-blue-200 text-sm"
            value={name}
            onChange={e => setName(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">อีเมล (อ่านอย่างเดียว)</label>
          <input
            type="email"
            className="w-full px-4 py-2 border rounded-md bg-gray-100 text-sm"
            value={user.email}
            readOnly
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่านใหม่ (ถ้าต้องการเปลี่ยน)</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded-md text-sm"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
          />
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-md transition mt-4"
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
        </button>
      </div>
    </div>
  );
}
