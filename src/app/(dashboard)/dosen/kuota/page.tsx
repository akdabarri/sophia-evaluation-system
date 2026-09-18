"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, BarChart, Bar, Legend
} from "recharts";

export default function KuotaAnalitikPage() {
  const [loading, setLoading] = useState(true);
  
  const [scatterData, setScatterData] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [tokenDistData, setTokenDistData] = useState<any[]>([]);
  const [tableData, setTableData] = useState<any[]>([]);
  const [kpi, setKpi] = useState({ avgScore: 0, criticalGroups: 0, totalIterations: 0, avgTokens: 0 });

  const fetchAnalytics = async () => {
    setLoading(true);
    const { data: groups } = await supabase
      .from("groups")
      .select("*, submissions(iteration_number, ai_raw_feedback, ai_total_score, final_score)")
      .eq("role", "STUDENT")
      .order("username", { ascending: true });

    if (groups) {
      let totalScore = 0;
      let activeGroups = 0;
      let totalIter = 0;
      let criticalCount = 0;
      let totalTokens = 0;

      const scatterTemp: any[] = [];
      const tokenDistTemp = [
        { name: "3 Token (Utuh)", count: 0, fill: "#10b981" },
        { name: "2 Token", count: 0, fill: "#3b82f6" },
        { name: "1 Token (Kritis)", count: 0, fill: "#f59e0b" },
        { name: "0 Token (Habis)", count: 0, fill: "#ef4444" }
      ];

      let sumIntro = 0, sumMethod = 0, sumResult = 0, sumDiscuss = 0;
      let validModules = 0;
      const iterScores: Record<number, number[]> = { 1: [], 2: [], 3: [], 4: [], 5: [] };

      groups.forEach((g) => {
        const subs = g.submissions || [];
        totalIter += subs.length;
        totalTokens += g.tokens_left;

        if (g.tokens_left >= 3) tokenDistTemp[0].count += 1;
        else if (g.tokens_left === 2) tokenDistTemp[1].count += 1;
        else if (g.tokens_left === 1) tokenDistTemp[2].count += 1;
        else tokenDistTemp[3].count += 1;

        let groupAvgScore = 0;
        if (subs.length > 0) {
          const scores = subs.map((s: any) => s.final_score || s.ai_total_score).filter(Boolean);
          groupAvgScore = scores.length > 0 ? Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length) : 0;
          
          totalScore += groupAvgScore;
          activeGroups += 1;

          subs.forEach((s: any) => {
            if (s.ai_raw_feedback && s.ai_raw_feedback.modules) {
              const mods = s.ai_raw_feedback.modules;
              sumIntro += mods.introduction?.score || 0;
              sumMethod += mods.methodology?.score || 0;
              sumResult += mods.results?.score || 0;
              sumDiscuss += mods.discussion?.score || 0;
              validModules += 1;
            }
            const iterNum = s.iteration_number || 1;
            if (iterScores[iterNum]) iterScores[iterNum].push(s.final_score || s.ai_total_score || 0);
          });
        }

        let statusColor = "#94a3b8"; 
        if (groupAvgScore >= 75 && g.tokens_left >= 2) statusColor = "#10b981"; 
        else if (groupAvgScore >= 75 && g.tokens_left < 2) statusColor = "#3b82f6"; 
        else if (groupAvgScore > 0 && groupAvgScore < 75 && g.tokens_left <= 1) {
          statusColor = "#ef4444"; 
          criticalCount += 1;
        }

        scatterTemp.push({
          id: g.id,
          username: g.username,
          groupName: g.group_name,
          tokens: g.tokens_left,
          avgScore: groupAvgScore,
          subsCount: subs.length > 0 ? subs.length * 150 : 50, 
          actualSubs: subs.length,
          fill: statusColor
        });
      });

      setKpi({
        avgScore: activeGroups > 0 ? Math.round(totalScore / activeGroups) : 0,
        criticalGroups: criticalCount,
        totalIterations: totalIter,
        avgTokens: groups.length > 0 ? Number((totalTokens / groups.length).toFixed(1)) : 0
      });

      setScatterData(scatterTemp);
      setTableData(scatterTemp);
      setTokenDistData(tokenDistTemp);

      if (validModules > 0) {
        setRadarData([
          { subject: "Introduction", A: Math.round(sumIntro / validModules), fullMark: 100 },
          { subject: "Methodology", A: Math.round(sumMethod / validModules), fullMark: 100 },
          { subject: "Results", A: Math.round(sumResult / validModules), fullMark: 100 },
          { subject: "Discussion", A: Math.round(sumDiscuss / validModules), fullMark: 100 },
        ]);
      } else {
        setRadarData([
          { subject: "Intro", A: 65, fullMark: 100 }, { subject: "Method", A: 50, fullMark: 100 },
          { subject: "Result", A: 70, fullMark: 100 }, { subject: "Discuss", A: 60, fullMark: 100 },
        ]);
      }

      const trendTemp = [];
      for (let i = 1; i <= 5; i++) {
        if (iterScores[i].length > 0) {
          const avg = iterScores[i].reduce((a, b) => a + b, 0) / iterScores[i].length;
          trendTemp.push({ name: `Iterasi ${i}`, score: Math.round(avg) });
        }
      }
      setTrendData(trendTemp.length > 0 ? trendTemp : [{ name: "Iterasi 1", score: 0 }]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleAddToken = async (id: string, currentTokens: number) => {
    await supabase.from("groups").update({ tokens_left: currentTokens + 1 }).eq("id", id);
    fetchAnalytics(); 
  };

  const handleResetToken = async (id: string) => {
    await supabase.from("groups").update({ tokens_left: 3 }).eq("id", id);
    fetchAnalytics();
  };

  // Fungsi Ekspor CSV untuk Pengolahan SPSS/R
  const downloadCSV = () => {
    const headers = ["Identitas Akun", "Nama Kelompok", "Sisa Token", "Rata-rata Skor IMRaD", "Total Iterasi", "Status Kritis"];
    const csvRows = [headers.join(",")];
    
    tableData.forEach(row => {
      const isCritical = row.avgScore > 0 && row.avgScore < 75 && row.tokens <= 1 ? "YA" : "TIDAK";
      const rowData = [
        row.username,
        `"${row.groupName}"`,
        row.tokens,
        row.avgScore,
        row.actualSubs,
        isCritical
      ];
      csvRows.push(rowData.join(","));
    });

    const blob = new Blob([csvRows.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `SOPHIA_Dataset_Metlit_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ScatterTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-slate-200 p-4 shadow-xl rounded-md font-mono text-[11px] text-slate-700">
          <p className="font-bold text-slate-900 mb-2 pb-2 border-b border-slate-100">{data.groupName}</p>
          <p className="mb-1"><span className="text-slate-400">Skor AI:</span> <span className="text-emerald-600 font-bold">{data.avgScore}</span></p>
          <p className="mb-1"><span className="text-slate-400">Sisa Kuota:</span> <span className="text-amber-600 font-bold">{data.tokens} Token</span></p>
          <p><span className="text-slate-400">Total Iterasi:</span> <span className="text-blue-600 font-bold">{data.actualSubs} Kali</span></p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-20 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Eksklusif - Light Mode */}
      <div className="mb-8 pt-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-200 pb-6">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">Pusat Komando Telemetri</span>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">SOPHIA Analytics Dashboard</h1>
          <p className="text-slate-500 text-sm mt-2 max-w-2xl leading-relaxed">
            Pemantauan multidimensi kinerja komputasi dan metrik pedagogis kelas. Analisis kuadran, distribusi modul PRISMA, dan tren beban kognitif secara langsung.
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={downloadCSV} className="bg-white border border-slate-300 text-slate-700 px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-50 hover:text-blue-600 transition-colors rounded shadow-sm flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            Unduh CSV
          </button>
          <button onClick={fetchAnalytics} className="bg-slate-900 text-white px-4 py-2.5 text-[10px] font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors rounded shadow-sm flex items-center gap-2">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            Resync
          </button>
        </div>
      </div>

      {/* Baris KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rerata Skor IMRaD</span>
          <span className="text-4xl font-black text-slate-800 tracking-tighter">{kpi.avgScore}</span>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Rerata Sisa Token</span>
          <span className="text-4xl font-black text-blue-600 tracking-tighter">{kpi.avgTokens}</span>
        </div>
        <div className="bg-white border border-slate-200 p-6 rounded-lg shadow-sm">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Volume Iterasi Global</span>
          <span className="text-4xl font-black text-amber-500 tracking-tighter">{kpi.totalIterations}</span>
        </div>
        <div className="bg-white border border-red-200 p-6 rounded-lg shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-red-100 rounded-full blur-2xl transform translate-x-4 -translate-y-4" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-widest block mb-2 relative z-10">Kelompok Kritis</span>
          <span className="text-4xl font-black text-red-600 tracking-tighter relative z-10">{kpi.criticalGroups}</span>
        </div>
      </div>

      {/* Grid Visualisasi 2x2 - Tema Putih Bersih */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-8">
        
        {/* CHART 1: Quadrant Matrix */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">Quadrant Efficiency Matrix</h3>
              <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Korelasi Beban Kognitif vs Capaian Skor</p>
            </div>
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div><span className="text-[9px] font-mono text-slate-500 uppercase">Efisien</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#3b82f6]"></div><span className="text-[9px] font-mono text-slate-500 uppercase">Iteratif</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2.5 h-2.5 rounded-full bg-[#ef4444]"></div><span className="text-[9px] font-mono text-red-600 font-bold uppercase">Kritis</span></div>
            </div>
          </div>
          {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400 font-mono text-xs">Memuat matriks...</div> : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: -20 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="tokens" name="Tokens" domain={[0, 4]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <YAxis type="number" dataKey="avgScore" name="Score" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={{ stroke: '#cbd5e1' }} tickLine={false} />
                  <ZAxis type="number" dataKey="subsCount" range={[50, 400]} />
                  <Tooltip content={<ScatterTooltip />} cursor={{ strokeDasharray: '3 3', stroke: '#94a3b8' }} />
                  <ReferenceLine y={75} stroke="#94a3b8" strokeDasharray="3 3" />
                  <ReferenceLine x={2} stroke="#94a3b8" strokeDasharray="3 3" />
                  <Scatter data={scatterData} animationDuration={1000}>
                    {scatterData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} opacity={0.75} stroke={entry.fill} strokeWidth={1} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 2: Kiviat Diagram */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-2">
            <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">IMRaD Competency Radar (Kiviat)</h3>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Distribusi Kekuatan Modul Manuskrip</p>
          </div>
          {loading ? <div className="h-[300px] flex items-center justify-center text-slate-400 font-mono text-xs">Memuat topologi...</div> : (
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#475569', fontSize: 10, fontFamily: 'monospace', fontWeight: 'bold' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 10 }} axisLine={false} />
                  <Radar name="Skor Rata-rata" dataKey="A" stroke="#3b82f6" strokeWidth={2} fill="#3b82f6" fillOpacity={0.2} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 3: Learning Curve */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">Longitudinal Learning Curve</h3>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Tren Evaluasi Formatif Berdasarkan Iterasi</p>
          </div>
          {loading ? <div className="h-[250px] flex items-center justify-center text-slate-400 font-mono text-xs">Menyusun deret waktu...</div> : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorScoreLight" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Area type="monotone" dataKey="score" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#colorScoreLight)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* CHART 4: Token Burn Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h3 className="text-slate-900 font-bold text-sm tracking-tight mb-1">Token Burn Rate Density</h3>
            <p className="text-slate-500 text-[10px] font-mono uppercase tracking-widest">Status Deplesi Kuota Komputasi Kelas</p>
          </div>
          {loading ? <div className="h-[250px] flex items-center justify-center text-slate-400 font-mono text-xs">Mengkalkulasi deplesi...</div> : (
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tokenDistData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fill: '#64748b', fontSize: 10, fontFamily: 'monospace' }} axisLine={false} tickLine={false} />
                  <Tooltip cursor={{ fill: '#f8fafc' }} contentStyle={{ backgroundColor: '#fff', borderColor: '#e2e8f0', color: '#0f172a', fontSize: '11px', fontFamily: 'monospace', borderRadius: '6px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {tokenDistData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* TABEL OTORITAS DOSEN */}
      <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-slate-900 text-sm tracking-tight">Data Grid Orkestrasi Kuota (HITL Action)</h3>
            <p className="text-[10px] font-mono uppercase tracking-widest text-slate-500 mt-1">Intervensi langsung pada pangkalan data</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest">Identitas Resolusi</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-center">Metrik & Kuadran</th>
                <th className="px-6 py-4 font-bold text-slate-400 text-[10px] uppercase tracking-widest text-right">Tindakan Otoritas HITL</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tableData.map((row) => {
                const isCritical = row.avgScore > 0 && row.avgScore < 75 && row.tokens <= 1;
                return (
                  <tr key={row.id} className={`transition-colors ${isCritical ? 'bg-red-50/50 hover:bg-red-50' : 'hover:bg-slate-50/50'}`}>
                    <td className="px-6 py-5">
                      <p className="font-bold text-slate-900 text-sm flex items-center gap-2">
                        {row.groupName}
                        {isCritical && <span className="flex w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>}
                      </p>
                      <p className="text-[10px] font-mono text-slate-500 mt-1 uppercase">{row.username}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center justify-center gap-8">
                        <div className="text-center">
                          <span className={`block font-mono text-lg font-bold ${row.tokens <= 1 ? 'text-red-600' : 'text-slate-700'}`}>{row.tokens}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Token</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                          <span className="block font-mono text-lg font-bold text-slate-700">{row.avgScore}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Skor AI</span>
                        </div>
                        <div className="w-px h-8 bg-slate-200"></div>
                        <div className="text-center">
                          <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: row.fill }}></div>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Status</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleAddToken(row.id, row.tokens)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300 text-[10px] font-bold uppercase tracking-wider transition-all rounded shadow-sm"
                        >
                          +1 Token
                        </button>
                        <button 
                          onClick={() => handleResetToken(row.id)}
                          className="px-4 py-2 bg-white border border-slate-300 text-slate-700 hover:bg-amber-50 hover:text-amber-700 hover:border-amber-300 text-[10px] font-bold uppercase tracking-wider transition-all rounded shadow-sm"
                        >
                          Reset (3)
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}