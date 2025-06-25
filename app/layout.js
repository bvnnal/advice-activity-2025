import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "กิจกรรม Advice New Year Party 2025 ตอบแทนพนักงานทุกคน!",
  description: "ปีใหม่หัวใจพร้อมบวก สนุกสุดทุกภารกิจ!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="th">
      <body>
        {children}
      </body>
    </html>
  );
}
