'use client';

import { useEffect, useState } from 'react';

export default function AllEventsModal({ open, onClose }) {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (!open) return;
    const fetchAll = async () => {
      try {
        const res = await fetch('/api/events?all=true'); // กำหนด query ตาม backend
        const data = await res.json();
        setEvents(data);
      } catch {
        setEvents([]);
      }
    };
    fetchAll();
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-start p-6 pt-12 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">

        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center text-[--color-dark-blue] mb-4">📋 กิจกรรมทั้งหมด</h2>

        {events.length > 0 ? (
          <ul className="space-y-4">
            {events.map((event) => (
              <li
                key={event.id}
                className="p-4 border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition bg-white hover:bg-gray-50"
              >
                <h3 className="text-lg font-semibold text-gray-800">{event.title}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{event.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 text-sm mt-4">ไม่มีข้อมูลกิจกรรม</p>
        )}
      </div>
    </div>
  );
}
