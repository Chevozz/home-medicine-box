"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, Clock, Pill, Package, Plus, ArrowRight, History as HistoryIcon } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import type { Medicine, Schedule, ConsumptionLog } from "@/types";

export default function Dashboard() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [logs, setLogs] = useState<ConsumptionLog[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    // Fetch each endpoint independently so one failure doesn't blank the others.
    try {
      const { data } = await api.get("/api/medicines");
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load medicines:", err);
      setMedicines([]);
    }

    try {
      const { data } = await api.get("/api/schedules");
      setSchedules(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load schedules:", err);
      setSchedules([]);
    }

    try {
      const { data } = await api.get("/api/logs");
      setLogs(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load logs:", err);
      setLogs([]);
    }

    setLoading(false);
  };

  const recordTaken = async (medicineId: string) => {
    try {
      await api.post("/api/logs", { medicine_id: medicineId, status: "Taken" });
      load();
    } catch (err) {
      console.error("Gagal mencatat konsumsi:", err);
    }
  };

  useEffect(() => { load(); }, []);

  const today = new Date();
  const critical = medicines.filter((m) => m.stock_quantity <= 2);
  const expiring = medicines.filter((m) => {
    const diff = new Date(m.expiry_date).getTime() - today.getTime();
    return diff >= 0 && diff <= 30 * 86400000;
  });

  const formatExpiryDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  };

  const daysUntilExpiry = (dateStr: string) => {
    const diff = new Date(dateStr).getTime() - today.getTime();
    return Math.ceil(diff / 86400000);
  };

  const todaysSchedule = schedules.filter((s) => {
    const h = parseInt(s.time_to_take.slice(0, 2), 10);
    return h >= 6 && h < 23;
  });

  if (loading) return <main className="flex items-center justify-center h-64"><div className="animate-pulse text-slate-400">{t.loading}</div></main>;

  return (
    <ResponsiveNav title="MedTracker">
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: t.totalMedicines, value: medicines.length, bg: "bg-white dark:bg-slate-900", tone: "text-slate-900 dark:text-slate-100", icon: Package },
            { label: t.todaySchedule, value: todaysSchedule.length, bg: "bg-white dark:bg-slate-900", tone: "text-slate-900 dark:text-slate-100", icon: Clock },
            { label: t.criticalStock, value: critical.length, bg: critical.length ? "bg-rose-50 dark:bg-rose-900/20" : "bg-white dark:bg-slate-900", tone: critical.length ? "text-rose-700 dark:text-rose-300" : "text-slate-900 dark:text-slate-100", icon: AlertTriangle },
            { label: t.nearExpiry, value: expiring.length, bg: expiring.length ? "bg-amber-50 dark:bg-amber-900/20" : "bg-white dark:bg-slate-900", tone: expiring.length ? "text-amber-700 dark:text-amber-300" : "text-slate-900 dark:text-slate-100", icon: Clock },
          ].map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className={`${card.bg} rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-5 shadow-sm flex flex-col`}>
                <div className="flex items-center gap-2">
                  <Icon size={16} className={card.tone} />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">{card.label}</p>
                </div>
                <p className={`text-2xl md:text-3xl font-bold mt-2 ${card.tone}`}>{card.value}</p>
              </div>
            );
          })}
        </div>

        {/* Alerts */}
        {(critical.length > 0 || expiring.length > 0) && (
          <div className="space-y-3">
            {critical.map((m) => (
              <div key={m.id} className="bg-rose-50 dark:bg-rose-900/20 border border-rose-200 dark:border-rose-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="p-2 bg-rose-100 dark:bg-rose-900/30 rounded-xl text-rose-600 dark:text-rose-400">
                    <AlertTriangle size={20} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-rose-800 dark:text-rose-200">{t.stockEmpty}</p>
                    <p className="text-sm text-rose-600 dark:text-rose-400 truncate">{m.name} — {m.stock_quantity} {m.stock_quantity === 1 ? "tablet" : "tablets"} left</p>
                  </div>
                </div>
                <Link href="/medicines" className="text-rose-700 dark:text-rose-300 hover:underline text-sm font-medium flex items-center gap-1">
                  Detail <ArrowRight size={14} />
                </Link>
              </div>
            ))}
            {expiring.map((m) => {
              const days = daysUntilExpiry(m.expiry_date);
              return (
                <div key={m.id} className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
                      <Clock size={20} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-amber-800 dark:text-amber-200">{t.expiringSoon}</p>
                      <p className="text-sm text-amber-600 dark:text-amber-400 truncate">{m.name} — {days} {days === 1 ? "day" : "days"} ({formatExpiryDate(m.expiry_date)})</p>
                    </div>
                  </div>
                  <Link href="/medicines" className="text-amber-700 dark:text-amber-300 hover:underline text-sm font-medium flex items-center gap-1">
                    Detail <ArrowRight size={14} />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        {/* Today's Schedule */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 md:p-6 shadow-sm">
          <h2 className="text-base md:text-lg font-semibold mb-4 text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Pill size={18} className="text-emerald-600 dark:text-emerald-400" /> {t.todaySchedules}
          </h2>
          {todaysSchedule.length === 0 ? (
            <div className="text-center py-10">
              <Pill size={48} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-slate-500 dark:text-slate-400">{t.noScheduleToday}</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {todaysSchedule.map((s) => (
                <li key={s.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-slate-100 truncate">{s.medicine?.name || "Medicine"}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">{s.time_to_take} • {s.frequency}</p>
                  </div>
                  <button
                    onClick={() => recordTaken(s.medicine_id)}
                    className="btn-primary whitespace-nowrap"
                  >
                    {t.taken}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Link href="/medicines/new" className="btn-primary">
            <Plus size={18} /> {t.addNewMedicine}
          </Link>
          <Link href="/medicines" className="btn-secondary justify-center">
            <Package size={18} /> {t.manageMedicines}
          </Link>
          <Link href="/history" className="btn-secondary justify-center">
            <HistoryIcon size={18} /> {t.viewHistory}
          </Link>
        </div>
      </main>
    </ResponsiveNav>
  );
}