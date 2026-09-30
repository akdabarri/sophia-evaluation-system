"use client";
import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function ValidasiContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [submission, setSubmission] = useState<any>(null);

  // State untuk Intervensi HITL (Menampung Data JSON AI yang bisa diedit)
  const [modulesData, setModulesData] = useState<any[]>([]);
  const [feedbackNotes, setFeedbackNotes] = useState<string>("");

  useEffect(() => {
    async function loadSubmission() {
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
        setFeedbackNotes(data.final_feedback || "Berdasarkan telaah sistem AI dan kurasi dosen, draf Anda sudah cukup baik. Perhatikan catatan evaluasi untuk iterasi selanjutnya.");
        
        // Memuat data JSON AI ke dalam State yang bisa diedit dosen
        if (data.ai_raw_feedback?.evaluations) {
          setModulesData(data.ai_raw_feedback.evaluations);
        }
      }
      
      setLoading(false);
    }
    
    loadSubmission();
  }, [id]);

  // 1. KALKULATOR SKOR TERTIMBANG (Otomatis Menghitung Bobot)
  const calculatedFinalScore = useMemo(() => {
    if (!modulesData || modulesData.length === 0) return 0;
    
    let total = 0;
    modulesData.forEach((mod) => {
      const name = (mod.chapterName || "").toLowerCase();
      // PERBAIKAN FATAL: Paksa nilai menjadi angka murni agar tidak ter-concatenate
      const score = parseInt(mod.score) || 0; 
      
      // Pembobotan Berdasarkan Urgensi Bab (Total 100%)
      if (name.includes("intro")) total += score * 0.20; // 20%
      else if (name.includes("method")) total += score * 0.20; // 20%
      else if (name.includes("result")) total += score * 0.30; // 30%
      else if (name.includes("discuss") || name.includes("conclu")) total += score * 0.30; // 30%
      else total += score * 0.25; // Fallback jika nama bab tidak dikenali
    });
    
    // Membulatkan hasil ke angka terdekat dan membatasi maksimal 100
    const finalRounded = Math.round(total);
    return finalRounded > 100 ? 100 : finalRounded;
  }, [modulesData]);

  // 2. PELACAK INTERVENSI & VALIDASI INPUT (Mendeteksi Editan Dosen)
  const handleModuleEdit = (index: number, field: string, subfield: string | null, value: any) => {
    const newData = [...modulesData];
    
    // --- TAMBAHAN BARU: Validasi khusus untuk input skor (Maks 100, Min 0) ---
    let validatedValue = value;
    if (field === "score") {
      validatedValue = parseInt(value) || 0; // Pastikan berupa angka
      if (validatedValue > 100) validatedValue = 100; // Hard limit atas
      if (validatedValue < 0) validatedValue = 0;     // Hard limit bawah
    }
    // ----------------------------------------------------------------------

    if (subfield) {
      newData[index][field][subfield] = validatedValue;
    } else {
      newData[index][field] = validatedValue;
    }
    
    // Menambahkan penanda tak kasatmata bahwa bab ini telah dikalibrasi manusia
    newData[index].isEditedByHuman = true; 
    setModulesData(newData);
  };

  const handlePublish = async () => {
    setSaving(true);
    
    // Membungkus kembali JSON dengan data yang sudah diedit & ditandai
    const calibratedRawFeedback = {
      ...submission.ai_raw_feedback,
      evaluations: modulesData,
      totalScore: calculatedFinalScore 
    };

    const { error } = await supabase
      .from("submissions")
      .update({
        status: "PUBLISHED",
        final_score: calculatedFinalScore, // Skor yang tersimpan adalah skor tertimbang otomatis
        final_feedback: feedbackNotes,
        ai_raw_feedback: calibratedRawFeedback // Menimpa JSON AI lama dengan JSON yang telah dikalibrasi
      })
      .eq("id", id);

    setSaving(false);
    if (!error) {
      router.push("/dosen/telemetri");
    } else {
      alert("Gagal memublikasikan laporan. Periksa koneksi pangkalan data Anda.");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Mengekstraksi Data Kurasi Dosen...
        </div>
      </div>
    );
  }

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

  return (
    <div className="max-w-[1400px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Halaman */}
      <div className="mb-8 pt-6 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
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
        <div className="flex gap-3 w-full md:w-auto">
          <button onClick={() => router.push('/dosen/telemetri')} className="px-4 py-2 flex-1 md:flex-none bg-white border border-slate-300 text-slate-600 rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-50">
            Batal
          </button>
          <button onClick={handlePublish} disabled={saving} className="px-6 py-2 flex-1 md:flex-none bg-[#10b981] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-sm disabled:bg-slate-300 flex items-center justify-center gap-2">
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

        {/* PANEL KANAN: Editor Intervensi Dosen */}
        <div className="bg-[#0a0f1c] border border-slate-800 shadow-xl rounded-xl overflow-hidden flex flex-col h-[700px]">
          <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#070b14]">
            <div>
              <h3 className="font-bold text-white text-sm">Panel Kurasi & Kalibrasi</h3>
              <p className="text-[10px] font-mono text-amber-500 uppercase tracking-widest mt-1">Edit langsung pada kotak umpan balik</p>
            </div>
            
            {/* Indikator Skor Tertimbang Otomatis */}
            <div className="flex items-center gap-3 bg-white/5 p-2 rounded border border-white/10">
              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Skor Tertimbang</span>
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Otomatis Terkalkulasi</span>
              </div>
              <div className="w-14 bg-emerald-500/20 text-emerald-400 font-black text-lg text-center border border-emerald-500/30 rounded py-1">
                {calculatedFinalScore}
              </div>
            </div>
          </div>
          
          <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-lg">
              <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-2">Catatan Final Dosen (General Feed-forward)</label>
              <textarea 
                value={feedbackNotes}
                onChange={(e) => setFeedbackNotes(e.target.value)}
                className="w-full bg-black/40 border border-slate-700 rounded text-slate-300 text-[13px] p-3 focus:outline-none focus:border-amber-500 min-h-[80px]"
                placeholder="Tuliskan pesan penutup untuk kelompok ini..."
              />
            </div>

            {modulesData.length === 0 ? (
              <div className="p-4 border border-dashed border-slate-700 text-slate-500 text-xs text-center rounded">
                Memuat struktur modul AI...
              </div>
            ) : (
              modulesData.map((module: any, index: number) => {
                return (
                  <div key={index} className={`border p-5 rounded-lg space-y-4 transition-colors ${module.isEditedByHuman ? 'bg-blue-900/10 border-blue-500/30' : 'bg-white/5 border-white/10'}`}>
                    <div className="flex justify-between items-center border-b border-white/10 pb-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-300 uppercase tracking-widest">{module.chapterName}</h4>
                        {module.isEditedByHuman && (
                          <span className="bg-blue-500/20 text-blue-400 text-[8px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-blue-500/30">
                            Disunting Dosen
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Skor Bab:</span>
                        <input 
                          type="number"
                          min="0"
                          max="100"
                          value={module.score}
                          onChange={(e) => handleModuleEdit(index, "score", null, e.target.value)}
                          className="w-14 bg-black/50 text-white font-mono font-bold text-center border border-slate-600 rounded px-1 py-1 text-sm focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block mb-1">Feed-Back (Kritik / Evaluasi)</span>
                      <textarea 
                        value={module.pedagogicalAlignment?.feedBack || ""}
                        onChange={(e) => handleModuleEdit(index, "pedagogicalAlignment", "feedBack", e.target.value)}
                        className="w-full bg-black/30 border border-slate-700/50 rounded text-slate-300 text-[12px] p-2 focus:outline-none focus:border-blue-500 min-h-[80px]"
                      />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest block mb-1">Feed-Forward (Instruksi Perbaikan)</span>
                      <textarea 
                        value={module.pedagogicalAlignment?.feedForward || ""}
                        onChange={(e) => handleModuleEdit(index, "pedagogicalAlignment", "feedForward", e.target.value)}
                        className="w-full bg-black/30 border border-slate-700/50 rounded text-slate-300 text-[12px] p-2 focus:outline-none focus:border-blue-500 min-h-[80px]"
                      />
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