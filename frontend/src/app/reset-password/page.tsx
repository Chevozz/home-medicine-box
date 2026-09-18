"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, AlertCircle, CheckCircle } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

export default function ResetPasswordPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Token reset password tidak ditemukan. Silakan minta link reset baru.");
    }
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!token) {
      setError(t.error);
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      return;
    }

    try {
      await api.post("/api/auth/reset-password", {
        token,
        newPassword: password,
      });
      setSuccess(true);
      // Auto redirect after 3 seconds
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    }
  };

  if (!token && !error) {
    return null; // Will show loading
  }

  return (
    <ResponsiveNav title="Reset Password">
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-4">
        <div className="w-full max-w-md">
          {error && !success && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center gap-3 text-rose-700 dark:text-rose-300">
              <AlertCircle size={20} />
              <span>{error}</span>
            </div>
          )}

          {success ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800 p-8 text-center shadow-sm">
              <CheckCircle size={64} className="mx-auto mb-4 text-emerald-600 dark:text-emerald-400" />
              <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
                {t.success}
              </h1>
              <p className="text-slate-600 dark:text-slate-400">
                Password berhasil direset. Anda akan dialihkan ke halaman login...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                  <Lock size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                    {t.resetPassword}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    Masukkan password baru Anda
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-lg text-rose-700 dark:text-rose-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="label">{t.password}</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    minLength={8}
                  />
                  <p className="text-xs text-slate-500">Minimal 8 karakter</p>
                </div>

                <div className="space-y-2">
                  <label className="label">{t.confirmPassword}</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="input-field"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-6 btn-primary flex items-center justify-center gap-2"
              >
                <Lock size={16} />
                {loading ? t.loading : "Set Password Baru"}
              </button>

              <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
               Ingat password Anda?{" "}
                <a href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium hover:underline">
                  {t.login}
                </a>
              </p>
            </form>
          )}
        </div>
      </main>
    </ResponsiveNav>
  );
}
