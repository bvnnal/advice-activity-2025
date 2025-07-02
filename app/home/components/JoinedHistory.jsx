'use client';
import { useState } from 'react';
import { CalendarDays, Clock, CheckCircle, AlertCircle, Search, X } from 'lucide-react';

export default function JoinedHistory({ joinedActivities = [], onClose }) {
  const [search, setSearch] = useState('');
  const [dateFilters, setDateFilters] = useState(['all']);
  const [statusFilters, setStatusFilters] = useState(['all']);
  const now = new Date();

  const toggleFilter = (filter, setFilterState) => {
    if (filter === 'all') {
      setFilterState(['all']);
      return;
    }
    setFilterState(prev => {
      const next = prev.includes(filter)
        ? prev.filter(f => f !== filter)
        : [...prev.filter(f => f !== 'all'), filter]; // ลบ 'all' ถ้าเลือกอย่างอื่น
      return next.length === 0 ? ['all'] : next;
    });
  };

  const matchesFilters = (a) => {
    const matchSearch = a.name_ac?.toLowerCase().includes(search.toLowerCase());
    const eventDate = new Date(a.date_start);
    const endDate = new Date(a.date_end);

    const matchDate =
      dateFilters.includes('all') ? true :
      (dateFilters.includes('future') && eventDate >= now) ||
      (dateFilters.includes('past') && eventDate < now);

    const matchStatus =
      statusFilters.includes('all') ? true :
      (statusFilters.includes('pending') && a.status === 'pending') ||
      (statusFilters.includes('approved') && ['approved', 'ลงทะเบียนสำเร็จ'].includes(a.status)) ||
      (statusFilters.includes('expired') && endDate < now);

    return matchSearch && matchDate && matchStatus;
  };

  const filtered = joinedActivities.filter(matchesFilters);
  const pending = filtered.filter(a => new Date(a.date_end) >= now && a.status === 'pending');
  const approved = filtered.filter(a => new Date(a.date_end) >= now && ['approved', 'ลงทะเบียนสำเร็จ'].includes(a.status));
  const expired = filtered.filter(a => new Date(a.date_end) < now);

  const Section = ({ data }) => (
    data.length === 0 ? (
      <p className="text-sm text-gray-400 italic">ไม่มีข้อมูลกิจกรรม</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.map(({ id_ac, name_ac, date_start, date_end, status }) => {
          const format = d => new Date(d).toLocaleString('th-TH', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit', hour12: false
          });
          const color = {
            pending: 'text-yellow-600',
            approved: 'text-green-600',
            'ลงทะเบียนสำเร็จ': 'text-green-600',
            expired: 'text-gray-500'
          }[status] || 'text-blue-800';

          return (
            <div key={id_ac} className="p-4 bg-white/70 border rounded-xl shadow">
              <p className="text-blue-800 font-semibold truncate">{name_ac}</p>
              <p className="text-xs text-gray-600 mt-1">🗓 เริ่ม: {format(date_start)}</p>
              <p className="text-xs text-gray-600">🏁 สิ้นสุด: {format(date_end)}</p>
              <p className={`text-xs font-semibold ${color}`}>📌 สถานะ: {status}</p>
            </div>
          );
        })}
      </div>
    )
  );

  const filterButton = (label, value, stateArray, setStateFn) => (
    <button
      onClick={() => toggleFilter(value, setStateFn)}
      className={`px-4 py-1 rounded-full border transition-all shadow-sm text-sm
        ${stateArray.includes(value)
          ? 'bg-blue-600 text-white border-blue-700'
          : 'bg-white text-gray-700 hover:bg-blue-100 border-gray-300'}
      `}
    >
      {label}
    </button>
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

        

        <div className="px-6 py-4 flex flex-col md:flex-row flex-wrap gap-4 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อกิจกรรม..."
              className="w-full pl-9 pr-4 py-2 border rounded-full shadow-sm focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div className="flex gap-2 flex-wrap items-center">
            {filterButton('📅 ทั้งหมด', 'all', dateFilters, setDateFilters)}
            {filterButton('⏳ อนาคต', 'future', dateFilters, setDateFilters)}
            {filterButton('🕰️ อดีต', 'past', dateFilters, setDateFilters)}
          </div>

          {/* UI: ปุ่ม Status Filters */}
          <div className="flex gap-2 flex-wrap items-center">
            {filterButton('📌 ทุกสถานะ', 'all', statusFilters, setStatusFilters)}
            {filterButton('🟡 รออนุมัติ', 'pending', statusFilters, setStatusFilters)}
            {filterButton('🟢 อนุมัติแล้ว', 'approved', statusFilters, setStatusFilters)}
            {filterButton('⚪ หมดอายุ', 'expired', statusFilters, setStatusFilters)}
          </div>
        </div>

        <div className="px-6 pb-6 pr-3 overflow-y-auto flex-1"><Section data={filtered} /></div>

        {/* <div className="px-6 pb-6 pr-3 overflow-y-auto flex-1">
          <Section title="รอการอนุมัติ" data={pending} icon={<AlertCircle size={16} />} color="text-yellow-600" />
          <Section title="อนุมัติแล้ว" data={approved} icon={<CheckCircle size={16} />} color="text-green-600" />
          <Section title="กิจกรรมที่สิ้นสุดแล้ว" data={expired} icon={<Clock size={16} />} color="text-gray-700" />
        </div> */}
      </div>
    </div>
  );
}
