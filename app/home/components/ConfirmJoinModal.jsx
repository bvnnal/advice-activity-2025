'use client';

import { useState, useEffect, useRef } from 'react';
import { getUserId, getUserData } from '@/utils/storage'; // ✅ getUserId ต้อง async
import { toast } from 'react-hot-toast';

export default function ConfirmJoinModal({ confirmData, setConfirmData, onClose, onSubmitSuccess }) {
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [userId, setUserId] = useState(null); // ✅ state สำหรับเก็บ user_id
  const fileInputRef = useRef();

  const localUser = getUserData?.() || {};

  useEffect(() => {
    // ✅ ดึง user id จาก session/cookie ผ่าน async
    const fetchUserId = async () => {
      const id = await getUserId();
      if (!id) toast.error('ไม่พบข้อมูลผู้ใช้');
      setUserId(id);
    };
    fetchUserId();
  }, []);

  const handleConfirm = async () => {
    if (!userId) {
      toast.error('ไม่สามารถยืนยันผู้ใช้ได้');
      return;
    }

    const email = confirmData.email?.trim() || localUser.email?.trim();
    const phone = confirmData.phone?.trim() || localUser.phone?.trim();

    if (!email || !phone) {
      toast.error('กรุณากรอกอีเมลและเบอร์โทร');
      return;
    }

    let imageBase64 = null;

    if (imageFile) {
      try {
        imageBase64 = await readFileAsBase64(imageFile);
      } catch (err) {
        toast.error('อ่านรูปไม่สำเร็จ');
        return;
      }
    }

    await submitJoinRequest(imageBase64, email, phone);
  };

  const submitJoinRequest = async (imageBase64, email, phone) => {
    setLoading(true);
    try {
      const res = await fetch('/api/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'join', // ✅ สำคัญ: ต้องใส่ action ด้วย
          user_id: userId,
          event_id: confirmData.event_id,
          email,
          phone,
          image_base64: imageBase64,
        }),
      });

      const result = await res.json();

      if (res.ok) {
        toast.success('ส่งคำขอเข้าร่วมแล้ว กรุณารออนุมัติ');
        onSubmitSuccess();
      } else if (res.status === 409) {
        toast('คุณได้ลงทะเบียนกิจกรรมนี้แล้ว');
        onSubmitSuccess();
      } else {
        toast.error(result.message || 'เกิดข้อผิดพลาด');
      }
    } catch (err) {
      console.error(err);
      toast.error('เกิดข้อผิดพลาดในการเข้าร่วม');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const readFileAsBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6 space-y-3">
        <h2 className="text-lg font-bold text-gray-800">ยืนยันการเข้าร่วม</h2>
        <p className="font-semibold text-gray-700">{confirmData.event_title}</p>
        <p className="text-sm text-gray-600 whitespace-pre-line">{confirmData.event_detail}</p>

        {['email', 'phone'].map((field) => (
          <div key={field}>
            <label className="block text-sm text-gray-700 capitalize">{field}</label>
            <input
              type={field === 'email' ? 'email' : 'tel'}
              value={confirmData[field] ?? localUser[field] ?? ''}
              onChange={(e) => setConfirmData({ ...confirmData, [field]: e.target.value })}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        ))}

        <div>
          <label className="block text-sm text-gray-700 mb-1">รูปภาพเพิ่มเติม (ไม่บังคับ)</label>
          <input
            type="file"
            ref={fileInputRef}
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files[0])}
            className="hidden"
          />
          <button
            onClick={handleImageUploadClick}
            className="mt-1 px-3 py-2 text-sm bg-blue-100 hover:bg-blue-200 rounded"
          >
            📷 อัปโหลดรูปภาพ
          </button>
          {imageFile && <p className="text-xs text-gray-600 mt-1">✔️ เลือกแล้ว: {imageFile.name}</p>}
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <button onClick={onClose} disabled={loading} className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !userId}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            {loading ? 'กำลังส่ง...' : 'ยืนยันเข้าร่วม'}
          </button>
        </div>
      </div>
    </div>
  );
}
