'use client';
import { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, AlertCircle, Search, X } from 'lucide-react';

export default function JoinedHistory({ joinedActivities = [], onClose }) {
  const [search, setSearch] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const now = new Date();

  const matchesFilters = (a) => {
    const matchSearch = a.name_ac?.toLowerCase().includes(search.toLowerCase());
    const eventDate = new Date(a.date_start);
    const matchDate = dateFilter === 'future' ? eventDate >= now : dateFilter === 'past' ? eventDate < now : true;
    const matchStatus =
      statusFilter === 'pending' ? a.status === 'pending' :
      statusFilter === 'approved' ? ['approved', 'ลงทะเบียนสำเร็จ'].includes(a.status) :
      statusFilter === 'expired' ? new Date(a.date_end) < now : true;
    return matchSearch && matchDate && matchStatus;
  };

  const filtered = joinedActivities.filter(matchesFilters);
  const pending = filtered.filter(a => new Date(a.date_end) >= now && a.status === 'pending');
  const approved = filtered.filter(a => new Date(a.date_end) >= now && ['approved', 'ลงทะเบียนสำเร็จ'].includes(a.status));
  const expired = filtered.filter(a => new Date(a.date_end) < now);

  const Section = ({ title, data, icon, color }) => (
    <div className="mb-6">
      <h3 className={`text-md font-semibold ${color} mb-2 flex items-center gap-2`}>{icon}{title}</h3>
      {data.length === 0 ? <p className="text-sm text-gray-400 italic">ไม่มีข้อมูล</p> : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map(item => (
            <div key={item.id_ac} className="p-4 bg-white/70 border rounded-xl shadow">
              <p className="text-blue-800 font-semibold truncate">{item.name_ac}</p>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <CalendarDays size={14} />
                {new Date(item.date_start).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4">
      <div className="w-full max-w-6xl h-[90vh] bg-white rounded-2xl shadow-2xl border relative flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>

        <div className="p-6 pb-0">
          <h2 className="text-xl font-bold text-blue-800 flex items-center gap-2">
            <Clock size={20} /> ประวัติกิจกรรมของคุณ
          </h2>
        </div>

        <div className="px-6 py-4 flex flex-col md:flex-row gap-4 items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อกิจกรรม..."
              className="w-full pl-9 pr-4 py-2 border rounded-full shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>
          <select value={dateFilter} onChange={(e) => setDateFilter(e.target.value)} className="px-4 py-2 border rounded-full shadow-sm">
            <option value="all">📅 ทั้งหมด</option>
            <option value="future">⏳ อนาคต</option>
            <option value="past">🕰️ อดีต</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-full shadow-sm">
            <option value="all">📌 ทุกสถานะ</option>
            <option value="pending">🟡 รออนุมัติ</option>
            <option value="approved">🟢 อนุมัติแล้ว</option>
            <option value="expired">⚪ หมดอายุ</option>
          </select>
        </div>

        <div className="px-6 pb-6 pr-3 overflow-y-auto flex-1">
          <Section title="รอการอนุมัติ" data={pending} icon={<AlertCircle size={16} />} color="text-yellow-600" />
          <Section title="อนุมัติแล้ว" data={approved} icon={<CheckCircle size={16} />} color="text-green-600" />
          <Section title="กิจกรรมที่สิ้นสุดแล้ว" data={expired} icon={<Clock size={16} />} color="text-gray-700" />
        </div>
      </div>
    </div>
  );
}
