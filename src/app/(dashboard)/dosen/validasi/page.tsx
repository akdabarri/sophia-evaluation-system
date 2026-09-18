"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ValidasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  // State Editor Dosen
  const [finalScore, setFinalScore] = useState<number>(0);
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");

  useEffect(() => {
    async function loadSubmission() {
      // PERBAIKAN: Matikan loading jika ID tidak ditemukan, jangan biarkan membeku
      if (!id) {
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("submissions")
        .select("*, groups(group_name)")
        .eq("id", id)
        .single();

      if (!error && data) {
        setSubmission(data);
        setFinalScore(data.ai_total_score || 0);
        setFeedbackNotes(data.final_feedback || "Berdasarkan telaah sistem AI dan kurasi dosen, draf Anda sudah cukup baik. Perhatikan catatan evaluasi untuk iterasi selanjutnya.");
      }
      
      // Pastikan loading dimatikan apapun hasil dari database
      setLoading(false);
    }
    
    loadSubmission();
  }, [id]);

  const handlePublish = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("submissions")
      .update({
        status: "PUBLISHED",
        final_score: finalScore,
        final_feedback: feedbackNotes,
      })
      .eq("id", id);

    setSaving(false);
    if (!error) {
      router.push("/dosen/telemetri");
    } else {
      alert("Gagal memublikasikan laporan. Periksa koneksi pangkalan data Anda.");
    }
  };

  // 1. Tampilan saat data sedang ditarik
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Mengekstraksi Data Kurasi Dosen...
        </div>
      </div>
    );
  }

  // 2. Tampilan jika ID naskah tidak valid atau diakses tanpa URL yang benar
  if (!submission) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Parameter Naskah Tidak Valid</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Sistem tidak dapat menemukan identitas naskah yang ingin divalidasi. Pastikan Anda mengakses halaman ini melalui tombol di Dasbor Telemetri.
        </p>
        <button onClick={() => router.push('/dosen/telemetri')} className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
          Kembali ke Telemetri
        </button>
      </div>
    );
  }

  const aiRawArray = submission.ai_raw_feedback?.evaluations || [];

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Halaman */}
      <div className="mb-8 pt-6 border-b border-slate-200/80 pb-6 flex justify-between items-end">
        <div>
          <span className="text-[10px] font-bold tracking-widest uppercase text-amber-600 block mb-2">
            Human-in-the-Loop Action
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Kurasi & Validasi Laporan
          </h1>
          <p className="text-slate-500 text-[13px] font-medium">
            Penulis: <strong className="text-slate-700">{submission.groups?.group_name}</strong> | Iterasi Ke-{submission.iteration_number}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push('/dosen/telemetri')} className="px-4 py-2 bg-white border border-slate-300 text-slate-600 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handlePublish} disabled={saving} className="px-6 py-2 bg-[#10b981] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-sm disabled:bg-slate-300 flex items-center gap-2">
            {saving ? "Merekam ke Pangkalan Data..." : "Setujui & Terbitkan (Publish)"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* PANEL KIRI: Draf Asli Mahasiswa */}
        <div className="bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col h-[700px]">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200">
            <h3 className="font-bold text-slate-800 text-sm">Draf Manuskrip IMRaD (Orisinil)</h3>
            <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mt-1">Data mentah masukan mahasiswa</p>
          </div>
          <div className="p-6 overflow-y-auto flex-1 space-y-8">
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">1. Introduction</h4>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{submission.intro_text || "Kosong."}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">2. Methodology</h4>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{submission.method_text || "Kosong."}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">3. Results</h4>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{submission.result_text || "Kosong."}</p>
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">4. Discussion</h4>
              <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">{submission.discuss_text || "Kosong."}</p>
            </div>
          </div>
        </div>

        {/* PANEL KANAN: Evaluasi AI & Editor Dosen */}
        <div className="bg-[#0a0f1c] border border-slate-800 shadow-xl rounded-xl overflow-hidden flex flex-col h-[700px]">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#070b14]">
            <div>
              <h3 className="font-bold text-white text-sm">Panel Kurasi AI</h3>
              <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mt-1">Dosen memiliki otoritas override</p>
            </div>
            
            {/* Skor AI Override */}
            <div className="flex items-center gap-3 bg-white/10 p-2 rounded border border-white/10">
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Skor Akhir:</span>
              <input 
                type="number" 
                value={finalScore} 
                onChange={(e) => setFinalScore(Number(e.target.value))}
                className="w-16 bg-black/50 text-emerald-400 font-mono font-bold text-center border border-slate-700 rounded px-2 py-1 focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Catatan Final Dosen (Feed-forward)</label>
              <textarea 
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full bg-black/40 border border-slate-700 rounded text-slate-300 text-[13px] p-3 focus:outline-none focus:border-amber-500 min-h-[100px]"
                placeholder="Tuliskan catatan tambahan atau koreksi terhadap halusinasi AI di sini..."
              />
            </div>

            {/* Render Hasil JSON AI */}
            {aiRawArray.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-700 text-slate-500 text-xs text-center rounded">
                Tidak ada data struktur modul AI yang ditemukan pada naskah ini.
              </div>
            ) : (
              aiRawArray.map((module: any, index: number) => {
                return (
                  <div key={index} className="bg-white/5 border border-white/10 p-5 rounded-lg space-y-4">
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{module.chapterName}</h4>
                      <span className="text-xs font-mono font-bold text-blue-400 bg-blue-400/10 px-2 py-1 rounded">Skor Mesin: {module.score || 0}</span>
                    </div>
                    
                    <div className="space-y-2 mb-4 p-3 bg-black/40 rounded border border-white/5">
                        <p className="text-[11px] text-emerald-400/80 font-medium"><span className="font-bold text-emerald-400">Kekuatan:</span> {module.strengths}</p>
                        <p className="text-[11px] text-red-400/80 font-medium"><span className="font-bold text-red-400">Kelemahan:</span> {module.improvements}</p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Feed-Up (Tujuan)</span>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{module.pedagogicalAlignment?.feedUp || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Feed-Back (Evaluasi)</span>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-medium">{module.pedagogicalAlignment?.feedBack || "-"}</p>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest block mb-1">Feed-Forward (Perbaikan)</span>
                      <p className="text-[12px] text-slate-400 leading-relaxed font-medium whitespace-pre-wrap">{module.pedagogicalAlignment?.feedForward || "-"}</p>
                    </div>
                  </div>
                );
              })
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

export default function ValidasiPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500 font-mono text-center">Menyiapkan Modul Kurasi...</div>}>
      <ValidasiContent />
    </Suspense>
  );
}