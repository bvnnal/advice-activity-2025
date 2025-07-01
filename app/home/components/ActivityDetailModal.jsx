// components/ActivityDetailModal
'use client';

export default function ActivityDetailModal({ activity, onClose }) {
  if (!activity) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 relative">
        <h2 className="text-xl font-bold text-blue-700 mb-4">รายละเอียดกิจกรรม</h2>

        <p className="mb-2 text-gray-800">
          <strong>ชื่อกิจกรรม:</strong> {activity.title}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>รายละเอียด:</strong>{' '}
          {activity.detail || activity.description || 'ไม่มีรายละเอียด'}
        </p>
        <p className="mb-2 text-gray-700">
          <strong>วันที่จัด:</strong>{' '}
          {new Date(activity.date_start ?? activity.date).toLocaleDateString()} -{' '}
          {new Date(activity.date_end ?? activity.date).toLocaleDateString()}
        </p>
        <p className="mb-4 text-gray-700">
          <strong>จำนวนผู้เข้าร่วม:</strong>{' '}
          {activity.current_participants ?? 0} / {activity.max_participants ?? 1}
        </p>

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}
