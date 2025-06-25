'use client';

import { useState, useEffect } from 'react';


export default function AdminPage() {
    const [activities, setActivities] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [showContact, setShowContact] = useState(false);
    const [joinedActivities, setJoinedActivities] = useState([]);


    const fetchActivities = async () => {
        const res = await fetch('/api/activity/getAll');
        const data = await res.json();
        setActivities(data);
        console.log("Data : ", data);
    };

    useEffect(() => { fetchActivities(); }, []);

    return (
        <div className="p-8 bg">
            <button onClick={handleLogout} className="absolute top-4 right-4">
                <img src="/icons/icons8-logout-50.png" alt="Logout" className="w-6 h-6 hover:opacity-70"/>
            </button>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-xl text-blue-700 font-bold">จัดการกิจกรรม</h1>
                <div className="space-x-4">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="border border-blue-700 bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-700 hover:text-white transition"
                    >
                        {showHistory ? 'ยกเลิก' : 'ประวัติกิจกรรม'}
                    </button>
                    <button
                        onClick={() => setShowContact(!showContact)}
                        className="border border-blue-700 bg-white text-blue-700 px-4 py-2 rounded hover:bg-blue-700 hover:text-white transition"
                    >
                        {showContact ? 'ยกเลิก' : 'ติดต่อ Admin'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {activities.filter(ac => new Date(ac.date_end) >= new Date()).map((ac) => (
                    <div key={ac.id_ac} className="relative border border-blue-300 p-4 rounded shadow bg-gray-100 min-h-[260px]">
                        {/* กลุ่มขวาแบบ absolute: ผู้เข้าร่วม, วันที่, ปุ่ม */}
                        <div className="absolute top-4 right-4 flex flex-col items-end space-y-3 w-40">
                            {/* กล่องผู้เข้าร่วม */}
                            <div className="bg-white p-2 rounded text-sm shadow w-full">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-gray-800">ผู้เข้าร่วม</span>
                                    {new Date(ac.date_end) < new Date() ? (
                                        <span className="text-gray-500 font-semibold">หมดเขต</span>
                                    ) : ac.current_participants >= ac.max_participants ? (
                                        <span className="text-red-500 font-semibold">เต็ม</span>
                                    ) : (
                                        <span className="text-green-500 font-semibold">เปิดรับ</span>
                                    )}
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>max</span>
                                    <span>{ac.max_participants}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>now</span>
                                    <span>{ac.current_participants}</span>
                                </div>
                            </div>

                            {/* กล่องวันที่จัด */}
                            <div className="bg-white p-2 rounded text-sm shadow w-full">
                                <div className="flex justify-between mb-1">
                                    <span className="font-semibold text-gray-800">วันที่จัด</span>
                                    <span className="text-gray-600">
                                        {new Date(ac.date_start).toLocaleDateString()}
                                    </span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-600">
                                    <span>ถึง</span>
                                    <span>{new Date(ac.date_end).toLocaleDateString()}</span>
                                </div>
                            </div>

                            {/* ปุ่ม */}
                            <button className={`w-full px-4 py-2 rounded text-white ${
                                new Date(ac.date_end) < new Date()
                                    ? 'bg-gray-400 cursor-not-allowed'
                                    : ac.current_participants >= ac.max_participants
                                    ? 'bg-red-500 hover:bg-red-600'
                                    : 'bg-blue-600 hover:bg-blue-700'
                            }`}>
                                {new Date(ac.date_end) < new Date()
                                    ? 'กิจกรรมสิ้นสุดแล้ว'
                                    : ac.current_participants >= ac.max_participants
                                    ? 'ยกเลิกการเข้าร่วม'
                                    : 'เข้าร่วม'}
                            </button>
                        </div>

                        {/* ชื่อกิจกรรม */}
                        <h2 className="text-lg text-blue-700 font-bold mb-2">กิจกรรม {ac.name_ac}</h2>

                        {/* กล่องรายละเอียดด้านซ้าย */}
                        <div className="bg-white text-gray-600 rounded p-4 mr-[176px] min-h-[100px]">
                            {ac.description_ac || 'รายละเอียดกิจกรรม'}
                        </div>
                    </div>
                ))}
            </div>

            {showHistory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white w-[90%] max-w-2xl p-6 rounded shadow-lg overflow-y-auto max-h-[80vh]">
                    <h2 className="text-lg font-bold mb-4 text-blue-700">ประวัติกิจกรรม</h2>

                    {/* ✅ รออนุมัติ */}
                    <div className="mb-6">
                        <h3 className="text-md font-semibold text-yellow-600 mb-2">รอการอนุมัติ</h3>
                        {joinedActivities.filter(ac =>
                        new Date(ac.date_end) >= new Date() && ac.status === 'pending'
                        ).map(item => (
                        <div key={item.id_ac} className="p-3 mb-2 bg-yellow-50 border border-yellow-300 rounded">
                            <p className="font-bold text-blue-700">กิจกรรม {item.name_ac}</p>
                            <p className="text-sm text-gray-600">วันที่จัด: {new Date(item.date_start).toLocaleDateString()}</p>
                        </div>
                        ))}
                    </div>

                    {/* ✅ กิจกรรมที่สิ้นสุดแล้ว */}
                    <div>
                        <h3 className="text-md font-semibold text-gray-700 mb-2">กิจกรรมที่สิ้นสุดแล้ว</h3>
                        {joinedActivities.filter(ac =>
                        new Date(ac.date_end) < new Date()
                        ).map(item => (
                        <div key={item.id_ac} className="p-3 mb-2 bg-gray-100 border border-gray-300 rounded">
                            <p className="font-bold text-blue-700">กิจกรรม {item.name_ac}</p>
                            <p className="text-sm text-gray-600">สิ้นสุด: {new Date(item.date_end).toLocaleDateString()}</p>
                        </div>
                        ))}
                    </div>

                    <div className="mt-4 text-right">
                        <button
                        onClick={() => setShowHistory(false)}
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                        ปิด
                        </button>
                    </div>
                    </div>
                </div>
                )}

        </div>
    );
}
