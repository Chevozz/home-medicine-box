"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { History, Pill, Plus, Trash2 } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import type { ConsumptionLog, Medicine } from "@/types";

export default function HistoryPage() {
  const { t } = useTranslation();
  const router = useRouter();
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [allMedicines, setAllMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterMedicineId, setFilterMedicineId] = useState("");

  const load = async (mid = "") => {
    setLoading(true);
    try {
      const [logsRes, medsRes] = await Promise.all([
        api.get(`/api/logs${mid ? `?medicine_id=${mid}` : ""}`),
        api.get("/api/medicines")
      ]);
      setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      setAllMedicines(Array.isArray(medsRes.data) ? medsRes.data : []);
    } catch (err) {
      console.error("Gagal load:", err);
      setLogs([]);
      setAllMedicines([]);
    }
    setLoading(false);
  };

  const record = async (mid: string, status: "Taken" | "Missed") => {
    try {
      await api.post("/api/logs", { medicine_id: mid, status });
      load(filterMedicineId);
      // Revalidate cache on server for dashboard as well
      router.refresh();
    } catch (err: any) {
      console.error("Gagal mencatat:", err);
      alert(err.response?.data?.error || t.error);
    }
  };

  useEffect(() => { load(); }, []);

  // Force refresh when filter changes to bypass Next.js cache
  useEffect(() => {
    load(filterMedicineId);
  }, [filterMedicineId]);

  const medicinesForFilter = allMedicines.map((m) => ({ id: m.id, name: m.name }));

  if (loading) return <main className="flex items-center justify-center h-64"><div className="animate-pulse text-slate-400">{t.loading}</div></main>;

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleString("id-ID", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const getStatusBadge = (status: string, time?: string) => {
    const icon = status === "Taken" ? <Plus size={10} /> : <Trash2 size={10} />;
    const label = status === "Taken" ? t.taken : t.missed;
    const bgClass = status === "Taken"
      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-300"
      : "bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-300";

    if (time) {
      const [hour, minute] = time.split(":");
      const displayTime = `${hour}:${minute}`;
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${bgClass}`}>
          {icon} {label} - {displayTime}
        </span>
      );
    }

    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${bgClass}`}>
        {icon} {label}
      </span>
    );
  };

  return (
    <ResponsiveNav title="MedTracker">
      <main className="flex-1 p-4 md:p-6 space-y-5">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <History size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.history}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.startAdding}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="flex-1 min-w-[200px]">
            <label className="label">{t.filterByMedicine}</label>
            <select value={filterMedicineId} onChange={(e) => { setFilterMedicineId(e.target.value); load(e.target.value); }}
              className="w-full input-field">
              <option value="">{t.allMedicines}</option>
              {Array.isArray(medicinesForFilter) && medicinesForFilter.map((med) => <option key={med.id} value={med.id}>{med.name}</option>)}
            </select>
          </div>
        </div>

        {/* Logs List */}
        {Array.isArray(logs) && logs.length === 0 ? (
          <div className="text-center py-12">
            <History size={56} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t.noRecords}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              {t.recordConsumption} {t.historyRecord}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {Array.isArray(logs) && logs.map((l) => (
              <div key={l.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:shadow-md transition-shadow duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-900 dark:text-slate-100">{l.medicine?.name || "-"} {l.medicine?.dosage_instructions ? `(${l.medicine.dosage_instructions})` : ""}</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">{formatTime(l.consumed_at)}</p>
                  {l.schedule && (
                    <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                      Scheduled at: {l.schedule.time_to_take}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(l.status, l.schedule?.time_to_take)}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Action Cards */}
        {Array.isArray(allMedicines) && allMedicines.length > 0 && (
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <h2 className="text-base md:text-lg font-semibold mb-3 text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Plus size={16} className="text-emerald-600 dark:text-emerald-400" /> {t.recordConsumption}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {allMedicines.map((m) => (
                <div key={m.id} className="flex items-center justify-between bg-slate-50 dark:bg-slate-900/50 rounded-xl p-3 border border-slate-200 dark:border-slate-800">
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100">{m.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{m.stock_quantity} {t.stock}</p>
                    {m.schedules && m.schedules.length > 0 && (
                      <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
                        Times: {m.schedules.map((s) => s.time_to_take).join(", ")}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1.5">
                    <button onClick={() => record(m.id, "Taken")} className="btn-primary text-sm px-3 py-1.5">
                      <Plus size={12} /> {t.taken}
                    </button>
                    <button onClick={() => record(m.id, "Missed")} className="btn-secondary text-sm px-3 py-1.5">
                      <Trash2 size={12} /> {t.missed}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </ResponsiveNav>
  );
}
