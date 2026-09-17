// Client-side service worker registration
"use client";

import { useEffect } from "react";

export function SWRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      const registerSW = async () => {
        try {
          const registration = await navigator.serviceWorker.register("/sw.js", {
            scope: "/",
          });

          // Handle updates
          registration.addEventListener("updatefound", () => {
            const newWorker = registration.installing;
            if (!newWorker) return;
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                window.dispatchEvent(new CustomEvent("sw-updated", { detail: registration }));
              }
            });
          });

          // Auto skip waiting for new sw
          if (registration.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" });
          }

          return registration;
        } catch (err) {
          console.error("Service Worker registration failed:", err);
        }
      };

      registerSW();
    }
  }, []);

  return null;
}

export function useSWUpdate() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const handleUpdate = (e: CustomEvent) => {
      const registration = e.detail;
      const refreshingNotification = new Notification("Update Available", {
        body: "Tap to refresh and get the latest version",
        icon: "/icon-192x192.png",
      });

      refreshingNotification.onclick = () => {
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
        window.location.reload();
      };
    };

    window.addEventListener("sw-updated", handleUpdate as EventListener);

    return () => {
      window.removeEventListener("sw-updated", handleUpdate as EventListener);
    };
  }, []);
}
