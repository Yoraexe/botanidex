# Quality, Security & Edge-Case Audit Report (Pass #2) — Botanidex (`flora-smk`)

- **Tanggal Audit Pass #2:** 23 Oktober 2026
- **Auditor:** Astesia (Layer 4 — Quality & Security Orchestrator)
- **Status Baseline:** 10 temuan Audit Pass #1 telah selesai diperbaiki dan kode telah dirampingkan (`net: -1899 lines`).
- **Hasil Audit Pass #2:** Ditemukan **6 bug logika & *edge-case* mendalam** (2 High, 3 Medium, 1 Low) yang lolos dari pemeriksaan tipe statis (`svelte-check`).

---

## Daftar Temuan Bug Baru (Audit Pass #2)

### 1. [HIGH] Bug Mutasi *Shallow Copy* pada `DEFAULT_APP_CONFIG` yang Merusak Fitur *Factory Reset*
- **Lokasi:** [`src/lib/repositories/config.repository.ts`](file:///d:/Workspaces/flora-smk/src/lib/repositories/config.repository.ts#L17-L88)
- **Deskripsi:** `ConfigRepository` menyalin `DEFAULT_APP_CONFIG` menggunakan *shallow spread* (`{ ...DEFAULT_APP_CONFIG }`). Objek bersarang seperti `identity`, `hero`, `appDownload`, dan `categories` tetap merujuk ke alamat memori yang sama dengan konstanta `DEFAULT_APP_CONFIG`.
- **Dampak:** Saat admin mengedit *input* yang terikat dengan `bind:value={config.identity.appName}` atau `config.hero.headlineLine1` di [`src/routes/admin/pengaturan/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/admin/pengaturan/+page.svelte), referensi asli di dalam `DEFAULT_APP_CONFIG` ikut termutasi di memori. Akibatnya, tombol **Reset ke Bawaan Pabrik** (`resetConfig()`) gagal mengembalikan nilai asli apabila terjadi mutasi pada referensi memori.
- **Rekomendasi Perbaikan:** Gunakan `structuredClone(DEFAULT_APP_CONFIG)` saat membaca, menginisialisasi, dan me-reset konfigurasi.

### 2. [HIGH] Bug Penolakan URL Gambar Lokal pada Validasi Zod CMS (`config.schema.ts`)
- **Lokasi:** [`src/lib/schemas/config.schema.ts`](file:///d:/Workspaces/flora-smk/src/lib/schemas/config.schema.ts#L19-L31) & [`src/routes/admin/pengaturan/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/admin/pengaturan/+page.svelte#L229)
- **Deskripsi:** Form CMS pada tab Foto Kebun memiliki *placeholder* `"URL Gambar (Unsplash / Imgur / Lokal)"`, namun `gardenPhotoSchema` dan `specimenItemSchema` menggunakan `z.string().url()`. Di Zod, `.url()` menolak *relative path* lokal seperti `/SMK-Pertanian-Gorontalo.png` atau `/icons/icon-512.svg`.
- **Dampak:** Guru/Admin tidak bisa menggunakan aset gambar lokal dari folder `static/` karena selalu ditolak oleh validasi Zod.
- **Rekomendasi Perbaikan:** Buat validator URL fleksibel (`http://`, `https://`, `data:image/`, atau *path* lokal yang diawali `/`) pada `config.schema.ts`.

### 3. [MEDIUM] Bug Navigasi Dinamis `/katalog/[slug]` Tidak Memuat Tanaman Kontribusi Baru
- **Lokasi:** [`src/routes/katalog/[slug]/+page.svelte`](file:///d:/Workspaces/flora-smk/src/routes/katalog/%5Bslug%5D/+page.svelte#L26-L44), [`PlantGallery.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/plant/PlantGallery.svelte#L17-L22), [`PlantVideoSection.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/plant/PlantVideoSection.svelte#L21-L22), & [`QrGenerator.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/qr/QrGenerator.svelte#L23-L31)
- **Deskripsi:**
  1. Pada `src/routes/katalog/[slug]/+page.svelte`, `loadPlantDetail()` hanya dipanggil di dalam `onMount()`, sedangkan `$effect` hanya mencari dari `INITIAL_PLANTS_DATA`. Jika pengguna berpindah antar-tanaman tanpa *full page reload* ke tanaman hasil kontribusi baru (yang hanya ada di `localStorage` / Supabase), data tanaman tidak dimuat ulang dari `PlantService.getPlantBySlug(slug)`.
  2. `QrGenerator.svelte` hanya men-generate QR di `onMount()`, sehingga jika `plant.slug` berubah secara reaktif, QR Code tidak diperbarui.
  3. `selectedIndex` pada `PlantGallery.svelte` dan `activeVideoIndex` pada `PlantVideoSection.svelte` tidak di-reset ke `0` saat berpindah tanaman.
- **Rekomendasi Perbaikan:** Pindahkan pemanggilan `PlantService.getPlantBySlug(slug)` ke efek reaktif yang memantau perubahan `slug`, serta gunakan `$effect` untuk sinkronisasi QR dan *index* media.

### 4. [MEDIUM] Bug *PostgREST Filter Syntax Error / Injection* pada Pencarian Supabase
- **Lokasi:** [`src/lib/repositories/plant.repository.ts`](file:///d:/Workspaces/flora-smk/src/lib/repositories/plant.repository.ts#L140-L145)
- **Deskripsi:** Nilai pencarian `filters.query` disisipkan langsung ke ekspresi `.or(\`name_local.ilike.%${s}%,...\`)`. Dalam PostgREST, karakter koma (`,`) dan tanda kurung (`(`, `)`) adalah pembatas sintaks logika.
- **Dampak:** Jika pengguna mengetik kueri yang mengandung koma atau tanda kurung (misal: `"Jahe, Kunyit"` atau `"Zingiber (Merah)"`), *query* Supabase gagal dengan *syntax error* `PGRST100`.
- **Rekomendasi Perbaikan:** Sanitasi karakter pembatas PostgREST (`[,()%*\\]`) pada string pencarian sebelum dimasukkan ke `.or()`.

### 5. [MEDIUM] Bug *Empty Slug* pada `createPlantSlug` untuk Input Karakter Non-Alfanumerik
- **Lokasi:** [`src/lib/utils/slug.ts`](file:///d:/Workspaces/flora-smk/src/lib/utils/slug.ts#L10-L16)
- **Deskripsi:** Fungsi `createPlantSlug(nameLocal, nameLatin)` menghapus seluruh karakter `\W` dengan `.replace(/[\s\W-]+/g, '-').replace(/^-+|-+$/g, '')`. Jika input hanya berisi simbol atau karakter non-Latin (misal `"???"` atau emoji), hasil akhirnya adalah string kosong `""`.
- **Dampak:** Tanaman tersimpan dengan `slug: ""` sehingga URL `/katalog/` gagal membuka halaman detail tanaman.
- **Rekomendasi Perbaikan:** Tambahkan *fallback* `|| 'tanaman'` setelah proses *regex replace* selesai.

### 6. [LOW] Bug *SSR Hydration Mismatch* akibat `Math.random()` pada Default Prop `Input.svelte`
- **Lokasi:** [`src/lib/components/ui/Input.svelte`](file:///d:/Workspaces/flora-smk/src/lib/components/ui/Input.svelte#L21)
- **Deskripsi:** Properti `id` menggunakan nilai bawaan `Math.random().toString(36).substring(2, 7)`. Saat SSR dijalankan di server dan kemudian di-hidrasi di browser, nilai `id` pada `<label for={id}>` dan `<input {id}>` berbeda antara server dan klien.
- **Dampak:** Memicu *hydration mismatch* di SvelteKit dan berpotensi merusak asosiasi aksesibilitas `<label>` dengan `<input>` sebelum hidrasi selesai.
- **Rekomendasi Perbaikan:** Gunakan rune bawaan Svelte 5 `$props.id()` sebagai *fallback* deterministik yang aman untuk SSR.
