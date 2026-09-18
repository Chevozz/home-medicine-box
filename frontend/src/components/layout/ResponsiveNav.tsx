"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Home, Pill, History, LogOut, Sun, Moon, Languages } from "lucide-react";
import { useTheme } from "@/lib/theme";
import { useTranslation } from "@/lib/i18n";
import { logout as doLogout } from "@/lib/api";

export default function ResponsiveNav({ title, children }: { title?: string; children: ReactNode }) {
  const pathname = usePathname();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const desktopLangRef = useRef<HTMLDivElement>(null);
  const mobileLangRef = useRef<HTMLDivElement>(null);

  const { theme, toggleTheme } = useTheme();
  const { t, language, setLanguage } = useTranslation();

  const isActive = (path: string) => pathname === path;

  const logout = () => {
    doLogout();
  };

  // Close language menu when clicking outside either the desktop or mobile menu.
  // ponytail: both menus share one open-state, so a single ref is wrong — the
  // ref would only cover whichever header rendered last, making the other
  // header's dropdown close on its own mousedown (before onClick → setLanguage).
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;
      const insideDesktop = desktopLangRef.current?.contains(target);
      const insideMobile = mobileLangRef.current?.contains(target);
      if (!insideDesktop && !insideMobile) setShowLanguageMenu(false);
    };

    if (showLanguageMenu) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside, { passive: true });
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showLanguageMenu]);

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Top Bar (Desktop) */}
      <header className="hidden md:flex bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3.5 justify-between items-center sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">
            MedTracker
          </Link>
          {title && <span className="text-sm font-medium text-slate-500 dark:text-slate-400 border-l border-slate-200 dark:border-slate-700 pl-4">{title}</span>}
        </div>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            <Link href="/dashboard" className={`px-3 py-1.5 text-sm font-medium transition rounded-lg ${isActive("/dashboard") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`}>
              {t.dashboard}
            </Link>
            <Link href="/medicines" className={`px-3 py-1.5 text-sm font-medium transition rounded-lg ${isActive("/medicines") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`}>
              {t.medicines}
            </Link>
            <Link href="/history" className={`px-3 py-1.5 text-sm font-medium transition rounded-lg ${isActive("/history") ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"}`}>
              {t.history}
            </Link>
          </nav>

          <div className="flex items-center gap-2 pl-4 border-l border-slate-200 dark:border-slate-700">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              aria-label={theme === "light" ? t.darkMode : t.lightMode}
            >
              {theme === "light" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* Language Switcher */}
            <div className="relative" ref={desktopLangRef}>
              <button
                onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
                className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                aria-label={t.language}
                aria-expanded={showLanguageMenu}
              >
                <Languages size={18} />
              </button>
              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  <button
                    onClick={() => { setLanguage("id"); setShowLanguageMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${language === "id" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    {t.indonesian}
                  </button>
                  <button
                    onClick={() => { setLanguage("en"); setShowLanguageMenu(false); }}
                    className={`w-full text-left px-4 py-2 text-sm transition ${language === "en" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                  >
                    {t.english}
                  </button>
                </div>
              )}
            </div>

            <button onClick={logout} className="text-sm text-rose-600 hover:text-rose-700 font-medium flex items-center gap-2 px-3 py-1.5">
              <LogOut size={16} /> {t.logout}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Header */}
      <header className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between sticky top-0 z-40 shadow-sm">
        <Link href="/dashboard" className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">
          MedTracker
        </Link>
        <div className="flex items-center gap-2">
          {/* Theme Toggle (Mobile) - Direct toggle, no dropdown */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition touch-manipulation"
            aria-label={theme === "light" ? t.darkMode : t.lightMode}
          >
            {theme === "light" ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          {/* Language Switcher (Mobile) - Uses same dropdown logic */}
          <div className="relative" ref={mobileLangRef}>
            <button
              onClick={(e) => { e.stopPropagation(); setShowLanguageMenu(!showLanguageMenu); }}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition touch-manipulation"
              aria-label={t.language}
              aria-expanded={showLanguageMenu}
            >
              <Languages size={20} />
            </button>
            {showLanguageMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg z-50 overflow-hidden">
                <button
                  onClick={() => { setLanguage("id"); setShowLanguageMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition ${language === "id" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {t.indonesian}
                </button>
                <button
                  onClick={() => { setLanguage("en"); setShowLanguageMenu(false); }}
                  className={`w-full text-left px-4 py-2 text-sm transition ${language === "en" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"}`}
                >
                  {t.english}
                </button>
              </div>
            )}
          </div>
          <button onClick={() => setShowLogoutConfirm(true)} className="text-rose-600 p-2 touch-manipulation">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* Bottom Navigation (Mobile Only) - Clean 3 items only */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-4 py-2.5 flex justify-around items-center z-40 shadow-lg">
        <Link href="/dashboard" className={`flex flex-col items-center p-2 rounded-xl transition ${isActive("/dashboard") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"}`}>
          <Home size={24} strokeWidth={isActive("/dashboard") ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">{t.dashboard}</span>
        </Link>
        <Link href="/medicines" className={`flex flex-col items-center p-2 rounded-xl transition ${isActive("/medicines") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"}`}>
          <Pill size={24} strokeWidth={isActive("/medicines") ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">{t.medicines}</span>
        </Link>
        <Link href="/history" className={`flex flex-col items-center p-2 rounded-xl transition ${isActive("/history") ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"}`}>
          <History size={24} strokeWidth={isActive("/history") ? 2.5 : 2} />
          <span className="text-[10px] font-medium mt-1">{t.history}</span>
        </Link>
      </nav>

      {/* Page Content */}
      <main className="flex-1 pt-20 md:pt-0 md:pb-0 pb-24">
        {children}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 md:hidden">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-bold mb-2 text-slate-900 dark:text-slate-100">{t.confirm}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">{t.logout}?</p>
            <div className="flex gap-3">
              <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl py-2.5 hover:bg-slate-200 dark:hover:bg-slate-700 transition font-medium text-sm">
                {t.cancel}
              </button>
              <button onClick={logout} className="flex-1 bg-rose-600 text-white rounded-xl py-2.5 hover:bg-rose-700 transition font-medium text-sm">
                {t.logout}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}