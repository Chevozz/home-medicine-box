"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Pill, X } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import { useTranslation } from "@/lib/i18n";
import api from "@/lib/api";

export default function LoginPage() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetMessage, setResetMessage] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const { token } = (await api.post("/api/auth/login", { email, password })).data;
      localStorage.setItem("token", token);
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage("");
    try {
      await api.post("/api/auth/forgot-password", { email: resetEmail });
      setResetMessage(t.resetPasswordSent);
      setShowForgotModal(false);
    } catch (err: any) {
      setResetMessage(err.response?.data?.error || t.resetPasswordError);
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
              {t.signInDesc}
            </p>
          </div>

          {error && (
            <div className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl p-4 text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

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

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={(e) => { e.preventDefault(); setShowForgotModal(true); }}
              className="text-sm text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              {t.forgotPassword}
            </button>
          </div>

          <button type="submit" className="btn-primary w-full">
            {t.signIn}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            {t.dontHaveAccount} <Link href="/register" className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline">{t.signUp}</Link>
          </p>
        </form>

        {/* Forgot Password Modal */}
        {showForgotModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4">{t.resetPassword}</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {t.sendResetLink}
                </p>
                {resetMessage && (
                  <div className={`mb-4 p-3 rounded-xl ${resetMessage.includes("Gagal") || resetMessage.includes("Failed") ? "bg-rose-50 dark:bg-rose-900/20" : "bg-emerald-50 dark:bg-emerald-900/20"} ${resetMessage.includes("Gagal") || resetMessage.includes("Failed") ? "text-rose-700 dark:text-rose-300" : "text-emerald-700 dark:text-emerald-300"}`}>
                    {resetMessage}
                  </div>
                )}
                <div className="space-y-2">
                  <label className="label">{t.email}</label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="input-field"
                    placeholder={t.emailPlaceholder}
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button onClick={() => setShowForgotModal(false)} className="btn-danger">{t.cancel}</button>
                  <button type="submit" className="btn-primary">{t.sendResetLink}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </ResponsiveNav>
  );
}

// Temporary icon until we define MedicineBoxIcon properly
function MedicineBoxIcon({ size, className }: { size: number; className?: string }) {
  return <Pill size={size} className={className} />;
}