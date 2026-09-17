"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function TopBar({ title }: { title: string }) {
  const router = useRouter();
  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };
  return (
    <header className="bg-primary text-white sticky top-0 z-50 shadow px-4 sm:px-6 py-3 flex items-center justify-between">
      <Link href="/dashboard" className="font-semibold text-lg">{title}</Link>
      <nav className="flex items-center gap-4 text-sm">
        <Link href="/dashboard" className="hover:underline hidden sm:block">Dashboard</Link>
        <Link href="/medicines" className="hover:underline hidden sm:block">Obat</Link>
        <Link href="/history" className="hover:underline hidden sm:block">Riwayat</Link>
        <button onClick={logout} className="opacity-80 hover:opacity-100">Keluar</button>
      </nav>
    </header>
  );
}
