"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, CalendarDays, Clock, Trash2, X } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";

// Cache-Control headers are set by the API route; fetch() calls use axios
// with `cache: 'no-store'` semantics via the api client in @/lib/api.

export default function AddMedicinePage() {
  const { t } = useTranslation();
  const [form, setForm] = useState({
    name: "",
    type: "",
    dosage_instructions: "",
    stock_quantity: "",
    expiry_date: "",
  });
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["08:00", "14:00"]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const validTimes = scheduleTimes.filter((t) => t.trim() !== "");
    if (validTimes.length === 0) {
      setError("Setidaknya satu waktu minum obat harus diisi");
      return;
    }
    setSubmitting(true);
    try {
      await api.post("/api/medicines", {
        ...form,
        stock_quantity: Number(form.stock_quantity),
        expiry_date: new Date(form.expiry_date).toISOString(),
        schedule_times: validTimes,
      });

      // Reset form before navigating so stale input state cannot be reused
      setForm({
        name: "",
        type: "",
        dosage_instructions: "",
        stock_quantity: "",
        expiry_date: "",
      });
      setScheduleTimes(["08:00", "14:00"]);

      // Push first, then refresh the router cache so /medicines and
      // /dashboard re-fetch from the database instead of serving stale data.
      router.push("/medicines");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.error || t.error);
    } finally {
      setSubmitting(false);
    }
  };

  const field = (key: keyof typeof form) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm({ ...form, [key]: e.target.value }),
  });

  const addTimeSlot = () => {
    setScheduleTimes([...scheduleTimes, ""]);
  };

  const removeTimeSlot = (index: number) => {
    setScheduleTimes(scheduleTimes.filter((_, i) => i !== index));
  };

  const updateTimeSlot = (index: number, value: string) => {
    const newTimes = [...scheduleTimes];
    newTimes[index] = value;
    setScheduleTimes(newTimes);
  };

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
              <input
                type="date"
                required
                {...field("expiry_date")}
                className="input-field pl-10 w-full box-border max-w-full appearance-none"
              />
              <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Schedule Times */}
          <div className="space-y-2">
            <label className="label flex items-center gap-2">
              <Clock size={14} className="text-slate-500 dark:text-slate-400" /> {t.scheduleTimes}
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">{t.scheduleTimesDesc}</p>
            <div className="space-y-2">
              {scheduleTimes.map((time, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => updateTimeSlot(index, e.target.value)}
                    className="input-field flex-1"
                    required
                  />
                  {scheduleTimes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeTimeSlot(index)}
                      className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                      aria-label={t.removeTime}
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={addTimeSlot}
              className="btn-secondary text-sm flex items-center justify-center gap-2 w-fit"
            >
              <Plus size={14} /> {t.addTime}
            </button>
          </div>

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={() => router.back()} disabled={submitting} className="btn-danger flex-1 flex items-center justify-center gap-2 opacity-50">
              <X size={14} /> {t.cancel}
            </button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus size={14} /> {submitting ? t.saving : t.save}
            </button>
          </div>
        </form>
      </main>
    </ResponsiveNav>
  );
}