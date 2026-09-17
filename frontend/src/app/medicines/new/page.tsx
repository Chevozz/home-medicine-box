"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Pill, Calendar, Package, ArrowLeft, CalendarDays } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

export default function AddMedicinePage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ name: "", type: "", dosage_instructions: "", stock_quantity: "", expiry_date: "" });
  const [error, setError] = useState("");
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/medicines", {
        ...form,
        stock_quantity: Number(form.stock_quantity),
        expiry_date: new Date(form.expiry_date).toISOString(),
      });
      router.push("/medicines");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  return (
    <ResponsiveNav title={t.addMedicineTitle}>
      <main className="flex items-center justify-center min-h-[calc(100vh-4rem)] sm:min-h-screen p-3 sm:p-4 md:p-6">
        <form onSubmit={submit} className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 space-y-4 md:space-y-5 shadow-sm">
          <h1 className="text-lg md:text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Plus size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.addMedicineTitle}
          </h1>
          {error && <p className="text-rose-600 dark:text-rose-400 text-sm">{error}</p>}
          <div className="space-y-2">
            <label className="label">{t.medicineName}</label>
            <input required {...field("name")} placeholder={t.namePlaceholder} className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label">{t.medicineType}</label>
            <select required {...field("type")} className="input-field">
              <option value="">{t.typePlaceholder}</option>
              <option value={t.capsule}>{t.capsule}</option>
              <option value={t.syrup}>{t.syrup}</option>
              <option value={t.tablet}>{t.tablet}</option>
              <option value={t.ointment}>{t.ointment}</option>
              <option value={t.inhaler}>{t.inhaler}</option>
              <option value={t.other}>{t.other}</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="label">{t.dosageInstructions}</label>
            <input required {...field("dosage_instructions")} placeholder={t.dosagePlaceholder} className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label">{t.stock}</label>
            <input type="number" min="0" required {...field("stock_quantity")} placeholder={t.stockPlaceholder} className="input-field" />
          </div>
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <CalendarDays size={14} className="text-slate-500 dark:text-slate-400" /> {t.expiryDate}
            </label>
            <div className="relative">
              <input type="date" required {...field("expiry_date")} className="input-field pl-10" />
              <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
            </div>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1 flex items-center justify-center gap-2">
              <ArrowLeft size={14} /> {t.cancel}
            </button>
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus size={14} /> {t.save}
            </button>
          </div>
        </form>
      </main>
    </ResponsiveNav>
  );
}

// Temporary icon until we define MedicineBoxIcon properly
function MedicineBoxIcon({ size, className }: { size: number; className?: string }) {
  return <Pill size={size} className={className} />;
}