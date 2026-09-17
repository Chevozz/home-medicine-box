"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    api
      .get("/auth/me")
      .then(() => router.push("/dashboard"))
      .catch(() => router.push("/login"));
  }, [router]);
  return <main className="p-8 text-center text-gray-500">Loading…</main>;
}
