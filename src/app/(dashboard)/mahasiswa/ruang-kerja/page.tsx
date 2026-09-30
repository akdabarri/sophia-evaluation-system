"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RuangKerjaPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWorkspaceData() {
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
      const activeUsername = userCookie ? userCookie.split("=")[1] : null;

      if (!activeUsername) {
        setLoading(false);
        return;
      }

      const { data: groupData, error } = await supabase
        .from("groups")
        .select(`
          *,
          submissions (*)
        `)
        .eq("username", activeUsername)
        .single();

      if (!error && groupData) {
        setData(groupData);
      }
      setLoading(false);
    }

    loadWorkspaceData();
  }, []);

  if (loading) {
    return <div className="p-8 text-sm text-slate-500 font-mono animate-pulse">Menyiapkan Ruang Kerja...</div>;
  }

  if (!data) {
    return <div className="p-8 text-sm text-red-500 font-mono">Sesi tidak valid. Silakan login kembali.</div>;
  }

  const tokens = data.tokens_left ?? 0;
  const submissions = (data.submissions as any[]) ?? [];

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-6 md:px-8 md:py-10 pb-16 font-sans">
      
      {/* Header Beranda Klasik Enterprise */}
      <div className="relative bg-[#070b14] rounded-xl p-6 md:p-10 mb-8 overflow-hidden shadow-xl border border-slate-800">
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)", 
            backgroundSize: "32px 32px" 
          }}
        />
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 md:gap-8">
          <div className="flex-1 w-full">
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight mb-2 md:mb-3">
              Halo, {data.group_name}.
            </h1>
            <p className="text-slate-400 text-xs md:text-sm max-w-2xl leading-relaxed">
              Ruang kerja komputasional Systematic Literature Review (SLR). Pastikan naskah IMRaD telah ditelaah mandiri sebelum evaluasi AI dijalankan.
            </p>
          </div>
          <Link 
            href="/mahasiswa/evaluasi" 
            className="w-full md:w-auto bg-white text-slate-900 hover:bg-slate-200 px-6 md:px-8 py-3.5 rounded text-sm font-bold transition-all flex items-center justify-center gap-2 shrink-0 shadow-sm"
          >
            Mulai Analisis IMRaD
          </Link>
        </div>
      </div>

      {/* Statistik Metrik */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-10">
        <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden group rounded-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600" />
          <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter block mb-3 md:mb-4">{tokens}</span>
          <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest">Token Tersisa</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 mt-1.5 md:mt-2 font-medium">Batas komputasi per kelompok</p>
        </div>

        <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden group rounded-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-amber-500" />
          <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter block mb-3 md:mb-4">
            {submissions.filter((s: any) => s.status === 'PENDING_REVIEW').length}
          </span>
          <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest">Antrean Validasi</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 mt-1.5 md:mt-2 font-medium">Menunggu persetujuan Dosen</p>
        </div>

        <div className="bg-white p-6 md:p-8 border border-slate-200 shadow-sm relative overflow-hidden group rounded-lg">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <span className="text-4xl md:text-5xl font-black text-slate-900 tracking-tighter block mb-3 md:mb-4">
            {submissions.filter((s: any) => s.status === 'PUBLISHED').length}
          </span>
          <p className="text-[10px] md:text-xs font-bold text-slate-900 uppercase tracking-widest">Evaluasi Tuntas</p>
          <p className="text-[10px] md:text-[11px] text-slate-500 mt-1.5 md:mt-2 font-medium">Laporan formatif siap dibaca</p>
        </div>
      </div>

      {/* Tabel Riwayat */}
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-end border-b border-slate-200 pb-4 gap-3">
        <h3 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">Riwayat Penilaian Terbaru</h3>
        <Link href="/mahasiswa/riwayat" className="text-[10px] md:text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors uppercase tracking-wider">
          Lihat Selengkapnya
        </Link>
      </div>

      <div className="bg-white border border-slate-200 shadow-sm rounded-lg overflow-x-auto">
        <table className="w-full text-left text-sm whitespace-nowrap md:whitespace-normal">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 md:px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Penyerahan</th>
              <th className="px-4 md:px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Status Sistem</th>
              <th className="px-4 md:px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px]">Skor Akhir</th>
              <th className="px-4 md:px-6 py-4 font-bold text-slate-500 uppercase tracking-widest text-[10px] text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 md:px-6 py-12 text-center text-slate-500 font-medium bg-white">
                  Belum ada draf naskah yang diserahkan.
                </td>
              </tr>
            ) : (
              submissions.sort((a: any,b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0,5).map((sub: any) => {
                const isPublished = sub.status === 'PUBLISHED';
                
                return (
                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 md:px-6 py-5 text-slate-600 font-medium text-xs">
                      {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-4 md:px-6 py-5">
                      {isPublished ? (
                        <span className="inline-block px-2 md:px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded text-[10px] font-bold uppercase tracking-wider">Selesai Divalidasi</span>
                      ) : (
                        <span className="inline-block px-2 md:px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded text-[10px] font-bold uppercase tracking-wider animate-pulse">Menunggu Dosen</span>
                      )}
                    </td>
                    
                    {/* AREA SENSOR SKOR */}
                    <td className="px-4 md:px-6 py-5">
                      {isPublished ? (
                        <span className="font-bold text-slate-900 text-sm md:text-base">{sub.final_score || "-"}</span>
                      ) : (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 border border-slate-200 rounded text-[11px] font-mono font-bold text-slate-400 cursor-help" title="Skor disembunyikan hingga dosen menyetujui evaluasi">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                          Proses Validasi
                        </div>
                      )}
                    </td>
                    
                    {/* AREA PENGUNCIAN TOMBOL */}
                    <td className="px-4 md:px-6 py-5 text-right">
                      {isPublished ? (
                        <Link href={`/mahasiswa/hasil?id=${sub.id}`} className="text-[10px] md:text-[11px] px-3 md:px-4 py-2 border border-slate-300 rounded font-bold text-slate-700 hover:bg-slate-900 hover:text-white transition-all uppercase tracking-wider inline-block">
                          Buka Laporan
                        </Link>
                      ) : (
                        <button disabled className="text-[10px] md:text-[11px] px-3 md:px-4 py-2 border border-slate-200 bg-slate-100 rounded font-bold text-slate-400 cursor-not-allowed uppercase tracking-wider inline-block">
                          Terkunci
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}