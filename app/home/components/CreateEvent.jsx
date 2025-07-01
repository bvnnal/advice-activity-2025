'use client';

import { useState, forwardRef, useImperativeHandle, useEffect } from 'react';
import { TextField, Snackbar, Alert, Slide } from '@mui/material';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format, parseISO } from 'date-fns';
import { X } from 'lucide-react';

const getNowDate = () => new Date().toISOString().slice(0, 10);

const Input = ({ label, error, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <input className={`w-full p-3 border rounded-xl focus:outline-none focus:ring text-sm shadow-sm ${error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-blue-400'}`} {...props} />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

const Textarea = ({ label, error, ...props }) => (
  <div className="space-y-1">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <textarea className={`w-full p-3 border rounded-xl focus:outline-none focus:ring text-sm shadow-sm ${error ? 'border-red-500 ring-red-200' : 'border-gray-300 focus:ring-blue-400'}`} rows={3} {...props} />
    {error && <p className="text-red-500 text-xs">{error}</p>}
  </div>
);

const CreateEvent = forwardRef(({ onCancel, onClose, onEditSuccess, editMode = false, eventData = {} }, ref) => {
  const [form, setForm] = useState({
    title: '', description: '', type: '', otherType: '',
    date_start_date: getNowDate(), date_start_time: new Date(),
    date_end_date: getNowDate(), date_end_time: new Date(),
    max_participants: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const eventTypes = ['อบรม', 'แข่งขัน', 'สุขภาพ', 'ออนไลน์', 'อื่นๆ'];

  useEffect(() => {
    if (editMode && eventData?.id) {
      const start = parseISO(eventData.date_start);
      const end = parseISO(eventData.date_end);
      setForm({
        title: eventData.title || '',
        description: eventData.description || '',
        type: eventTypes.includes(eventData.type) ? eventData.type : 'อื่นๆ',
        otherType: eventTypes.includes(eventData.type) ? '' : eventData.type,
        date_start_date: format(start, 'yyyy-MM-dd'),
        date_start_time: start,
        date_end_date: format(end, 'yyyy-MM-dd'),
        date_end_time: end,
        max_participants: eventData.max_participants?.toString() || '',
      });
    }
  }, [editMode, eventData]);

  const handleChange = ({ target: { name, value } }) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const handleTimeChange = (name, value) => {
    setForm(f => ({ ...f, [name]: value }));
    setErrors(e => ({ ...e, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!form.title.trim()) newErrors.title = 'กรุณาระบุชื่อกิจกรรม';
    if (!form.description.trim()) newErrors.description = 'กรุณาระบุรายละเอียด';
    if (!form.type) newErrors.type = 'กรุณาเลือกประเภทกิจกรรม';
    if (form.type === 'อื่นๆ' && !form.otherType.trim()) newErrors.otherType = 'กรุณาระบุประเภทกิจกรรม';
    if (!/^[1-9]\d*$/.test(form.max_participants)) newErrors.max_participants = 'กรุณาระบุจำนวนผู้เข้าร่วมเป็นตัวเลขที่ถูกต้อง';
    const start = new Date(`${form.date_start_date}T${format(form.date_start_time, 'HH:mm')}`);
    const end = new Date(`${form.date_end_date}T${format(form.date_end_time, 'HH:mm')}`);
    if (end.getTime() - start.getTime() < 60000) newErrors.date_end_time = 'วันสิ้นสุดต้องมากกว่าวันเริ่มอย่างน้อย 1 นาที';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const submit = async () => {
    if (!validate()) return;
    setLoading(true);
    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      type: form.type === 'อื่นๆ' ? form.otherType : form.type,
      date_start: `${form.date_start_date}T${format(form.date_start_time, 'HH:mm')}`,
      date_end: `${form.date_end_date}T${format(form.date_end_time, 'HH:mm')}`,
      max_participants: parseInt(form.max_participants, 10),
    };

    try {
      const res = await fetch('/api/events', {
        method: editMode ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editMode ? { id: eventData.id, ...payload } : payload),
      });

      if (!res.ok) throw await res.json();
      setSnackbar({ open: true, message: editMode ? '✅ กิจกรรมสำเร็จ' : '✅ เพิ่มกิจกรรมสำเร็จ', severity: 'success' });

      if (!editMode) {
        setForm({
          title: '', description: '', type: '', otherType: '',
          date_start_date: getNowDate(), date_start_time: new Date(),
          date_end_date: getNowDate(), date_end_time: new Date(),
          max_participants: '',
        });
      }

      onClose?.();
      if (editMode) onEditSuccess?.();
    } catch (err) {
      setSnackbar({ open: true, message: '❌ ไม่สำเร็จ: ' + (err.message || 'เกิดข้อผิดพลาด'), severity: 'error' });
    } finally {
      setLoading(false);
    }

  };

  useImperativeHandle(ref, () => ({ submit }));

  return (
    <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-xl w-full relative overflow-y-auto max-h-[90vh] animate-fade-in">
      <button
        onClick={onClose || onCancel}
        className="absolute top-4 right-4 text-xl text-gray-500 hover:text-red-500 z-10"
        aria-label="Close modal"
      >
        <X className="w-6 h-6" />
      </button>

      <h2 className="text-xl font-bold text-gray-800 mb-4">
        {editMode ? 'แก้ไขกิจกรรม' : 'เพิ่มกิจกรรมใหม่'}
      </h2>

      <form className="space-y-5">
        <Input label="ชื่อกิจกรรม" name="title" value={form.title} onChange={handleChange} error={errors.title} />
        <Textarea label="รายละเอียดกิจกรรม" name="description" value={form.description} onChange={handleChange} error={errors.description} />

        <div className="space-y-1">
          <label className="block text-sm font-medium text-gray-700">ประเภทกิจกรรม</label>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setForm(f => ({ ...f, type }))}
                className={`px-4 py-1.5 rounded-xl border text-sm ${
                  form.type === type ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
          {form.type === 'อื่นๆ' && (
            <Input label="กรุณาระบุประเภทกิจกรรมเพิ่มเติม" name="otherType" value={form.otherType} onChange={handleChange} error={errors.otherType} />
          )}
          {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type}</p>}
        </div>

        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <div className="grid grid-cols-2 gap-4">
            <Input label="วันเริ่ม (วันที่)" name="date_start_date" type="date" value={form.date_start_date} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เวลาเริ่ม (เวลา)</label>
              <TimePicker
                value={form.date_start_time}
                onChange={val => handleTimeChange('date_start_time', val)}
                ampm={false}
                renderInput={params => <TextField {...params} fullWidth size="small" />}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input label="วันสิ้นสุด (วันที่)" name="date_end_date" type="date" value={form.date_end_date} onChange={handleChange} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">เวลาสิ้นสุด (เวลา)</label>
              <TimePicker
                value={form.date_end_time}
                onChange={val => handleTimeChange('date_end_time', val)}
                ampm={false}
                renderInput={params => <TextField {...params} fullWidth size="small" />}
              />
              {errors.date_end_time && <p className="text-red-500 text-xs mt-1">{errors.date_end_time}</p>}
            </div>
          </div>
        </LocalizationProvider>

        <Input
          label="จำนวนผู้เข้าร่วมสูงสุด"
          name="max_participants"
          type="number"
          value={form.max_participants}
          onChange={handleChange}
          error={errors.max_participants}
          min="1"
          inputMode="numeric"
          pattern="[0-9]*"
        />

        <div className="flex justify-end gap-4 pt-6 border-t mt-8">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-xl border text-gray-600 hover:bg-gray-100"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={loading}
            className={`px-5 py-2 rounded-xl text-white font-medium ${
              loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {loading ? 'กำลังบันทึก...' : 'ยืนยัน'}
          </button>
        </div>
      </form>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        TransitionComponent={Slide}
      >
        <Alert
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );

});

export default CreateEvent;