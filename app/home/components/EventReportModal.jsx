'use client';

export default function EventReportModal({ role, eventReport = [], onApprove, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-800">รายงานการเข้าร่วมกิจกรรม</h2>
          <button onClick={onClose} className="text-sm text-blue-600 hover:underline">ปิด ✖</button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border">
            <thead className="bg-gray-100">
              <tr className="text-left border-b">
                <th className="px-2 py-1">#</th>
                <th className="px-2 py-1">ชื่อ</th>
                <th className="px-2 py-1">อีเมล</th>
                <th className="px-2 py-1">เบอร์</th>
                <th className="px-2 py-1">สถานะ</th>
                {role === 'admin' && <th className="px-2 py-1 text-center">จัดการ</th>}
              </tr>
            </thead>
            <tbody>
              {eventReport.length > 0 ? eventReport.map((row, i) => (
                <tr key={row.id} className="border-b hover:bg-gray-50">
                  <td className="px-2 py-1">{i + 1}</td>
                  <td className="px-2 py-1">{row.name}</td>
                  <td className="px-2 py-1">{row.email}</td>
                  <td className="px-2 py-1">{row.phone}</td>
                  <td className="px-2 py-1 text-gray-700">{row.status}</td>
                  {role === 'admin' && (
                    <td className="px-2 py-1 text-center space-x-1">
                      <button
                        onClick={() => onApprove(row.id, 'ลงทะเบียนสำเร็จ')}
                        disabled={row.status === 'ลงทะเบียนสำเร็จ'}
                        className="px-2 py-0.5 text-green-600 hover:underline disabled:opacity-30"
                      >
                        ✅ อนุมัติ
                      </button>
                      <button
                        onClick={() => onApprove(row.id, 'ยกเลิก')}
                        disabled={row.status === 'ยกเลิก'}
                        className="px-2 py-0.5 text-red-600 hover:underline disabled:opacity-30"
                      >
                        ❌ ยกเลิก
                      </button>
                    </td>
                  )}
                </tr>
              )) : (
                <tr>
                  <td colSpan={role === 'admin' ? 6 : 5} className="text-center py-3 text-gray-500">
                    ไม่พบข้อมูลผู้เข้าร่วม
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
