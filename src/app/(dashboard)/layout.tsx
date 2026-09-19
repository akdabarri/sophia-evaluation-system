import Sidebar from "@/components/layout/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Struktur flex yang membelah secara vertikal di seluler dan horizontal di desktop
    <div className="flex flex-col md:flex-row h-screen w-full bg-slate-50 overflow-hidden font-sans">
      
      {/* Kolom Bilah Samping / Header Seluler */}
      <div className="flex-none z-30 shadow-sm md:shadow-none">
        <Sidebar />
      </div>
      
      {/* Kolom Konten Utama (Scroll independen) */}
      <main className="flex-1 w-full h-full overflow-y-auto relative scroll-smooth bg-[#fafbfc]">
        {children}
      </main>
      
    </div>
  );
}