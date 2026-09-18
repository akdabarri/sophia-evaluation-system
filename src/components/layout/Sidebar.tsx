"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("SOPHIA User");

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const roleCookie = cookies.find((row) => row.startsWith("sophia_role="));
    const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
    
    if (roleCookie) setRole(roleCookie.split("=")[1]);
    if (userCookie) setUsername(userCookie.split("=")[1]);
  }, []);

  const handleLogout = () => {
    document.cookie = "sophia_username=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    document.cookie = "sophia_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/login");
  };

  if (!role) return <aside className="w-64 bg-[#0a0f1c] shrink-0 hidden md:block" />;

  return (
    <aside className="w-64 bg-[#0a0f1c] text-slate-300 flex flex-col justify-between hidden md:flex shrink-0 border-r border-slate-800">
      <div>
        <div className="h-16 flex items-center px-8 border-b border-white/5">
          <div className="w-5 h-5 bg-blue-600 rounded-sm flex items-center justify-center text-white mr-3">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
          </div>
          <span className="font-bold tracking-[0.2em] text-sm uppercase text-white">SOPHIA</span>
        </div>
        
        <div className="py-8">
          {role === "STUDENT" ? (
            <>
              <nav className="space-y-1 mb-8">
                <Link href="/mahasiswa/ruang-kerja" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname === '/mahasiswa/ruang-kerja' ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                  Ruang Kerja
                </Link>
              </nav>

              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Komputasi</p>
              <nav className="space-y-1 mb-8">
                <Link href="/mahasiswa/evaluasi" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/evaluasi') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                  Mulai Evaluasi
                </Link>
                <Link href="/mahasiswa/riwayat" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/riwayat') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                  Riwayat Laporan
                </Link>
              </nav>

              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Sistem</p>
              <nav className="space-y-1">
                <Link href="/mahasiswa/panduan" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/panduan') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                  Panduan Evaluasi
                </Link>
                <Link href="/mahasiswa/pengaturan" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/pengaturan') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                  Pengaturan Profil
                </Link>
                <Link href="/mahasiswa/bantuan" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/bantuan') ? 'border-blue-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  Tiket Bantuan
                </Link>
              </nav>
            </>
          ) : (
            <>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Human-in-the-Loop</p>
              <nav className="space-y-1 mb-8">
                <Link href="/dosen/telemetri" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/telemetri') ? 'border-amber-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  Dasbor Telemetri
                </Link>
              </nav>
              <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-3 px-8">Otoritas</p>
              <nav className="space-y-1">
                <Link href="/dosen/kuota" className={`flex items-center gap-3 px-8 py-2.5 text-sm transition-colors border-l-2 ${pathname.includes('/kuota') ? 'border-amber-500 text-white bg-white/5' : 'border-transparent hover:text-white'}`}>
                  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" /></svg>
                  Manajemen Kuota
                </Link>
              </nav>
            </>
          )}
        </div>
      </div>
      
      <div className="p-6 border-t border-white/5 bg-[#070b14]">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-8 h-8 rounded-sm flex items-center justify-center text-xs font-bold text-white shrink-0 ${role === 'INSTRUCTOR' ? 'bg-amber-600' : 'bg-blue-600'}`}>
              {role === 'INSTRUCTOR' ? 'DS' : 'M'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{username}</p>
              <p className="text-[10px] font-mono tracking-wider text-slate-500 truncate uppercase">{role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            title="Keluar dari Sistem"
            className="text-slate-500 hover:text-red-400 p-2 rounded hover:bg-red-500/10 transition-colors shrink-0"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </button>
        </div>
      </div>
    </aside>
  );
}