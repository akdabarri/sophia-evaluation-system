"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function PengaturanPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // State Identitas
  const [activeUsername, setActiveUsername] = useState<string>("");
  const [systemId, setSystemId] = useState<string>("");
  const [role, setRole] = useState<string>("");
  
  // State Form
  const [groupName, setGroupName] = useState("");
  const [email, setEmail] = useState("");
  
  // State Notifikasi
  const [statusMessage, setStatusMessage] = useState<{ type: "success" | "error", text: string } | null>(null);

  useEffect(() => {
    async function loadProfile() {
      // 1. Ekstraksi sesi dari peramban
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
      const username = userCookie ? userCookie.split("=")[1] : null;

      if (!username) {
        setLoading(false);
        return;
      }

      setActiveUsername(username);

      // 2. Tarik data profil komprehensif
      const { data, error } = await supabase
        .from("groups")
        .select("id, username, group_name, email, role")
        .eq("username", username)
        .single();

      if (!error && data) {
        setSystemId(data.id);
        setRole(data.role);
        setGroupName(data.group_name || "");
        setEmail(data.email || "");
      }
      setLoading(false);
    }
    loadProfile();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeUsername) return;

    setSaving(true);
    setStatusMessage(null);

    const { error } = await supabase
      .from("groups")
      .update({
        group_name: groupName,
        email: email
      })
      .eq("username", activeUsername);

    setSaving(false);
    
    if (error) {
      setStatusMessage({ type: "error", text: "Integritas data gagal diverifikasi. Perubahan dibatalkan." });
    } else {
      setStatusMessage({ type: "success", text: "Konfigurasi entitas berhasil diperbarui di pangkalan data." });
      // Hilangkan pesan sukses setelah 4 detik
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Memuat Metadata Entitas...
        </div>
      </div>
    );
  }

  if (!activeUsername) {
    return (
      <div className="p-8 text-sm text-red-500 font-mono text-center mt-10">
        Sesi otorisasi tidak ditemukan. Silakan login kembali.
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Halaman */}
      <div className="mb-10 pt-8 border-b border-slate-200/80 pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
            Manajemen Entitas
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Konfigurasi Profil
          </h1>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
            Perbarui identitas visibel kelompok dan kanal notifikasi. Beberapa atribut dikunci secara bawaan oleh sistem untuk menjaga konsistensi rekam jejak evaluasi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Formulir Input (2/3 Grid) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 pb-4 border-b border-slate-100">
              Parameter Modifikasi
            </h2>

            {statusMessage && (
              <div className={`p-4 mb-6 text-xs font-semibold rounded-lg flex items-center gap-3 ${statusMessage.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {statusMessage.type === 'success' ? (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                )}
                {statusMessage.text}
              </div>
            )}

            <form onSubmit={handleUpdate} className="space-y-6">
              {/* Input Nama Kelompok */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Nama Kelompok & Anggota
                </label>
                <input
                  type="text"
                  required
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Contoh: The Fourward (Aldilah, Aldy...)"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
                <p className="text-[11px] text-slate-400 mt-2 font-medium">
                  Identitas ini akan dicetak pada laporan evaluasi formatif.
                </p>
              </div>

              {/* Input Email */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Kanal Surel (Email)
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email.kelompok@student.upi.edu"
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium"
                />
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-[#2557a7] hover:bg-[#1d478a] text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:bg-slate-300 disabled:text-slate-500 shadow-sm flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Merekam Data...
                    </>
                  ) : (
                    "Simpan Perubahan"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Metadata Sistem (1/3 Grid) */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#0a0f1c] border border-slate-800 shadow-xl rounded-xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl transform translate-x-10 -translate-y-10" />
            
            <h3 className="text-white font-bold text-sm tracking-tight mb-6">Metadata Sistem</h3>
            
            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Otoritas Peran</span>
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/10 px-3 py-1.5 rounded text-xs font-bold text-white uppercase tracking-wider">
                  <span className={`w-1.5 h-1.5 rounded-full ${role === 'INSTRUCTOR' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                  {role}
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">Kredensial Username</span>
                <p className="text-slate-300 font-mono text-[13px] bg-black/40 px-3 py-2 rounded border border-white/5 truncate">
                  {activeUsername}
                </p>
              </div>

              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-1">UUID Pangkalan Data</span>
                <p className="text-slate-500 font-mono text-[10px] bg-black/40 px-3 py-2 rounded border border-white/5 break-all">
                  {systemId || "Memuat..."}
                </p>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                Atribut metadata ini dikunci secara absolut oleh arsitektur SOPHIA untuk keperluan audit <i>Human-in-the-loop</i>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}