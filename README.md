# SI-Acad — Academic Planner & Companion
> **Sistem Informasi Akademik: Academic Task, Group Planner & Smart Academic Reminder**  
> Dibangun dengan React 19, TypeScript, Vite, Tailwind CSS v4, Supabase (PostgreSQL + RLS + Edge Functions + pg_cron), dan Web Push PWA.

---

## 🌿 Desain & Identitas
- **Konsep:** Modern Academic Minimalist
- **Warna Utama:** Sage Green (`#7C9A76`)
- **Mode:** Light Mode & Dark Mode (otomatis tersimpan di LocalStorage)
- **Tipografi:** *Lora* (Headings & Identitas Akademik) + *Source Sans 3* (Antarmuka & Data)
- **Ikon:** Lucide React (bebas emoji kaku)
- **Responsif:** Mobile First dengan Bottom Navigation di HP dan Sidebar di Desktop

---

## 🚀 Fitur Utama

### 1. Academic Task & Notes
- Buat, edit, dan hapus tugas perkuliahan
- Hubungkan tugas ke Mata Kuliah & Semester aktif
- Tanggal & jam deadline dengan perhitungan waktu sisa dinamis
- Tingkat prioritas (*Rendah*, *Normal*, *Tinggi*)
- Status pengerjaan (*Belum dikerjakan*, *Sedang dikerjakan*, *Selesai*)
- Catatan pribadi (*personal notes*) untuk instruksi pengumpulan
- Filter fleksibel: Mata Kuliah, Tanggal, Prioritas, Status, dan Pencarian teks
- **Tampilan Kalender Deadline Interaktif** dengan indikator warna titik tugas
- Penanda visual Sage Green, batas waktu mendekat (*Hari Ini!*), dan peringatan *Lewat Deadline*

### 2. Group Planner & Rotasi Mingguan
- **Manajemen Kelompok:**
  - Buat kelompok perkuliahan, tentukan Ketua (*Owner*), Admin, dan Anggota
  - Sistem kode undangan unik (*Invite Code*) dan tautan cepat (*Direct Link*)
  - Hak akses aman terotentikasi backend (RLS PostgreSQL)
- **Jadwal Rotasi Mingguan:**
  - Generator rotasi otomatis berdasarkan tanggal awal dan interval hari
  - Fleksibilitas ubah giliran dan tanggal secara manual jika jadwal dosen berubah
  - Tambah agenda kegiatan, topik presentasi, dan catatan perlengkapan
- **Group Dashboard:**
  - Banner dinamis **"Giliran Kelompokmu Pekan Ini!"** ketika kelompok Anda bertugas
  - Kartu pemantau: Pekan Ini, Pekan Berikutnya, Agenda Terdekat
  - Catatan persiapan dan koordinasi pembagian slide presentasi

### 3. Smart Academic Reminder (PWA Push Notification)
- **Web Push API, Notifications API, dan Service Worker (`sw.js`)**
- Berfungsi di background HP/laptop meskipun aplikasi sedang tidak dibuka
- **Pengingat Kuliah:** Default 2 jam sebelum kelas & 5 menit sebelum masuk kelas
- **Pengingat Tugas:** Default H-1, 2 jam sebelum deadline, dan saat batas waktu tiba (otomatis membatalkan pengingat jika tugas ditandai selesai)
- **Pengingat Kelompok:** Notifikasi H-1 dan hari-H giliran presentasi
- **Notification Settings:**
  - Tombol manual *"Aktifkan Notifikasi HP"* (tidak meminta izin secara agresif saat aplikasi pertama kali dibuka)
  - Pengaturan interval menit/jam per jenis notifikasi
  - Manajemen perangkat terdaftar (*push subscriptions*)
  - Toggle efek suara & pemilihan zona waktu (WIB, WITA, WIT)
- **In-App Notification Center:**
  - Tab kategori: *Semua*, *Belum Dibaca*, *Tugas*, *Kelompok*, *Kuliah*
  - Klik notifikasi langsung mengarahkan ke halaman terkait (*action URL*)

---

## 🛠️ Panduan Menjalankan Aplikasi

### 1. Masuk ke Direktori Proyek
```bash
cd si-acad
```

### 2. Konfigurasi Environment Variable (`.env`)
Salin file `.env.example` menjadi `.env`:
```env
VITE_SUPABASE_URL=https://proyek-anda.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOi...
VITE_VAPID_PUBLIC_KEY=kunci-publik-vapid-anda
```

### 3. Jalankan Migrasi Database di Supabase
Buka **Supabase Dashboard > SQL Editor**, lalu jalankan file migrasi secara berurutan:
1. `supabase/migrations/001_base_schema.sql` (Profil, Semester, Mata Kuliah, Jadwal Kuliah + RLS)
2. `supabase/migrations/002_tasks.sql` (Tabel Tasks, Triggers, RLS)
3. `supabase/migrations/003_study_groups.sql` (Study Groups, Members, Rotations, Events, RPC Join)
4. `supabase/migrations/004_notifications.sql` (Preferences, Subscriptions, Jobs, Logs, Task Triggers)

### 4. Menjalankan di Mode Development
```bash
npm run dev
```
Buka browser di `http://localhost:5173`.

### 5. Build untuk Produksi
```bash
npm run build
```
File siap di-deploy ke hosting statis (Vercel, Netlify, Firebase Hosting, Cloudflare Pages) di folder `dist/`.

---

## 🔔 Konfigurasi Web Push & Supabase Edge Function (Opsional untuk Push Otomatis)

1. **Generate Kunci VAPID**:
   ```bash
   npx web-push generate-vapid-keys
   ```
   - Masukkan Public Key ke `.env` sebagai `VITE_VAPID_PUBLIC_KEY`.
   - Simpan Private Key secara aman di Supabase Secrets.

2. **Deploy Edge Function**:
   ```bash
   supabase functions deploy send-notifications
   supabase secrets set VAPID_PUBLIC_KEY=xxx VAPID_PRIVATE_KEY=yyy
   ```

3. **Jadwalkan Supabase pg_cron (Setiap Menit)**:
   Di SQL Editor Supabase:
   ```sql
   SELECT cron.schedule(
     'dispatch-academic-reminders',
     '* * * * *',
     $$
     SELECT net.http_post(
       url := 'https://proyek-anda.supabase.co/functions/v1/send-notifications',
       headers := '{"Content-Type": "application/json", "Authorization": "Bearer SERVICE_ROLE_KEY"}'::jsonb
     ) AS request_id;
     $$
   );
   ```

---
*SI-Acad — Teman Pintar Perjalanan Akademik Anda.*
