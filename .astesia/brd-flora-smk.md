# Business Requirements Document (BRD)
## Flora SMK — Sistem Katalog Tanaman Digital untuk SMK Pertanian

**Version:** 1.0  
**Status:** Draft — Menunggu Persetujuan User  
**Tanggal:** 2026-10-21  

---

## 1. Executive Summary

### Problem Statement
SMK Pertanian memiliki beragam koleksi tanaman di area sekolah — baik untuk praktikum, kebun percobaan, maupun tanaman hias — namun **tidak ada sistem terpusat** yang mendokumentasikan dan mengkatalogkan seluruh tanaman tersebut. Akibatnya:
- Siswa kesulitan mengenali tanaman di luar jam pelajaran.
- Guru harus menjelaskan ulang identifikasi tanaman secara repetitif.
- Pengunjung/publik tidak memiliki akses terhadap informasi koleksi tanaman sekolah.
- Pengetahuan tentang tanaman sekolah bersifat lisan dan tidak terdokumentasi.

### Proposed Solution
**Flora SMK** adalah Progressive Web App (PWA) yang berfungsi sebagai **katalog digital tanaman** interaktif. Aplikasi ini memungkinkan pengguna untuk:
- Menelusuri katalog tanaman lengkap dengan nama lokal, nama ilmiah (Latin), dan deskripsi dalam bahasa Indonesia/Inggris.
- Memindai QR Code yang terpasang di setiap tanaman untuk langsung melihat informasi detailnya.
- Melihat lokasi tanaman di peta area sekolah.
- (Siswa) Berkontribusi menambahkan data tanaman baru yang akan dimoderasi oleh guru.

### Business Value
- **Edukasi**: Meningkatkan literasi botani siswa melalui akses informasi yang mudah dan menyenangkan.
- **Dokumentasi**: Arsip digital koleksi tanaman yang persisten dan tahan terhadap pergantian personel.
- **Branding Sekolah**: Menunjukkan inovasi digital SMK Pertanian kepada publik dan calon siswa baru.
- **Aksesibilitas**: Siapapun bisa mengakses — tanpa install dari app store, cukup buka browser.

---

## 2. Target Users & Stakeholders

| Role | Permission Level | Deskripsi |
|---|---|---|
| **Publik / Pengunjung** | `viewer` | Hanya bisa melihat katalog, scan QR, dan lihat peta. Tidak perlu login. |
| **Siswa** | `contributor` | Bisa melihat semua + menambahkan data tanaman baru (masuk antrian moderasi). Perlu login. |
| **Guru / Admin** | `admin` | Full access: CRUD tanaman, approve/reject kontribusi siswa, kelola QR code, kelola peta. Perlu login. |

---

## 3. Core Features

### F1: Katalog Tanaman (Browse & Search)
**Deskripsi:** Halaman utama menampilkan daftar tanaman dengan card view. Setiap tanaman menampilkan foto, nama lokal, nama Latin, dan kategori.

**Business Rules:**
- Setiap tanaman WAJIB memiliki minimal: 1 foto, nama lokal (ID), nama Latin, dan kategori.
- Pencarian mendukung: nama lokal, nama Latin, nama Inggris, kategori, dan family/famili.
- Filter tersedia berdasarkan: Kategori (hias, pangan, obat, kayu, dll.), Family/Famili, Lokasi di sekolah.
- Hasil pencarian diurutkan berdasarkan relevansi, dengan fallback ke alfabet.
- Katalog harus accessible offline setelah pertama kali dimuat (PWA cache).

**Acceptance Criteria:**
- [ ] AC1.1: User dapat melihat daftar tanaman dalam card grid yang responsive.
- [ ] AC1.2: User dapat mencari tanaman berdasarkan nama (lokal/Latin/Inggris) dan hasilnya muncul dalam < 300ms.
- [ ] AC1.3: User dapat memfilter berdasarkan kategori, famili, dan lokasi secara simultan.
- [ ] AC1.4: Halaman katalog berfungsi offline setelah kunjungan pertama.
- [ ] AC1.5: Setiap card tanaman menampilkan foto thumbnail, nama lokal, nama Latin, dan badge kategori.

**Edge Cases:**
- Tanaman tanpa foto: tampilkan placeholder image generik.
- Pencarian tanpa hasil: tampilkan pesan "Tidak ditemukan" + saran pencarian alternatif.
- Tanaman dengan nama lokal berbeda di daerah yang berbeda: dukung multiple aliases/sinonim.

---

### F2: Detail Tanaman (Plant Profile)
**Deskripsi:** Halaman detail untuk setiap tanaman, menampilkan informasi lengkap.

**Business Rules:**
- Informasi yang ditampilkan:
  - Foto gallery (multi-foto: habitus, daun, bunga, buah, biji)
  - Video penjelasan dari siswa (opsional, bisa lebih dari satu)
  - Nama lokal (Indonesia), nama Latin (italic), nama Inggris
  - Klasifikasi ilmiah: Kingdom → Divisio → Classis → Ordo → Familia → Genus → Species
  - Deskripsi umum (morfologi, habitat, kegunaan)
  - Lokasi di sekolah (teks + link ke peta)
  - Tanggal ditambahkan & kontributor
- Video penjelasan diupload oleh siswa (role contributor) dan dimoderasi oleh guru sebelum tayang.
- Format video yang diterima: MP4, WebM. Maksimal 50MB per video, durasi maksimal 5 menit.
- Video di-stream langsung dari Supabase Storage (tidak di-embed dari YouTube — agar tetap self-contained).
- Halaman detail bisa di-share via URL yang unik per tanaman.

**Acceptance Criteria:**
- [ ] AC2.1: Halaman detail menampilkan semua field di atas dengan layout yang jelas.
- [ ] AC2.2: Foto gallery mendukung swipe/carousel dengan lazy loading.
- [ ] AC2.3: Video penjelasan siswa ditampilkan di bawah foto gallery dengan native HTML5 video player.
- [ ] AC2.4: Video hanya tayang setelah disetujui guru/admin (moderasi).
- [ ] AC2.5: Nama Latin selalu ditampilkan dalam format *italic*.
- [ ] AC2.6: URL detail tanaman bisa dibagikan dan dibuka langsung.
- [ ] AC2.7: Halaman detail berfungsi offline jika data sudah pernah di-cache (video memerlukan koneksi).

**Edge Cases:**
- Tanaman dengan klasifikasi tidak lengkap: tampilkan field yang ada, field kosong ditandai "Belum diketahui".
- Foto gagal dimuat offline: tampilkan placeholder + pesan "Foto tersedia saat online".
- Video gagal dimuat / koneksi lambat: tampilkan thumbnail video + tombol play, streaming progresif (bukan download penuh).
- Video melebihi durasi 5 menit: tolak upload di client-side dengan pesan error.
- Video format tidak didukung: validasi MIME type di client dan server, tolak selain MP4/WebM.

---

### F3: QR Code Scanner & Generator
**Deskripsi:** Setiap tanaman memiliki QR Code unik. User bisa scan QR di lapangan untuk langsung membuka halaman detail tanaman tersebut.

**Business Rules:**
- Admin bisa generate QR Code per tanaman dan mendownloadnya sebagai PNG/SVG untuk dicetak.
- QR Code mengarah ke URL detail tanaman (deep link).
- Scanner menggunakan kamera device, diakses via browser (tanpa aplikasi tambahan).
- QR Code harus tetap bisa di-scan meskipun dicetak hitam-putih.

**Acceptance Criteria:**
- [ ] AC3.1: Admin dapat generate QR Code untuk tanaman terdaftar dan mendownloadnya.
- [ ] AC3.2: User dapat membuka scanner dari menu utama dan memindai QR Code.
- [ ] AC3.3: Setelah scan berhasil, user langsung diarahkan ke halaman detail tanaman.
- [ ] AC3.4: Scanner meminta izin kamera hanya saat pertama kali digunakan.
- [ ] AC3.5: QR Code readable di ukuran minimal 3cm x 3cm pada cetakan.

**Edge Cases:**
- QR Code rusak/tidak terbaca: tampilkan pesan error + opsi input manual ID tanaman.
- QR Code mengarah ke tanaman yang sudah dihapus: tampilkan halaman "Tanaman tidak ditemukan" dengan link ke katalog.
- Device tanpa kamera: sembunyikan tombol scan, tampilkan opsi input manual.

---

### F4: Peta Lokasi Tanaman (Interactive Map)
**Deskripsi:** Peta interaktif area sekolah yang menunjukkan posisi setiap tanaman.

**Business Rules:**
- Peta menggunakan custom image (denah sekolah), BUKAN Google Maps — karena lokasi indoor/area sekolah tidak ter-cover GPS secara presisi.
- Admin menandai lokasi tanaman dengan pin/marker di atas gambar denah.
- User bisa klik marker untuk melihat preview tanaman dan navigasi ke detail.
- Peta mendukung zoom dan pan.

**Acceptance Criteria:**
- [ ] AC4.1: Peta menampilkan denah sekolah dengan marker tanaman yang sudah ditandai.
- [ ] AC4.2: Klik marker menampilkan popup preview (foto kecil + nama tanaman).
- [ ] AC4.3: Peta mendukung pinch-to-zoom dan drag-to-pan di mobile.
- [ ] AC4.4: Admin bisa menambah/edit posisi marker melalui interface drag-and-drop.
- [ ] AC4.5: Peta berfungsi offline jika denah sudah di-cache.

**Edge Cases:**
- Denah sekolah belum diupload: tampilkan placeholder + instruksi untuk admin upload.
- Tanaman tanpa lokasi yang ditandai: tanaman tidak muncul di peta, tapi tetap ada di katalog.
- Denah berubah (renovasi): admin bisa re-upload denah dan menyesuaikan ulang posisi marker.

---

### F5: Kontribusi Siswa (Student Contribution / Moderation)
**Deskripsi:** Siswa yang login bisa mengajukan data tanaman baru. Submisi masuk ke antrian moderasi yang dikelola oleh guru/admin.

**Business Rules:**
- Siswa mengisi form: nama lokal, nama Latin (opsional), kategori, deskripsi, foto (min 1), video penjelasan (opsional, max 50MB, max 5 menit), lokasi (opsional).
- Submisi berstatus: `pending` → `approved` / `rejected`.
- Admin bisa: approve (langsung tayang), reject (dengan alasan), atau edit sebelum approve.
- Siswa bisa melihat status submisi mereka di dashboard pribadi.
- Siswa TIDAK bisa mengedit tanaman yang sudah di-approve (hanya admin).

**Acceptance Criteria:**
- [ ] AC5.1: Siswa yang login dapat mengakses form "Tambah Tanaman".
- [ ] AC5.2: Form memvalidasi field wajib sebelum submit.
- [ ] AC5.3: Admin melihat daftar submisi pending di dashboard moderasi.
- [ ] AC5.4: Admin bisa approve/reject dengan satu klik + field alasan untuk reject.
- [ ] AC5.5: Siswa menerima notifikasi (in-app) saat submisi di-approve/reject.
- [ ] AC5.6: Tanaman yang di-approve otomatis muncul di katalog publik.

**Edge Cases:**
- Siswa submit tanaman duplikat: sistem mendeteksi kesamaan nama Latin dan menampilkan warning.
- Foto yang di-upload melebihi ukuran: kompres otomatis di client-side sebelum upload (max 2MB per foto).
- Siswa mencoba submit konten tidak pantas: admin bisa ban kontributor jika melanggar berulang.

---

### F6: Autentikasi & Otorisasi
**Deskripsi:** Sistem login sederhana untuk membedakan viewer, contributor, dan admin.

**Business Rules:**
- Publik tidak perlu login untuk browsing katalog, scan QR, dan lihat peta.
- Siswa login dengan email sekolah atau username/password.
- Admin login dengan credentials yang dikelola secara manual (seeding/invite).
- Tidak ada self-registration untuk role admin.
- Session berlaku 30 hari (remember me).

**Acceptance Criteria:**
- [ ] AC6.1: Halaman publik (katalog, detail, peta, scan) dapat diakses tanpa login.
- [ ] AC6.2: Siswa dapat register dengan email dan password.
- [ ] AC6.3: Admin dapat login dan mengakses dashboard moderasi.
- [ ] AC6.4: Route yang membutuhkan auth redirect ke halaman login jika belum autentikasi.
- [ ] AC6.5: Token/session expired menampilkan pesan "Sesi berakhir, silakan login ulang".

**Edge Cases:**
- Lupa password: flow reset via email (jika SMTP tersedia) ATAU admin manual reset.
- Brute force login: rate limiting 5 attempt per 15 menit per IP.
- Token hijacking: gunakan HttpOnly cookie + CSRF protection.

---

## 4. Critical User Journey (CUJ)

### CUJ-1: Pengunjung Scan QR Code Tanaman
```
Pengunjung berada di area kebun sekolah
  → Melihat QR Code tertempel di pohon
  → Membuka flora-smk.app di browser HP
  → Tap tombol "Scan QR"
  → Browser meminta izin kamera → Allow
  → Arahkan kamera ke QR Code
  → QR Code terdeteksi → Redirect ke halaman detail tanaman
  → Pengunjung membaca info: nama, deskripsi, klasifikasi, foto
  → Pengunjung bisa klik "Lihat di Peta" untuk tahu lokasi tanaman lain
```

### CUJ-2: Siswa Menambahkan Data Tanaman Baru
```
Siswa login ke aplikasi
  → Tap tombol "Tambah Tanaman" di navbar
  → Isi form: nama lokal, deskripsi, upload 2 foto
  → Tap "Submit"
  → Sistem menampilkan konfirmasi "Submisi berhasil, menunggu persetujuan guru"
  → Siswa bisa lihat status di "Kontribusi Saya"
  → (Kemudian) Guru login → Lihat dashboard moderasi → Review → Approve
  → Tanaman baru muncul di katalog publik
```

### CUJ-3: Guru Mengelola Katalog
```
Guru login sebagai admin
  → Buka dashboard admin
  → Lihat daftar tanaman + submisi pending
  → Klik "Tambah Tanaman" → Isi form lengkap → Save → Langsung tayang
  → ATAU klik submisi pending → Review → Edit nama Latin → Approve
  → Generate QR Code untuk tanaman baru → Download PNG → Cetak & tempel di tanaman
```

---

## 5. Non-Functional Requirements (NFR)

### Performance
- **First Contentful Paint (FCP):** < 1.5 detik pada koneksi 3G.
- **Time to Interactive (TTI):** < 3 detik pada koneksi 3G.
- **Offline Capability:** Halaman katalog, detail tanaman yang sudah dikunjungi, dan peta tersedia offline.
- **Bundle Size:** < 200KB gzipped untuk initial load.
- **Image Optimization:** Semua foto tanaman dikompresi dan di-serve dalam format WebP dengan lazy loading.
- **Video Streaming:** Video di-serve langsung dari Supabase Storage dengan progressive streaming. Tidak di-cache offline.

### Security
- Password di-hash dengan bcrypt (min cost factor 12).
- Semua API endpoint terproteksi CORS.
- File upload divalidasi tipe (image/*: jpg/png/webp, video/*: mp4/webm) dan ukuran (foto max 5MB server, 2MB client; video max 50MB, durasi max 5 menit).
- Input sanitization untuk semua user-generated content (anti-XSS).
- Rate limiting pada endpoint autentikasi.

### Accessibility
- Minimum WCAG 2.1 Level AA compliance.
- Semua gambar memiliki alt text.
- Navigasi keyboard-friendly.
- Contrast ratio minimal 4.5:1.

### Scalability
- Aplikasi harus mampu menangani 500+ entri tanaman tanpa degradasi performa.
- Database harus mendukung full-text search.

---

## 6. Tech Stack Recommendation

> **Catatan:** Ini adalah rekomendasi Product Layer. Keputusan final ada di Engineering Layer.

| Concern | Recommendation | Rationale |
|---|---|---|
| **Frontend** | SvelteKit (PWA) | Dipilih user. Ringan, performa tinggi, SSR + SPA hybrid. |
| **Backend/DB** | Supabase (PostgreSQL + Auth + Storage) | Gratis untuk skala SMK, hosted, real-time, built-in auth & file storage. Menghilangkan kebutuhan server custom. |
| **Hosting** | Vercel / Cloudflare Pages | Free tier generous, edge deployment, auto-SSL. |
| **QR Code** | qrcode library (client-side generation) | Tidak butuh server untuk generate QR. |
| **Image Storage** | Supabase Storage | Integrated dengan auth, mendukung transformasi gambar. |

**Mengapa Supabase (bukan Firebase atau Offline-only)?**
- ✅ PostgreSQL = full-text search native, relational data yang cocok untuk taksonomi tanaman.
- ✅ Auth bawaan = tidak perlu build auth system dari nol.
- ✅ Storage bawaan = upload/serve foto tanaman.
- ✅ Free tier = cukup untuk SMK (500MB DB, 1GB storage, 50K monthly active users).
- ✅ Open source = bisa self-host kalau sekolah punya server sendiri nantinya.
- ❌ Firebase: NoSQL (Firestore) kurang ideal untuk data relasional taksonomi.
- ❌ Offline-only: Tidak mendukung kontribusi siswa & moderasi guru lintas device.

---

## 7. Explicit Out-of-Scope (MVP)

Fitur-fitur berikut **TIDAK** termasuk dalam MVP dan bisa dipertimbangkan untuk iterasi selanjutnya:

| Excluded Feature | Reason |
|---|---|
| AI Plant Identification (foto → identifikasi otomatis) | Kompleksitas tinggi, butuh model ML terpisah. |
| Gamification (badge, leaderboard kontributor) | Nice-to-have, bukan kebutuhan inti. |
| Forum diskusi / komentar per tanaman | Menambah kompleksitas moderasi. |
| Integrasi kalender perawatan tanaman | Di luar scope katalog. |
| Multi-sekolah / multi-tenant | MVP fokus 1 sekolah dulu. |
| Native mobile app (Android/iOS) | PWA sudah cukup untuk kebutuhan ini. |
| Export data ke PDF/Excel | Bisa ditambahkan nanti. |
| Notifikasi push (FCM) | In-app notification cukup untuk MVP. |

---

## 8. Data Model (Conceptual — Bukan Schema)

```
Plant
├── id (unique)
├── name_local (required)
├── name_latin (required, italic display)
├── name_english (optional)
├── aliases[] (sinonim nama lokal)
├── category (enum: hias, pangan, obat, kayu, industri, lainnya)
├── taxonomy
│   ├── kingdom, divisio, classis, ordo, familia, genus, species
├── description (rich text)
├── photos[] (min 1, with labels: habitus/daun/bunga/buah/biji)
├── videos[] (opsional, uploaded by contributors, moderated)
│   ├── url, thumbnail_url, title, duration_seconds
│   ├── uploaded_by (ref → User), status (pending/approved/rejected)
├── location (x, y on map)
├── contributor (ref → User)
├── status (draft, pending, approved, rejected)
├── created_at, updated_at

User
├── id
├── email
├── display_name
├── role (viewer, contributor, admin)
├── created_at

Contribution
├── id
├── plant_id (ref → Plant)
├── submitted_by (ref → User)
├── status (pending, approved, rejected)
├── rejection_reason (nullable)
├── reviewed_by (ref → User, nullable)
├── reviewed_at (nullable)

SchoolMap
├── id
├── image_url (denah sekolah)
├── version
├── uploaded_by (ref → User)
├── uploaded_at
```

---

## 9. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Internet sekolah tidak stabil | User tidak bisa akses app | PWA offline-first: service worker cache katalog & peta |
| Siswa upload foto tidak relevan/spam | Kualitas data menurun | Moderasi admin wajib sebelum tayang |
| Guru tidak tech-savvy | Admin dashboard tidak terpakai | UX sangat sederhana, training guide, tooltips |
| Foto tanaman berat (DSLR) | Storage cepat penuh, load lambat | Auto-compress client-side + WebP conversion |
| QR Code rusak karena cuaca | User tidak bisa scan | Material tahan air untuk cetak QR + fallback search |

---

## 10. Change Requests (CR)

### CR-01: Kategori Tanaman Kustom Terkendali & Kuantitas/Populasi Tanaman
**Status:** Approved (2026-10-27)  
**Tipe:** Feature Enhancement & Data Model Extension

#### 1. Kategori Tanaman Kustom (Opsi A — Hierarki Terkendali)
- **Problem Statement:** Sekolah memerlukan fleksibilitas untuk menambahkan kategori botani baru (misalnya "Tanaman Pakan Ternak", "Kultur Jaringan", "Perdu") tanpa harus hardcode di kode program, namun tetap terkontrol agar tidak terjadi duplikasi semantik oleh siswa.
- **Business Rules:**
  - Kategori hanya dapat ditambahkan, diedit, atau dihapus oleh **Guru / Admin** melalui panel CMS Pengaturan (`/admin/pengaturan`).
  - Kategori baru otomatis terdaftar ke dalam `ConfigService` dan menjadi opsi pilihan di dropdown formulir kontribusi siswa (`/kontribusi/tambah`).
  - Kategori kustom otomatis memiliki filter chip aktif di halaman katalog (`/katalog`) dan beranda.
  - Penghapusan kategori diproteksi jika terdapat tanaman yang sedang menggunakan kategori tersebut (atau diberikan peringatan/fallback ke 'lainnya').
- **Acceptance Criteria:**
  - [ ] AC-CR1.1: Admin dapat menambah kategori baru dengan ID slug unik, label nama, dan pilihan warna dot indikator.
  - [ ] AC-CR1.2: Kategori baru yang ditambahkan admin langsung muncul dalam dropdown pilihan di halaman kontribusi tambah tanaman.
  - [ ] AC-CR1.3: Halaman katalog menampilkan kategori baru secara dinamis pada bilah filter lengkap dengan hitungan jumlah tanaman.

#### 2. Kuantitas / Populasi Tanaman (Opsi 1 — Agregat Populasi)
- **Problem Statement:** Saat mendokumentasikan tanaman di kebun sekolah, seringkali satu spesies memiliki lebih dari 1 pohon (contoh: *Mangga Madu ada 3 pohon*). Sistem sebelumnya hanya mencatat keberadaan spesies tanpa mencatat total populasi pohon.
- **Business Rules:**
  - Setiap data tanaman wajib memiliki atribut `quantity` (bilangan bulat positif, minimal 1, default: 1).
  - Setiap data tanaman memiliki satuan populasi `unit` (string, default: `'pohon'`, opsi pilihan: `'pohon'`, `'rumpun'`, `'polybag'`, `'pot'`, `'bedeng'`).
  - Siswa/kontributor dapat mengisi jumlah dan satuan saat menambah tanaman baru.
  - Kartu tanaman pada katalog menampilkan badge populasi jika tanaman > 1 (atau menampilkan tag kuantitas).
  - Halaman detail tanaman menampilkan informasi populasi kebun secara eksplisit (contoh: *"Populasi Kebun: 3 Pohon"*).
- **Acceptance Criteria:**
  - [ ] AC-CR2.1: Model data `Plant` dan skema validasi Zod memuat field `quantity` (number, >= 1) dan `unit` (string non-empty).
  - [ ] AC-CR2.2: Formulir penambahan tanaman menyediakan input angka untuk jumlah tanaman dan pilihan satuan.
  - [ ] AC-CR2.3: Komponen `PlantCard` menampilkan indikator kuantitas spesimen dengan format yang jelas (misal: "3 Pohon").
  - [ ] AC-CR2.4: Halaman detail tanaman (`/katalog/[slug]`) menampilkan kotak info populasi lengkap dengan jumlah dan satuan.

---

*Dokumen ini dihasilkan oleh Astesia Product Layer dan disetujui untuk implementasi pipeline.*
