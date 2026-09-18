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

export default api;
