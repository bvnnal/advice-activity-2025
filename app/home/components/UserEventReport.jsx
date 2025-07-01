'use client';

export default function UserEventReport({ activity, myStatus = '', onCancel, onBack }) {
  if (!activity) return null;
  const dateStr = d => new Date(d).toLocaleDateString('th-TH', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const colorMap = {
    'รออนุมัติ': 'text-yellow-600',
    'ลงทะเบียนสำเร็จ': 'text-green-600',
    'ยกเลิก': 'text-red-500'
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-lg rounded-xl shadow-xl p-6 animate-fade-in">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-blue-800">📋 รายงาน: {activity.title}</h2>
          <button onClick={onBack}>❌</button>
        </div>

        <p className="text-gray-700 text-sm mb-4">{activity.detail || activity.description || 'ไม่มีรายละเอียดกิจกรรม'}</p>

        <div className="text-sm text-gray-700 space-y-1 mb-4">
          <p><strong>📅 วันที่:</strong> {dateStr(activity.date_start)} - {dateStr(activity.date_end)}</p>
          <p><strong>👥 ผู้เข้าร่วม:</strong> {activity.current_participants ?? 0} / {activity.max_participants ?? 1}</p>
          <p><strong>📌 สถานะของคุณ:</strong> <span className={colorMap[myStatus] || 'text-gray-600'}>{myStatus || 'ไม่ได้เข้าร่วม'}</span></p>
        </div>

        {Array.isArray(activity.participants) && activity.participants.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-800 mb-2">👥 รายชื่อผู้เข้าร่วม</h3>
            <ul className="list-disc list-inside text-sm text-gray-700 space-y-1 max-h-40 overflow-y-auto">
              {activity.participants.map((p, i) => (
                <li key={i}>{p.name || 'ไม่ระบุชื่อ'}</li>
              ))}
            </ul>
          </div>
        )}

        {myStatus && myStatus !== 'ยกเลิก' && (
          <div className="flex justify-end mt-4">
            <button
              onClick={onCancel}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded text-sm shadow-md transition"
            >
              ยกเลิกเข้าร่วม
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
