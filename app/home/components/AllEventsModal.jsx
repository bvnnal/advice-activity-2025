'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Users, ClipboardList, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { X, FilterX } from 'lucide-react';

export default function AllEventsModal({ open, onClose }) {
  const [events, setEvents] = useState([]);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({ types: [] });
  const [dateRange, setDateRange] = useState('all'); // all | future | past
  const [sortOrder, setSortOrder] = useState('asc'); // asc | desc

  const allTypes = ["อบรม", "แข่งขัน", "สุขภาพ", "ออนไลน์", "อื่นๆ"];

  useEffect(() => {
    if (open) fetchEvents();
  }, [open, search, filters]);

  const fetchEvents = async () => {
    const params = new URLSearchParams();
    params.set('role', 'admin');
    params.set('search', search);
    params.set('expired', 'true');

    try {
      const res = await fetch(`/api/events?${params.toString()}`);
      const data = await res.json();
      setEvents(data);
    } catch {
      setEvents([]);
    }
  };

  const toggleFilter = (type) => {
    setFilters((prev) => {
      const selected = prev.types.includes(type)
        ? prev.types.filter((t) => t !== type)
        : [...prev.types, type];
      return { ...prev, types: selected };
    });
  };

  const filteredEvents = events
    .filter((event) =>
      (filters.types.length === 0 || filters.types.includes(event.type)) &&
      event.title.toLowerCase().includes(search.toLowerCase()) &&
      (
        dateRange === 'all' ? true :
        dateRange === 'future' ? new Date(event.date_start) >= new Date() :
        new Date(event.date_start) < new Date()
      )
    )
    .sort((a, b) => {
      const timeA = new Date(a.date_start).getTime();
      const timeB = new Date(b.date_start).getTime();
      return sortOrder === 'asc' ? timeA - timeB : timeB - timeA;
    });

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-6xl h-[90vh] overflow-y-auto rounded-2xl shadow-2xl p-6 relative animate-fade-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500 text-xl"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">📋 กิจกรรมทั้งหมด</h2>

        {/* Filters */}
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              placeholder="ค้นหากิจกรรม"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 p-2 border rounded-full shadow-sm text-sm focus:ring-2 focus:ring-blue-400"
            />
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() => toggleFilter(type)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all
                  ${filters.types.includes(type)
                    ? 'bg-blue-600 text-white border-blue-700 shadow'
                    : 'bg-white text-gray-700 hover:bg-blue-100 border-gray-300'}
                `}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* ช่วงวันที่ */}
            {[
              { label: '📅 ทั้งหมด', value: 'all' },
              { label: '⏳ อนาคต', value: 'future' },
              { label: '🕰️ ที่ผ่านมา', value: 'past' }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setDateRange(value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all
                  ${dateRange === value
                    ? 'bg-indigo-600 text-white border-indigo-700 shadow'
                    : 'bg-white text-gray-700 hover:bg-indigo-100 border-gray-300'}
                `}
              >
                {label}
              </button>
            ))}

            {/* ปุ่มเรียง */}
            {[
              { label: 'เก่าสุด', value: 'asc' },
              { label: 'ล่าสุด', value: 'desc' }
            ].map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setSortOrder(value)}
                className={`px-3 py-1.5 rounded-full text-xs border transition-all
                  ${sortOrder === value
                    ? 'bg-teal-600 text-white border-teal-700 shadow'
                    : 'bg-white text-gray-700 hover:bg-teal-100 border-gray-300'}
                `}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 mb-3">🎯 พบทั้งหมด: {filteredEvents.length} รายการ</p>

        {/* Event Grid */}
        {filteredEvents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-4">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white border border-blue-100 rounded-xl p-3 shadow hover:shadow-lg hover:ring-2 hover:ring-blue-200 transition-all transform hover:scale-[1.02] text-sm flex flex-col justify-between"
              >
                <div className="mb-2">
                  <h3 className="text-sm font-semibold text-blue-800 line-clamp-2 mb-1">{event.title}</h3>
                  <p className="text-gray-500 text-xs line-clamp-2">{event.description}</p>
                </div>
                <div className="flex flex-col gap-1 text-gray-600 text-xs">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 text-blue-400" />
                    <span>{event.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-green-500" />
                    <span>{format(new Date(event.date_start), 'dd/MM/yyyy')} <Clock className="inline w-4 h-4 ml-1" /> {format(new Date(event.date_start), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CalendarDays className="w-4 h-4 text-red-400" />
                    <span>{format(new Date(event.date_end), 'dd/MM/yyyy')} <Clock className="inline w-4 h-4 ml-1" /> {format(new Date(event.date_end), 'HH:mm')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-500" />
                    <span>{event.current_participants} / {event.max_participants} คน</span>
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
