import React from "react";
import Link from "next/link";

export default function PanduanPage() {
  return (
    <div className="max-w-[1000px] mx-auto w-full pb-24 px-4 sm:px-6 lg:px-8 font-sans">
      
      {/* Header Dokumentasi */}
      <div className="mb-10 pt-8 border-b border-slate-200/80 pb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="max-w-2xl">
          <span className="text-[10px] font-bold tracking-widest uppercase text-blue-600 block mb-2">
            Dokumentasi Akademik
          </span>
          <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-2">
            Panduan Evaluasi SOPHIA
          </h1>
          <p className="text-slate-500 text-[13px] font-medium leading-relaxed">
            Sistem ini dirancang bukan sebagai alat bantu instan, melainkan sebagai instrumen regulasi kognitif. Berikut adalah tiga prinsip arsitektur utama yang wajib dipahami sebelum menggunakan sistem komputasi.
          </p>
        </div>
      </div>

      <div className="space-y-8">
        
        {/* Prinsip 1: Struktur IMRaD */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="bg-blue-50/50 md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
            <div className="w-10 h-10 bg-white border border-blue-200 rounded-lg flex items-center justify-center text-blue-600 mb-4 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Restriksi Modular (IMRaD)
            </h3>
            <p className="text-[11px] font-bold text-blue-600 uppercase tracking-widest">
              Optimasi Jendela Konteks
            </p>
          </div>
          <div className="md:w-2/3 p-8">
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
              Sistem ini sengaja membatasi input draf Anda ke dalam empat blok spesifik: <strong>Introduction, Methodology, Results, dan Discussion</strong>. 
            </p>
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
              Pemisahan ini dirancang secara taktis agar mesin inferensi tidak berhalusinasi saat membaca konteks naskah yang terlalu panjang. Pembagian ini juga memastikan bahwa rubrik penilaian PRISMA 2020 dapat diterapkan secara tajam dan terfokus pada bab yang relevan.
            </p>
          </div>
        </div>

        {/* Prinsip 2: Friction Design (Kuota Token) */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="bg-amber-50/50 md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
            <div className="w-10 h-10 bg-white border border-amber-200 rounded-lg flex items-center justify-center text-amber-600 mb-4 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Sistem Kuota Token
            </h3>
            <p className="text-[11px] font-bold text-amber-600 uppercase tracking-widest">
              Friction Design Pedagogis
            </p>
          </div>
          <div className="md:w-2/3 p-8">
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
              Kelompok Anda secara bawaan hanya diberikan <strong>3 token komputasi per iterasi tugas</strong>. Pembatasan ini bukan merupakan kelemahan teknis server, melainkan implementasi dari prinsip <em>friction design</em>.
            </p>
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
              Anda dipaksa untuk menghindari kemalasan kognitif. Setiap kelompok diwajibkan untuk berdiskusi, merevisi silang antaranggota, dan memastikan kualitas draf secara manual sebelum menyerahkan evaluasinya kepada AI.
            </p>
          </div>
        </div>

        {/* Prinsip 3: Human in the loop */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row">
          <div className="bg-emerald-50/50 md:w-1/3 p-8 border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-center">
            <div className="w-10 h-10 bg-white border border-emerald-200 rounded-lg flex items-center justify-center text-emerald-600 mb-4 shadow-sm">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight mb-1">
              Otoritas Instruktur
            </h3>
            <p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Validasi Human-in-the-Loop
            </p>
          </div>
          <div className="md:w-2/3 p-8">
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed mb-4">
              Keluaran penilaian dari AI generatif tidak bersifat final. Segera setelah komputasi selesai, laporan tidak akan langsung diberikan kepada Anda, melainkan tertahan pada status <strong>PENDING_REVIEW</strong>.
            </p>
            <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
              Dosen pengampu bertindak sebagai pengawas gerbang (<em>gatekeeper</em>). Instruktur memiliki kendali mutlak untuk memodifikasi skor, menghapus saran yang berhalusinasi, atau menyetujui laporan tersebut sebelum akhirnya dapat Anda baca di menu Riwayat.
            </p>
          </div>
        </div>

      </div>

      <div className="mt-12 flex justify-center">
        <Link 
          href="/mahasiswa/ruang-kerja" 
          className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-3.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all shadow-sm flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Kembali ke Ruang Kerja
        </Link>
      </div>

    </div>
  );
}