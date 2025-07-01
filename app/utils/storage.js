// app/utils/storage.js

export async function fetchSessionUser() {
  try {
    const res = await fetch('/api/users', { credentials: 'include' }); // ใช้ cookie
    if (!res.ok) throw new Error('Session ไม่ถูกต้อง');
    return await res.json(); // คืน user object ทั้งชุด
  } catch (err) {
    console.error('ไม่สามารถดึงข้อมูล session ผู้ใช้:', err);
    return null;
  }
}

export async function getUserData() {
  return await fetchSessionUser();
}

export async function getUserId() {
  const user = await fetchSessionUser();
  return user?.id || null;
}

export async function getUserRole() {
  const user = await fetchSessionUser();
  return user?.role || '';
}

// ✅ สำหรับกรณียังใช้ localStorage เก่าในบางที่ (optional)
export function getUserIdFromLocal() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user)?.id : null;
}

// ✅ สำหรับอนาคต: เคลียร์ session ผ่าน API logout
export function clearSession() {
  console.log('🚪 เคลียร์ session - กรุณาสร้าง /api/logout หากต้องการลบ cookie');
}
