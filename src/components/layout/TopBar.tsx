"use client";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function TopBar() {
  const pathname = usePathname();
  const [role, setRole] = useState<string | null>(null);
  const [tokens, setTokens] = useState<number>(0);

  useEffect(() => {
    const cookies = document.cookie.split("; ");
    const roleCookie = cookies.find((row) => row.startsWith("sophia_role="));
    const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
    
    const currentRole = roleCookie ? roleCookie.split("=")[1] : null;
    const currentUsername = userCookie ? userCookie.split("=")[1] : null;
    
    setRole(currentRole);

    async function fetchTokenRealtime() {
      if (currentRole === "STUDENT" && currentUsername) {
        const { data } = await supabase
          .from("groups")
          .select("tokens_left")
          .eq("username", currentUsername)
          .single();
          
        if (data) {
          setTokens(data.tokens_left);
        }
      }
    }

    fetchTokenRealtime();
  }, [pathname]); // Memuat ulang data token setiap kali rute halaman berpindah

  // Format pembersihan nama rute untuk judul header
  const pageName = pathname.split("/").pop()?.replace(/-/g, " ") || "Dasbor Ruang Kerja";

  return (
    <header className="h-16 bg-white/95 backdrop-blur-sm border-b border-slate-200 flex items-center justify-between px-8 shrink-0 sticky top-0 z-50">
      <div className="flex items-center">
        <h2 className="text-sm font-bold text-slate-800 capitalize tracking-tight">
          {pageName}
        </h2>
      </div>
      
      {role === "STUDENT" && (
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded shadow-sm">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
            Sisa Kuota
          </span>
          <div className="w-px h-3 bg-slate-300" />
          <div className="flex gap-1.5">
            {[...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${i < tokens ? 'bg-blue-600' : 'bg-slate-200'}`} 
              />
            ))}
          </div>
        </div>
      )}

      {role === "INSTRUCTOR" && (
        <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded shadow-sm">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-widest">
            Sistem Aktif
          </span>
        </div>
      )}
    </header>
  );
}