<!--
  Botanidex — Admin CMS & Content Management Portal (Svelte 5 Runes)
  Tujuan: Mengatur seluruh konten, identitas sekolah, galeri showcase, dan kategori secara dinamis dengan proteksi role admin
  Caller: Route '/admin/pengaturan'
  Dependensi: ConfigService, authUser, toast, Button.svelte
  Main Functions: reloadConfig, runAction, handleSaveIdentity, handleAddGardenPhoto, handleAddSpecimen, handleAddCategory, handleResetDefaults
  Side Effects: Memperbarui konfigurasi aplikasi via ConfigService dan memicu event flora:config-updated
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { ConfigService } from '#lib/services/config.service';
	import type { AppConfig, GardenShowcasePhoto, SpecimenShowcaseItem, CategoryItemConfig } from '#lib/types/config.types';
	import Button from '#lib/components/ui/Button.svelte';
	import { ShieldCheck, RotateCcw, Save, Plus, Trash2, Image, Type, Tag, Download, Sliders, AlertTriangle, AlertCircle } from '@lucide/svelte';

	type TabId = 'identity' | 'garden' | 'specimen' | 'categories' | 'download';

	let config = $state<AppConfig>(ConfigService.getConfig());
	let activeTab = $state<TabId>('identity');
	let newGardenPhoto = $state<Omit<GardenShowcasePhoto, 'id'>>({ url: '', title: '', badge: '' });
	let newSpecimen = $state<Omit<SpecimenShowcaseItem, 'id'>>({ commonName: '', latinName: '', url: '' });
	let newCategory = $state<CategoryItemConfig>({ id: '', label: '', dotColor: 'bg-emerald-500' });

	const tabs = $derived<{ id: TabId; label: string }[]>([
		{ id: 'identity', label: '1. Identitas & Headline' },
		{ id: 'garden', label: `2. Foto Kebun Sekolah (${config.hero.gardenPhotos.length})` },
		{ id: 'specimen', label: `3. Etalase Spesimen Kanan (${config.hero.specimens.length})` },
		{ id: 'categories', label: `4. Kategori Botani (${config.categories.length})` },
		{ id: 'download', label: '5. Info Unduh Aplikasi' }
	]);

	const dotOptions = [
		{ value: 'bg-emerald-500', label: 'Hijau Zamrud (bg-emerald-500)' },
		{ value: 'bg-amber-500', label: 'Kuning Amber (bg-amber-500)' },
		{ value: 'bg-pink-500', label: 'Merah Muda (bg-pink-500)' },
		{ value: 'bg-cyan-500', label: 'Biru Cyan (bg-cyan-500)' },
		{ value: 'bg-purple-500', label: 'Ungu Lavender (bg-purple-500)' },
		{ value: 'bg-amber-800', label: 'Cokelat Perkebunan (bg-amber-800)' },
		{ value: 'bg-lime-700', label: 'Hijau Hutan (bg-lime-700)' }
	];

	onMount(() => reloadConfig());

	function reloadConfig() {
		config = ConfigService.getConfig();
	}

	function runAction(fn: () => void, okTitle: string, okMsg: string, errTitle = 'Gagal Menyimpan') {
		try {
			fn();
			reloadConfig();
			toast.success(okTitle, okMsg);
		} catch (err: any) {
			toast.error(errTitle, err?.message || 'Terjadi kesalahan validasi.');
		}
	}

	function handleSaveIdentity() {
		runAction(
			() => {
				ConfigService.updateIdentity(config.identity);
				ConfigService.updateHeroHeadline(config.hero.headlineLine1, config.hero.headlineLine2);
			},
			'Pengaturan Disimpan!',
			'Identitas sekolah dan judul hero berhasil diperbarui.'
		);
	}

	function handleAddGardenPhoto() {
		if (!newGardenPhoto.url || !newGardenPhoto.title || !newGardenPhoto.badge) {
			toast.error('Data Belum Lengkap', 'Harap isi URL foto, judul fasilitas, dan badge.');
			return;
		}
		runAction(
			() => {
				ConfigService.addGardenPhoto(newGardenPhoto);
				newGardenPhoto = { url: '', title: '', badge: '' };
			},
			'Foto Ditambahkan!',
			'Foto fasilitas kebun berhasil ditambahkan ke rotasi.',
			'Gagal Menambah Foto'
		);
	}

	function handleAddSpecimen() {
		if (!newSpecimen.commonName || !newSpecimen.latinName || !newSpecimen.url) {
			toast.error('Data Belum Lengkap', 'Harap isi nama lokal, nama Latin, dan URL gambar spesimen.');
			return;
		}
		runAction(
			() => {
				ConfigService.addSpecimen(newSpecimen);
				newSpecimen = { commonName: '', latinName: '', url: '' };
			},
			'Spesimen Ditambahkan!',
			'Spesimen berhasil ditambahkan ke etalase kanan.',
			'Gagal Menambah Spesimen'
		);
	}

	function handleAddCategory() {
		if (!newCategory.id || !newCategory.label) {
			toast.error('Data Belum Lengkap', 'Harap isi ID kategori dan label.');
			return;
		}
		runAction(
			() => {
				ConfigService.addCategory({ ...newCategory, id: newCategory.id.toLowerCase().trim() });
				newCategory = { id: '', label: '', dotColor: 'bg-emerald-500' };
			},
			'Kategori Ditambahkan!',
			'Kategori baru berhasil ditambahkan.',
			'Gagal Menambah Kategori'
		);
	}

	function handleResetDefaults() {
		if (confirm('Apakah Anda yakin ingin mengembalikan seluruh pengaturan ke preset awal pabrik? Perubahan kustom Anda akan direset.')) {
			runAction(() => ConfigService.resetToDefaults(), 'Pengaturan Direset!', 'Seluruh konfigurasi kembali ke preset bawaan resmi.');
		}
	}
</script>

<svelte:head>
	<title>Pengaturan CMS Aplikasi — Botanidex</title>
</svelte:head>

<div class="flex flex-col gap-6 max-w-5xl mx-auto w-full">
	{#if $authUser?.role !== 'admin'}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#E07A5F] text-white border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center">
				<AlertCircle class="w-7 h-7 stroke-[2.5]" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Akses Terbatas — Khusus Guru / Administrator</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">
					Portal pengaturan CMS dinamis hanya dapat diakses oleh akun Guru Pembimbing / Administrator SMK PPN Gorontalo.
				</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-2">
				<Button variant="primary" onclick={() => authUser.loginAsDemo('admin')}>
					<ShieldCheck class="w-4 h-4 stroke-[2.5]" />
					Masuk sebagai Guru / Admin
				</Button>
				<a href="/" class="px-4 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#F3F6ED]">
					Kembali ke Beranda
				</a>
			</div>
		</div>
	{:else}
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D]">
			<div>
				<div class="flex items-center gap-2">
					<div class="w-8 h-8 rounded-lg bg-[#D4F469] border-2 border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D]">
						<Sliders class="w-4 h-4 stroke-[2.5]" />
					</div>
					<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D] uppercase tracking-tight">CMS Pengaturan Dinamis</h1>
				</div>
				<p class="text-xs text-stone-600 font-semibold mt-1">
					Kelola seluruh identitas sekolah, teks hero, galeri kebun, dan kategori botani secara mandiri.
				</p>
			</div>
			<div class="flex items-center gap-2">
				<a href="/admin/moderasi" class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all select-none">
					Moderasi Siswa
				</a>
				<span class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-[#0D0D0D] text-[#D4F469] text-xs font-black shadow-[2px_2px_0px_#0D0D0D] select-none">
					Pengaturan CMS
				</span>
			</div>
		</div>

		<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
			{#each tabs as tab (tab.id)}
				<button
					type="button"
					onclick={() => (activeTab = tab.id)}
					class="px-4 py-2 rounded-xl text-xs font-black border-2 border-[#0D0D0D] transition-all cursor-pointer shrink-0 select-none {activeTab === tab.id ? 'bg-[#0D0D0D] text-[#D4F469] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-[#0D0D0D] hover:bg-stone-50'}"
				>
					{tab.label}
				</button>
			{/each}
		</div>

		{#if activeTab === 'identity'}
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
				<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
					<Type class="w-4 h-4" /> Identitas Sekolah &amp; Teks Headline Utama
				</h2>
				<div class="p-3.5 bg-[#F8F9F5] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center gap-3.5">
					<div class="w-12 h-12 rounded-lg border-2 border-[#0D0D0D] p-1 bg-white flex items-center justify-center shrink-0 shadow-[1px_1px_0px_#0D0D0D]">
						<img src="/SMK-Pertanian-Gorontalo.png" alt="Logo SMK PPN Gorontalo" class="w-full h-full object-contain" />
					</div>
					<div>
						<p class="font-black text-xs text-stone-900">Logo Resmi Sekolah Aktif</p>
						<p class="text-[11px] text-stone-600 font-bold">SMK-Pertanian-Gorontalo.png (Ditampilkan pada Header, Footer, &amp; Kartu Beranda)</p>
					</div>
				</div>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="appName" class="text-xs font-black text-[#0D0D0D]">Nama Brand / Aplikasi</label>
						<input id="appName" bind:value={config.identity.appName} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5] outline-none" placeholder="Contoh: Botanidex" />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="schoolName" class="text-xs font-black text-[#0D0D0D]">Nama Sekolah Resmi</label>
						<input id="schoolName" bind:value={config.identity.schoolName} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5] outline-none" placeholder="Contoh: SMK PPN Gorontalo" />
					</div>
					<div class="flex flex-col gap-1.5 md:col-span-2">
						<label for="headerBadge" class="text-xs font-black text-[#0D0D0D]">Badge Label Atas Navbar</label>
						<input id="headerBadge" bind:value={config.identity.headerBadge} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5] outline-none" placeholder="Contoh: Katalog Botani Digital SMK PPN Gorontalo" />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="headlineLine1" class="text-xs font-black text-[#0D0D0D]">Headline Baris 1 (Besar)</label>
						<input id="headlineLine1" bind:value={config.hero.headlineLine1} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5] outline-none uppercase" placeholder="KATALOG BOTANI" />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="headlineLine2" class="text-xs font-black text-[#0D0D0D]">Headline Baris 2 (Besar)</label>
						<input id="headlineLine2" bind:value={config.hero.headlineLine2} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5] outline-none uppercase" placeholder="SMK PPN GORONTALO" />
					</div>
				</div>

				<div class="flex justify-end pt-3 border-t border-stone-200">
					<Button variant="primary" onclick={handleSaveIdentity}>
						<Save class="w-4 h-4 mr-1.5" /> Simpan Identitas &amp; Headline
					</Button>
				</div>
			</div>
		{:else if activeTab === 'garden'}
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
				<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
					<Image class="w-4 h-4" /> Kelola Foto Fasilitas Kebun Sekolah (Kartu Kiri)
				</h2>
				<p class="text-xs text-stone-600 font-medium">Foto-foto ini akan berotasi otomatis di kartu besar bagian bawah headline beranda.</p>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each config.hero.gardenPhotos as photo (photo.id)}
						<div class="rounded-xl border-2 border-[#0D0D0D] overflow-hidden bg-stone-50 flex flex-col justify-between shadow-xs">
							<div class="relative aspect-16/9 w-full bg-stone-200">
								<img src={photo.url} alt={photo.title} class="w-full h-full object-cover" />
								<span class="absolute top-2 left-2 bg-black/80 text-[#D4F469] px-2 py-0.5 rounded text-[9px] font-bold border border-white/20 uppercase">{photo.badge}</span>
							</div>
							<div class="p-3 flex items-start justify-between gap-2">
								<h4 class="text-xs font-bold text-[#0D0D0D] leading-snug">{photo.title}</h4>
								<button type="button" onclick={() => runAction(() => ConfigService.removeGardenPhoto(photo.id), 'Foto Dihapus', 'Foto berhasil dihapus dari rotasi.', 'Gagal Menghapus')} class="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0" title="Hapus foto">
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</div>
					{/each}
				</div>

				<div class="bg-[#F3F6ED] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
					<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Foto Kebun Baru</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input bind:value={newGardenPhoto.title} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="Judul Fasilitas (mis: Laboratorium Hidroponik)" />
						<input bind:value={newGardenPhoto.badge} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="Badge (mis: LAHAN RISET AGRO)" />
						<input bind:value={newGardenPhoto.url} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="URL Gambar (Unsplash / Imgur / Lokal)" />
					</div>
					<div class="flex justify-end">
						<button type="button" onclick={handleAddGardenPhoto} class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer">
							<Plus class="w-4 h-4" /> Tambahkan Foto
						</button>
					</div>
				</div>
			</div>
		{:else if activeTab === 'specimen'}
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
				<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
					<Tag class="w-4 h-4" /> Kelola Pameran Spesimen Tanaman (Kartu Kanan)
				</h2>
				<p class="text-xs text-stone-600 font-medium">Koleksi tanaman unggulan yang tampil di kartu vertikal kanan beranda. Nama Latin otomatis ditampilkan secara vertikal pada strip chartreuse.</p>

				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{#each config.hero.specimens as item (item.id)}
						<div class="rounded-xl border-2 border-[#0D0D0D] overflow-hidden bg-stone-50 flex flex-col justify-between shadow-xs">
							<div class="relative aspect-4/3 w-full bg-stone-200">
								<img src={item.url} alt={item.commonName} class="w-full h-full object-cover" />
								<div class="absolute bottom-2 left-2 bg-[#0D0D0D]/85 text-white px-2 py-0.5 rounded text-[10px] font-bold">{item.commonName}</div>
							</div>
							<div class="p-3 flex items-start justify-between gap-2">
								<div>
									<h4 class="text-xs font-bold text-[#0D0D0D]">{item.commonName}</h4>
									<p class="text-[11px] font-latin italic text-stone-600">{item.latinName}</p>
								</div>
								<button type="button" onclick={() => runAction(() => ConfigService.removeSpecimen(item.id), 'Spesimen Dihapus', 'Spesimen berhasil dihapus.', 'Gagal Menghapus')} class="text-red-500 hover:text-red-700 p-1 cursor-pointer shrink-0" title="Hapus spesimen">
									<Trash2 class="w-4 h-4" />
								</button>
							</div>
						</div>
					{/each}
				</div>

				<div class="bg-[#F3F6ED] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
					<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Spesimen Baru</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input bind:value={newSpecimen.commonName} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="Nama Lokal (mis: Jahe Merah)" />
						<input bind:value={newSpecimen.latinName} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="Nama Latin (mis: Zingiber officinale var. rubrum)" />
						<input bind:value={newSpecimen.url} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="URL Gambar Spesimen" />
					</div>
					<div class="flex justify-end">
						<button type="button" onclick={handleAddSpecimen} class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer">
							<Plus class="w-4 h-4" /> Tambahkan Spesimen
						</button>
					</div>
				</div>
			</div>
		{:else if activeTab === 'categories'}
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
				<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
					<Sliders class="w-4 h-4" /> Manajemen Kategori Tanaman SMK
				</h2>
				<p class="text-xs text-stone-600 font-medium">Kategori ini akan langsung tampil di bilah filter beranda, halaman katalog tanaman, dan formulir kontribusi.</p>

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
								<button type="button" onclick={() => runAction(() => ConfigService.removeCategory(cat.id), 'Kategori Dihapus', 'Kategori berhasil dihapus.', 'Gagal Menghapus Kategori')} class="text-red-500 hover:text-red-700 p-1 cursor-pointer" title="Hapus kategori">
									<Trash2 class="w-4 h-4" />
								</button>
							{/if}
						</div>
					{/each}
				</div>

				<div class="bg-[#F3F6ED] p-4 rounded-xl border-2 border-[#0D0D0D] flex flex-col gap-3 mt-2">
					<h3 class="text-xs font-black uppercase tracking-wider text-[#0D0D0D]">Tambah Kategori Baru</h3>
					<div class="grid grid-cols-1 md:grid-cols-3 gap-3">
						<input bind:value={newCategory.id} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="ID Kategori (slug, mis: kultur-jaringan)" />
						<input bind:value={newCategory.label} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white" placeholder="Label Kategori (mis: Kultur Jaringan)" />
						<select bind:value={newCategory.dotColor} class="px-3 py-2 rounded-lg border-2 border-[#0D0D0D] text-xs font-bold bg-white">
							{#each dotOptions as opt (opt.value)}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</div>
					<div class="flex justify-end">
						<button type="button" onclick={handleAddCategory} class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] font-black text-xs border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] cursor-pointer">
							<Plus class="w-4 h-4" /> Tambahkan Kategori
						</button>
					</div>
				</div>
			</div>
		{:else if activeTab === 'download'}
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-5 sm:p-6 flex flex-col gap-5">
				<h2 class="text-base font-black uppercase text-[#0D0D0D] flex items-center gap-2 border-b border-stone-200 pb-2">
					<Download class="w-4 h-4" /> Pengaturan Kartu Unduh Aplikasi &amp; Reset Pabrik
				</h2>

				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div class="flex flex-col gap-1.5">
						<label for="downloadTitle" class="text-xs font-black text-[#0D0D0D]">Judul Kartu</label>
						<input id="downloadTitle" bind:value={config.hero.appDownload.title} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5]" />
					</div>
					<div class="flex flex-col gap-1.5">
						<label for="btnLabel" class="text-xs font-black text-[#0D0D0D]">Label Tombol Pasang</label>
						<input id="btnLabel" bind:value={config.hero.appDownload.buttonLabel} class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5]" />
					</div>
					<div class="flex flex-col gap-1.5 md:col-span-2">
						<label for="downloadDesc" class="text-xs font-black text-[#0D0D0D]">Deskripsi Teks</label>
						<textarea id="downloadDesc" bind:value={config.hero.appDownload.description} rows="2" class="px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-sm font-bold bg-[#F8F9F5]"></textarea>
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
					<Button variant="primary" onclick={() => runAction(() => ConfigService.updateAppDownload(config.hero.appDownload), 'Pengaturan Disimpan!', 'Informasi unduh aplikasi berhasil diperbarui.')}>
						<Save class="w-4 h-4 mr-1.5" /> Simpan Info Unduh
					</Button>
				</div>

				<div class="mt-4 p-4 rounded-xl border-2 border-amber-600 bg-amber-50 flex flex-col sm:flex-row items-center justify-between gap-4">
					<div class="flex items-center gap-3">
						<AlertTriangle class="w-6 h-6 text-amber-700 shrink-0" />
						<div>
							<h4 class="text-xs font-black uppercase text-amber-900">Pulihkan Seluruh Pengaturan Bawaan</h4>
							<p class="text-[11px] text-amber-800 font-medium">Mengembalikan teks, galeri kebun, spesimen, dan kategori ke preset resmi SMK PPN Gorontalo.</p>
						</div>
					</div>
					<button type="button" onclick={handleResetDefaults} class="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-amber-100 text-amber-900 font-black text-xs border-2 border-amber-800 cursor-pointer shrink-0">
						<RotateCcw class="w-3.5 h-3.5" /> Reset ke Bawaan Pabrik
					</button>
				</div>
			</div>
		{/if}
	{/if}
</div>
