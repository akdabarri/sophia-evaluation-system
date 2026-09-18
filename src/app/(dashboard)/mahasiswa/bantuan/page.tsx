"use client";
import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Ticket {
  id: string;
  category: string;
  message: string;
  status: string;
  created_at: string;
}

export default function BantuanPage() {
  const [loading, setLoading] = useState(true);
  const [groupId, setGroupId] = useState<string | null>(null);
  
  // Form State
  const [category, setCategory] = useState("Permohonan Tambahan Kuota Token");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusNotice, setStatusNotice] = useState<{ type: "success" | "error", text: string } | null>(null);
  
  // Data State
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    async function initData() {
      // 1. Ekstraksi identitas dari cookie
      const cookies = document.cookie.split("; ");
      const userCookie = cookies.find((row) => row.startsWith("sophia_username="));
      const activeUsername = userCookie ? userCookie.split("=")[1] : null;

      if (!activeUsername) {
        setLoading(false);
        return;
      }

      // 2. Tarik ID Kelompok
      const { data: group } = await supabase
        .from("groups")
        .select("id")
        .eq("username", activeUsername)
        .single();

      if (group) {
        setGroupId(group.id);
        fetchTickets(group.id);
      } else {
        setLoading(false);
      }
    }
    initData();
  }, []);

  async function fetchTickets(gId: string) {
    const { data, error } = await supabase
      .from("support_tickets")
      .select("*")
      .eq("group_id", gId)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupId) return;

    setIsSubmitting(true);
    setStatusNotice(null);

    const { error } = await supabase.from("support_tickets").insert({
      group_id: groupId,
      category: category,
      message: message,
      status: "OPEN"
    });

    setIsSubmitting(false);

    if (!error) {
      setMessage("");
      setStatusNotice({ type: "success", text: "Tiket bantuan berhasil dikirim ke antrean dosen." });
      fetchTickets(groupId);
      setTimeout(() => setStatusNotice(null), 5000);
    } else {
      setStatusNotice({ type: "error", text: "Terjadi kendala jaringan saat mengirim tiket. Coba lagi nanti." });
    }
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-sm text-slate-400 font-mono animate-pulse tracking-widest uppercase">
          Memuat Pusat Resolusi...
        </div>
      </div>
    );
  }

  if (!groupId) {
    return (
      <div className="p-8 text-sm text-red-500 font-mono text-center mt-10">
        Sesi otorisasi tidak ditemukan. Silakan login kembali.
      </div>
    );
  }

  return (
    <div className="max-w-[1000px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Halaman */}
      <div className="mb-10 pt-8 border-b border-slate-200/80 pb-6">
        <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
          Pusat Bantuan & Resolusi
        </span>
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
          Layanan Intervensi Dosen
        </h1>
        <p className="text-slate-500 text-[13px] font-medium leading-relaxed max-w-2xl">
          Kanal komunikasi resmi untuk mengajukan dispensasi kuota token komputasi, banding hasil telaah AI, atau pertanyaan seputar metodologi SLR secara langsung kepada dosen pengampu.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Formulir Pengajuan Tiket (2/3 Grid) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 shadow-sm rounded-xl p-8">
            <h2 className="text-lg font-bold text-slate-800 tracking-tight mb-6 pb-4 border-b border-slate-100">
              Buat Tiket Baru
            </h2>

            {statusNotice && (
              <div className={`p-4 mb-6 text-xs font-semibold rounded-lg flex items-center gap-3 ${statusNotice.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                {statusNotice.type === 'success' ? (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" /></svg>
                ) : (
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                )}
                {statusNotice.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Dropdown Kategori */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Kategori Resolusi
                </label>
                <div className="relative">
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 px-4 py-3 rounded-lg text-[13px] text-slate-900 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium appearance-none cursor-pointer"
                  >
                    <option value="Permohonan Tambahan Kuota Token">Permohonan Tambahan Kuota Token</option>
                    <option value="Banding Hasil Evaluasi AI">Banding Hasil Evaluasi AI</option>
                    <option value="Pertanyaan Metodologi SLR">Pertanyaan Metodologi SLR</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              {/* Textarea Pesan */}
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">
                  Rincian Penjelasan & Justifikasi
                </label>
                <textarea
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 px-4 py-4 rounded-lg text-[13px] text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium min-h-[160px] resize-y leading-relaxed"
                  placeholder="Uraikan secara komprehensif argumen banding atau justifikasi mengapa kelompok Anda membutuhkan tambahan kuota token..."
                />
              </div>

              <div className="pt-6 mt-6 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#2557a7] hover:bg-[#1d478a] text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all disabled:bg-slate-300 disabled:text-slate-500 shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                      Mengirimkan Tiket...
                    </>
                  ) : (
                    <>
                      Kirim Tiket
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Timeline Riwayat Tiket (1/3 Grid) */}
        <div className="lg:col-span-1">
          <div className="bg-[#fafbfc] border border-slate-200 shadow-sm rounded-xl p-6 h-full">
            <h3 className="text-sm font-bold text-slate-800 tracking-tight mb-6 flex items-center gap-2">
              <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Log Resolusi
            </h3>
            
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="p-6 border border-dashed border-slate-300 rounded-lg text-slate-400 text-xs text-center font-medium">
                  Belum ada rekam jejak tiket bantuan yang diajukan.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 ml-3 space-y-6 pb-4">
                  {tickets.map((ticket) => {
                    const isOpen = ticket.status === "OPEN";
                    return (
                      <div key={ticket.id} className="relative pl-6 group">
                        {/* Dot Timeline */}
                        <div className={`absolute -left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white ${isOpen ? 'bg-amber-400 ring-2 ring-amber-100' : 'bg-emerald-500 ring-2 ring-emerald-100'}`} />
                        
                        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm group-hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500 truncate pr-2">
                              {ticket.category}
                            </span>
                            <span className={`shrink-0 text-[9px] font-bold uppercase px-2 py-1 rounded bg-slate-50 border ${isOpen ? "text-amber-700 border-amber-200" : "text-emerald-700 border-emerald-200"}`}>
                              {ticket.status}
                            </span>
                          </div>
                          <p className="text-[12px] text-slate-700 leading-relaxed font-medium line-clamp-3 mb-3">
                            "{ticket.message}"
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {new Date(ticket.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })} WIB
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}