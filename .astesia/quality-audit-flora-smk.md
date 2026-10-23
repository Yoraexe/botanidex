# Quality, Security & Edge-Case Audit Report (Pass #3) — Botanidex (`flora-smk`)

- **Tanggal Audit Pass #3:** 23 Oktober 2026
- **Auditor:** Astesia (Layer 4 — Quality & Security Orchestrator)
- **Status Sebelumnya:** 10 temuan Pass #1 + 6 temuan Pass #2 telah diperbaiki (`29/29` unit tests lulus).
- **Hasil Audit Pass #3 (Forensic Cross-Component & BRD Compliance Inspection):** Ditemukan **4 bug fungsional & kepatuhan BRD** (1 High, 2 Medium, 1 Low).

---

## Daftar Temuan Bug Baru (Audit Pass #3)

### 1. [HIGH] Bug Bypass Akses Publik terhadap Tanaman Berstatus `pending` / `rejected` melalui URL `/katalog/[slug]`
- **Lokasi:** [`src/routes/katalog/[slug]/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/katalog/%5Bslug%5D/+page.svelte#L26-L43)
- **Deskripsi:** Berdasarkan **BRD F5 & AC2.4**, pengajuan tanaman dari siswa yang masih berstatus `pending` atau `rejected` tidak boleh tampil ke pengunjung publik sebelum disetujui oleh Guru/Admin. Saat ini, `PlantRepository.getPlantBySlug(slug)` mengembalikan tanaman dari `localStorage` tanpa memfilter `status`, dan halaman `/katalog/[slug]/+page.svelte` langsung merender detail tanaman tersebut kepada siapa pun yang mengakses URL-nya. Selain itu, saat Guru/Admin membuka halaman detail dari tombol **"Lihat Detail"** di `/admin/moderasi`, tidak ada indikator status bahwa tanaman tersebut masih `pending` atau `rejected`.
- **Rekomendasi Perbaikan:**
  1. Pada `/katalog/[slug]/+page.svelte`, batasi akses tanaman berstatus `pending` / `rejected` hanya untuk `admin` atau kontributor pemiliknya (`$authUser?.id === plant.contributor_id`); tampilkan pesan proteksi moderasi bagi pengunjung publik.
  2. Tampilkan *banner* status moderasi (`MENUNGGU VERIFIKASI GURU` / `PENGAJUAN DITOLAK` beserta `rejection_reason`) di bagian atas halaman detail saat dilihat oleh Guru/Admin atau kontributor.

### 2. [MEDIUM] Bug *Dead Binding* pada Field CMS `schoolName`, `headerBadge`, dan `tagline`
- **Lokasi:** [`src/routes/admin/pengaturan/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/admin/pengaturan/+page.svelte#L172-L195), [`Navbar.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/layout/Navbar.svelte#L50-L54), [`+layout.svelte`](file:///d:/Workspaces/flora-smk/src/routes/+layout.svelte#L49-L53), & [`QrGenerator.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/qr/QrGenerator.svelte#L52-L54)
- **Deskripsi:**
  - Di halaman CMS `/admin/pengaturan` (Tab 1), Admin dapat mengubah **Nama Sekolah Resmi (`config.identity.schoolName`)** dan **Badge Label Atas Navbar (`config.identity.headerBadge`)**, namun tidak ada input untuk `config.identity.tagline`.
  - Sebaliknya, `Navbar.svelte` hanya merender `identity.appName` dan `identity.tagline` (yang tidak memiliki input di CMS), sedangkan `schoolName` dan `headerBadge` tidak dirender di `Navbar.svelte`, *footer* `+layout.svelte`, maupun label cetak `QrGenerator.svelte` (masih *hardcoded* `"SMK PPN Gorontalo"`).
- **Dampak:** Ketika Admin mengubah Nama Sekolah Resmi atau Badge Label Atas Navbar di CMS dan menekan Simpan, perubahan tersebut tidak terlihat di Navbar, Footer, maupun Label Cetak QR.
- **Rekomendasi Perbaikan:** Tambahkan input `tagline` pada Tab 1 CMS `/admin/pengaturan`, tampilkan `identity.headerBadge` di `Navbar.svelte`, serta gunakan `identity.appName` & `identity.schoolName` secara reaktif di *footer* `+layout.svelte` dan label cetak `QrGenerator.svelte`.

### 3. [MEDIUM] Bug Parameter Pencarian URL (`?q=` & `?cat=`) Tidak Reaktif pada `/katalog`
- **Lokasi:** [`src/routes/katalog/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/katalog/+page.svelte#L24-L42)
- **Deskripsi:** Pembacaan `page.url.searchParams.get('q')` dan `page.url.searchParams.get('cat')` hanya dilakukan sekali di dalam `onMount()`.
- **Dampak:** Jika pengguna bernavigasi menggunakan tombol *Back/Forward* browser atau tautan pencarian ketika komponen `/katalog` sudah ter-mount, state `searchQuery` dan `selectedCategory` tidak ikut diperbarui.
- **Rekomendasi Perbaikan:** Gunakan `$effect` untuk menyinkronkan `page.url.searchParams` ke `searchQuery` dan `selectedCategory`.

### 4. [LOW] Bug Dropdown Profil `Navbar.svelte` Tetap Terbuka Saat Pindah Halaman
- **Lokasi:** [`src/lib/components/layout/Navbar.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/layout/Navbar.svelte#L17-L45)
- **Deskripsi:** State `isDropdownOpen` pada `Navbar.svelte` tidak di-reset ke `false` ketika pengguna berpindah rute (`currentPath` berubah).
- **Rekomendasi Perbaikan:** Tambahkan `$effect(() => { currentPath; isDropdownOpen = false; })` pada `Navbar.svelte`.
