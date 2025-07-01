import "../styles/globals.css"; 
import { Geist, Geist_Mono } from "next/font/google";
import '../styles/globals.css';

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
    <html lang="th" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
      </head>
      <body className="font-sans">
        {children}
      </body>
    </html>
  );
}
