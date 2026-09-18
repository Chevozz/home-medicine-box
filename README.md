# MedTracker - Home Medicine Box

MedTracker adalah aplikasi manajemen dan pelacakan konsumsi obat berbasis web yang dirancang untuk penggunaan rumah tangga. Aplikasi ini memudahkan pencatatan stok obat, penjadwalan konsumsi, dan riwayat pemakaian secara *real-time*.

## Fitur Utama
- **Manajemen Inventaris Obat:** Tambah, edit, dan hapus data obat beserta informasi stok dan tanggal kedaluwarsa.
- **Pencatatan Otomatis (Auto-Decrement):** Stok obat akan otomatis berkurang saat jadwal konsumsi ditandai sebagai "Diminum".
- **Riwayat Konsumsi:** Pelacakan riwayat pemakaian obat harian dengan status log (Diminum/Terlewat).
- **Sistem Autentikasi & Keamanan:** Fitur login pengguna dilengkapi dengan *Reset Password* menggunakan token JWT dan pengiriman email otomatis via Nodemailer (Gmail SMTP).
- **Dukungan Bilingual (i18n):** Antarmuka tersedia dalam Bahasa Indonesia dan Bahasa Inggris.
- **Progressive Web App (PWA):** Dapat diinstal di perangkat seluler dengan dukungan *caching Service Worker* yang dioptimalkan untuk performa tinggi.

## Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Database & ORM:** PostgreSQL (via Supabase) & Prisma ORM
- **Styling:** Tailwind CSS
- **Email Service:** Nodemailer (Gmail SMTP)
- **Deployment:** Vercel

## Prasyarat
Pastikan Anda telah menginstal utilitas berikut di sistem Anda:
- [Node.js](https://nodejs.org/) (versi 18.x atau terbaru)
- npm, pnpm, atau yarn
- Akun [Supabase](https://supabase.com/) (untuk *hosting* database PostgreSQL)
- Akun Google dengan fitur Sandi Aplikasi (*App Password*) aktif (untuk Nodemailer)

## Instalasi & Menjalankan Aplikasi Lokal

1. **Kloning repositori:**
   ```bash
   git clone https://github.com/username-anda/home-medicine-tracker.git
   cd home-medicine-tracker/frontend
   ```

2. **Instal dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment Variables:**
   Buat file `.env` di direktori `frontend` dan sesuaikan nilainya:
   ```env
   # Database Configuration (Dapatkan URL ini dari dashboard Supabase Anda)
   DATABASE_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"
   DIRECT_URL="postgresql://postgres:password@db.supabase.co:5432/postgres"

   # Security
   JWT_SECRET="masukkan_kunci_rahasia_acak_anda_di_sini"

   # Email Configuration (Nodemailer - Gmail SMTP)
   EMAIL_USER="email.anda@gmail.com"
   EMAIL_PASS="16_karakter_sandi_aplikasi_google"

   # Application URL (Gunakan localhost untuk tahap development)
   NEXT_PUBLIC_APP_URL="http://localhost:3000"
   ```

4. **Migrasi Database & Generate Prisma Client:**
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init_schema
   ```

5. **Jalankan Development Server:**
   ```bash
   npm run dev
   ```
   Buka `http://localhost:3000` di *browser* Anda untuk melihat hasilnya.

## Deployment ke Vercel

1. *Push* kode sumber Anda ke repositori GitHub.
2. Buat proyek baru di [Vercel](https://vercel.com) dan hubungkan dengan repositori GitHub Anda.
3. Masuk ke menu **Settings > Environment Variables** di *dashboard* proyek Vercel Anda.
4. Tambahkan semua kunci variabel dari file `.env` lokal Anda. 
   **Penting:** Pastikan nilai `NEXT_PUBLIC_APP_URL` diubah menjadi domain *live* proyek Anda (contoh: `https://medicine-box-black.vercel.app`).
5. Klik **Deploy** (atau jalankan *Redeploy* jika memperbarui variabel). Vercel secara otomatis mendeteksi Next.js dan akan mengeksekusi `npx prisma generate && next build` sesuai skrip *build* Anda.