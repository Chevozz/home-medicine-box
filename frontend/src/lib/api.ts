"use client";
import axios from "axios";

// ponytail: base URL empty string means same-origin (Next.js API routes now
// live inside the same frontend app — frontend + backend unified on Vercel).
const api = axios.create({
  baseURL: "",
  headers: { "Content-Type": "application/json" },
});

// Attach token to every request
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    // Next.js API routes return Cache-Control: no-store in response headers
    // which tells Next.js not to cache the response. This ensures fresh data.
  }
  return config;
});

// Auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (typeof window !== "undefined" && error.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Logout: clear localStorage AND cookie so middleware can't be bypassed
export function logout() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  // Clear the httpOnly-ish cookie set at login (same-site, lax)
  document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; samesite=lax";
  // Hard redirect to login so no stale client state can serve protected data
  window.location.href = "/login";
}

export default api;
