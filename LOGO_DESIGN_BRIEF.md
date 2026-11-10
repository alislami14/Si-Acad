# SI-Acad — Logo Design Brief & Master Prompt Guide

> **Identitas Visual Resmi untuk Pembuatan Logo Menggunakan Google Gemini / Imagen 3**

Dokumen ini disusun khusus agar Anda dapat langsung menyalin (*copy-paste*) identitas merek dan instruksi prompt ke **Google Gemini** (atau model generator gambar AI seperti Imagen 3 / Midjourney) guna menghasilkan logo yang selaras 100% dengan antarmuka aplikasi **SI-Acad**.

---

## 1. Profil & Filosofi Merek (Brand Context)

| Parameter | Keterangan |
| :--- | :--- |
| **Nama Aplikasi** | **SI-Acad** |
| **Tagline** | *Academic Companion* |
| **Kategori** | Sistem Informasi & Perencana Akademik Mahasiswa (PWA Web & Mobile) |
| **Fungsi Utama** | Manajemen jadwal kuliah, manajemen tugas & deadline, rotasi kelompok belajar, dan smart reminder. |
| **Karakter Desain** | **Modern Academic Minimalist**, Bersih, Intelektual, Menenangkan, Terstruktur. |
| **Kesan Psikologis** | Mengurangi rasa cemas mahasiswa terhadap deadline, menghadirkan fokus, ketenangan, serta keteraturan. |

---

## 2. Palet Warna Resmi (Design Tokens)

Warna logo **wajib** menggunakan palet turunan **Sage Green** yang sama persis dengan sistem desain CSS aplikasi SI-Acad:

```
┌─────────────────────────────────────────────────────────────────┐
│                    PALET WARNA RESMI SI-ACAD                    │
├───────────────────┬─────────────┬───────────────────────────────┤
│ Nama Token        │ Kode HEX    │ Peruntukan                    │
├───────────────────┼─────────────┼───────────────────────────────┤
│ Sage 500 (Utama)  │ #7C9A76     │ Warna primer logo & ikon      │
│ Sage 700 (Tegas)  │ #4D6449     │ Kontur, aksen gelap & teks    │
│ Sage 400 (Lembut) │ #93AC91     │ Shadow halus / aksen sekunder │
│ Sage 100 (Pudar)  │ #E6EDE5     │ Latar ikon / container bulat │
│ Canvas Light      │ #FAFAF7     │ Latar belakang tema terang    │
│ Canvas Dark       │ #141814     │ Latar belakang tema gelap     │
└───────────────────┴─────────────┴───────────────────────────────┘
```

* **Warna Primer:** `#7C9A76` *(Muted botanical sage green)*
* **Warna Aksen Dalam:** `#4D6449` *(Deep forest olive)*
* **Latar Belakang Ikon App:** `#FAFAF7` *(Warm off-white)* atau `#7C9A76` *(Solid Sage)*

---

## 3. Simbolisme & Elemen Visual Kunci

Logo yang ideal untuk SI-Acad menggabungkan **dua hingga tiga** metafora berikut secara harmonis tanpa terlihat ramai (*overcrowded*):

1. **Monogram "S" (atau "SA"):** Bentuk huruf S yang mengalir lembut dengan proporsi geometris presisi.
2. **Daun Sage (Botani / Tunas):** Melambangkan pertumbuhan intelektual (*growth*), ketenangan pikiran (*calmness*), dan kesehatan mental mahasiswa.
3. **Buku Terbuka / Lembaran Kalender:** Garis lengkung tipis yang membentuk siluet buku atau agenda perkuliahan.
4. **Sirkel / Rotasi:** Melambangkan siklus semester dan rotasi kelompok yang berkesinambungan.

---

## 4. Gaya Visual yang Diharapkan vs Dihindari

| ✅ Yang Diharapkan (Wajib) | ❌ Yang Dihindari (Dilarang) |
| :--- | :--- |
| Vektor 2D / Flat modern minimalist | Efek 3D berlebihan, glossy plastik, skeuomorphic |
| Garis lengkung bersih (*smooth continuous curves*) | Garis terlalu rumit (*overly intricate detail*) |
| Terbaca jelas pada ukuran kecil (32px / Favicon) | Gradasi warna pelangi (*rainbow/vibrant gradients*) |
| Ruang bernapas luas (*generous negative space*) | Tumpukan teks panjang atau ornamen ramai |
| Proporsi golden ratio & simetris seimbang | Clipart generik topi toga atau pensil kartun |

---

## 5. Master Prompt untuk Diberikan ke Google Gemini

Salin salah satu prompt di bawah ini ke Gemini sesuai gaya yang paling Anda sukai:

### Opsi A: Monogram "S" Organik (Rekomendasi Terbaik untuk Ikon Aplikasi & Favicon)
> **Salin ke Gemini:**
> ```text
> Tolong buatkan desain logo modern minimalis untuk aplikasi akademik mahasiswa bernama "SI-Acad".
> 
> Konsep Desain:
> - Bentuk utama: Monogram huruf "S" geometris yang elegan dan modern.
> - Sentuhan simbolik: Lekukan huruf "S" terinspirasi dari gabungan siluet daun sage (botanical leaf) dan garis lembaran buku yang terbuka.
> - Gaya visual: Flat vector, 2D minimalist, clean lines, golden ratio, aesthetic app icon style.
> - Warna utama: Sage Green (#7C9A76) dengan aksen warna Forest Green gelap (#4D6449).
> - Latar belakang: Warna bersih warm off-white (#FAFAF7), tanpa bayangan 3D yang tebal.
> - Mood: Cerdas, tenang, akademis, profesional, dan menyejukkan.
> - Format: Logo mark / app icon di tengah kanvas, tajam, resolusi tinggi, vektor bersih tanpa teks tambahan.
> ```

---

### Opsi B: Buku Akademik & Tunas Daun Sage (Simbol Edukasi Modern)
> **Salin ke Gemini:**
> ```text
> Tolong rancang logo simbol untuk aplikasi perencana perkuliahan bernama "SI-Acad".
> 
> Konsep Desain:
> - Bentuk utama: Siluet minimalis sebuah buku terbuka yang disederhanakan (abstract open book), di mana dari bagian tengahnya tumbuh tunas daun sage yang melengkung anggun.
> - Makna: Melambangkan ilmu pengetahuan, perencanaan semester, dan pertumbuhan intelektual yang tenang.
> - Gaya visual: Modern Scandinavian academic minimalist, line art elegan berpadu dengan shape solid halus.
> - Warna: Palet Sage Green (#7C9A76), Deep Olive (#4D6449), dan krem lembut (#FAFAF7).
> - Komposisi: Ikon simetris berpusat di tengah dengan ruang negatif yang luas (negative space).
> - Hindari: Gradasi neon mencolok, efek glossy 3D, atau ornamen rumit. Harus tetap terlihat jelas dan ikonik saat diperkecil menjadi favicon browser.
> ```

---

### Opsi C: Logo Lengkap (Logo Mark + Logotype Teks "SI-Acad")
> **Salin ke Gemini:**
> ```text
> Tolong buatkan brand identity logo lengkap untuk aplikasi "SI-Acad (Academic Companion)".
> 
> Komponen Logo:
> 1. Di sebelah kiri: Simbol ikonik gabungan daun sage dan buku minimalis berpalet warna #7C9A76 (Sage Green).
> 2. Di sebelah kanan: Teks "SI-Acad" menggunakan tipografi serif modern yang anggun dan berwibawa (mirip gaya font Lora), dengan sub-teks kecil "Academic Companion" berwarna abu-abu kehijauan (#627F5C).
> 3. Latar belakang: Putih gading bersih (#FAFAF7).
> 4. Tampilan: Elegan, estetik, berkelas, ramah mahasiswa, dan profesional setara brand software modern (seperti Notion atau Linear).
> ```

---

### Opsi D: Prompt Berbahasa Inggris (Untuk Hasil Terbaik di Imagen 3 / Gemini Advanced)
> **Salin ke Gemini:**
> ```text
> A premium, modern academic minimalist app icon logo for a university companion app called "SI-Acad".
> 
> Visual Concept:
> A stylized geometric letter "S" seamlessly morphing into an elegant sage leaf and open book curves.
> 
> Aesthetics & Specifications:
> - Style: Flat 2D vector, Scandinavian minimalism, clean continuous contour lines, golden ratio symmetry.
> - Color Palette: Muted Sage Green (#7C9A76), Deep Forest Olive (#4D6449), on a clean warm off-white background (#FAFAF7).
> - Composition: Centered square app icon with subtle rounded corners, high negative space, crisp vector edges.
> - Mood: Academic elegance, mindfulness, calm, intellectual, organized.
> - Strict Exclusions: No 3D bevels, no glossy plastic textures, no busy drop shadows, no colorful rainbow gradients, no clipart.
> ```

---

## 6. Cara Menggunakan Hasil Logo di Aplikasi SI-Acad

Setelah Gemini membuatkan gambar logo yang Anda sukai:
1. Simpan gambar tersebut ke folder project: `d:\viescot\Si-Acad\public\icons\logo.png` (atau format SVG).
2. Kami dapat langsung memasangnya ke:
   * **Favicon browser** (`public/favicon.svg` atau `index.html`)
   * **Ikon Web App Manifest PWA** (`public/icons/icon-192.png` & `icon-512.png`)
   * **Sidebar Navigasi Desktop** menggantikan huruf kotak hijau "S" saat ini.
   * **Header Mobile** di samping judul SI-Acad.

