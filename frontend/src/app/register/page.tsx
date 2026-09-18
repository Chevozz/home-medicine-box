"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Pill } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import { useTranslation } from "@/lib/i18n";
import api from "@/lib/api";

export default function RegisterPage() {
  const { t } = useTranslation();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { token } = (await api.post("/api/auth/signup", { name, email, password })).data;
      localStorage.setItem("token", token);
      // Set cookie for middleware to read
      document.cookie = `token=${token}; path=/; max-age=604800; samesite=lax`; // 7 days
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    }
  };

  return (
    <ResponsiveNav>
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-screen p-4 sm:p-6 lg:p-8">
        <form onSubmit={submit} className="w-full max-w-md space-y-6">
          <div className="text-center">
            <Link href="/" className="inline-flex items-center justify-center gap-2 text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              <MedicineBoxIcon size={28} className="text-emerald-600 dark:text-emerald-400" />
              <span className="tracking-tight">MedTracker</span>
            </Link>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              {t.signUpDesc}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="label">{t.name}</label>
            <div className="relative">
              <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="input-field pl-10"
                placeholder={t.namePlaceholder}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="label">{t.email}</label>
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-field pl-10"
                placeholder={t.emailPlaceholder}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="label">{t.password}</label>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400" />
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-field pl-10"
                placeholder={t.passwordPlaceholder}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
              >
                {showPass ? <EyeOff size={18} className="text-slate-500 dark:text-slate-400" /> : <Eye size={18} className="text-slate-500 dark:text-slate-400" />}
              </button>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full">
            {t.signUp}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t.alreadyHaveAccount} <Link href="/login" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">{t.signIn}</Link>
          </p>
        </form>
      </main>
    </ResponsiveNav>
  );
}

// Temporary icon until we define MedicineBoxIcon properly
function MedicineBoxIcon({ size, className }: { size: number; className?: string }) {
  return <Pill size={size} className={className} />;
}