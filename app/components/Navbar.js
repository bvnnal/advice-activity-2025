"use client";
import { useRouter } from 'next/navigation';

export default function Navbar() {
    const router = useRouter();

    const handleLogout = () => {
        alert("คุณได้ออกจากระบบ")
        router.push('/login');
    };
    

    return (
        <nav className="bg-blue-600 text-white px-6 py-6 shadow">
            <div>
                <h1 className="text-xl font-semibold">กิจกรรม Advice New Year Party 2025 ตอบแทนพนักงานทุกคน!</h1>
                <h2 className="text-l font-semibold">ปีใหม่หัวใจพร้อมบวก สนุกสุดทุกภารกิจ!</h2>
            </div>

            <button onClick={() => handleLogout()} className="absolute top-5 right-4">
                <img src="/icons8-logout-50.png" alt="Logout" className="w-8 h-8 hover:opacity-80 transition"/>
            </button>
            
        </nav>
    );
}
