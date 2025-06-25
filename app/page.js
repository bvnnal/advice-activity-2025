import Link from 'next/link';

export default function IndexPage() {
  return (
    <main className="p-10">
      <h1 className="text-2xl mb-4">ยินดีต้อนรับ</h1>
      <Link href="/home" className="text-blue-500 underline">
        ไปที่หน้ากิจกรรมปีใหม่
      </Link>
    </main>
  );
}
