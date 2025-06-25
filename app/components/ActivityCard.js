"use client";

export default function ActivityCard({ activity, role }) {
return (
    <div className="bg-white rounded-xl shadow p-4 mb-4 border border-gray-200">
        <h3 className="text-xl font-bold text-blue-800 mb-2">{activity.title}</h3>
        <p className="text-gray-700 mb-1">วันที่: {activity.date}</p>
        <p className="text-gray-700 mb-1">ประเภท: {activity.type}</p>
        <p className="text-gray-600 text-sm mb-3">{activity.description}</p>

        {role === "user" && (
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                ลงทะเบียนเข้าร่วม
            </button>
    )}

    {role === "admin" && (
        <div className="flex gap-2">
            <button className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
                แก้ไขกิจกรรม
            </button>

            <button className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
                ลบกิจกรรม
            </button>
        </div>
    )}
    </div>
);
}
