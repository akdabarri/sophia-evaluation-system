import type { Metadata } from "next";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({ 
  weight: ["300", "400", "700"], 
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: "SOPHIA | Orchestrated Pedagogical Assessment",
  description: "Tata Kelola Evaluasi Akademik Berbasis AI",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-slate-50 text-slate-900 selection:bg-blue-200 selection:text-blue-900 overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}