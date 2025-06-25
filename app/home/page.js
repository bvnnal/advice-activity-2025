'use client';

import { useEffect, useState } from 'react';

export default function UserHomePage() {
    const [joinedActivities, setJoinedActivities] = useState([]);

    const fetchJoinedActivities = async () => {
        const userId = localStorage.getItem('userId');

        if (!userId) {
            console.error('User ID not found in localStorage.');
            return;
        }

        try {
            const res = await fetch(`/api/activity/joined?userId=${userId}`);

            if (!res.ok) {
                console.error('Failed to fetch joined activities');
                return;
            }

            const text = await res.text();
            if (!text) {
                console.warn('Empty response from API');
                return;
            }

            const data = JSON.parse(text);
            setJoinedActivities(data);
        } catch (err) {
            console.error('Error fetching joined activities:', err);
        }
    };

    useEffect(() => {
        fetchJoinedActivities();
    }, []);

    return (
        <div className="p-8">
            <h1 className="text-xl font-bold text-blue-700 mb-4">กิจกรรมที่คุณเข้าร่วม</h1>
            {joinedActivities.length === 0 ? (
                <p className="text-gray-500">คุณยังไม่มีกิจกรรมที่เข้าร่วม</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {joinedActivities.map((item, index) => (
                        <div key={`${item.id_ac}-${index}`} className="border p-4 rounded shadow bg-white">
                            <h2 className="text-lg font-semibold text-blue-600 mb-2">กิจกรรม {item.name_ac}</h2>
                            <p className="text-sm text-gray-600">
                                วันที่จัด: {new Date(item.date_start).toLocaleDateString()}
                            </p>
                            <p className="text-sm text-gray-600">
                                ถึง: {new Date(item.date_end).toLocaleDateString()}
                            </p>
                            <p className="text-sm mt-2">
                                สถานะ: <span className="font-semibold">{item.status}</span>
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
