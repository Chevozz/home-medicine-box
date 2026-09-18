import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "@/app/globals.css";
import { ThemeProvider } from "@/lib/theme";
import { I18nProvider } from "@/lib/i18n";
import { SWRegister } from "@/lib/sw";
import { FocusSync } from "@/lib/appFocus";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "MedTracker",
  description: "Smart Medicine Management for Your Home",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-512x512.png",
  },
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedTracker",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    title: "MedTracker",
    description: "Smart Medicine Management for Your Home",
    images: [
      {
        url: "/icon-512x512.png",
        width: 512,
        height: 512,
        alt: "MedTracker",
      },
    ],
  },
};

export const viewport: Viewport = {
  themeColor: "#0f172a",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300`}>
        <ThemeProvider>
          <I18nProvider>
            {children}
            <SWRegister />
            <FocusSync />
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}