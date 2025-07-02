'use client';

import { useState } from 'react';
import CreateEvent from './CreateEvent';
import { CalendarDays, Users, ClipboardList, BadgeCheck } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

function formatDateParts(date) {
  const d = new Date(date);
  return {
    date: format(d, "dd MMM yyyy", { locale: th }),
    time: format(d, "HH:mm", { locale: th }) + ' น.'
  };
}

export default function ActivityCard({
  activity = {},
  role = 'user',
  isJoined = false,
  joinStatus = '',
  onJoin,
  onCancel,
  onClick,
  onViewReport,
  onEditSuccess,
  onEdit  ,
}) {
  const {
    title,
    description,
    date_start,
    date_end,
    max_participants = 1,
    current_participants = 0,
    type,
  } = activity;

  const isFull = current_participants >= max_participants;
  const percent = Math.min((current_participants / max_participants) * 100, 100);
  const stop = (fn) => (e) => (e.stopPropagation(), fn?.());
  const start = formatDateParts(date_start);
  const end = formatDateParts(date_end);
  const baseBtn = 'text-white font-medium rounded-lg text-sm px-4 py-2 text-center w-[110px] transition-all duration-150';

  const getStatusColor = () => {
    switch (joinStatus) {
      case 'รอดำเนินการ':
        return 'text-blue-500 bg-neutral-50';
      case 'ลงทะเบียนสำเร็จ':
        return 'text-green-800 bg-green-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  const getButtons = () => (
    <div className="flex gap-3 w-full justify-between px-10 mt-auto mb-2">
      {role === 'admin' ? (
        <>
          <button onClick={stop(() => onEdit?.(activity))} className={`${baseBtn} bg-yellow-500 hover:bg-yellow-600`}>แก้ไข</button>
          <button onClick={stop(onViewReport)} className={`${baseBtn} bg-blue-500 hover:bg-blue-600`}>รายงาน</button>
        </>
      ) : (
        <>
          {joinStatus === 'รอดำเนินการ' && (
            <button onClick={stop(onCancel)} className={`${baseBtn} bg-red-500 hover:bg-red-600`}>ยกเลิก</button>
          )}
          {isJoined && joinStatus !== 'รอดำเนินการ' && (
            <button onClick={stop(onCancel)} className={`${baseBtn} bg-red-500 hover:bg-red-600`}>ยกเลิก</button>
          )}
          {!isFull && !isJoined && joinStatus !== 'รอดำเนินการ' && (
            <button onClick={stop(onJoin)} className={`${baseBtn} bg-green-500 hover:bg-green-600`}>เข้าร่วม</button>
          )}
          <button onClick={stop(onViewReport)} className={`${baseBtn} bg-blue-500 hover:bg-blue-600`}>รายงาน</button>
        </>
      )}

    </div>
  );

  return (
    <>
      <div
        onClick={onClick}
        className="card cursor-pointer p-3 rounded-2xl shadow-md hover:shadow-lg hover:-translate-y-1 hover:ring-2 hover:ring-[#6b6a68] hover:ring-offset-2 transition w-[330px] h-[420px] flex flex-col justify-between overflow-hidden"
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="w-[85%]">
            <h2 className="text-lg font-semibold text-heading line-clamp-2 min-h-[2.6rem]">
              <span className="inline-flex items-center gap-2">
                <BadgeCheck className="w-5 h-5 text-primary" />
                {title || 'ไม่พบชื่อกิจกรรม'}
              </span>
            </h2>
            <p className="text-sm text-subtle-text mt-1 line-clamp-2 min-h-[2.8rem]">{description || 'ไม่มีรายละเอียดกิจกรรมเพิ่มเติม'}</p>
          </div>
          <span className={`text-xs px-3 py-1 rounded-full font-medium ${isFull ? 'bg-danger text-white' : 'bg-success text-white'}`}>
            {isFull ? 'เต็มแล้ว' : 'เปิดรับ'}
          </span>
        </div>

        {/* Info Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-subtle-text w-full h-[160px] shadow bg-neutral-50 rounded-xl p-4 overflow-hidden">
          <div className="flex items-start">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-foreground" />
                <span className="truncate">{type || 'ไม่ระบุประเภท'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-start">
            <div className="w-full">
              <div className="flex justify-between mb-1">
                <span className="flex items-center gap-1 text-foreground font-medium">
                  <Users className="w-4 h-4" /> ผู้เข้าร่วม
                </span>
                <span>{current_participants} / {max_participants}</span>
              </div>
              <div className="w-full h-2 bg-muted rounded overflow-hidden">
                <div className={`h-full ${isFull ? 'bg-danger' : 'bg-success'}`} style={{ width: `${percent}%` }} />
              </div>
              {percent > 80 && !isFull && (
                <p className="text-xs text-danger mt-1 line-clamp-1 truncate">⚠️ เหลือที่นั่งน้อย</p>
              )}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="text-foreground font-medium flex items-center gap-2 mb-1">
              <CalendarDays className="w-4 h-4" /> วันที่จัดกิจกรรม
            </p>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">เริ่ม:</p>
                <p className="truncate">{start.date}</p>
                <p>{start.time}</p>
              </div>
              <div>
                <p className="font-medium">สิ้นสุด:</p>
                <p className="truncate">{end.date}</p>
                <p>{end.time}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-end gap-2 mt-auto mb-3">
          {(joinStatus === 'รอดำเนินการ' || joinStatus === 'ลงทะเบียนสำเร็จ') && (
            <p className={`text-base font-semibold  px-3 py-2 w-fit justify-between rounded-md shadow-sm ${getStatusColor()}`}>
              สถานะของคุณ: {joinStatus}
            </p>
          )}
          {getButtons()}
        </div>

      </div>


      {/* Edit Modal */}
      {/* {editMode && (
        <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4 overflow-y-auto animate-fade-in">
          <CreateEvent
            eventData={activity}
            editMode
            onCancel={() => setEditMode(false)}
            onEditSuccess={() => {
              setEditMode(false);
              onEditSuccess?.();
            }}
          />
        </div>
      )} */}
    </>
  );
}
