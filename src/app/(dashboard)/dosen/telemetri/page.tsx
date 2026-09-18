"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

export default function TelemetriPage() {
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [kpi, setKpi] = useState({
    pending: 0,
    published: 0,
    avgScore: 0,
    completionRate: 0
  });

  const fetchTelemetry = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("submissions")
      .select(`
        *,
        groups ( username, group_name )
      `)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setSubmissions(data);

      // Kalkulasi KPI
      const pendingCount = data.filter(s => s.status === "PENDING_REVIEW").length;
      const publishedCount = data.filter(s => s.status === "PUBLISHED").length;
      const totalScore = data.reduce((acc, curr) => acc + (curr.ai_total_score || 0), 0);
      const avg = data.length > 0 ? Math.round(totalScore / data.length) : 0;
      const rate = data.length > 0 ? Math.round((publishedCount / data.length) * 100) : 0;

      setKpi({ pending: pendingCount, published: publishedCount, avgScore: avg, completionRate: rate });

      // Agregasi Data untuk Grafik (Volume Inferensi Harian)
      const dailyData: Record<string, { count: number, totalScore: number }> = {};
      
      // Balik urutan untuk grafik (dari terlama ke terbaru)
      const reversedData = [...data].reverse();
      
      reversedData.forEach(sub => {
        const dateStr = new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
        if (!dailyData[dateStr]) {
          dailyData[dateStr] = { count: 0, totalScore: 0 };
        }
        dailyData[dateStr].count += 1;
        dailyData[dateStr].totalScore += (sub.ai_total_score || 0);
      });

      const formattedChart = Object.keys(dailyData).map(date => ({
        date,
        volume: dailyData[date].count,
        avgDaily: Math.round(dailyData[date].totalScore / dailyData[date].count)
      }));

      setChartData(formattedChart);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  // Tooltip Grafik Khusus
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white border border-slate-200 p-4 shadow-xl rounded font-mono text-[11px] text-slate-700">
          <p className="font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">{label}</p>
          <p className="mb-1"><span className="text-slate-400">Volume Komputasi:</span> <span className="text-blue-600 font-bold">{payload[0].value} Naskah</span></p>
          <p><span className="text-slate-400">Rerata Skor Harian:</span> <span className="text-emerald-600 font-bold">{payload[1]?.value || 0}</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1200px] mx-auto w-full pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Eksklusif */}
      <div className="mb-8 pt-8 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
            Pusat Komando Instruktur
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Telemetri & Tata Kelola HITL
          </h1>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
            Dasbor pengawasan mesin AI. Lakukan intervensi <strong>Human-in-the-Loop</strong> untuk memitigasi halusinasi model bahasa sebelum laporan formatif diekspos kepada mahasiswa.
          </p>
        </div>
        <button onClick={fetchTelemetry} className="bg-white border border-slate-300 text-slate-700 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-colors rounded shadow-sm flex items-center gap-2 shrink-0">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          Segarkan Data
        </button>
      </div>

      {loading ? (
        <div className="flex h-[40vh] items-center justify-center">
          <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
            Mengekstraksi Data Telemetri...
          </div>
        </div>
      ) : (
        <>
          {/* Baris KPI (Key Performance Indicators) */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-[#0a0f1c] border border-slate-800 p-6 rounded-xl shadow-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl transform translate-x-8 -translate-y-8" />
              <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest block mb-2 relative z-10">Antrean Intervensi</span>
              <div className="flex items-baseline gap-2 relative z-10">
                <span className="text-5xl font-black text-white tracking-tighter">{kpi.pending}</span>
                <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Draf</span>
              </div>
              {kpi.pending > 0 && (
                <div className="absolute top-6 right-6 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </div>
              )}
            </div>
            
            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Total Divalidasi</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-emerald-600 tracking-tighter">{kpi.published}</span>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">Laporan</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rerata Skor Kelas</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-slate-800 tracking-tighter">{kpi.avgScore}</span>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">/ 100</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm flex flex-col justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rasio Penyelesaian</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-4xl font-black text-blue-600 tracking-tighter">{kpi.completionRate}</span>
                <span className="text-xs font-mono text-slate-500 uppercase tracking-widest">%</span>
              </div>
            </div>
          </div>

          {/* Grafik Volume Aktivitas (Recharts) */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm mb-8">
            <div className="mb-6">
              <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">Aktivitas Komputasi Sistem</h3>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Tren volume pengumpulan draf berdasarkan garis waktu</p>
            </div>
            <div className="h-[260px] w-full">
              {chartData.length === 0 ? (
                <div className="h-full flex items-center justify-center border border-dashed border-slate-200 rounded text-slate-400 text-xs font-medium">
                  Belum ada data aktivitas komputasi yang direkam.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#f1f5f9" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis yAxisId="right" orientation="right" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#cbd5e1' }} />
                    <Area yAxisId="left" type="monotone" dataKey="volume" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVolume)" />
                    <Area yAxisId="right" type="step" dataKey="avgDaily" stroke="#10b981" strokeWidth={2} strokeDasharray="4 4" fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Tabel Orkestrasi Dosen (Data Grid) */}
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-900 text-sm tracking-tight">Katalog Orkestrasi Dosen (HITL Action)</h3>
                <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Daftar naskah yang menunggu validasi</p>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-white border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Identitas Kelompok</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Timestamp Masuk</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Skor AI</th>
                    <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Tindakan Otoritas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {submissions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-16 text-center">
                        <p className="text-slate-500 font-medium text-sm">Belum ada draf naskah yang masuk ke sistem.</p>
                      </td>
                    </tr>
                  ) : (
                    submissions.map((sub) => {
                      const isPending = sub.status === "PENDING_REVIEW";
                      const groupData = sub.groups as any;

                      return (
                        <tr key={sub.id} className={`transition-colors ${isPending ? 'bg-amber-50/30 hover:bg-amber-50/80' : 'hover:bg-slate-50/50'}`}>
                          
                          <td className="px-6 py-5">
                            <p className="font-bold text-slate-700 text-[13px]">
                              {groupData?.group_name || "Kelompok Tidak Diketahui"}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5 uppercase">
                              Iterasi Ke-{sub.iteration_number}
                            </p>
                          </td>
                          
                          <td className="px-6 py-5">
                            <p className="font-medium text-slate-600 text-[12px]">
                              {new Date(sub.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </p>
                            <p className="text-[10px] font-mono text-slate-400 mt-0.5">
                              {new Date(sub.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                            </p>
                          </td>
                          
                          <td className="px-6 py-5 text-center">
                            <span className={`inline-flex items-center justify-center min-w-[3rem] px-2 py-1 font-mono font-bold text-[13px] rounded border ${isPending ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                              {sub.ai_total_score || "-"}
                            </span>
                          </td>
                          
                          <td className="px-6 py-5 text-right">
                            {isPending ? (
                              <Link 
                                href={`/dosen/validasi?id=${sub.id}`} 
                                className="inline-flex items-center gap-2 bg-[#2557a7] text-white hover:bg-[#1d478a] px-5 py-2.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm"
                              >
                                Validasi HITL
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" /></svg>
                              </Link>
                            ) : (
                              <div className="inline-flex items-center justify-end gap-2 text-[10px] font-bold text-emerald-600 uppercase tracking-widest px-5 py-2.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"/></svg>
                                Telah Disetujui
                              </div>
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
        </>
      )}
    </div>
  );
}