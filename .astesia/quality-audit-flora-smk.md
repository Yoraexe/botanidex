# Quality & Security Audit Report — Flora SMK (Botanidex)

**Layer:** Quality Layer (`/astesia-quality`)  
**Status Audit:** ✅ **PASSED (10/10 Temuan Telah Diperbaiki & Terverifikasi)**  
**Tanggal Audit & Remediation:** 2026-10-23  
**Verifikasi Akhir:** `svelte-check` (0 error, 0 warning), `vitest` (26/26 unit & regression tests pass), `vite build` (sukses kompilasi dengan `@sveltejs/adapter-vercel` dan Service Worker URL tervalidasi).

---

## Ringkasan Eksekutif & Status Remediation

Seluruh **10 temuan bug, celah keamanan, pelanggaran arsitektur, dan bloat** yang terdeteksi pada putaran audit pertama telah diselesaikan melalui siklus *Engineering Self-Healing* dan diverifikasi ulang oleh Quality Layer:

| ID | Kategori & Severity | Deskripsi Masalah | Status & Bukti Perbaikan |
|---|---|---|---|
| **BUG-01** | 🔴 Critical (PWA) | `src/service-worker.js` mengirim objek `{path}` mentah dari `$app/manifest` ke `cache.addAll()` sehingga gagal install (`/[object Object]` 404), serta belum memfilter protokol non-HTTP. | ✅ **FIXED** — Menambahkan normalizer `toUrlPath()` di `src/service-worker.js` serta filter protokol `http:`/`https:`. |
| **BUG-02** | 🔴 Critical (DB) | Mismatch antara tipe bersarang `Plant.taxonomy` + `contributor_name` / `uploaded_by_name` di TypeScript dengan kolom *flat* pada tabel PostgreSQL `public.plants`. | ✅ **FIXED** — Mengimplementasikan `mapDbRowToPlant()` & `mapPlantToDbRow()` di `src/lib/repositories/plant.repository.ts`, memperbarui `001_initial_schema.sql`, dan menguji *roundtrip* pada Vitest. |
| **BUG-03** | 🔴 High (CMS) | Kategori kustom yang ditambah lewat CMS `/admin/pengaturan` ditolak oleh `plantCategorySchema`, tidak muncul di `<select>` form kontribusi, dan terpotong di `PlantCard.svelte`. | ✅ **FIXED** — Mengintegrasikan `ConfigService.getCategories()` ke `plant.schema.ts`, form `/kontribusi/tambah`, dan `getCategoryShortLabel()` di `format.ts` + `PlantCard.svelte`. |
| **BUG-04** | 🔴 High (Security) | Halaman `/admin/moderasi` & `/admin/pengaturan` memiliki *backdoor* `onMount` yang otomatis me-login pengunjung *guest* sebagai Admin dan tidak memblokir role `contributor` (Siswa). | ✅ **FIXED** — Menghapus auto-login di `onMount` dan memasang *Role Guard* (`$authUser?.role !== 'admin'`) di `/admin/moderasi`, `/admin/pengaturan`, serta guard login di `/kontribusi/tambah`. |
| **BUG-05** | 🟠 Medium (BRD F2/F5) | Input `taxonomySpecies` hilang dari template HTML form kontribusi; durasi video maks. 5 menit (300 detik) belum divalidasi; status video tidak ikut berubah saat tanaman di-approve; video belum difilter `status === 'approved'`. | ✅ **FIXED** — Menambahkan input `Species` di form, membuat `StorageService.validateVideoFile()` (batas 50MB & 300 detik), meng-update status `plant_videos` saat moderasi, dan memfilter `visibleVideos` di `PlantVideoSection.svelte`. |
| **BUG-06** | 🟠 Medium (QR Scanner) | `QrScanner.svelte` gagal memindai file foto QR ketika kamera aktif, berpotensi membocorkan *camera stream* saat *unmount* cepat, dan mengizinkan *Open Redirect* ke domain eksternal. | ✅ **FIXED** — Memanggil `await stopScanner()` sebelum `scanFile()`, menjaga flag `isMounted`, dan membatasi *redirect* hanya untuk *same-origin* atau path `/katalog/[slug]`. |
| **BUG-07** | 🟡 Architecture (Rule #7) | `src/routes/peta/+page.svelte` mengimpor `MapRepository` secara langsung dari layer UI. | ✅ **FIXED** — Menambahkan `PlantService.getSchoolMapData()` dan memanggilnya dari `src/routes/peta/+page.svelte`. |
| **BUG-08** | 🟡 Memory Leak | Preview foto `URL.createObjectURL(file)` di `/kontribusi/tambah` tidak pernah di-*revoke*. | ✅ **FIXED** — Memanggil `URL.revokeObjectURL()` pada `removePhoto()` dan `onDestroy()`. |
| **BUG-09** | 🟡 Config | `vite.config.ts` memakai `@sveltejs/adapter-auto` sehingga memunculkan warning environment saat build. | ✅ **FIXED** — Beralih ke `@sveltejs/adapter-vercel` di `vite.config.ts`. |
| **BUG-10** | 🟡 Anti-Bloat & Docs | Duplikasi paket `lucide-svelte`, duplikasi aset `static/logo-smk.png` (1.73 MB) yang membebani cache PWA, file contoh `vitest-examples`, schema moderasi belum dipakai, dan Header Docs tidak sinkron. | ✅ **FIXED** — Menghapus `lucide-svelte`, `static/logo-smk.png`, `src/lib/vitest-examples/`, `contribution.types.ts`, mengaktifkan `moderationReviewSchema` di `PlantService.moderatePlant()`, dan menyinkronkan seluruh Header Docs. |

---

## Hasil Pengujian Regresi (Vitest)
- `src/lib/schemas/plant.schema.test.ts` — **6 passed** (termasuk regresi kategori dinamis CMS & batas durasi video 300 detik)
- `src/lib/services/config.service.test.ts` — **8 passed**
- `src/lib/utils/format.test.ts` — **3 passed** (termasuk regresi label kategori kustom multi-kata)
- `src/lib/services/plant.service.test.ts` — **9 passed** (termasuk regresi mapper PostgreSQL flat row ↔ `Plant`, propagasi status moderasi video, validasi alasan penolakan, dan `getSchoolMapData`)
- **Total:** **26/26 Tests Passed (100%)**
