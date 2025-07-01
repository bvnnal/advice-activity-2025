'use client';

import { useEffect, useState } from 'react';

export default function AdminEventReport({ activity = {}, onClose, onApprove }) {
  const approved = activity.approved_count ?? 0;
  const total = activity.current_participants ?? 0;

  const [report, setReport] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('ทั้งหมด');

  useEffect(() => {
    const loadData = async () => {
      try {
        const res = await fetch(`/api/report?role=admin&event_id=${activity.id}`);
        const data = await res.json();
        setReport(data?.report || []);
      } catch (err) {
        console.error('โหลดรายงานไม่สำเร็จ:', err);
        setReport([]);
      } finally {
        setLoading(false);
      }
    };
    if (activity?.id) loadData();
  }, [activity]);

  const filteredReport = report.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = r.name?.toLowerCase().includes(q) || r.phone?.includes(q) || r.email?.toLowerCase().includes(q);
    const matchStatus = filterStatus === 'ทั้งหมด' || r.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusLabels = {
    'ทั้งหมด': '👁️ แสดงทั้งหมด',
    'ลงทะเบียนสำเร็จ': '✅ อนุมัติแล้ว',
    'รอดำเนินการ': '⏳ รอดำเนินการ',
    'ยกเลิกการลงทะเบียน': '❌ ยกเลิกการลงทะเบียน'
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
      <div className="bg-white p-6 rounded-2xl max-w-6xl w-full shadow-2xl relative border border-gray-200 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 border-b pb-3">
          <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
            <span className="text-blue-600">📋</span> รายงานกิจกรรม: <span className="text-black">{activity.title || 'ไม่ระบุ'}</span>
          </h2>
          <button onClick={onClose} className="text-red-500 hover:text-red-700 text-xl">×</button>
        </div>

        <div className="mb-5 grid grid-cols-2 md:grid-cols-4 gap-3 text-sm text-gray-700">
          <div className="bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">👥 ผู้เข้าร่วม: <span className="font-bold text-blue-700">{total}</span> คน</div>
          <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2">✅ อนุมัติแล้ว: <span className="font-bold text-green-700">{approved}</span> คน</div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg px-3 py-2">⏳ รอดำเนินการ: <span className="font-bold text-yellow-700">{report.filter(r => r.status === 'รอดำเนินการ').length}</span> คน</div>
          <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2">❌ ยกเลิก: <span className="font-bold text-red-700">{report.filter(r => r.status === 'ยกเลิกการลงทะเบียน').length}</span> คน</div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4 items-center">
          {Object.entries(statusLabels).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setFilterStatus(key)}
              className={`px-3 py-1 rounded-full text-sm border transition ${filterStatus === key ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-300'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 ค้นหาชื่อ / เบอร์ / อีเมล"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-4 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />

        <div className="overflow-x-auto border rounded-xl shadow-sm">
          <table className="w-full text-sm text-gray-800 min-w-[800px]">
            <thead className="bg-gray-50 text-sm font-medium text-gray-600">
              <tr>
                <th className="p-3 text-center">#</th>
                <th className="p-3">📅 ลงทะเบียน</th>
                <th className="p-3">👤 ชื่อ</th>
                <th className="p-3">📞 เบอร์</th>
                <th className="p-3">📧 อีเมล</th>
                <th className="p-3 text-center">🖼️ รูป</th>
                <th className="p-3 text-center">⚙️ สถานะ</th>
                <th className="p-3 text-center">🎯 ยืนยัน</th>
              </tr>
            </thead>
            <tbody>
              {filteredReport.length ? filteredReport.map((r, i) => (
                <tr key={r.id || i} className="hover:bg-gray-50 border-t">
                  <td className="p-3 text-center font-medium text-gray-600">{i + 1}</td>
                  <td className="p-3">{new Date(r.registered_at).toLocaleString('th-TH')}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.phone}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3 text-center">
                    {r.image_url ? (
                      <img
                        src={r.image_url}
                        alt="รูป"
                        className="h-10 w-10 object-cover rounded-lg shadow cursor-pointer hover:opacity-80"
                        onClick={() => setPreviewImage(r.image_url)}
                      />
                    ) : <span className="italic text-gray-400">ไม่มี</span>}
                  </td>
                  <td className="p-3 text-center">
                    <span className="inline-block px-3 py-1 rounded-full text-xs bg-gray-100 border text-gray-700">
                      {r.status}
                    </span>
                  </td>
                  <td className="p-3 text-center space-x-1">
                    <button
                      onClick={() => onApprove(r.id, 'ลงทะเบียนสำเร็จ')}
                      disabled={r.status === 'ลงทะเบียนสำเร็จ'}
                      className="text-green-600 hover:underline disabled:opacity-30"
                    >อนุมัติ</button>
                    <button
                      onClick={() => onApprove(r.id, 'ยกเลิกการลงทะเบียน')}
                      disabled={r.status === 'ยกเลิกการลงทะเบียน'}
                      className="text-red-600 hover:underline disabled:opacity-30"
                    >ยกเลิก</button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan={8} className="text-center p-5 text-gray-500">ไม่พบข้อมูล</td></tr>
              )}
            </tbody>
          </table>
        </div>

        {previewImage && (
          <div className="fixed inset-0 bg-black/70 z-50 flex justify-center items-center">
            <div className="relative">
              <img src={previewImage} alt="หลักฐานขยาย" className="max-h-[80vh] max-w-[90vw] rounded-xl shadow-lg" />
              <button
                onClick={() => setPreviewImage(null)}
                className="absolute top-2 right-2 bg-white text-black rounded-full p-1 text-xs shadow hover:bg-gray-100"
              >✖</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
