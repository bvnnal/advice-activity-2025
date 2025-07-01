'use client';

import { useEffect, useState, useMemo } from 'react';
import { format } from 'date-fns';
import { X, FilterX } from 'lucide-react';

export default function AdminActivityReportModal({ onClose }) {
  const [loading, setLoading] = useState(true);
  const [reportData, setReportData] = useState([]);
  const [filters, setFilters] = useState({ status: [], type: [], fullOnly: false, search: '' });
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const timeout = setTimeout(() => {
      setFilters(f => ({ ...f, search: searchTerm.trim() }));
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchTerm]);

  useEffect(() => {
    fetch('/api/report?role=admin')
      .then(res => res.json())
      .then(data => setReportData(data.summary || data))
      .catch(() => alert('โหลดรายงานไม่สำเร็จ'))
      .finally(() => setLoading(false));
  }, []);

  const uniqueTypes = useMemo(() => [...new Set(reportData.map(e => e.type))], [reportData]);
  
  const exportToCSV = () => {
    const headers = ['#', 'กิจกรรม', 'ประเภท', 'เริ่ม', 'สิ้นสุด', 'จำกัด', 'เข้าร่วม', 'ยืนยัน'];
    const rows = filteredSortedData.map((e, i) => [
      i + 1,
      e.title,
      e.type,
      format(new Date(e.date_start), 'dd/MM/yyyy'),
      format(new Date(e.date_end), 'dd/MM/yyyy'),
      e.max_participants,
      e.current_participants,
      e.approved_count
    ]);

    const csvContent = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'activity_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredData = useMemo(() => {
    const today = new Date();
    return reportData.filter(event => {
      const isOpen = new Date(event.date_end) >= today;
      const matchStatus =
        filters.status.length === 0 ||
        (filters.status.includes('เปิดอยู่') && isOpen) ||
        (filters.status.includes('ปิดแล้ว') && !isOpen);
      const matchType = filters.type.length === 0 || filters.type.includes(event.type);
      const matchFull = !filters.fullOnly || event.current_participants >= event.max_participants;
      const matchSearch = filters.search === '' || event.title.toLowerCase().includes(filters.search.toLowerCase());

      return matchStatus && matchType && matchFull && matchSearch;
    });
  }, [reportData, filters]);

  const filteredSortedData = useMemo(() =>
    filteredData.sort((a, b) => b.current_participants - a.current_participants),
    [filteredData]
  );

  const toggleFilter = (key, value) => {
    setFilters(prev => {
      const list = new Set(prev[key]);
      list.has(value) ? list.delete(value) : list.add(value);
      return { ...prev, [key]: [...list] };
    });
  };

  const clearFilters = () => {
    setFilters({ status: [], type: [], fullOnly: false, search: '' });
    setSearchTerm('');
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 animate-fade-in">
      <div className="relative w-full max-w-6xl h-[90vh] bg-white rounded-2xl p-6 shadow-xl overflow-hidden flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-red-500">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-800 mb-4">📋 ภาพรวมกิจกรรมทั้งหมด</h2>

        <div className="flex justify-between items-center flex-wrap gap-2 mb-4 text-sm">
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-medium text-gray-700">สถานะ:</span>
            {['เปิดอยู่', 'ปิดแล้ว'].map(s => (
              <label key={s} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={filters.status.includes(s)}
                  onChange={() => toggleFilter('status', s)}
                />
                <span>{s}</span>
              </label>
            ))}
            <span className="font-medium text-gray-700 ml-4">ประเภท:</span>
            {uniqueTypes.map(type => (
              <label key={type} className="flex items-center gap-1">
                <input
                  type="checkbox"
                  checked={filters.type.includes(type)}
                  onChange={() => toggleFilter('type', type)}
                />
                <span>{type}</span>
              </label>
            ))}
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={filters.fullOnly}
                onChange={() => setFilters(f => ({ ...f, fullOnly: !f.fullOnly }))}
              />
              <span>เฉพาะกิจกรรมที่เต็มแล้ว</span>
            </label>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <input
              type="text"
              placeholder="ค้นหาชื่อกิจกรรม"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border p-1.5 rounded-md text-sm focus:outline-none focus:ring focus:ring-blue-300"
            />
            <button
              onClick={clearFilters}
              className="text-gray-500 hover:text-red-500 flex items-center gap-1"
            >
              <FilterX className="w-4 h-4" /> ล้างตัวกรอง
            </button>
            <button
              onClick={exportToCSV}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-md text-sm hover:bg-blue-700"
            >
              ส่งออก
            </button>
          </div>
        </div>

        {loading ? (
          <p className="text-gray-500">กำลังโหลด...</p>
        ) : (
          <div className="overflow-auto flex-1 border rounded-lg">
            <table className="min-w-full text-sm border table-fixed">
              <thead className="bg-blue-50 sticky top-0 z-10">
                <tr className="text-center">
                  <th className="px-3 py-2 border w-12">#</th>
                  <th className="px-3 py-2 border w-64">กิจกรรม</th>
                  <th className="px-3 py-2 border w-32">ประเภท</th>
                  <th className="px-3 py-2 border w-24">เริ่ม</th>
                  <th className="px-3 py-2 border w-24">สิ้นสุด</th>
                  <th className="px-3 py-2 border w-20">จำกัด</th>
                  <th className="px-3 py-2 border w-20">เข้าร่วม</th>
                  <th className="px-3 py-2 border w-20">ยืนยัน</th>
                </tr>
              </thead>
              <tbody>
                {filteredSortedData.map((e, i) => (
                  <tr key={e.id} className={`hover:bg-gray-50 ${e.current_participants >= e.max_participants ? 'bg-red-50' : ''}`}>
                    <td className="px-3 py-2 border text-center">{i + 1}</td>
                    <td className="px-3 py-2 border text-center font-medium text-blue-600 truncate">{e.title}</td>
                    <td className="px-3 py-2 border text-center truncate">{e.type}</td>
                    <td className="px-3 py-2 border text-center">{format(new Date(e.date_start), 'dd/MM/yyyy')}</td>
                    <td className="px-3 py-2 border text-center">{format(new Date(e.date_end), 'dd/MM/yyyy')}</td>
                    <td className="px-3 py-2 border text-center">{e.max_participants}</td>
                    <td className="px-3 py-2 border text-center">{e.current_participants}</td>
                    <td className="px-3 py-2 border text-center">{e.approved_count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
