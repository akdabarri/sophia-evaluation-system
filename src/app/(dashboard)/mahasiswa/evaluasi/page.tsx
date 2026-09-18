"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function EvaluasiPage() {
  const router = useRouter();
  const [activeUsername, setActiveUsername] = useState<string | null>(null);
  const [tokensLeft, setTokensLeft] = useState<number>(0);
  const [loadingTokens, setLoadingTokens] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [introText, setIntroText] = useState("");
  const [methodText, setMethodText] = useState("");
  const [resultText, setResultText] = useState("");
  const [discussText, setDiscussText] = useState("");

  useEffect(() => {
    async function initWorkspace() {
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
      const user = userCookie ? userCookie.split("=")[1] : null;

      if (user) {
        setActiveUsername(user);
        const { data } = await supabase
          .from("groups")
          .select("tokens_left")
          .eq("username", user)
          .single();

        if (data) {
          setTokensLeft(data.tokens_left);
        }
      }
      setLoadingTokens(false);
    }
    initWorkspace();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUsername) {
      setErrorMessage("Sesi tidak valid. Silakan login kembali.");
      return;
    }
    if (tokensLeft <= 0) {
      setErrorMessage("Token komputasi Anda habis. Ajukan dispensasi ke dosen pengampu melalui Tiket Bantuan.");
      return;
    }

    setIsEvaluating(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/evaluasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: activeUsername,
          introText,
          methodText,
          resultText,
          discussText,
        }),
      });

      const data = await res.json();
      setIsEvaluating(false);

      if (!res.ok) {
        setErrorMessage(data.error || "Gagal memproses draf naskah.");
        return;
      }

      router.push("/mahasiswa/ruang-kerja");
    } catch (err) {
      setIsEvaluating(false);
      setErrorMessage("Koneksi jaringan terputus saat memproses komputasi AI.");
    }
  };

  if (loadingTokens) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Menyiapkan Lingkungan Komputasi...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto w-full pb-24 font-sans">
      
      {/* Header Halaman (Dibuat Statis agar Tidak Bertumpuk) */}
      <div className="mb-10 pt-4 border-b border-slate-200/80 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-xl">
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
            Modul Komputasi
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Inferensi Draf IMRaD
          </h1>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
            Pecah naskah Systematic Literature Review Anda ke dalam blok modul di bawah ini. Pastikan tidak menyertakan daftar pustaka untuk mengoptimalkan jendela konteks komputasi.
          </p>
        </div>
        
        {/* Indikator Token Elegan */}
        <div className="flex flex-col items-end shrink-0">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">Kapasitas Token</span>
          <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-lg shadow-sm">
            <div className="flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-2 h-2 rounded-full ${i < tokensLeft ? 'bg-blue-600' : 'bg-slate-200'}`} 
                />
              ))}
            </div>
            <span className="text-lg font-black text-slate-700 font-mono leading-none">{tokensLeft}</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="p-4 mb-8 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-semibold rounded shadow-sm flex items-center gap-3">
          <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Blok 1: Introduction */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3 bg-slate-50 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded border border-slate-300 bg-white text-slate-600 font-bold text-xs shadow-sm">1</span>
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Introduction & State of the Art</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Latar belakang, urgensi, dan rumusan masalah.</p>
            </div>
          </div>
          <textarea
            required
            value={introText}
            onChange={(e) => setIntroText(e.target.value)}
            placeholder="Tuliskan latar belakang masalah, urgensi riset, dan research gap di sini..."
            className="w-full bg-transparent border-0 px-6 py-5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0 focus:border-transparent resize-y min-h-[200px] leading-relaxed font-medium"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Blok 2: Methodology */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3 bg-slate-50 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded border border-slate-300 bg-white text-slate-600 font-bold text-xs shadow-sm">2</span>
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Methodology (PRISMA)</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Strategi pencarian, string Boolean, dan kriteria inklusi.</p>
            </div>
          </div>
          <textarea
            required
            value={methodText}
            onChange={(e) => setMethodText(e.target.value)}
            placeholder="Uraikan strategi pencarian pangkalan data, string Boolean, dan kriteria eligibilitas..."
            className="w-full bg-transparent border-0 px-6 py-5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0 focus:border-transparent resize-y min-h-[200px] leading-relaxed font-medium"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Blok 3: Results */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3 bg-slate-50 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded border border-slate-300 bg-white text-slate-600 font-bold text-xs shadow-sm">3</span>
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Results & Findings</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Ekstraksi data studi primer dan sintesis temuan utama.</p>
            </div>
          </div>
          <textarea
            required
            value={resultText}
            onChange={(e) => setResultText(e.target.value)}
            placeholder="Sajikan ekstraksi data studi primer dan sintesis temuan utama..."
            className="w-full bg-transparent border-0 px-6 py-5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0 focus:border-transparent resize-y min-h-[250px] leading-relaxed font-medium"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Blok 4: Discussion */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden transition-all duration-300 focus-within:border-blue-500 focus-within:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] shadow-sm">
          <div className="px-6 py-4 flex items-center gap-3 bg-slate-50 border-b border-slate-100">
            <span className="flex items-center justify-center w-6 h-6 rounded border border-slate-300 bg-white text-slate-600 font-bold text-xs shadow-sm">4</span>
            <div>
              <h2 className="text-sm font-bold text-slate-600 uppercase tracking-widest">Discussion & Implication</h2>
              <p className="text-[11px] font-medium text-slate-400 mt-0.5">Komparasi temuan, implikasi teoritis, dan limitasi riset.</p>
            </div>
          </div>
          <textarea
            required
            value={discussText}
            onChange={(e) => setDiscussText(e.target.value)}
            placeholder="Tuliskan komparasi temuan dengan literatur sebelumnya, implikasi teoritis, dan limitasi..."
            className="w-full bg-transparent border-0 px-6 py-5 text-[13px] text-slate-700 placeholder:text-slate-300 focus:outline-none focus:ring-0 focus:border-transparent resize-y min-h-[250px] leading-relaxed font-medium"
            style={{ boxShadow: 'none' }}
          />
        </div>

        {/* Footer Action Form */}
        <div className="pt-8 pb-4 flex flex-col md:flex-row justify-between items-center gap-6 border-t border-slate-200/80">
          <div className="flex items-start gap-3 max-w-lg">
            <div className="w-5 h-5 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">!</div>
            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
              Memulai evaluasi akan mengonsumsi <strong className="text-slate-700">1 Token Kuota</strong>. Pastikan seluruh struktur IMRaD telah ditelaah mandiri. Proses komputasi memakan waktu 30-60 detik.
            </p>
          </div>
          
          <button
            type="submit"
            disabled={isEvaluating || tokensLeft <= 0}
            className="w-full md:w-auto bg-[#2557a7] hover:bg-[#1d478a] text-white px-10 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:bg-slate-300 disabled:text-slate-500 shadow-sm flex items-center justify-center gap-3 shrink-0"
          >
            {isEvaluating ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Mengeksekusi AI...
              </>
            ) : (
              "Mulai Evaluasi Draf"
            )}
          </button>
        </div>
      </form>
    </div>
  );
}