'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Users, ClipboardList } from 'lucide-react';

export default function AllEventsModal({ open, onClose }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState({ status: 'all', type: '' });

  useEffect(() => {
    if (!open) return;
    fetchEvents();
  }, [open, search, filter]);

  const fetchEvents = async () => {
    const params = new URLSearchParams({
      search,
      status: filter.status || 'all',
      ...(filter.type && { type: filter.type }),
    });

    try {
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex justify-center items-start p-6 pt-12 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl p-6 relative max-h-[90vh] overflow-y-auto">
        {/* ปุ่มปิด */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          ✖
        </button>

        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">📋 กิจกรรมทั้งหมด</h2>

        {/* 🔍 Search + Filter */}
        <div className="flex flex-wrap items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="ค้นหาชื่อกิจกรรม / คำอธิบาย"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 p-3 border rounded-lg shadow-sm focus:outline-none focus:ring focus:ring-blue-300 text-sm"
          />
          <select
            value={filter.status}
            onChange={(e) => setFilter((f) => ({ ...f, status: e.target.value }))}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="all">ทั้งหมด</option>
            <option value="active">เปิดรับ</option>
            <option value="inactive">สิ้นสุด</option>
          </select>
          <select
            value={filter.type}
            onChange={(e) => setFilter((f) => ({ ...f, type: e.target.value }))}
            className="p-2 border rounded-lg text-sm"
          >
            <option value="">ทุกประเภท</option>
            <option value="อบรม">อบรม</option>
            <option value="แข่งขัน">แข่งขัน</option>
            <option value="สุขภาพ">สุขภาพ</option>
            <option value="ออนไลน์">ออนไลน์</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        {/* 📋 กิจกรรม */}
        {events.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition text-sm"
              >
                <h3 className="text-base font-semibold text-gray-800 line-clamp-2">{event.title}</h3>
                <p className="text-gray-500 line-clamp-2 mb-3">{event.description}</p>

                <div className="flex flex-col gap-2 text-gray-600">
                  <div className="flex items-center gap-2 text-xs">
                    <ClipboardList className="w-4 h-4" />
                    <span>{event.type || 'ไม่ระบุประเภท'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <CalendarDays className="w-4 h-4" />
                    <span>{new Date(event.date_start).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs">
                    <Users className="w-4 h-4" />
                    <span>{event.current_participants} / {event.max_participants}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 text-sm mt-8">ไม่พบกิจกรรมที่ตรงกับเงื่อนไข</p>
        )}
      </div>
    </div>
  );
}
