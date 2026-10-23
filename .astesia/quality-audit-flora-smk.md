# Quality & Security Audit Report — Flora SMK (Botanidex)

**Layer:** Quality Layer (`/astesia-quality`)  
**Status Audit:** ❌ **FAILED (10 Temuan — Membutuhkan Remediation di Engineering Layer)**  
**Tanggal Audit:** 2026-10-23  
**Baseline Check:** `svelte-check` (0 error, 0 warning), `vitest` (22/22 unit tests pass), `vite build` (sukses kompilasi).

---

## Ringkasan Eksekutif (Critique Direktur Agensi)

Secara permukaan, `svelte-check` dan 22 unit test lolos tanpa error. Namun itu adalah *false sense of security* karena unit test yang ada saat ini hanya menguji jalur *in-memory / localStorage fallback* dan melewatkan kontrak integrasi nyata.

Audit mendalam pada kode sumber menemukan **10 bug dan pelanggaran arsitektur** (termasuk **3 Critical/High Bug** yang pasti membuat aplikasi *crash* di produksi saat PWA di-install atau saat Supabase diaktifkan).

---

## 1. Critical & High-Severity Functional Bugs

### 🔴 BUG-01 [CRITICAL]: PWA Service Worker Gagal Install 100% di Production (`[object Object]` Fetch Crash)
- **Lokasi:** `src/service-worker.js` (Baris 10–25)
- **Akar Masalah:** Di SvelteKit 3 (`@sveltejs/kit` `^3.0.0`), modul `$app/manifest` mengekspor `immutable`, `assets`, dan `prerendered` sebagai array objek `{ path: string }` (tanpa *leading slash*), **bukan** `string[]`. Saat `cache.addAll(ASSETS_TO_CACHE)` dieksekusi pada event `install`, browser mencoba melakukan HTTP GET ke `/[object Object]`, menghasilkan `404 Not Found` dan menggagalkan instalasi Service Worker secara total.
- **Masalah Tambahan (Baris 45–89):** Event `fetch` tidak memfilter skema non-HTTP (`if (!url.protocol.startsWith('http')) return;`), sehingga request ekstensi browser (`chrome-extension://`) atau `blob:`/`data:` akan memicu `TypeError` saat `cache.put()`.
- **Solusi:** Gunakan modul standar `$service-worker` (`import { build, files, version } from '$service-worker'`) atau petakan `.map(x => typeof x === 'string' ? x : '/' + x.path)` serta filter protokol `http:`/`https:`.

### 🔴 BUG-02 [CRITICAL]: Ketidakcocokan Skema Data TypeScript `Plant` vs Tabel PostgreSQL `public.plants`
- **Lokasi:** `src/lib/repositories/plant.repository.ts` (Baris 55–248) vs `supabase/migrations/001_initial_schema.sql` (Baris 49–103)
- **Akar Masalah:**
  1. Di kode TypeScript (`Plant`), taksonomi disimpan sebagai objek bersarang `taxonomy: { kingdom, divisio, classis, ordo, familia, genus, species }`, ditambah properti `contributor_name` pada `Plant` dan `uploaded_by_name` pada `PlantVideo`.
  2. Di skema SQL Supabase (`public.plants`), kolom disimpan secara *flat* (`taxonomy_kingdom`, `taxonomy_divisio`, dst.) tanpa kolom JSON `taxonomy`, tanpa `contributor_name`, dan `public.plant_videos` tanpa `uploaded_by_name`.
  3. Saat `isSupabaseConfigured() === true`:
     - `insertPlant()` langsung mengirim `...plantRow` ke Supabase → **Gagal Insert (PostgREST 400 Error: column `taxonomy` does not exist)**.
     - `getApprovedPlants()`, `getPlantBySlug()`, dan `getAllPlants()` melakukan `return data as Plant[]` tanpa *mapper* transformasi → properti `plant.taxonomy` bernilai `undefined` → **UI Crash (`TypeError: Cannot read properties of undefined (reading 'familia')`)** di `katalog/+page.svelte`, `PlantTaxonomy.svelte`, dan `QrGenerator.svelte`.
- **Solusi:** Buat fungsi mapper `mapRowToPlant()` dan `mapPlantToRow()` di `PlantRepository`, serta tambahkan kolom `contributor_name` dan `uploaded_by_name` pada migrasi SQL.

### 🔴 BUG-03 [HIGH]: Kategori Dinamis CMS (`ConfigService`) Tidak Terintegrasi dengan Form, Zod Schema, dan Badge
- **Lokasi:** `src/routes/admin/pengaturan/+page.svelte`, `src/lib/schemas/plant.schema.ts` (Baris 12–19), `src/routes/kontribusi/tambah/+page.svelte` (Baris 260–272), `src/lib/utils/format.ts` (Baris 10–20), `src/lib/components/plant/PlantCard.svelte` (Baris 42)
- **Akar Masalah:**
  1. Admin dapat menambah kategori baru di `/admin/pengaturan` (misal: `id: 'hidroponik'`, `label: 'Hidroponik'`).
  2. Namun `<select>` pada form `/kontribusi/tambah` masih *hardcoded* ke 6 opsi statis, dan `plantCategorySchema` di `plant.schema.ts` mengunci validasi pada `z.enum(['hias', 'pangan', 'obat', 'kayu', 'industri', 'lainnya'])`.
  3. `PlantCard.svelte` baris 42 memotong teks badge dengan `{categoryLabel.split(' ')[1] || categoryLabel}` yang mengasumsikan semua label diawali kata `"Tanaman "` (sehingga label kustom `"Kultur Jaringan"` terpotong menjadi `"Jaringan"`).
- **Solusi:** Dinamiskan validasi kategori terhadap `ConfigService.getCategories()`, muat opsi `<select>` dari `ConfigService`, dan perbaiki perenderan label badge di `format.ts` & `PlantCard.svelte`.

---

## 2. Medium-Severity Bugs (BRD Traceability & Security)

### 🟠 BUG-04 [HIGH/SECURITY]: Backdoor Auto-Login Admin & Ketiadaan Route Guard (Pelanggaran BRD AC6.4 & Security Rule #3)
- **Lokasi:** `src/routes/admin/moderasi/+page.svelte` (Baris 36–40), `src/routes/admin/pengaturan/+page.svelte` (Baris 59–63), `src/routes/kontribusi/tambah/+page.svelte`, `src/lib/components/layout/BottomNav.svelte` (Baris 74–84)
- **Akar Masalah:**
  1. Pada `onMount` halaman `/admin/moderasi` dan `/admin/pengaturan`, kode menjalankan `if (!$authUser) { authUser.loginAsDemo('admin'); }`. Pengunjung publik (*guest*) yang mengakses URL `/admin/moderasi` atau menekan tombol *Logout* saat berada di halaman admin justru **otomatis masuk kembali sebagai Admin**.
  2. Jika pengguna sedang login sebagai `contributor` (Siswa), `$authUser` bernilai *truthy* sehingga pengecekan dilewati — **Siswa dapat membuka `/admin/moderasi` untuk menyetujui pengajuannya sendiri** atau merusak konfigurasi CMS di `/admin/pengaturan`.
- **Solusi:** Hapus auto-login admin tersembunyi di `onMount`. Terapkan pengecekan otorisasi ketat (`$authUser?.role === 'admin'`) dengan tampilan *Access Denied / Prompt Login Guru* jika belum memiliki hak akses.

### 🟠 BUG-05 [MEDIUM]: Field `Species` Hilang di Form Kontribusi & Validasi Video Belum Sesuai BRD (AC2.4, F2, F5)
- **Lokasi:** `src/routes/kontribusi/tambah/+page.svelte` (Baris 49 & 308–315), `src/lib/services/storage.service.ts` (Baris 60–94), `src/lib/repositories/plant.repository.ts` (Baris 253–289), `src/lib/components/plant/PlantVideoSection.svelte`
- **Akar Masalah:**
  1. Variabel state `taxonomySpecies` dideklarasikan di baris 49 namun **tidak memiliki elemen `<Input>` pada template HTML** (baris 308–315 hanya merender 6 dari 7 tingkat taksonomi).
  2. **Durasi Video:** BRD F2 & F5 mewajibkan batas durasi video maksimal **5 menit (300 detik)** dan mengekstrak `duration_seconds`. Saat ini hanya ukuran byte (50MB) yang divalidasi; durasi video tidak diperiksa dan `duration_seconds` tidak disimpan.
  3. **Status Moderasi Video:** Saat guru menyetujui tanaman di `PlantRepository.updatePlantStatus()`, status pada array `plant.videos[]` tetap `'pending'` dan tidak ikut berubah menjadi `'approved'`. Sementara `PlantVideoSection.svelte` juga tidak memfilter `video.status === 'approved'`.
  4. **Blob URL Video Offline:** `StorageService.uploadPlantVideo()` mengembalikan `URL.createObjectURL(file)` yang mati ketika halaman di-refresh atau dibuka di tab baru (`target="_blank"` dari halaman moderasi).

### 🟠 BUG-06 [MEDIUM]: Race Condition Kamera & Kegagalan Scan File di `QrScanner.svelte`
- **Lokasi:** `src/lib/components/qr/QrScanner.svelte` (Baris 21–117)
- **Akar Masalah:**
  1. Saat kamera sedang aktif memindai (`isScanning === true`), memanggil `html5QrCode.scanFile(file, true)` pada `handleFileUpload` akan langsung melempar exception dari library `html5-qrcode` karena kamera belum dihentikan (`await stopScanner()` wajib dipanggil sebelum `scanFile`).
  2. Jika user keluar dari halaman `/scan` sebelum Promise `startScanner()` selesai, `onDestroy` gagal menghentikan kamera karena `isScanning` masih `false`, menyebabkan *camera stream leak*.
  3. `handleScanSuccess` baris 30–31 melakukan `window.location.href = decodedText` untuk sembarang URL `http*` (potensi *Open Redirect* ke domain eksternal berbahaya dari QR code palsu).

---

## 3. Architectural, Performance & Anti-Bloat Audit (Quality Rules #5, #7, #8)

### 🟡 BUG-07 [ARCHITECTURAL VIOLATION — Rule #7]: UI Route Mengakses Repository Secara Langsung
- **Lokasi:** `src/routes/peta/+page.svelte` (Baris 9 & 19)
- **Masalah:** `[ARCHITECTURAL_VIOLATION]` Halaman UI `/peta/+page.svelte` mengimpor `MapRepository` secara langsung tanpa melewati Service Layer (`PlantService` atau `MapService`).

### 🟡 BUG-08 [MEMORY LEAK]: Object URL Preview Foto Tidak Di-revoke
- **Lokasi:** `src/routes/kontribusi/tambah/+page.svelte` (Baris 69–77)
- **Masalah:** `URL.createObjectURL(file)` dipanggil setiap kali menambah foto, tetapi `removePhoto()` dan `onDestroy` tidak memanggil `URL.revokeObjectURL()`.

### 🟡 BUG-09 [DEVOPS / CONFIG]: Adapter Produksi Salah Terkonfigurasi di `vite.config.ts`
- **Lokasi:** `vite.config.ts` (Baris 4)
- **Masalah:** `package.json` sudah menginstal `@sveltejs/adapter-vercel`, namun `vite.config.ts` masih memakai `@sveltejs/adapter-auto` yang memunculkan warning `Could not detect a supported production environment` saat build lokal.

### 🟡 BUG-10 [ANTI-BLOAT / PONYTAIL & DOCS — Rules #5 & #8]: Dead Files, Duplikasi Dependency, & Header Docs Stale
- `delete: package.json` → Menginstal dua library ikon identik sekaligus: `@lucide/svelte` (`^1.61.0`) DAN `lucide-svelte` (`^1.0.1`). Seluruh komponen memakai `@lucide/svelte`; `lucide-svelte` tidak terpakai.
- `delete: static/logo-smk.png` → File berukuran **1.73 MB** yang identik 100% dengan `static/SMK-Pertanian-Gorontalo.png` dan tidak pernah dipakai di kode, namun ikut ter-cache oleh Service Worker sehingga membebani kuota user sebesar 1.73 MB sia-sia (melanggar NFR Bundle/Cache).
- `delete: src/lib/vitest-examples/greet.ts` & `greet.spec.ts` → File contoh bawaan generator yang tidak relevan dengan domain proyek.
- `shrink: src/lib/schemas/contribution.schema.ts` → `moderationReviewSchema` sudah dibuat tetapi tidak dipanggil di `PlantService.moderatePlant()`.
- `docs:` Header Doc di `src/lib/services/plant.service.ts` dan `src/lib/repositories/map.repository.ts` mencantumkan nama fungsi/caller yang sudah tidak sinkron dengan implementasi aktual.
