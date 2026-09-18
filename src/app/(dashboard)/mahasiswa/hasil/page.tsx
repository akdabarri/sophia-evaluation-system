"use client";
import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

function HasilContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState<any>(null);

  useEffect(() => {
    async function fetchReport() {
      // PERBAIKAN: Jika ID tidak ada di URL, matikan loading dan hentikan eksekusi
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
      }
      
      // Pastikan loading dimatikan apapun hasil kuerinya
      setLoading(false);
    }
    
    fetchReport();
  }, [id]);

  // 1. Tampilan saat memuat data
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Mendekripsi Laporan Evaluasi...
        </div>
      </div>
    );
  }

  // 2. Tampilan jika ID tidak valid, atau naskah tidak ditemukan
  if (!submission) {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Parameter Laporan Tidak Valid</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Sistem tidak dapat menemukan identitas laporan yang Anda cari. Pastikan Anda mengakses halaman ini melalui tombol "Buka Laporan" pada menu Riwayat.
        </p>
        <button onClick={() => router.push('/mahasiswa/riwayat')} className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  // 3. Tampilan jika naskah ditemukan, tapi statusnya belum disetujui dosen
  if (submission.status !== "PUBLISHED") {
    return (
      <div className="max-w-2xl mx-auto mt-20 p-10 bg-white border border-slate-200 rounded-xl shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Laporan Terkunci</h2>
        <p className="text-sm text-slate-500 leading-relaxed mb-6">
          Dokumen evaluasi ini belum mendapatkan otorisasi dari dosen pengampu atau masih berada dalam antrean komputasi. Silakan periksa kembali nanti.
        </p>
        <button onClick={() => router.push('/mahasiswa/riwayat')} className="px-6 py-2 bg-slate-900 text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors">
          Kembali ke Riwayat
        </button>
      </div>
    );
  }

  const aiRawArray = submission.ai_raw_feedback?.evaluations || [];

  return (
    <div className="max-w-5xl mx-auto pb-20 font-sans">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 pt-4">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Laporan Evaluasi Formatif</h2>
        <button onClick={() => router.push('/mahasiswa/ruang-kerja')} className="text-xs font-bold uppercase tracking-wider text-slate-600 border border-slate-300 rounded px-6 py-2.5 hover:bg-slate-50 transition-colors shadow-sm">
          Selesai Membaca
        </button>
      </div>

      <div className="bg-[#0a0f1c] rounded-xl p-8 mb-10 flex flex-col md:flex-row items-center gap-10 shadow-xl overflow-hidden relative border border-slate-800">
        <div className="absolute -right-20 -top-20 opacity-5">
          <svg width="200" height="200" viewBox="0 0 24 24" fill="white"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
        </div>
        
        <div className="w-36 h-36 relative flex items-center justify-center shrink-0 z-10">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
            <path className="text-slate-800" strokeWidth="2.5" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            <path className="text-emerald-500" strokeDasharray={`${submission.final_score || 0}, 100`} strokeWidth="2.5" strokeLinecap="round" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-white tracking-tighter">{submission.final_score || 0}</span>
          </div>
        </div>
        
        <div className="text-white z-10 w-full">
          <div className="flex justify-between items-start">
             <div>
                <h3 className="text-2xl font-bold mb-2 tracking-tight">Status Naskah: {submission.final_score >= 80 ? 'Memuaskan' : 'Perlu Revisi'}</h3>
                <p className="text-[13px] text-slate-400 font-medium mb-1">
                  Penulis: <span className="text-slate-200">{submission.groups?.group_name}</span>
                </p>
                <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                  Iterasi Ke-{submission.iteration_number}
                </p>
             </div>
          </div>
          
          <p className="text-slate-400 leading-relaxed text-[13px] mt-4 font-medium max-w-2xl">
            Draf naskah ini telah melewati tahapan komputasional AI tingkat lanjut dan divalidasi mutlak oleh instruktur. Tinjau bagian <strong className="text-slate-200">Feed-Forward</strong> pada setiap modul untuk instruksi perbaikan konkret.
          </p>
          
          <div className="mt-5 flex gap-3">
            <span className="text-[10px] font-bold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded border border-emerald-500/20 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Telah Divalidasi
            </span>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        
        {submission.final_feedback && (
          <div className="bg-amber-50 border border-amber-200 p-6 rounded-xl shadow-sm">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-3 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
              Catatan Instruksional (Human-in-the-Loop)
            </h3>
            <p className="text-[13px] text-amber-900 leading-relaxed font-medium whitespace-pre-wrap">
              {submission.final_feedback}
            </p>
          </div>
        )}

        <div className="space-y-6">
          <h3 className="text-lg font-bold text-slate-900 tracking-tight border-b border-slate-200 pb-2 mb-4">
            Rincian Diagnostik Komputasional
          </h3>

          {aiRawArray.length === 0 ? (
            <div className="p-8 bg-slate-50 border border-dashed border-slate-300 rounded-lg text-slate-500 text-sm text-center font-medium">
              Struktur data evaluasi AI tidak ditemukan untuk iterasi ini.
            </div>
          ) : (
            aiRawArray.map((module: any, index: number) => {
              const init = module.chapterName ? module.chapterName.charAt(0) : `${index+1}`;
              
              return (
                <div key={index} className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
                  <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                     <div className="flex items-center gap-4">
                        <div className="w-8 h-8 bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center rounded shadow-sm shrink-0">
                          {init}
                        </div>
                        <h4 className="font-bold text-slate-800 text-sm tracking-tight">{module.chapterName}</h4>
                     </div>
                     <span className="text-[10px] font-mono font-bold text-slate-600 bg-white border border-slate-300 px-3 py-1.5 rounded shadow-sm">
                        Skor: {module.score || 0}
                     </span>
                  </div>
                  
                  <div className="p-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-lg">
                           <p className="text-[12px] text-emerald-800 leading-relaxed font-medium"><span className="font-bold uppercase tracking-widest text-[10px] block mb-1">Kekuatan:</span> {module.strengths}</p>
                        </div>
                        <div className="bg-red-50/50 border border-red-100 p-4 rounded-lg">
                           <p className="text-[12px] text-red-800 leading-relaxed font-medium"><span className="font-bold uppercase tracking-widest text-[10px] block mb-1">Kelemahan Fatal:</span> {module.improvements}</p>
                        </div>
                     </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <div>
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 bg-slate-100 inline-block px-2 py-1 rounded">Feed-Up (Ekspektasi Jurnal)</h5>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{module.pedagogicalAlignment?.feedUp || "N/A"}</p>
                        
                        <h5 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 mt-6 bg-slate-100 inline-block px-2 py-1 rounded">Feed-Back (Evaluasi Kondisi Saat Ini)</h5>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium">{module.pedagogicalAlignment?.feedBack || "N/A"}</p>
                      </div>
                      
                      <div className="bg-blue-50/30 p-5 rounded-lg border border-blue-100/50">
                        <h5 className="text-[10px] font-bold text-blue-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                          Tindakan (Feed-Forward)
                        </h5>
                        <p className="text-[13px] text-slate-700 leading-relaxed font-medium whitespace-pre-wrap">
                          {module.pedagogicalAlignment?.feedForward || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

export default function HasilPage() {
  return (
    <Suspense fallback={<div className="p-10 text-slate-500 font-mono text-center">Menyiapkan Laporan...</div>}>
      <HasilContent />
    </Suspense>
  );
}