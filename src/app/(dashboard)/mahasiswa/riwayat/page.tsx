"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function RiwayatPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ total: 0, highestScore: 0, lastStatus: "-" });

  useEffect(() => {
    async function fetchHistory() {
      // 1. Dapatkan identitas kelompok dari sesi peramban
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
      const activeUsername = userCookie ? userCookie.split("=")[1] : null;

      if (!activeUsername) {
        setLoading(false);
        return;
      }

      // 2. Tarik ID kelompok terlebih dahulu
      const { data: group } = await supabase
        .from("groups")
        .select("id")
        .eq("username", activeUsername)
        .single();

      if (group) {
        // 3. Tarik seluruh riwayat naskah kelompok tersebut
        const { data: subs } = await supabase
          .from("submissions")
          .select("*")
          .eq("group_id", group.id)
          .order("created_at", { ascending: false });

        if (subs && subs.length > 0) {
          setSubmissions(subs);
          
          // Kalkulasi Metrik KPI
          const scores = subs.map(s => s.final_score || s.ai_total_score).filter(Boolean);
          const highest = scores.length > 0 ? Math.max(...scores) : 0;
          
          setKpi({
            total: subs.length,
            highestScore: highest,
            lastStatus: subs[0].status === "PUBLISHED" ? "Tuntas (Divalidasi)" : "Menunggu Dosen"
          });
        }
      }
      setLoading(false);
    }

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Menyinkronkan Rekam Jejak Komputasi...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Eksklusif */}
      <div className="mb-8 pt-8 border-b border-slate-200/80 pb-6">
        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
          Jejak Audit Sistem
        </span>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
          Log Riwayat Evaluasi
        </h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-2xl">
          Rekam jejak seluruh iterasi naskah IMRaD yang telah diproses oleh arsitektur Generative AI. Laporan yang masih menunggu otorisasi Dosen Pengampu tidak dapat diakses untuk menjaga integritas data.
        </p>
      </div>

      {/* Baris KPI (Key Performance Indicators) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Total Iterasi Komputasi</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-slate-800 tracking-tighter">{kpi.total}</span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Naskah</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Capaian Skor Tertinggi</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-4xl font-black text-emerald-600 tracking-tighter">{kpi.highestScore}</span>
            <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">/ 100</span>
          </div>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Status Naskah Terakhir</span>
          <div className="flex items-center gap-3 mt-3">
            <div className={`w-2.5 h-2.5 rounded-full ${kpi.lastStatus === "Menunggu Dosen" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            <span className="text-sm font-bold text-slate-700 tracking-tight">{kpi.lastStatus}</span>
          </div>
        </div>
      </div>

      {/* Tabel Data Grid Presisi */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <h3 className="font-bold text-slate-900 text-sm tracking-tight">Katalog Resolusi Naskah</h3>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Diurutkan dari terbaru</span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Penyerahan (Timestamp)</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Iterasi</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Status Validasi (HITL)</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Metrik Skor</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Akses Laporan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <p className="text-slate-500 font-medium text-sm">Belum ada jejak evaluasi naskah.</p>
                    <p className="text-slate-400 text-xs mt-1">Lakukan komputasi draf IMRaD di menu Mulai Evaluasi.</p>
                  </td>
                </tr>
              ) : (
                submissions.map((sub, idx) => {
                  const isPublished = sub.status === "PUBLISHED";
                  // Menghitung iterasi mundur karena data diurutkan dari terbaru
                  const iterNumber = submissions.length - idx; 
                  
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                      
                      <td className="px-6 py-5">
                        <p className="font-bold text-slate-700 text-[13px]">
                          {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {new Date(sub.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })} WIB
                        </p>
                      </td>

                      <td className="px-6 py-5 text-center">
                        <span className="inline-flex items-center justify-center w-6 h-6 rounded bg-slate-100 border border-slate-200 font-mono text-[11px] font-bold text-slate-600">
                          {sub.iteration_number || iterNumber}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        {isPublished ? (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-widest">Selesai Ditelaah</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse"></span>
                            <span className="text-[11px] font-bold text-amber-700 uppercase tracking-widest">Dalam Antrean Dosen</span>
                          </div>
                        )}
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex items-center justify-center gap-3">
                          <div className="text-center">
                            <span className="block font-mono text-[13px] font-bold text-slate-400">{sub.ai_total_score || "-"}</span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Skor AI</span>
                          </div>
                          <div className="w-px h-6 bg-slate-200"></div>
                          <div className="text-center">
                            <span className={`block font-mono text-[13px] font-bold ${isPublished ? 'text-emerald-600' : 'text-slate-400'}`}>
                              {sub.final_score || "-"}
                            </span>
                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">Skor Akhir</span>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-5 text-right">
                        {isPublished ? (
                          <Link 
                            href={`/mahasiswa/hasil?id=${sub.id}`} 
                            className="inline-block bg-white border border-slate-300 text-slate-700 hover:border-blue-500 hover:text-blue-600 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                          >
                            Buka Laporan
                          </Link>
                        ) : (
                          <button 
                            disabled 
                            className="inline-block bg-slate-100 border border-slate-200 text-slate-400 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider cursor-not-allowed"
                          >
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
    </div>
  );
}