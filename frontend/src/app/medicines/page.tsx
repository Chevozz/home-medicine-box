"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Edit3, Trash2, Package, AlertTriangle, AlertCircle, CalendarDays, Download } from "lucide-react";
import ResponsiveNav from "@/components/layout/ResponsiveNav";
import api from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import type { Medicine } from "@/types";

export default function MedicinesPage() {
  const { t } = useTranslation();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    dosage_instructions: "",
    stock_quantity: "",
    expiry_date: ""
  });
  const [scheduleTimes, setScheduleTimes] = useState<string[]>(["08:00", "14:00", "20:00"]);

  const load = async () => {
    try {
      const { data } = await api.get("/api/medicines");
      setMedicines(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load medicines:", err);
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm(t.confirm)) return;
    try {
      await api.delete(`/api/medicines/${id}`);
      setMedicines((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      console.error("Failed to delete medicine:", err);
      alert(err.response?.data?.error || t.error);
    }
  };

  const openEdit = (medicine: Medicine) => {
    setEditingMedicine(medicine);
    setFormData({
      name: medicine.name,
      type: medicine.type,
      dosage_instructions: medicine.dosage_instructions,
      stock_quantity: medicine.stock_quantity.toString(),
      expiry_date: new Date(medicine.expiry_date).toISOString().split("T")[0]
    });
    // Set schedule times if available
    if (medicine.schedules && medicine.schedules.length > 0) {
      setScheduleTimes(medicine.schedules.map((s) => s.time_to_take));
    }
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMedicine) return;
    try {
      await api.put(`/api/medicines/${editingMedicine.id}`, {
        name: formData.name,
        type: formData.type,
        dosage_instructions: formData.dosage_instructions,
        stock_quantity: parseInt(formData.stock_quantity),
        expiry_date: new Date(formData.expiry_date).toISOString(),
        schedule_times: scheduleTimes.filter((t) => t.trim() !== ""),
      });
      setShowEditModal(false);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || t.error);
    }
  };

  const cancelEdit = () => {
    setShowEditModal(false);
    setEditingMedicine(null);
  };

  // Generate ICS file content for a medicine's schedule
  const generateICSContent = (medicine: Medicine, scheduleTimes: string[]): string => {
    const now = new Date();
    const icsLines: string[] = [];

    // ICS Header
    icsLines.push("BEGIN:VCALENDAR");
    icsLines.push("VERSION:2.0");
    icsLines.push("PRODID:-//MedTracker//MedTracker Calendar//ID");

    // Generate events for each schedule time (next 30 days)
    scheduleTimes.forEach((time, index) => {
      const [hour, minute] = time.split(":");
      const date = new Date(now);
      date.setHours(parseInt(hour), parseInt(minute), 0, 0);

      // Find the next occurrence that's >= today
      if (date.getTime() < now.getTime()) {
        date.setDate(date.getDate() + 1);
      }

      for (let day = 0; day < 30; day++) {
        const eventDate = new Date(date);
        eventDate.setDate(eventDate.getDate() + day);

        const uid = `${medicine.id}-${time}-${day}@medtracker.app`;
        const summary = `${medicine.name} - ${time}`;
        const description = `Minum obat: ${medicine.name}\n${medicine.dosage_instructions || ""}`;

        icsLines.push("BEGIN:VEVENT");
        icsLines.push(`UID:${uid}`);
        icsLines.push(`DTSTAMP:${formatDateForICS(now)}`);
        icsLines.push(`DTSTART:${formatDateForICS(eventDate)}`);
        icsLines.push(`SUMMARY:${summary}`);
        icsLines.push(`DESCRIPTION:${description}`);
        icsLines.push("END:VEVENT");
      }
    });

    // ICS Footer
    icsLines.push("END:VCALENDAR");

    return icsLines.join("\r\n");
  };

  const formatDateForICS = (date: Date): string => {
    return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  };

  const downloadICS = (medicine: Medicine) => {
    const content = generateICSContent(medicine, (medicine.schedules || []).map((s) => s.time_to_take));
    const blob = new Blob([content], { type: "text/calendar;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${medicine.name.replace(/\s+/g, "_")}_schedule.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  useEffect(() => { load(); }, []);

  const getExpiryStatus = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(dateStr);
    const diff = Math.ceil((expiry.getTime() - today.getTime()) / 86400000);

    if (diff < 0) return { label: t.expired, class: "bg-rose-50 dark:bg-rose-900/20", icon: AlertTriangle };
    if (diff <= 30) return { label: `${t.expiringSoon} ${diff} ${diff === 1 ? "day" : "days"}`, class: "bg-amber-50 dark:bg-amber-900/20", icon: AlertCircle };
    return { label: `${diff} ${diff === 1 ? "day" : "days"}`, class: "bg-emerald-50 dark:bg-emerald-900/20", icon: Package };
  };

  const getStockStatus = (qty: number) => {
    if (qty === 0) return { label: t.stockEmpty, class: "bg-rose-50 dark:bg-rose-900/20", icon: AlertTriangle };
    if (qty <= 2) return { label: t.lowStock, class: "bg-amber-50 dark:bg-amber-900/20", icon: AlertTriangle };
    return { label: `${t.stock}: ${qty}`, class: "bg-emerald-50 dark:bg-emerald-900/20", icon: Package };
  };

  if (loading) return <main className="flex items-center justify-center h-64"><div className="animate-pulse text-slate-400">{t.loading}</div></main>;

  return (
    <ResponsiveNav title="MedTracker">
      <main className="flex-1 p-4 md:p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t.medicineBox}</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">{t.startAdding}</p>
          </div>
          <Link href="/medicines/new" className="btn-secondary">
            <Plus size={18} /> {t.addMedicine}
          </Link>
        </div>

        {/* Empty State */}
        {medicines.length === 0 ? (
          <div className="text-center py-12">
            <Package size={56} className="mx-auto mb-4 text-slate-300 dark:text-slate-600" strokeWidth={1.5} />
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{t.noMedicines}</h2>
            <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">{t.startAdding}</p>
            <Link href="/medicines/new" className="btn-primary mt-4">
              <Plus size={18} /> {t.addNewMedicine}
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {medicines.map((m) => {
              const expiry = getExpiryStatus(m.expiry_date);
              const stock = getStockStatus(m.stock_quantity);
              const times = m.schedules && m.schedules.length > 0 ? m.schedules.map((s) => s.time_to_take) : ["08:00", "14:00", "20:00"];

              return (
                <div key={m.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 hover:shadow-md transition-shadow duration-200 flex flex-col">
                  {/* Header: Name + Type */}
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-slate-100 line-clamp-1">{m.name}</h3>
                    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400">{m.type}</span>
                  </div>

                  {/* Dosage */}
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">{m.dosage_instructions}</p>

                  {/* Schedule Times */}
                  {times.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {times.map((time, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded">
                          {time}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${stock.class}`}>
                      <stock.icon size={10} className="flex-shrink-0" /> {stock.label}
                    </span>
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${expiry.class}`}>
                      <expiry.icon size={10} className="flex-shrink-0" /> {expiry.label}
                    </span>
                  </div>

                  {/* Actions - Horizontally aligned */}
                  <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                    <button onClick={() => openEdit(m)} className="flex-1 text-sm font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-1.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Edit3 size={14} /> {t.edit}
                    </button>
                    <button onClick={() => remove(m.id)} className="flex-1 text-sm font-medium text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-900/20 px-3 py-1.5 rounded-xl flex items-center justify-center gap-2 transition-colors">
                      <Trash2 size={14} /> {t.delete}
                    </button>
                  </div>

                  {/* Calendar Sync Button */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => downloadICS(m)}
                      className="w-full text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 px-3 py-2 rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                      <Download size={12} /> {t.syncCalendar}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-800">
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-4 flex items-center gap-2">
                <Edit3 size={20} className="text-emerald-600 dark:text-emerald-400" /> {t.editMedicine}
              </h2>

              <div className="space-y-2">
                <label className="label">{t.medicineName}</label>
                <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="label">{t.medicineType}</label>
                <select required value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })} className="input-field">
                  <option value="">{t.typePlaceholder}</option>
                  <option value={t.capsule}>{t.capsule}</option>
                  <option value={t.tablet}>{t.tablet}</option>
                  <option value={t.ointment}>{t.ointment}</option>
                  <option value={t.inhaler}>{t.inhaler}</option>
                  <option value={t.other}>{t.other}</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="label">{t.dosage}</label>
                <input required value={formData.dosage_instructions} onChange={(e) => setFormData({ ...formData, dosage_instructions: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="label">{t.stock}</label>
                <input type="number" min="0" required value={formData.stock_quantity} onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })} className="input-field" />
              </div>
              <div className="space-y-2">
                <label className="label flex items-center gap-2">
                  <CalendarDays size={14} className="text-slate-500 dark:text-slate-400" /> {t.expiryDate}
                </label>
                <div className="relative">
                  <input type="date" required value={formData.expiry_date} onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })} className="input-field pl-10" />
                  <CalendarDays size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="label">{t.scheduleTimes}</label>
                <p className="text-xs text-slate-500 dark:text-slate-400">{t.scheduleTimesDesc}</p>
                <div className="space-y-2">
                  {scheduleTimes.map((time, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="time"
                        value={time}
                        onChange={(e) => {
                          const newTimes = [...scheduleTimes];
                          newTimes[index] = e.target.value;
                          setScheduleTimes(newTimes);
                        }}
                        className="input-field flex-1"
                        required
                      />
                      {scheduleTimes.length > 1 && (
                        <button
                          type="button"
                          onClick={() => setScheduleTimes(scheduleTimes.filter((_, i) => i !== index))}
                          className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-lg transition"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleTimes([...scheduleTimes, ""])}
                  className="btn-secondary text-sm flex items-center justify-center gap-2 w-fit"
                >
                  <Plus size={14} /> {t.addTime}
                </button>
              </div>
              <div className="flex justify-end pt-4 space-x-3">
                <button onClick={cancelEdit} className="btn-secondary">{t.cancel}</button>
                <button type="submit" className="btn-primary">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </ResponsiveNav>
  );
}
