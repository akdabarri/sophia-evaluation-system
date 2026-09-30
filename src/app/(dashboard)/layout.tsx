import Sidebar from "@/components/layout/Sidebar";
import Script from "next/script";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* SNIPPET MAZE */}
      <Script
        id="maze-snippet"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function (m, a, z, e) {
              var s, t, u, v;
              try {
                t = m.sessionStorage.getItem('maze-us');
              } catch (err) {}
            
              if (!t) {
                t = new Date().getTime();
                try {
                  m.sessionStorage.setItem('maze-us', t);
                } catch (err) {}
              }
            
              u = document.currentScript || (function () {
                var w = document.getElementsByTagName('script');
                return w[w.length - 1];
              })();
              v = u && u.nonce;
            
              s = a.createElement('script');
              s.src = z + '?apiKey=' + e;
              s.async = true;
              if (v) s.setAttribute('nonce', v);
              a.getElementsByTagName('head')[0].appendChild(s);
              m.mazeUniversalSnippetApiKey = e;
            })(window, document, 'https://snippet.maze.co/maze-universal-loader.js', 'd4015134-5421-40fb-9363-34ed8039533e');
          `,
        }}
      />

      {/* Struktur flex yang membelah secara vertikal di seluler dan horizontal di desktop */}
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
    </>
  );
}