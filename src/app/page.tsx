import { redirect } from "next/navigation";

export default function RootPage() {
  // Mengarahkan pengunjung root URL langsung ke halaman login
  redirect("/login");
}