'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ActivityCard from './components/ActivityCard';
import CreateEvent from './components/CreateEvent';
import ConfirmJoinModal from './components/ConfirmJoinModal';
import ActivityDetailModal from './components/ActivityDetailModal';
import AdminEventReport from './components/AdminEventReport';
import UserEventReport from './components/UserEventReport';
import Navbar from './components/Navbar';
import { toast, Toaster } from 'react-hot-toast';
import AdminActivityReportModal from './components/AdminActivityReportModal';

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [joinedEvents, setJoinedEvents] = useState({});
  const [loading, setLoading] = useState(true);
  const [modals, setModals] = useState({
    confirm: false,
    report: false,
    userReport: false,
    createEvent: false,
    activityReport: false,
  });
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [confirmData, setConfirmData] = useState({});
  const [eventReport, setEventReport] = useState([]);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetch('/api/users'); // 🟢 ใช้ session
        if (!res.ok) throw new Error();
        const data = await res.json();
        setUser(data);
        if (data.role === 'user') await fetchJoinedEvents(data.id);
        fetchEvents(data.role);
      } catch {
        router.push('/login');
      }
    };
    fetchUserSession();
  }, []);

  const fetchEvents = async (role) => {
    try {
      const res = await fetch(`/api/events?role=${role}`);
      setEvents(await res.json());
    } catch {
      toast.error('เกิดข้อผิดพลาดในการโหลดกิจกรรม');
    }
  };

  const fetchJoinedEvents = async (userId) => {
    try {
      const res = await fetch(`/api/join?userId=${userId}`);
      const data = await res.json();
      setJoinedEvents(data.reduce((map, j) => ({ ...map, [`${j.user_id}_${j.event_id}`]: j.status }), {}));
    } catch {
      toast.error('โหลดกิจกรรมที่เข้าร่วมไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async (eventId) => {
    try {
      const res = await fetch('/api/users');
      const user = await res.json();
      const event = events.find(e => e.id === eventId);
      setConfirmData({ event_id: eventId, ...user, event_title: event?.title, event_detail: event?.detail });
      setModals(prev => ({ ...prev, confirm: true }));
    } catch {
      toast.error('ไม่สามารถเตรียมข้อมูลการเข้าร่วม');
    }
  };

  const handleCancelJoin = async (eventId) => {
    try {
      await fetch('/api/join', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId, user_id: user.id })
      });
      setJoinedEvents(prev => {
        const updated = { ...prev };
        delete updated[`${user.id}_${eventId}`];
        return updated;
      });
      toast.success('ยกเลิกการเข้าร่วมแล้ว');
    } catch {
      toast.error('ไม่สามารถยกเลิกการเข้าร่วมได้');
    }
  };

  const handleViewReport = async (event) => {
    if (user?.role === 'admin') {
      try {
        const res = await fetch(`/api/report?eventId=${event.id}&role=admin`);
        const data = await res.json();
        setSelectedActivity(data);
        setEventReport(data.report);
        setModals(prev => ({ ...prev, report: true }));
        toast.success('โหลดรายงานกิจกรรมสำเร็จ');
      } catch {
        toast.error('เกิดข้อผิดพลาดในการโหลดรายงาน');
      }
    } else {
      setSelectedActivity(event);
      setModals(prev => ({ ...prev, userReport: true }));
    }
  };

  const handleApprove = async (joinId, status) => {
    try {
      const res = await fetch('/api/join', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ join_id: joinId, status })
      });
      if (!res.ok) return toast.error('ไม่สามารถอัปเดตสถานะได้');
      toast.success('อัปเดตสถานะสำเร็จ');
      fetchEvents(user.role);
      fetchJoinedEvents(user.id);
      if (selectedActivity) handleViewReport(selectedActivity);
    } catch {
      toast.error('เกิดข้อผิดพลาดในการอนุมัติ');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#f9f9f9] animate-fade-in transition-all duration-700">
      <Toaster />
      <Navbar role={user?.role} onAddEvent={() => setModals(prev => ({ ...prev, createEvent: true }))} onOpenReport={() => setModals(prev => ({ ...prev, activityReport: true }))} onLogout={handleLogout} />

      <div className="flex flex-wrap justify-center gap-x-3 gap-y-8 px-6 py-6 max-w-full">
        {events.map(event => {
          const key = `${user?.id}_${event.id}`;
          return (
            <div key={event.id} className="w-[330px] transition-transform duration-300 hover:scale-105">
              <ActivityCard
                activity={{ ...event, name_ac: event.title, description_ac: event.description }}
                role={user?.role}
                isJoined={joinedEvents[key] === 'ลงทะเบียนสำเร็จ'}
                joinStatus={joinedEvents[key]}
                onJoin={() => handleJoin(event.id)}
                onCancel={() => handleCancelJoin(event.id)}
                onClick={() => setSelectedActivity(event)}
                onViewReport={() => handleViewReport(event)}
                onEditSuccess={() => fetchEvents(user?.role)}
              />
            </div>
          );
        })}
      </div>

      {modals.confirm && (
        <ConfirmJoinModal
          confirmData={confirmData}
          setConfirmData={setConfirmData}
          onClose={() => setModals(prev => ({ ...prev, confirm: false }))}
          onSubmitSuccess={() => {
            setModals(prev => ({ ...prev, confirm: false }));
            fetchJoinedEvents(user?.id);
          }}
        />
      )}

      {modals.userReport && selectedActivity && (
        <UserEventReport
          activity={selectedActivity}
          myStatus={joinedEvents[`${user?.id}_${selectedActivity.id}`]}
          onCancel={() => handleCancelJoin(selectedActivity.id)}
          onBack={() => setModals(prev => ({ ...prev, userReport: false }))}
        />
      )}

      {modals.report && selectedActivity && (
        <AdminEventReport
          activity={selectedActivity}
          report={eventReport}
          onApprove={handleApprove}
          onClose={() => setModals(prev => ({ ...prev, report: false }))}
        />
      )}

      {modals.createEvent && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4">
          <CreateEvent
            onCancel={() => setModals(prev => ({ ...prev, createEvent: false }))}
            onSuccess={() => {
              setModals(prev => ({ ...prev, createEvent: false }));
              fetchEvents(user?.role);
            }}
          />
        </div>
      )}

      {modals.activityReport && (
        <AdminActivityReportModal onClose={() => setModals(prev => ({ ...prev, activityReport: false }))} />
      )}
    </div>
  );
}
