"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image"; // Mengimpor komponen Image dari Next.js
import { usePathname, useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const roleCookie = cookies.find((row) => row.startsWith("sophia_role="));
    if (roleCookie) {
      setRole(roleCookie.split("=")[1]);
    } else {
      setRole(pathname.includes("/dosen") ? "INSTRUCTOR" : "STUDENT");
    }
  }, [pathname]);

  const closeSidebar = () => setIsOpen(false);

  const handleLogout = () => {
    document.cookie = "sophia_role=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    router.push("/");
  };

  return (
    <>
      {/* HEADER MOBILE */}
      <div className="md:hidden flex items-center bg-[#0a0f1c] w-full p-4 text-white border-b border-slate-800 h-16 gap-4">
        <button 
          onClick={() => setIsOpen(!isOpen)} 
          className="p-2 -ml-2 bg-slate-800/50 rounded hover:bg-slate-700 transition-colors focus:outline-none shrink-0"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
        
        <div className="font-bold text-lg tracking-widest flex items-center gap-3">
          {/* Logo pada Header Seluler */}
          <Image 
            src="/logo1.png" 
            alt="SOPHIA Logo" 
            width={32} 
            height={32} 
            className="w-7 h-7 object-contain shrink-0 drop-shadow-[0_0_8px_rgba(37,99,235,0.5)]" 
          />
          SOPHIA
        </div>
      </div>

      {/* OVERLAY GELAP UNTUK MOBILE */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* SIDEBAR UTAMA */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f1c] text-slate-300 flex flex-col border-r border-slate-800 transition-all duration-300 ease-in-out
        md:relative md:h-full md:translate-x-0 ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full md:shadow-none"}`}
      >
        {/* Area Logo Desktop & Menu Laci */}
        <div className="flex items-center gap-3 px-8 py-8 flex-none border-b border-slate-800 md:border-none">
          {/* Logo pada Bilah Samping Desktop */}
          <Image 
            src="/logo1.png" 
            alt="SOPHIA Logo" 
            width={40} 
            height={40} 
            className="w-8 h-8 object-contain shrink-0 drop-shadow-[0_0_12px_rgba(37,99,235,0.5)]" 
          />
          <span className="font-bold text-xl tracking-widest text-white">SOPHIA</span>
        </div>

        {/* Area Navigasi */}
        <div className="flex-1 overflow-y-auto py-6 md:py-0 scrollbar-hide pt-6">
          
          {role === "STUDENT" && (
            <>
              <nav className="space-y-1 mb-8">
                <Link href="/mahasiswa/ruang-kerja" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/ruang-kerja') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Ruang Kerja
                </Link>
              </nav>

              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Komputasi</p>
              <nav className="space-y-1 mb-8">
                <Link href="/mahasiswa/evaluasi" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/evaluasi') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" /></svg>
                  Mulai Evaluasi
                </Link>
                <Link href="/mahasiswa/riwayat" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/riwayat') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                   <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                  Riwayat Laporan
                </Link>
              </nav>

              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Sistem</p>
              <nav className="space-y-1 mb-8">
                <Link href="/mahasiswa/panduan" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/panduan') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Panduan Evaluasi
                </Link>
                <Link href="/mahasiswa/profil" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/profil') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Pengaturan Profil
                </Link>
                <Link href="/mahasiswa/bantuan" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/bantuan') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Tiket Bantuan
                </Link>
              </nav>
            </>
          )}

          {role === "INSTRUCTOR" && (
            <>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Human In The Loop</p>
              <nav className="space-y-1 mb-8">
                <Link href="/dosen/telemetri" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/telemetri') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Dasbor Telemetri
                </Link>
                <Link href="/dosen/kuota" onClick={closeSidebar} className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/kuota') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  Manajemen Kuota
                </Link>
              </nav>
            </>
          )}

        </div>

        {/* Area Profil & Logout */}
        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex-none">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-bold border border-slate-700 shrink-0">
                {role === "INSTRUCTOR" ? "DS" : "M"}
              </div>
              <div className="truncate">
                <p className="text-sm font-bold text-white truncate max-w-[120px]">
                  {role === "INSTRUCTOR" ? "Asdos" : "Kelompok"}
                </p>
                <p className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">{role}</p>
              </div>
            </div>
            <button onClick={handleLogout} className="text-slate-500 hover:text-white transition-colors focus:outline-none shrink-0 ml-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}