"use client";

import { useRouter } from 'next/navigation';
import { clearSession } from '@/utils/storage';
import { useState, useEffect, useRef } from 'react';
import AllEventsModal from './AllEventsModal';
import JoinedHistory from './JoinedHistory';

export default function Navbar({ role, onAddEvent, onOpenReport }) {
  const router = useRouter();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [suggestedKeywords, setSuggestedKeywords] = useState([]);
  const [allEventsOpen, setAllEventsOpen] = useState(false);
  const [showExpired, setShowExpired] = useState(false);
  const [expiredEvents, setExpiredEvents] = useState([]);
  const [joinedOpen, setJoinedOpen] = useState(false);
  const [joinedActivities, setJoinedActivities] = useState([]);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const Button = ({ label, onClick, showIcon = false }) => (
    <button
      onClick={onClick}
      className={`text-white font-medium rounded-lg text-sm px-6 py-4 text-center w-180px flex items-center justify-center gap-5 transition 
        ${label === 'เพิ่มกิจกรรม' ? 'bg-green-500 hover:bg-green-600' : 'bg-blue-500 hover:bg-blue-600'}`}
    >
      {showIcon && <span>➕</span>}<span>{label}</span>
    </button>
  );

  const MenuItem = ({ label, icon, onClick }) => {
    const handleClick = async () => {
      if (label === 'ออกจากระบบ') {
        try {
          await fetch('/api/logout', { method: 'POST' });
        } catch (err) {
          console.error('Logout error:', err);
        } finally {
          clearSession();
          router.push('/login');
        }
      } else {
        onClick?.();
      }
    };

    return (
      <button
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 text-sm text-[--foreground] hover:bg-[--color-light-green] w-full text-left transition"
      >
        <span>{icon}</span>
        <span>{label}</span>
      </button>
    );
  };

  const AdminNav = () => (
    <nav className="flex flex-wrap gap-2 items-center">
      <Button label="เพิ่มกิจกรรม" onClick={onAddEvent} />
      <Button label="รายงานกิจกรรม" onClick={onOpenReport} />
      <Button label="กิจกรรมทั้งหมด" onClick={() => setAllEventsOpen(true)} />
    </nav>
  );

  useEffect(() => {
    if (!searchQuery) {
      setSearchResults([]);
      setSuggestedKeywords([]);
      return;
    }

    const delayDebounce = setTimeout(async () => {
      try {
        const res = await fetch(`/api/events?search=${encodeURIComponent(searchQuery)}`);
        const data = await res.json();
        setSearchResults(data);

        const suggestRes = await fetch(`/api/events?suggest=${encodeURIComponent(searchQuery)}`);
        const suggestData = await suggestRes.json();
        setSuggestedKeywords(suggestData.keywords || []);
      } catch {
        setSearchResults([]);
        setSuggestedKeywords([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter' && searchQuery) {
      setSuggestedKeywords([]);
      router.push(`/?search=${encodeURIComponent(searchQuery)}`);
    }
  };

  const loadExpiredEvents = async () => {
    setShowExpired(true);
    try {
      const res = await fetch(`/api/events?expired=true`);
      const data = await res.json();
      setExpiredEvents(data);
    } catch {
      alert('ไม่สามารถโหลดกิจกรรมที่สิ้นสุดแล้ว');
    }
  };

  const loadJoinedHistory = async () => {
    try {
      const res = await fetch('/api/report?role=user&mode=user');
      const data = await res.json();
      setJoinedActivities(Array.isArray(data) ? data : []);
      setJoinedOpen(true);
    } catch {
      alert('ไม่สามารถโหลดประวัติกิจกรรม');
    }
  };

  return (
    <>
      <header className="flex flex-col md:flex-row justify-between items-center px-6 py-4 bg-[--background] shadow-sm border-b border-[--border-color]">
        <div className="text-center md:text-left">
          <h1 className="text-lg font-bold text-[--color-dark-blue]">🎉 กิจกรรม Advice 2025</h1>
          <p className="text-sm text-[--foreground] opacity-80">ปีใหม่หัวใจพร้อมบวก สนุกสุดทุกภารกิจ!</p>
        </div>

        <div className="flex items-center gap-4 mt-3 md:mt-0 relative">
          <div className="relative">
            <input
              type="text"
              placeholder="ค้นหากิจกรรม..."
              className="px-3 py-1 text-sm border rounded-full focus:outline-none focus:ring focus:ring-[--color-blue] transition w-[200px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />

            {suggestedKeywords.length > 0 && (
              <ul className="absolute left-0 w-full mt-1 bg-white border border-gray-200 rounded shadow z-50 max-h-[200px] overflow-y-auto text-sm">
                {suggestedKeywords.map((kw, idx) => (
                  <li
                    key={idx}
                    className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                    onClick={() => setSearchQuery(kw)}
                  >
                    {kw}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {role === 'admin' ? <AdminNav /> : (
            <Button label="ประวัติกิจกรรม" onClick={loadJoinedHistory} />
          )}

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="w-9 h-9 rounded-full bg-[--btn-primary] text-white font-bold text-sm flex items-center justify-center shadow hover:opacity-90 transition"
            >
              A
            </button>
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 bg-white border border-[--border-color] rounded-md shadow-lg z-50 w-40 animate-fade-in">
                <MenuItem icon="⚙️" label="ตั้งค่าบัญชี" onClick={() => alert('ยังไม่เปิดให้ใช้งาน')} />
                <MenuItem icon="🔓" label="ออกจากระบบ" onClick={() => { clearSession(); router.push('/login'); }} />
              </div>
            )}
          </div>
        </div>
      </header>

      {showExpired && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4 animate-fade-in">
          <div className="modal w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
            <button className="absolute top-3 right-3 text-gray-500 hover:text-red-500 transition" onClick={() => setShowExpired(false)}>
              ✖
            </button>
            <h2 className="text-lg font-bold mb-4">🗓️ กิจกรรมที่สิ้นสุดแล้ว</h2>
            <ul className="space-y-2">
              {expiredEvents.length > 0 ? expiredEvents.map((event) => (
                <li key={event.id} className="card cursor-pointer">
                  <p className="font-medium text-[--foreground]">{event.title}</p>
                  <p className="text-sm opacity-80 line-clamp-2">{event.description}</p>
                </li>
              )) : (
                <p className="text-sm text-gray-500">ไม่พบกิจกรรมที่หมดอายุ</p>
              )}
            </ul>
          </div>
        </div>
      )}

      {joinedOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-center items-center p-4 animate-fade-in">
          <JoinedHistory joinedActivities={joinedActivities} onClose={() => setJoinedOpen(false)} />
        </div>
      )}

      <AllEventsModal open={allEventsOpen} onClose={() => setAllEventsOpen(false)} />
    </>
  );
}
