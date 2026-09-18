// App focus/visibility management for PWA sync on iOS
// Detects when app becomes visible again after being closed/backgrounded

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Hook to detect when app becomes visible again (visibilitychange or focus)
 * and force a router refresh to sync data from server.
 *
 * Fixes iOS PWA issue where closing from recent apps and reopening
 * leaves stale cache/state that prevents sync.
 */
export function useAppFocusSync() {
  const router = useRouter();

  useEffect(() => {
    // Initial visibility state check
    if (document.visibilityState === "visible") {
      console.log("[FocusSync] App visible on mount - scheduling refresh");
      scheduleRefresh();
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("[FocusSync] visibilitychange - app visible");
        scheduleRefresh();
      }
    };

    const handleFocus = () => {
      console.log("[FocusSync] window focus - scheduling refresh");
      scheduleRefresh();
    };

    // Listen for visibility changes (iOS PWA close/reopen)
    document.addEventListener("visibilitychange", handleVisibilityChange);
    // Listen for window focus (fallback for some cases)
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [router]); // router dependency for navigation

  // Debounce refresh to allow multiple visibility changes to settle
  let refreshTimeout: NodeJS.Timeout | null = null;
  const scheduleRefresh = () => {
    if (refreshTimeout) {
      clearTimeout(refreshTimeout);
    }
    refreshTimeout = setTimeout(() => {
      console.log("[FocusSync] Performing router.refresh() to sync data");
      router.refresh();
    }, 300); // 300ms debounce to avoid race conditions
  };
}

/**
 * Component wrapper for useAppFocusSync
 * Place in root layout to enable global focus detection
 */
export function FocusSync() {
  useAppFocusSync();
  return null;
}
