<!--
  Flora SMK — Admin CMS & Content Management Portal (Svelte 5 Runes)
  Tujuan: Mengatur seluruh konten, identitas sekolah, galeri showcase, dan kategori secara dinamis
  Caller: Route '/admin/pengaturan'
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { ConfigService } from '#lib/services/config.service';
	import type {
		AppConfig,
		GardenShowcasePhoto,
		SpecimenShowcaseItem,
		CategoryItemConfig
	} from '#lib/types/config.types';
	import Button from '#lib/components/ui/Button.svelte';
	import {
		Settings,
		ShieldCheck,
		RotateCcw,
		Save,
		Plus,
		Trash2,
		Image,
		Type,
		Tag,
		Download,
		Sliders,
		CheckCircle2,
		AlertTriangle
	} from '@lucide/svelte';

	let config = $state<AppConfig>(ConfigService.getConfig());
	let activeTab = $state<'identity' | 'garden' | 'specimen' | 'categories' | 'download'>('identity');
	let isSaving = $state(false);

	// New Garden Photo Form State
	let newGardenPhoto = $state<Omit<GardenShowcasePhoto, 'id'>>({
		url: '',
		title: '',
		badge: ''
	});

	// New Specimen Form State
	let newSpecimen = $state<Omit<SpecimenShowcaseItem, 'id'>>({
		commonName: '',
		latinName: '',
		url: ''
	});

	// New Category Form State
	let newCategory = $state<CategoryItemConfig>({
		id: '',
		label: '',
		dotColor: 'bg-emerald-500'
	});

	onMount(() => {
		if (!$authUser) {
			authUser.loginAsDemo('admin');
		}
		reloadConfig();
	});

	function reloadConfig() {
		config = ConfigService.getConfig();
	}

	function handleSaveIdentity() {
		try {
			ConfigService.updateIdentity(config.identity);
			ConfigService.updateHeroHeadline(config.hero.headlineLine1, config.hero.headlineLine2);
			toast.success('Pengaturan Disimpan!', 'Identitas sekolah dan judul hero berhasil diperbarui.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menyimpan', err.message || 'Terjadi kesalahan validasi.');
		}
	}

	function handleAddGardenPhoto() {
		if (!newGardenPhoto.url || !newGardenPhoto.title || !newGardenPhoto.badge) {
			toast.error('Data Belum Lengkap', 'Harap isi URL foto, judul fasilitas, dan badge.');
			return;
		}
		try {
			ConfigService.addGardenPhoto(newGardenPhoto);
			newGardenPhoto = { url: '', title: '', badge: '' };
			toast.success('Foto Ditambahkan!', 'Foto fasilitas kebun berhasil ditambahkan ke rotasi.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menambah Foto', err.message);
		}
	}

	function handleRemoveGardenPhoto(id: string) {
		try {
			ConfigService.removeGardenPhoto(id);
			toast.success('Foto Dihapus', 'Foto berhasil dihapus dari rotasi.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menghapus', err.message);
		}
	}

	function handleAddSpecimen() {
		if (!newSpecimen.commonName || !newSpecimen.latinName || !newSpecimen.url) {
			toast.error('Data Belum Lengkap', 'Harap isi nama lokal, nama Latin, dan URL gambar spesimen.');
			return;
		}
		try {
			ConfigService.addSpecimen(newSpecimen);
			newSpecimen = { commonName: '', latinName: '', url: '' };
			toast.success('Spesimen Ditambahkan!', 'Spesimen berhasil ditambahkan ke etalase kanan.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menambah Spesimen', err.message);
		}
	}

	function handleRemoveSpecimen(id: string) {
		try {
			ConfigService.removeSpecimen(id);
			toast.success('Spesimen Dihapus', 'Spesimen berhasil dihapus.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menghapus', err.message);
		}
	}

	function handleAddCategory() {
		if (!newCategory.id || !newCategory.label) {
			toast.error('Data Belum Lengkap', 'Harap isi ID kategori dan label.');
			return;
		}
		try {
			ConfigService.addCategory({
				...newCategory,
				id: newCategory.id.toLowerCase().trim()
			});
			newCategory = { id: '', label: '', dotColor: 'bg-emerald-500' };
			toast.success('Kategori Ditambahkan!', 'Kategori baru berhasil ditambahkan.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menambah Kategori', err.message);
		}
	}

	function handleRemoveCategory(id: string) {
		try {
			ConfigService.removeCategory(id);
			toast.success('Kategori Dihapus', 'Kategori berhasil dihapus.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menghapus Kategori', err.message);
		}
	}

	function handleSaveAppDownload() {
		try {
			ConfigService.updateAppDownload(config.hero.appDownload);
			toast.success('Pengaturan Disimpan!', 'Informasi unduh aplikasi berhasil diperbarui.');
			reloadConfig();
		} catch (err: any) {
			toast.error('Gagal Menyimpan', err.message);
		}
	}

	function handleResetDefaults() {
		const confirmed = confirm('Apakah Anda yakin ingin mengembalikan seluruh pengaturan ke preset awal pabrik? Perubahan kustom Anda akan direset.');
		if (confirmed) {
			ConfigService.resetToDefaults();
			reloadConfig();
			toast.success('Pengaturan Direset!', 'Seluruh konfigurasi kembali ke preset bawaan resmi.');
		}
	}
</script>

<svelte:head>
	<title>Pengaturan CMS Aplikasi — Flora SMK</title>
</svelte:head>

<div class="flex flex-col gap-6 max-w-5xl mx-auto w-full">
	<!-- Page Header & Top Navigation Bar -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D]">
		<div>
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-[#E2EF46] border-2 border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D]">
					<Sliders class="w-4 h-4 stroke-[2.5]" />
				</div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D] uppercase tracking-tight">
					CMS Pengaturan Dinamis
				</h1>
			</div>
			<p class="text-xs text-stone-600 font-semibold mt-1">
				Kelola seluruh identitas sekolah, teks hero, galeri kebun, dan kategori botani secara mandiri.
			</p>
		</div>

		<!-- Nav Tabs to Moderasi -->
		<div class="flex items-center gap-2">
			<a
				href="/admin/moderasi"
				class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all select-none"
			>
				Moderasi Siswa
			</a>
			<span class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-[#0D0D0D] text-[#E2EF46] text-xs font-black shadow-[2px_2px_0px_#0D0D0D] select-none">
				Pengaturan CMS
			</span>
		</div>
	</div>

	<!-- CMS Category Navigation Sub-Tabs -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
		<button
			type="button"
			onclick={() => (activeTab = 'identity')}
			class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === 'identity' ? 'bg-[#0D0D0D] text-[#E2EF46] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
		>
			1. Identitas &amp; Headline
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'garden')}
			class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === 'garden' ? 'bg-[#0D0D0D] text-[#E2EF46] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
		>
			2. Foto Kebun Sekolah ({config.hero.gardenPhotos.length})
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'specimen')}
			class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === 'specimen' ? 'bg-[#0D0D0D] text-[#E2EF46] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
		>
			3. Etalase Spesimen Kanan ({config.hero.specimens.length})
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'categories')}
			class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === 'categories' ? 'bg-[#0D0D0D] text-[#E2EF46] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
		>
			4. Kategori Botani ({config.categories.length})
		</button>
		<button
			type="button"
			onclick={() => (activeTab = 'download')}
			class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === 'download' ? 'bg-[#0D0D0D] text-[#E2EF46] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
		>
			5. Info Unduh Aplikasi
		</button>
	</div>

	<!-- TAB 1: IDENTITAS & HEADLINE HERO -->
	{#if activeTab === 'identity'}
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
			<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
				<Type class="w-4 h-4" />
				Identitas Sekolah &amp; Teks Headline Utama
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="appName" class="text-xs font-black text-[#0D0D0D]">Nama Brand / Aplikasi</label>
					<input
						id="appName"
						bind:value={config.identity.appName}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7] outline-none"
						placeholder="Contoh: Flora SMK"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="schoolName" class="text-xs font-black text-[#0D0D0D]">Nama Sekolah Resmi</label>
					<input
						id="schoolName"
						bind:value={config.identity.schoolName}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7] outline-none"
						placeholder="Contoh: SMK PPN Gorontalo"
					/>
				</div>

				<div class="flex flex-col gap-1.5 md:col-span-2">
					<label for="headerBadge" class="text-xs font-black text-[#0D0D0D]">Badge Label Atas Navbar</label>
					<input
						id="headerBadge"
						bind:value={config.identity.headerBadge}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7] outline-none"
						placeholder="Contoh: Katalog Botani Digital SMK PPN Gorontalo"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="headlineLine1" class="text-xs font-black text-[#0D0D0D]">Headline Baris 1 (Besar)</label>
					<input
						id="headlineLine1"
						bind:value={config.hero.headlineLine1}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7] outline-none uppercase"
						placeholder="KATALOG BOTANI"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="headlineLine2" class="text-xs font-black text-[#0D0D0D]">Headline Baris 2 (Besar)</label>
					<input
						id="headlineLine2"
						bind:value={config.hero.headlineLine2}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7] outline-none uppercase"
						placeholder="SMK PPN GORONTALO"
					/>
				</div>
			</div>

			<div class="flex justify-end pt-3 border-t border-stone-200">
				<Button variant="primary" onclick={handleSaveIdentity}>
					<Save class="w-4 h-4 mr-1.5" />
					Simpan Identitas &amp; Headline
				</Button>
			</div>
		</div>
	{/if}

	<!-- TAB 2: FOTO KEBUN SEKOLAH (KARTU KIRI SHOWCASE) -->
	{#if activeTab === 'garden'}
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
			<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
				<Image class="w-4 h-4" />
				Kelola Foto Fasilitas Kebun Sekolah (Kartu Kiri)
			</h2>
			<p class="text-xs text-stone-600 font-medium">
				Foto-foto ini akan berotasi otomatis di kartu besar bagian bawah headline beranda.
			</p>

			<!-- Existing Photos List -->
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each config.hero.gardenPhotos as photo (photo.id)}
					<div class="rounded-xl border-2 border-[#0D0D0D] overflow-hidden bg-stone-50 flex flex-col justify-between shadow-xs">
						<div class="relative aspect-16/9 w-full bg-stone-200">
							<img src={photo.url} alt={photo.title} class="w-full h-full object-cover" />
							<span class="absolute top-2 left-2 bg-black/80 text-[#E2EF46] px-2 py-0.5 rounded text-[9px] font-bold border border-white/20 uppercase">
								{photo.badge}
							</span>
						</div>
						<div class="p-3 flex items-start justify-between gap-2">
							<div>
								<h4 class="text-xs font-bold text-[#0D0D0D] leading-snug">{photo.title}</h4>
							</div>
							<button
								type="button"
								onclick={() => handleRemoveGardenPhoto(photo.id)}
								class="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
								title="Hapus foto"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Add New Photo Form -->
			<div class="bg-[#F7F2E7] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
				<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Foto Kebun Baru</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						bind:value={newGardenPhoto.title}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="Judul Fasilitas (mis: Laboratorium Hidroponik)"
					/>
					<input
						bind:value={newGardenPhoto.badge}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="Badge (mis: LAHAN RISET AGRO)"
					/>
					<input
						bind:value={newGardenPhoto.url}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="URL Gambar (Unsplash / Imgur / Lokal)"
					/>
				</div>
				<div class="flex justify-end">
					<button
						type="button"
						onclick={handleAddGardenPhoto}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E2EF46] hover:bg-[#d8e538] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer"
					>
						<Plus class="w-4 h-4" />
						Tambahkan Foto
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 3: SPESIMEN KANAN SHOWCASE -->
	{#if activeTab === 'specimen'}
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
			<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
				<Tag class="w-4 h-4" />
				Kelola Pameran Spesimen Tanaman (Kartu Kanan)
			</h2>
			<p class="text-xs text-stone-600 font-medium">
				Koleksi tanaman unggulan yang tampil di kartu vertikal kanan beranda. Nama Latin otomatis ditampilkan secara vertikal pada strip chartreuse.
			</p>

			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
				{#each config.hero.specimens as item (item.id)}
					<div class="rounded-xl border-2 border-[#0D0D0D] overflow-hidden bg-stone-50 flex flex-col justify-between shadow-xs">
						<div class="relative aspect-4/3 w-full bg-stone-200">
							<img src={item.url} alt={item.commonName} class="w-full h-full object-cover" />
							<div class="absolute bottom-2 left-2 bg-[#0D0D0D]/85 text-white px-2 py-0.5 rounded text-[10px] font-bold">
								{item.commonName}
							</div>
						</div>
						<div class="p-3 flex items-start justify-between gap-2">
							<div>
								<h4 class="text-xs font-bold text-[#0D0D0D]">{item.commonName}</h4>
								<p class="text-[11px] font-latin italic text-stone-600">{item.latinName}</p>
							</div>
							<button
								type="button"
								onclick={() => handleRemoveSpecimen(item.id)}
								class="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0"
								title="Hapus spesimen"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<!-- Add New Specimen Form -->
			<div class="bg-[#F7F2E7] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
				<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Spesimen Baru</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						bind:value={newSpecimen.commonName}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="Nama Lokal (mis: Jahe Merah)"
					/>
					<input
						bind:value={newSpecimen.latinName}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="Nama Latin (mis: Zingiber officinale var. rubrum)"
					/>
					<input
						bind:value={newSpecimen.url}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="URL Gambar Spesimen"
					/>
				</div>
				<div class="flex justify-end">
					<button
						type="button"
						onclick={handleAddSpecimen}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E2EF46] hover:bg-[#d8e538] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer"
					>
						<Plus class="w-4 h-4" />
						Tambahkan Spesimen
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 4: KATEGORI BOTANI -->
	{#if activeTab === 'categories'}
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
			<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
				<Sliders class="w-4 h-4" />
				Manajemen Kategori Tanaman SMK
			</h2>
			<p class="text-xs text-stone-600 font-medium">
				Kategori ini akan langsung tampil di bilah filter beranda dan halaman katalog tanaman.
			</p>

			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
				{#each config.categories as cat (cat.id)}
					<div class="p-3 rounded-xl border-2 border-[#0D0D0D] bg-stone-50 flex items-center justify-between shadow-xs">
						<div class="flex items-center gap-2">
							<span class="w-3 h-3 rounded-full {cat.dotColor} border border-[#0D0D0D]"></span>
							<div>
								<h4 class="text-xs font-black text-[#0D0D0D]">{cat.label}</h4>
								<span class="text-[10px] text-stone-500 font-mono">id: {cat.id}</span>
							</div>
						</div>
						{#if cat.id !== 'semua'}
							<button
								type="button"
								onclick={() => handleRemoveCategory(cat.id)}
								class="text-red-500 hover:text-red-700 p-1 cursor-pointer"
								title="Hapus kategori"
							>
								<Trash2 class="w-4 h-4" />
							</button>
						{/if}
					</div>
				{/each}
			</div>

			<!-- Add New Category Form -->
			<div class="bg-[#F7F2E7] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
				<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Kategori Baru</h3>
				<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
					<input
						bind:value={newCategory.id}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="ID Kategori (slug, mis: kultur-jaringan)"
					/>
					<input
						bind:value={newCategory.label}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
						placeholder="Label Kategori (mis: Kultur Jaringan)"
					/>
					<select
						bind:value={newCategory.dotColor}
						class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white"
					>
						<option value="bg-emerald-500">Hijau Zamrud (bg-emerald-500)</option>
						<option value="bg-amber-500">Kuning Amber (bg-amber-500)</option>
						<option value="bg-pink-500">Merah Muda (bg-pink-500)</option>
						<option value="bg-cyan-500">Biru Cyan (bg-cyan-500)</option>
						<option value="bg-purple-500">Ungu Lavender (bg-purple-500)</option>
						<option value="bg-amber-800">Cokelat Perkebunan (bg-amber-800)</option>
						<option value="bg-lime-700">Hijau Hutan (bg-lime-700)</option>
					</select>
				</div>
				<div class="flex justify-end">
					<button
						type="button"
						onclick={handleAddCategory}
						class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#E2EF46] hover:bg-[#d8e538] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer"
					>
						<Plus class="w-4 h-4" />
						Tambahkan Kategori
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- TAB 5: UNDUH APLIKASI & RESET -->
	{#if activeTab === 'download'}
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
			<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
				<Download class="w-4 h-4" />
				Pengaturan Kartu Unduh Aplikasi &amp; Reset Pabrik
			</h2>

			<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div class="flex flex-col gap-1.5">
					<label for="downloadTitle" class="text-xs font-black text-[#0D0D0D]">Judul Kartu</label>
					<input
						id="downloadTitle"
						bind:value={config.hero.appDownload.title}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7]"
					/>
				</div>

				<div class="flex flex-col gap-1.5">
					<label for="btnLabel" class="text-xs font-black text-[#0D0D0D]">Label Tombol Pasang</label>
					<input
						id="btnLabel"
						bind:value={config.hero.appDownload.buttonLabel}
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7]"
					/>
				</div>

				<div class="flex flex-col gap-1.5 md:col-span-2">
					<label for="downloadDesc" class="text-xs font-black text-[#0D0D0D]">Deskripsi Teks</label>
					<textarea
						id="downloadDesc"
						bind:value={config.hero.appDownload.description}
						rows="2"
						class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#FDFBF7]"
					></textarea>
				</div>

				<div class="flex items-center gap-4">
					<label class="flex items-center gap-2 text-xs font-black cursor-pointer select-none">
						<input type="checkbox" bind:checked={config.hero.appDownload.showIosBadge} class="w-4 h-4" />
						Tampilkan Logo Apple iOS
					</label>
					<label class="flex items-center gap-2 text-xs font-black cursor-pointer select-none">
						<input type="checkbox" bind:checked={config.hero.appDownload.showAndroidBadge} class="w-4 h-4" />
						Tampilkan Logo Android
					</label>
				</div>
			</div>

			<div class="flex justify-end pt-3 border-t border-stone-200">
				<Button variant="primary" onclick={handleSaveAppDownload}>
					<Save class="w-4 h-4 mr-1.5" />
					Simpan Info Unduh
				</Button>
			</div>

			<!-- Factory Reset Area -->
			<div class="mt-4 p-4 rounded-xl border-2 border-amber-600 bg-amber-50 flex flex-col sm:flex-row items-center justify-between gap-4">
				<div class="flex items-center gap-3">
					<AlertTriangle class="w-6 h-6 text-amber-700 shrink-0" />
					<div>
						<h4 class="text-xs font-black uppercase text-amber-900">Pulihkan Seluruh Pengaturan Bawaan</h4>
						<p class="text-[11px] text-amber-800">
							Kembalikan seluruh teks, galeri foto, spesimen, dan kategori ke preset resmi Flora SMK.
						</p>
					</div>
				</div>
				<button
					type="button"
					onclick={handleResetDefaults}
					class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-200 hover:bg-amber-300 text-amber-950 font-black text-xs border-2 border-amber-900 shadow-[2px_2px_0px_#78350F] cursor-pointer shrink-0"
				>
					<RotateCcw class="w-4 h-4" />
					Reset ke Default
				</button>
			</div>
		</div>
	{/if}
</div>
