"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type Language = "id" | "en";

interface Translations {
  // Navigation
  dashboard: string;
  medicines: string;
  history: string;
  profile: string;
  logout: string;
  login: string;
  register: string;

  // Common
  save: string;
  cancel: string;
  delete: string;
  edit: string;
  add: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;

  // Dashboard
  totalMedicines: string;
  todaySchedule: string;
  criticalStock: string;
  nearExpiry: string;
  todaySchedules: string;
  noScheduleToday: string;
  quickActions: string;
  addNewMedicine: string;
  manageMedicines: string;
  viewHistory: string;
  syncCalendar: string;

  // Medicines
  medicineBox: string;
  addMedicine: string;
  editMedicine: string;
  medicineName: string;
  medicineType: string;
  dosage: string;
  stock: string;
  expiryDate: string;
  noMedicines: string;
  startAdding: string;
  typePlaceholder: string;
  dosagePlaceholder: string;
  scheduleTimes: string;
  scheduleTimesDesc: string;
  addTime: string;
  removeTime: string;

  // Medicine Types
  capsule: string;
  syrup: string;
  tablet: string;
  ointment: string;
  inhaler: string;
  other: string;

  // Add Medicine Form
  addMedicineTitle: string;
  dosageInstructions: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  stockPlaceholder: string;
  passwordPlaceholder: string;

  // History
  consumptionHistory: string;
  filterByMedicine: string;
  allMedicines: string;
  noRecords: string;
  recordConsumption: string;
  taken: string;
  missed: string;
  historyRecord: string;

  // Auth
  email: string;
  password: string;
  name: string;
  forgotPassword: string;
  resetPassword: string;
  sendResetLink: string;
  alreadyHaveAccount: string;
  dontHaveAccount: string;
  signIn: string;
  signUp: string;
  signInDesc: string;
  signUpDesc: string;
  resetPasswordSent: string;
  resetPasswordError: string;

  // Profile
  profileTitle: string;
  saveChanges: string;

  // Alerts
  stockEmpty: string;
  lowStock: string;
  expiringSoon: string;
  expired: string;

  // Language
  language: string;
  indonesian: string;
  english: string;

  // Theme
  theme: string;
  lightMode: string;
  darkMode: string;
}

const translations: Record<Language, Translations> = {
  id: {
    dashboard: "Dashboard",
    medicines: "Kotak Obat",
    history: "Riwayat",
    profile: "Profil",
    logout: "Keluar",
    login: "Masuk",
    register: "Daftar",
    save: "Simpan",
    cancel: "Batal",
    delete: "Hapus",
    edit: "Edit",
    add: "Tambah",
    confirm: "Konfirmasi",
    loading: "Memuat...",
    error: "Error",
    success: "Berhasil",
    totalMedicines: "Total Obat",
    todaySchedule: "Jadwal Hari Ini",
    criticalStock: "Stok Kritis",
    nearExpiry: "Hampir Kedaluwarsa",
    todaySchedules: "Jadwal Hari Ini",
    noScheduleToday: "Tidak ada jadwal hari ini.",
    quickActions: "Aksi Cepat",
    addNewMedicine: "Tambah Obat Baru",
    manageMedicines: "Kelola Obat",
    viewHistory: "Lihat Riwayat",
    syncCalendar: "Sinkron ke Kalender",
    medicineBox: "Kotak Obat",
    addMedicine: "Tambah Obat",
    editMedicine: "Edit Obat",
    medicineName: "Nama Obat",
    medicineType: "Jenis Obat",
    dosage: "Dosis / Cara Pakai",
    stock: "Stok",
    expiryDate: "Tanggal Kedaluwarsa",
    noMedicines: "Belum Ada Obat",
    startAdding: "Mulailah dengan menambahkan obat pertama Anda ke kotak obat.",
    typePlaceholder: "Pilih...",
    dosagePlaceholder: "Contoh: 3x sehari sesudah makan",
    scheduleTimes: "Jam Minum (Waktu)",
    scheduleTimesDesc: "Pilih jam-jam kapan Anda harus minum obat ini",
    addTime: "Tambah Jam",
    removeTime: "Hapus jam ini",
    capsule: "Kapsul",
    syrup: "Sirup",
    tablet: "Tablet",
    ointment: "Salep",
    inhaler: "Inhaler",
    other: "Lainnya",
    addMedicineTitle: "Tambah Obat Baru",
    dosageInstructions: "Dosis / Cara Pakai",
    namePlaceholder: "Masukkan nama lengkap",
    emailPlaceholder: "you@example.com",
    stockPlaceholder: "Jumlah stok",
    passwordPlaceholder: "••••••••",
    consumptionHistory: "Riwayat Konsumsi",
    filterByMedicine: "Filter Berdasarkan Obat",
    allMedicines: "Semua Obat",
    noRecords: "Belum Ada Catatan",
    recordConsumption: "Catat Konsumsi",
    taken: "Diminum",
    missed: "Terlewat",
    historyRecord: "untuk mulai mencatat konsumsi obat Anda.",
    email: "Email",
    password: "Password",
    name: "Nama",
    forgotPassword: "Lupa Password?",
    resetPassword: "Reset Password",
    sendResetLink: "Kirim Link Reset",
    alreadyHaveAccount: "Sudah punya akun?",
    dontHaveAccount: "Belum punya akun?",
    signIn: "Masuk",
    signUp: "Daftar",
    signInDesc: "Masuk untuk mengakses akun Anda",
    signUpDesc: "Daftar untuk membuat akun baru",
    resetPasswordSent: "Link reset password telah dikirim ke email Anda.",
    resetPasswordError: "Gagal mengirim link reset",
    profileTitle: "Profil Pengguna",
    saveChanges: "Simpan Perubahan",
    stockEmpty: "Stok Habis!",
    lowStock: "Stok Rendah",
    expiringSoon: "Akan Kedaluwarsa!",
    expired: "Kedaluwarsa",
    language: "Bahasa",
    indonesian: "Indonesia",
    english: "English",
    theme: "Tema",
    lightMode: "Terang",
    darkMode: "Gelap",
  },
  en: {
    dashboard: "Dashboard",
    medicines: "Medicine Box",
    history: "History",
    profile: "Profile",
    logout: "Logout",
    login: "Login",
    register: "Register",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    totalMedicines: "Total Medicines",
    todaySchedule: "Today's Schedule",
    criticalStock: "Critical Stock",
    nearExpiry: "Near Expiry",
    todaySchedules: "Today's Schedule",
    noScheduleToday: "No schedule for today.",
    quickActions: "Quick Actions",
    addNewMedicine: "Add New Medicine",
    manageMedicines: "Manage Medicines",
    viewHistory: "View History",
    syncCalendar: "Sync to Calendar",
    medicineBox: "Medicine Box",
    addMedicine: "Add Medicine",
    editMedicine: "Edit Medicine",
    medicineName: "Medicine Name",
    medicineType: "Medicine Type",
    dosage: "Dosage / Instructions",
    stock: "Stock",
    expiryDate: "Expiry Date",
    noMedicines: "No Medicines Yet",
    startAdding: "Start by adding your first medicine to the box.",
    typePlaceholder: "Select...",
    dosagePlaceholder: "e.g., 3x daily after meals",
    scheduleTimes: "Medicine Times",
    scheduleTimesDesc: "Select the times you need to take this medicine",
    addTime: "Add Time",
    removeTime: "Remove this time",
    capsule: "Capsule",
    syrup: "Syrup",
    tablet: "Tablet",
    ointment: "Ointment",
    inhaler: "Inhaler",
    other: "Other",
    addMedicineTitle: "Add New Medicine",
    dosageInstructions: "Dosage / Instructions",
    namePlaceholder: "Enter your full name",
    emailPlaceholder: "you@example.com",
    stockPlaceholder: "Stock quantity",
    passwordPlaceholder: "••••••••",
    consumptionHistory: "Consumption History",
    filterByMedicine: "Filter by Medicine",
    allMedicines: "All Medicines",
    noRecords: "No Records Yet",
    recordConsumption: "Record Consumption",
    taken: "Taken",
    missed: "Missed",
    historyRecord: "to start recording your medication consumption.",
    email: "Email",
    password: "Password",
    name: "Name",
    forgotPassword: "Forgot Password?",
    resetPassword: "Reset Password",
    sendResetLink: "Send Reset Link",
    alreadyHaveAccount: "Already have an account?",
    dontHaveAccount: "Don't have an account?",
    signIn: "Sign In",
    signUp: "Sign Up",
    signInDesc: "Sign in to access your account",
    signUpDesc: "Sign up to create a new account",
    resetPasswordSent: "Password reset link has been sent to your email.",
    resetPasswordError: "Failed to send reset link",
    profileTitle: "User Profile",
    saveChanges: "Save Changes",
    stockEmpty: "Out of Stock!",
    lowStock: "Low Stock",
    expiringSoon: "Expiring Soon!",
    expired: "Expired",
    language: "Language",
    indonesian: "Indonesian",
    english: "English",
    theme: "Theme",
    lightMode: "Light",
    darkMode: "Dark",
  },
};

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  // ponytail: initial state must be identical on server and client to avoid
  // hydration mismatch (#418). localStorage is read in an effect after
  // hydration, not in the useState initializer.
  const [language, setLanguage] = useState<Language>("id");

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language;
    if (saved === "id" || saved === "en") setLanguage(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("language", language);
  }, [language]);

  return (
    <I18nContext.Provider value={{ language, setLanguage, t: translations[language] }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useTranslation must be used within an I18nProvider");
  return context;
}
