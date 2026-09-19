"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Tambahkan impor Image
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage(null);

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    const { data: user, error } = await supabase
      .from("groups")
      .select("username, password, role, group_name")
      .eq("username", cleanUsername)
      .single();

    setLoading(false);

    if (error || !user) {
      setErrorMessage("Identitas akun tidak terdaftar dalam sistem.");
      return;
    }

    if (user.password !== cleanPassword) {
      setErrorMessage("Kode akses unik (password) tidak valid.");
      return;
    }

    document.cookie = `sophia_username=${user.username}; path=/; max-age=604800`;
    document.cookie = `sophia_role=${user.role}; path=/; max-age=604800`;

    if (user.role === "INSTRUCTOR") {
      router.push("/dosen/telemetri");
    } else {
      router.push("/mahasiswa/ruang-kerja");
    }
  };

  return (
    <div className="h-screen overflow-y-auto bg-[#fafbfc] flex flex-col font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      
      <header className="w-full px-8 py-6 flex-none flex items-center justify-between bg-white border-b border-slate-200/60 z-10 sticky top-0">
        <div className="flex items-center gap-3">
          {/* Logo PNG diterapkan di sini menggantikan SVG lama */}
          <Image 
            src="/logo.png" 
            alt="SOPHIA Logo" 
            width={32} 
            height={32} 
            className="w-7 h-7 object-contain shrink-0 drop-shadow-sm" 
          />
          <span className="font-bold text-sm tracking-[0.2em] text-slate-800">
            SOPHIA
          </span>
        </div>
        <span className="text-xs text-slate-400 font-medium hidden sm:block">
          Versi 3.0 / Purwarupa Tesis
        </span>
      </header>

      <main className="flex-1 flex flex-col px-6 py-10 my-auto">
        <div className="w-full max-w-[480px] mx-auto">
          <div className="bg-white border border-slate-200 rounded-xl p-8 sm:p-12 shadow-sm">
            
            <div className="mb-10 text-center">
              <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-3">
                Autentikasi Terbatas
              </span>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight mb-4">
                Masuk ke Ruang Kerja
              </h1>
              <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
                <strong className="text-slate-700 font-semibold">System for Orchestrated Pedagogical & Human-in-the-loop Assessment.</strong> Platform evaluasi formatif berbasis Generative AI pada Pembelajaran Metodologi Penelitian.
              </p>
            </div>

            {errorMessage && (
              <div className="p-3 mb-6 bg-red-50 border border-red-100 text-red-600 text-xs font-medium text-center rounded">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Identitas Akun (Username)
                </label>
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Contoh: kelompok_01 atau dosen"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Kode Akses Unik (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Masukkan sandi privat kelompok"
                    className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" /></svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded text-xs uppercase tracking-wider transition-colors disabled:bg-slate-300"
                >
                  {loading ? "Memverifikasi Otoritas..." : "Buka Dasbor Evaluasi"}
                </button>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <div className="bg-slate-50 border border-slate-200 rounded p-4 flex items-start gap-3">
                <div className="w-4 h-4 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  i
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  Harap jaga kerahasiaan kode akses unik Anda untuk melindungi kuota token kelompok. Hubungi instruktur jika Anda mengalami kendala akses.
                </p>
              </div>
            </div>

          </div>
        </div>
      </main>

    </div>
  );
}