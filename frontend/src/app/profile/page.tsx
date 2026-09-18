"use client";
import { useEffect, useState } from "react";
import { User, Mail, Save, Pill } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import type { User as UserType } from "@/types";

export default function ProfilePage() {
  const { t } = useTranslation();
  const [user, setUser] = useState<UserType | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/api/auth/me").then(({ data }) => { setUser(data); setName(data.name); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.patch("/api/auth/me", { name });
      setUser({ ...user!, name });
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    }
  };

  if (loading) return <main className="flex items-center justify-center h-64"><div className="animate-pulse text-slate-400">{t.loading}</div></main>;
  if (!user) return <main className="p-6"><a href="/login" className="text-emerald-600 dark:text-emerald-400 font-medium">{t.login}</a></main>;

  return (
    <ResponsiveNav title={t.profileTitle}>
      <main className="flex-1 p-3 sm:p-4 md:p-6 max-w-lg mx-auto">
        <form onSubmit={save} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 space-y-4 shadow-sm">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <User size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.profileTitle}
          </h1>
          {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="label flex items-center gap-1">
              <Mail size={12} /> {t.email}
            </label>
            <input type="email" value={user.email} disabled className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-500 dark:text-slate-400" />
          </div>
          <div className="space-y-2">
            <label className="label flex items-center gap-1">
              <User size={12} /> {t.name}
            </label>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="input-field" />
          </div>
          <button type="submit" className="btn-primary w-full flex items-center justify-center gap-2">
            <Save size={14} /> {t.saveChanges}
          </button>
        </form>
      </main>
    </ResponsiveNav>
  );
}