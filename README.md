# Roda.Motorku — Sistem Katalog & Valuasi Harga Motor Bekas

Aplikasi web manajemen katalog showroom dan penentuan rekomendasi harga jual motor bekas berbasis **Machine Learning** menggunakan **Next.js 16 (App Router + Turbopack)**, **React 19**, **PostgreSQL**, serta fallback penyimpanan lokal **JSON atomik** (`src/data/db_store.json`).

---

## Fitur Utama

- **Katalog Publik (`/` & `/katalog/[id]`):** Pencarian teks, filter merek, tahun, rentang harga, dan status unit (`Tersedia` / `Terjual`), penghitung *views* dengan proteksi spam refresh, serta reservasi *test-drive* via WhatsApp. Data sensitif internal (`harga_beli`) disaring dari API publik.
- **Panel Admin Terproteksi (`/login` & `/admin/*`):**
  - **Dashboard:** Ringkasan inventaris, valuasi stok, akurasi model ML terbaik, dan aktivitas terbaru.
  - **Kelola Data Motor:** CRUD unit lengkap dengan unggah foto lokal (`/api/upload`), ekspor CSV, serta fitur *seed* 187 unit dataset Capstone.
  - **Estimasi Harga ML:** Evaluasi harga jual wajar menggunakan 3 model regresi (**Random Forest Regressor v1.4**, **Decision Tree Regressor**, dan **Ridge Linear Regression**) beserta *feature importance*.
  - **Riwayat Estimasi:** Simpan, ubah harga/catatan, ekspor CSV, dan konversi hasil simulasi langsung menjadi unit katalog.
- **Keamanan:** Single-admin (`scrypt:` per-user random salt + `timingSafeEqual`), JWT `HttpOnly` cookie diverifikasi di [src/proxy.ts](src/proxy.ts), proteksi *mass assignment*, validasi *magic bytes* gambar, *header* keamanan HTTP, dan *rate limiting* percobaan login gagal.

---

## Persyaratan & Konfigurasi `.env`

Salin `.env.example` ke `.env` lalu sesuaikan nilainya:

```env
# Koneksi PostgreSQL lokal atau cloud
DATABASE_URL="postgresql://postgres:PASSWORD_POSTGRES_ANDA@localhost:5432/postgres"

# Kunci HMAC-SHA256 minimal 32 karakter acak (wajib diset di environment production)
JWT_SECRET="isi-dengan-string-acak-panjang-yang-aman"

NODE_ENV="development"
PORT=3000
```

> **Catatan Mode Database:**
> - Jika PostgreSQL dapat dijangkau melalui `DATABASE_URL`, backend otomatis membuat tabel (`users`, `motor`, `foto_motor`, `prediksi_harga`) dan men-*seed* akun admin serta 187 unit awal.
> - Jika PostgreSQL tidak aktif/kredensial belum sesuai, sistem otomatis memakai mode `json-fallback` di `src/data/db_store.json` agar aplikasi tetap berjalan.

---

## Skrip Perintah

| Perintah | Fungsi |
| :--- | :--- |
| `npm run dev` | Menjalankan server pengembangan Next.js (`http://localhost:3000`). |
| `npm run build` | Membangun aplikasi produksi Next.js. |
| `npm run start` | Menjalankan hasil *production build*. |
| `npm run lint` | Menjalankan ESLint pada kode sumber. |
| `npm test` | Menjalankan suite *smoke test* E2E API, keamanan, upload, & ML (pastikan sudah `npm run build`). |
| `npm run db:start` | Menyalakan layanan PostgreSQL 17 lokal via `scripts/db_ctl.mjs`. |
| `npm run db:status` | Mengecek status server PostgreSQL 17 lokal. |
| `npm run db:stop` | Menghentikan layanan PostgreSQL 17 lokal. |

---

## Arsitektur & Endpoint API Ringkas

- `GET /api/health` — Status aplikasi, mode basis data aktif (`postgresql` / `json-fallback`), dan metrik model ML.
- `POST /api/auth/login`, `POST /api/auth/logout`, `GET /api/auth/me` — Autentikasi admin + proteksi *rate limit* (`429`).
- `GET /api/motor`, `POST /api/motor` — Daftar unit (publik tanpa `harga_beli`, admin lengkap) & tambah unit.
- `GET /api/motor/[id]`, `PUT /api/motor/[id]`, `DELETE /api/motor/[id]` — Detail, ubah, dan hapus unit.
- `POST /api/motor/[id]/view` — Mencatat kunjungan halaman detail dengan jeda anti-spam per IP.
- `POST /api/motor/seed` — Men-*seed* ulang 187 dataset motor Capstone (admin).
- `POST /api/predict`, `GET / POST /api/prediksi`, `GET / PUT / DELETE /api/prediksi/[id]`, `POST /api/prediksi/link` — Inferensi ML, histori estimasi, dan penautan ke unit katalog.
- `POST /api/upload`, `GET /api/upload/[filename]` — Unggah gambar JPG/PNG/WebP tervalidasi *magic bytes* & penyajian aman di mode dev/produksi.

---

## Catatan Deployment Produksi

- Jika di-*deploy* ke VPS/server persisten (`next start`), penyimpanan `public/uploads/` dan mode `json-fallback` bersifat permanen.
- Jika di-*deploy* ke platform *serverless* (*stateless*) seperti Vercel, gunakan **PostgreSQL eksternal** dan sambungkan `POST /api/upload` ke *object storage* eksternal (mis. S3, Cloudinary, atau Supabase Storage).
- Pastikan kredensial akun admin bawaan (`admin_otista`) diubah sebelum dibuka secara publik.
