'use client';

import { useState } from 'react';

export default function CreateCard({ onSuccess, onCancel }) {
    const [form, setForm] = useState({
        name_ac: '',
        description_ac: '',
        type_ac: '',
        location_ac: '',
        date_start: '',
        date_end: '',
        max_participants: '',
        image_url: '',
        created_by: 1,
    });

    const handleChange = (e) => {setForm({ ...form, [e.target.name]: e.target.value });};

    const handleSubmit = async (e) => {
        e.preventDefault();

        const res = await fetch('/api/activity/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        });

        const result = await res.json();

        if (result.success) {
            alert('เพิ่มกิจกรรมสำเร็จ!');
            onSuccess?.();
        } else {
            alert('เกิดข้อผิดพลาด');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="grid gap-4 max-w-xl bg-gray-100 p-6 rounded shadow mt-4">
            <input name="name_ac" placeholder="ชื่อกิจกรรม" onChange={handleChange} value={form.name_ac} required className="border p-2 text-black placeholder-blue-500" />
            <textarea name="description_ac" placeholder="รายละเอียดกิจกรรม" onChange={handleChange} value={form.description_ac} required className="border p-2 text-black placeholder-blue-500" />
            <input name="type_ac" placeholder="ประเภท (เกม/กีฬา)" onChange={handleChange} value={form.type_ac} className="border p-2 text-black placeholder-blue-500" />
            <input name="location_ac" placeholder="สถานที่" onChange={handleChange} value={form.location_ac} className="border p-2 text-black placeholder-blue-500" />
            <input type="datetime-local" name="date_start" onChange={handleChange} value={form.date_start} required className="border p-2 text-black" />
            <input type="datetime-local" name="date_end" onChange={handleChange} value={form.date_end} required className="border p-2 text-black" />
            <input type="number" name="max_participants" placeholder="จำนวนผู้ร่วมสูงสุด" onChange={handleChange} value={form.max_participants} required className="border p-2 text-black placeholder-blue-500" />
            <input name="image_url" placeholder="URL รูปกิจกรรม" onChange={handleChange} value={form.image_url} className="border p-2 text-black placeholder-blue-500" />

            <div className="flex justify-between">
                <button type="submit" className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">บันทึกกิจกรรม</button>
                <button type="button" onClick={onCancel} className="text-gray-500 hover:underline">ยกเลิก</button>
            </div>
        </form>
    );
}
