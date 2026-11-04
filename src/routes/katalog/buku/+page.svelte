<!--
  Botanidex — Print-Ready Botanical Catalog Book Generator (Svelte 5 Runes)
  Tujuan: Generator dan pratinjau Buku Ensiklopedia Botani Sekolah format A4 siap cetak / simpan PDF dengan sampul resmi, denah kebun, daftar isi, lembar spesimen, taksonomi, QR code cetak, dan indeks familia
  Caller: Route '/katalog/buku'
  Dependensi: PlantService, ConfigService, catalog-book.ts, markdown.ts, format.ts, Button.svelte, @lucide/svelte
  Main Functions: loadBookData, handlePrint, setDensity, setFilterCategory
  Side Effects: Menghasilkan data URL QR code dan memicu window.print() untuk cetak A4 / Save as PDF
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { ConfigService } from '#lib/services/config.service';
	import type { Plant } from '#lib/types/plant.types';
	import type { AppConfig } from '#lib/types/config.types';
	import {
		compileBookStatistics,
		groupPlantsByCategory,
		groupPlantsByFamily,
		calculateSpecimenPageNumbers,
		type BookStatistics,
		type CategoryGroup,
		type FamilyGroup
	} from '#lib/utils/catalog-book';
	import { formatMarkdown } from '#lib/utils/markdown';
	import { getCategoryBadgeLabel } from '#lib/utils/format';
	import { Printer, ArrowLeft, BookOpen, Trees, MapPin, QrCode, Filter } from '@lucide/svelte';

	let allPlants = $state<Plant[]>([]);
	let selectedCategory = $state<string>('semua');
	let layoutMode = $state<'encyclopedia' | 'compact'>('encyclopedia');
	let isLoading = $state(true);
	let config = $state<AppConfig>(ConfigService.getConfig());
	let qrCodeMap = $state<Map<string, string>>(new Map());
	let coverQrCode = $state<string>('');

	onMount(async () => {
		await loadBookData();
	});

	async function loadBookData() {
		isLoading = true;
		try {
			config = ConfigService.getConfig();
			const fetched = await PlantService.getCatalog();
			allPlants = fetched && fetched.length > 0 ? fetched : [];

			// Generate QR Code untuk setiap tanaman dan cover secara paralel
			const qrEntries = await Promise.all(
				allPlants.map(async (p) => {
					try {
						const qr = await PlantService.generateQrDataUrl(p.slug);
						return [p.id, qr] as const;
					} catch {
						return [p.id, ''] as const;
					}
				})
			);
			qrCodeMap = new Map(qrEntries);

			try {
				coverQrCode = await PlantService.generateQrDataUrl(
					typeof window !== 'undefined' ? window.location.origin : 'https://botanidex.app'
				);
			} catch {
				coverQrCode = '';
			}
		} catch (err) {
			console.warn('Gagal menyiapkan data buku katalog:', err);
		} finally {
			isLoading = false;
		}
	}

	const activePlants = $derived(
		selectedCategory === 'semua'
			? allPlants
			: allPlants.filter((p) => p.category === selectedCategory)
	);

	const stats = $derived<BookStatistics>(compileBookStatistics(activePlants));
	const categoryGroups = $derived<CategoryGroup[]>(groupPlantsByCategory(activePlants));
	const familyGroups = $derived<FamilyGroup[]>(groupPlantsByFamily(activePlants));
	const pageMap = $derived<Map<string, number>>(
		calculateSpecimenPageNumbers(activePlants, layoutMode, 4)
	);

	const totalBookPages = $derived(
		layoutMode === 'encyclopedia'
			? 3 + activePlants.length + (familyGroups.length > 0 ? 1 : 0) + 1
			: 3 + Math.ceil(activePlants.length / 2) + (familyGroups.length > 0 ? 1 : 0) + 1
	);

	function handlePrint() {
		if (typeof window !== 'undefined') {
			window.print();
		}
	}
</script>

<svelte:head>
	<title>Buku Katalog Botani Siap Cetak (A4 PDF) — Botanidex</title>
</svelte:head>

<!-- Toolbar Kontrol Cetak (Hanya tampil di layar, otomatis tersembunyi saat cetak) -->
<div class="no-print sticky top-0 z-50 bg-[#0D0D0D] text-white border-b-4 border-[#D4F469] shadow-2xl px-4 py-3">
	<div class="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
		<div class="flex items-center gap-3">
			<a
				href="/katalog"
				class="px-3 py-1.5 rounded-xl border-2 border-white/40 bg-white/10 hover:bg-white/20 text-white text-xs font-black flex items-center gap-1.5 transition-all"
			>
				<ArrowLeft class="w-4 h-4" />
				<span>Kembali ke Katalog</span>
			</a>
			<div>
				<h1 class="text-sm md:text-base font-black text-[#D4F469] tracking-tight flex items-center gap-1.5">
					<BookOpen class="w-4 h-4" />
					<span>Buku Ensiklopedia Botani Siap Cetak (A4)</span>
				</h1>
				<p class="text-[11px] text-stone-300 font-medium">
					{activePlants.length} Spesies • Estimasi {totalBookPages} Halaman A4
				</p>
			</div>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			<!-- Filter Kategori -->
			<div class="flex items-center gap-1 bg-white/10 px-2 py-1 rounded-xl border border-white/20 text-xs font-bold">
				<Filter class="w-3.5 h-3.5 text-[#D4F469]" />
				<select
					bind:value={selectedCategory}
					class="bg-transparent text-white font-bold text-xs outline-none cursor-pointer pr-1"
				>
					<option value="semua" class="bg-[#0D0D0D] text-white">Semua Kategori ({allPlants.length})</option>
					{#each config.categories.filter((c) => c.id !== 'semua') as cat}
						<option value={cat.id} class="bg-[#0D0D0D] text-white">
							{cat.label} ({allPlants.filter((p) => p.category === cat.id).length})
						</option>
					{/each}
				</select>
			</div>

			<!-- Pilihan Kepadatan -->
			<div class="flex items-center bg-white/10 p-0.5 rounded-xl border border-white/20 text-xs font-bold">
				<button
					type="button"
					onclick={() => (layoutMode = 'encyclopedia')}
					class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {layoutMode === 'encyclopedia'
						? 'bg-[#D4F469] text-[#0D0D0D] font-black'
						: 'text-stone-300 hover:text-white'}"
				>
					Ensiklopedia (1/Hal)
				</button>
				<button
					type="button"
					onclick={() => (layoutMode = 'compact')}
					class="px-2.5 py-1 rounded-lg transition-all cursor-pointer {layoutMode === 'compact'
						? 'bg-[#D4F469] text-[#0D0D0D] font-black'
						: 'text-stone-300 hover:text-white'}"
				>
					Kompak (2/Hal)
				</button>
			</div>

			<!-- Tombol Cetak / Simpan PDF -->
			<button
				type="button"
				onclick={handlePrint}
				class="px-4 py-2 rounded-xl bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] font-black text-xs md:text-sm flex items-center gap-2 shadow-[2px_2px_0px_#ffffff] cursor-pointer active:translate-y-0.5 transition-all"
			>
				<Printer class="w-4 h-4 stroke-[2.5]" />
				<span>Cetak / Simpan PDF</span>
			</button>
		</div>
	</div>
</div>

{#if isLoading}
	<div class="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-stone-100 no-print">
		<div class="w-14 h-14 rounded-2xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] animate-bounce mb-4">
			<BookOpen class="w-7 h-7 stroke-[2.5]" />
		</div>
		<h2 class="text-xl font-black text-[#0D0D0D]">Menyiapkan Buku Ensiklopedia Botani...</h2>
		<p class="text-xs text-stone-600 font-bold mt-1">Mengompilasi taksonomi, denah kebun, dan QR code cetak beresolusi tinggi.</p>
	</div>
{:else}
	<!-- Container Pratinjau Buku & Cetak A4 -->
	<div class="book-container bg-stone-200 py-6 sm:py-10 px-2 sm:px-4">
		<div class="book-sheet-wrapper max-w-[210mm] mx-auto flex flex-col gap-8">

			<!-- ==================================================================== -->
			<!-- HALAMAN 1: SAMPUL DEPAN BUKU (FRONT COVER)                           -->
			<!-- ==================================================================== -->
			<section class="book-page a4-page bg-[#0D0D0D] text-white p-8 sm:p-12 rounded-2xl sm:shadow-2xl border-4 border-[#0D0D0D] relative flex flex-col justify-between overflow-hidden">
				<!-- Latar Aksen Geometris -->
				<div class="absolute -right-24 -top-24 w-80 h-80 rounded-full bg-[#D4F469]/20 blur-3xl pointer-events-none"></div>
				<div class="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-[#0F3E2E] blur-2xl pointer-events-none"></div>

				<!-- Header Sampul -->
				<div class="relative z-10 flex flex-col gap-4">
					<div class="flex items-center justify-between pb-4 border-b-2 border-white/20">
						<div class="flex items-center gap-3">
							<div class="w-11 h-11 rounded-xl bg-[#D4F469] border-2 border-white text-[#0D0D0D] flex items-center justify-center font-black text-xl shadow-[2px_2px_0px_#ffffff]">
								🌱
							</div>
							<div>
								<p class="text-[11px] font-black uppercase tracking-widest text-[#D4F469]">
									{config.identity.schoolName}
								</p>
								<p class="text-[9px] font-bold text-stone-300 uppercase tracking-wider">
									Program Keahlian Agroteknologi &amp; Agribisnis Tanaman
								</p>
							</div>
						</div>
						<span class="px-2.5 py-1 rounded-md bg-[#D4F469] text-[#0D0D0D] font-black text-[9px] uppercase tracking-wider border border-white">
							EDISI CETAK RESMI
						</span>
					</div>

					<div class="pt-6">
						<span class="px-3 py-1 rounded-full bg-white/10 text-[#D4F469] text-xs font-black uppercase tracking-wider border border-white/20 inline-block mb-3">
							Flora &amp; Spesimen Kebun Praktikum
						</span>
						<h1 class="text-3xl sm:text-5xl font-black text-white leading-tight tracking-tight uppercase">
							KATALOG BOTANI &amp;<br />
							<span class="text-[#D4F469]">AGROTEKNOLOGI</span>
						</h1>
						<p class="text-xs sm:text-sm text-stone-300 font-medium mt-3 leading-relaxed max-w-lg">
							Inventarisasi Spesies Tanaman, Taksonomi 7 Tingkat, Kuantitas Populasi, dan Khasiat Herbal Lahan Praktikum SMK PPN Gorontalo.
						</p>
					</div>
				</div>

				<!-- Hero Visual Sampul -->
				<div class="relative z-10 my-6 rounded-2xl border-2 border-white bg-white/5 overflow-hidden shadow-[4px_4px_0px_#D4F469] aspect-16/9">
					<img
						src={config.gardenPhotos[0]?.url || '/icons/icon-512.svg'}
						alt="Kebun Praktikum SMK PPN Gorontalo"
						class="w-full h-full object-cover"
					/>
					<div class="absolute bottom-2 left-2 bg-[#0D0D0D]/80 backdrop-blur-xs text-white px-3 py-1 rounded-lg border border-white/20 text-[10px] font-bold">
						📍 Area Laboratorium &amp; Kebun Praktikum Lahan Terbuka
					</div>
				</div>

				<!-- Footer Sampul & QR Portal -->
				<div class="relative z-10 pt-4 border-t-2 border-white/20 flex items-end justify-between gap-4">
					<div class="flex flex-col gap-1">
						<p class="text-[10px] font-bold text-[#D4F469] uppercase tracking-wider">Penerbit &amp; Pengelola Data:</p>
						<p class="text-xs font-black text-white">{config.identity.schoolName}</p>
						<p class="text-[10px] text-stone-400 font-medium">Gorontalo, Indonesia • Tahun Ajaran {new Date().getFullYear()} / {new Date().getFullYear() + 1}</p>
					</div>

					{#if coverQrCode}
						<div class="flex items-center gap-2.5 bg-white p-2 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#D4F469] shrink-0">
							<img src={coverQrCode} alt="QR Code Portal" class="w-14 h-14" />
							<div class="text-[#0D0D0D] text-left pr-1">
								<p class="text-[8px] font-black uppercase tracking-tight text-emerald-800">Scan Portal</p>
								<p class="text-[10px] font-black leading-tight">Versi Digital</p>
								<p class="text-[8px] text-stone-600 font-medium">botanidex.app</p>
							</div>
						</div>
					{/if}
				</div>
			</section>

			<!-- ==================================================================== -->
			<!-- HALAMAN 2: SAMBUTAN, STATISTIK & PETA KEBUN                         -->
			<!-- ==================================================================== -->
			<section class="book-page a4-page bg-white text-[#0D0D0D] p-8 sm:p-10 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col justify-between gap-4">
				<div class="flex flex-col gap-4">
					<!-- Running Header -->
					<div class="flex items-center justify-between pb-2 border-b-2 border-[#0D0D0D] text-[10px] font-black uppercase text-stone-600">
						<span>Profil &amp; Denah Kebun Sekolah</span>
						<span>{config.identity.appName} — Hal. 2</span>
					</div>

					<div class="flex items-center gap-3">
						<div class="w-9 h-9 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0">
							<Trees class="w-5 h-5 stroke-[2.5]" />
						</div>
						<div>
							<h2 class="text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-tight">Koleksi Botani SMK PPN Gorontalo</h2>
							<p class="text-xs text-stone-600 font-bold">Lahan Edukasi, Konservasi Plasma Nutfah, dan Praktikum Agroteknologi Siswa</p>
						</div>
					</div>

					<!-- Ringkasan Statistik -->
					<div class="grid grid-cols-3 gap-3 my-1">
						<div class="p-3 rounded-xl border-2 border-[#0D0D0D] bg-[#F3F6ED] shadow-[2px_2px_0px_#0D0D0D] text-center">
							<p class="text-[10px] font-black uppercase text-stone-600">Total Spesies</p>
							<p class="text-2xl font-black text-[#0D0D0D]">{stats.totalSpecies}</p>
							<p class="text-[9px] text-stone-500 font-bold">Spesies Botani</p>
						</div>
						<div class="p-3 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] shadow-[2px_2px_0px_#0D0D0D] text-center">
							<p class="text-[10px] font-black uppercase text-[#0D0D0D]">Total Populasi</p>
							<p class="text-2xl font-black text-[#0D0D0D]">{stats.totalPopulation}</p>
							<p class="text-[9px] text-stone-700 font-bold">Pohon / Rumpun</p>
						</div>
						<div class="p-3 rounded-xl border-2 border-[#0D0D0D] bg-[#F3F6ED] shadow-[2px_2px_0px_#0D0D0D] text-center">
							<p class="text-[10px] font-black uppercase text-stone-600">Familia Botani</p>
							<p class="text-2xl font-black text-[#0D0D0D]">{stats.totalFamilies}</p>
							<p class="text-[9px] text-stone-500 font-bold">Famili Terdokumentasi</p>
						</div>
					</div>

					<!-- Teks Pengantar -->
					<div class="p-4 rounded-xl border border-[#0D0D0D] bg-stone-50 text-xs text-stone-800 leading-relaxed font-medium">
						<p class="mb-2">
							Katalog ini diterbitkan sebagai pedoman identifikasi dan inventarisasi resmi seluruh koleksi flora hidup yang tumbuh di area praktikum agroteknologi SMK Pertanian Pembangunan Negeri Gorontalo. Setiap tanaman didokumentasikan langsung oleh siswa bersama guru pembimbing dengan verifikasi taksonomi ilmiah.
						</p>
						<p>
							Setiap lembar spesimen di dalam buku ini dilengkapi <strong>QR Code Vektor</strong> yang dapat dipindai dengan kamera ponsel untuk membuka video demonstrasi siswa, khasiat herbal lengkap, serta posisi GPS mikro di lahan kebun.
						</p>
					</div>

					<!-- Peta Denah Sekolah -->
					<div>
						<div class="flex items-center justify-between mb-1.5">
							<span class="text-xs font-black uppercase tracking-wide text-[#0D0D0D] flex items-center gap-1.5">
								<MapPin class="w-4 h-4 text-emerald-800" />
								<span>Denah Zonasi Lahan Praktikum SMK PPN Gorontalo</span>
							</span>
							<span class="text-[10px] text-stone-500 font-bold">Skala Indikatif</span>
						</div>
						<div class="w-full aspect-16/9 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] overflow-hidden bg-stone-100">
							<img src="/map-schematic.svg" alt="Denah Kebun Sekolah" class="w-full h-full object-cover" />
						</div>
					</div>
				</div>

				<!-- Running Footer -->
				<div class="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-500">
					<span>Buku Katalog Botani SMK PPN Gorontalo</span>
					<span>Halaman 2</span>
				</div>
			</section>

			<!-- ==================================================================== -->
			<!-- HALAMAN 3: DAFTAR ISI OTOMATIS (TABLE OF CONTENTS)                  -->
			<!-- ==================================================================== -->
			<section class="book-page a4-page bg-white text-[#0D0D0D] p-8 sm:p-10 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col justify-between gap-4">
				<div class="flex flex-col gap-4">
					<!-- Running Header -->
					<div class="flex items-center justify-between pb-2 border-b-2 border-[#0D0D0D] text-[10px] font-black uppercase text-stone-600">
						<span>Daftar Isi &amp; Sistematika Koleksi</span>
						<span>{config.identity.appName} — Hal. 3</span>
					</div>

					<div class="pb-2 border-b-2 border-[#0D0D0D]">
						<h2 class="text-2xl font-black text-[#0D0D0D] tracking-tight">Daftar Isi Katalog</h2>
						<p class="text-xs text-stone-600 font-bold">Indeks Spesies Tanaman Berdasarkan Kategori Budidaya &amp; Nomor Halaman</p>
					</div>

					<!-- Daftar Entri per Kategori -->
					<div class="space-y-4 max-h-[190mm] overflow-hidden">
						{#each categoryGroups as group}
							<div>
								<div class="flex items-center justify-between py-1 px-2.5 rounded-lg bg-[#0D0D0D] text-white text-xs font-black uppercase tracking-wider mb-2">
									<span>{getCategoryBadgeLabel(group.categoryId as any)}</span>
									<span class="text-[10px] text-[#D4F469]">{group.plants.length} Spesies</span>
								</div>

								<div class="space-y-1.5 pl-1">
									{#each group.plants as plant}
										<div class="flex items-baseline justify-between text-xs font-medium text-stone-800">
											<div class="flex items-baseline gap-2 truncate pr-2">
												<span class="font-black text-[#0D0D0D]">{plant.name_local}</span>
												<span class="font-serif italic text-stone-600 text-[11px] truncate">({plant.name_latin})</span>
											</div>
											<div class="grow border-b border-dotted border-stone-400 mx-2 mb-0.5"></div>
											<div class="shrink-0 flex items-center gap-2">
												<span class="text-[10px] text-stone-500 font-bold">{plant.quantity || 1} {plant.unit || 'pohon'}</span>
												<span class="font-black text-[#0D0D0D] w-6 text-right font-mono">
													Hal. {pageMap.get(plant.id) ?? '-'}
												</span>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/each}
					</div>
				</div>

				<!-- Running Footer -->
				<div class="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-500">
					<span>Buku Katalog Botani SMK PPN Gorontalo</span>
					<span>Halaman 3</span>
				</div>
			</section>

			<!-- ==================================================================== -->
			<!-- HALAMAN 4+: LEMBAR ENTRI SPESIMEN TANAMAN                           -->
			<!-- ==================================================================== -->
			{#if activePlants.length === 0}
				<section class="book-page a4-page bg-white text-[#0D0D0D] p-12 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col items-center justify-center text-center gap-4">
					<div class="w-16 h-16 rounded-2xl bg-amber-100 border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D]">
						<Trees class="w-8 h-8 stroke-[2.5]" />
					</div>
					<h3 class="text-xl font-black text-[#0D0D0D]">Tidak Ada Koleksi Tanaman</h3>
					<p class="text-xs text-stone-600 font-semibold max-w-sm">
						Belum ada koleksi tanaman terverifikasi pada filter kategori terpilih untuk dicetak ke lembar buku.
					</p>
				</section>
			{:else if layoutMode === 'encyclopedia'}
				<!-- Mode Ensiklopedia: 1 Spesimen per Halaman A4 -->
				{#each activePlants as plant, idx}
					{@const pageNum = pageMap.get(plant.id) ?? idx + 4}
					<section class="book-page a4-page bg-white text-[#0D0D0D] p-8 sm:p-10 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col justify-between gap-4">
						<div class="flex flex-col gap-3">
							<!-- Running Header -->
							<div class="flex items-center justify-between pb-2 border-b-2 border-[#0D0D0D] text-[10px] font-black uppercase text-stone-600">
								<span>Katalog Botani: {getCategoryBadgeLabel(plant.category)}</span>
								<span>Hal. {pageNum}</span>
							</div>

							<!-- Header Tanaman -->
							<div class="pb-3 border-b-2 border-[#0D0D0D]">
								<div class="flex flex-wrap items-center gap-2 mb-1.5">
									<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#0D0D0D] text-white border border-[#0D0D0D]">
										{getCategoryBadgeLabel(plant.category)}
									</span>
									<span class="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D] flex items-center gap-1">
										<Trees class="w-3 h-3 stroke-[2.5]" />
										<span>Populasi: {plant.quantity || 1} {plant.unit || 'pohon'}</span>
									</span>
									{#if plant.location_label}
										<span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
											📍 {plant.location_label}
										</span>
									{/if}
								</div>
								<h2 class="text-2xl sm:text-3xl font-black text-[#0D0D0D] tracking-tight leading-tight">
									{plant.name_local}
								</h2>
								<div class="flex flex-wrap items-baseline gap-2 mt-0.5">
									<p class="font-serif italic font-bold text-base sm:text-lg text-[#0F3E2E]">
										{plant.name_latin}
									</p>
									{#if plant.name_english}
										<span class="text-xs text-stone-600 font-semibold">• English: {plant.name_english}</span>
									{/if}
									{#if plant.aliases?.length}
										<span class="text-xs text-stone-500 font-medium">• Sinonim: {plant.aliases.join(', ')}</span>
									{/if}
								</div>
							</div>

							<!-- Grid Visual & QR Code Cetak -->
							<div class="grid grid-cols-12 gap-4">
								<!-- Foto Habitus Utama (8 kolom) -->
								<div class="col-span-8 rounded-xl border-2 border-[#0D0D0D] overflow-hidden bg-stone-100 shadow-[2px_2px_0px_#0D0D0D] aspect-16/10">
									<img
										src={plant.photos[0]?.storage_path || '/icons/icon-512.svg'}
										alt={plant.name_local}
										class="w-full h-full object-cover"
									/>
								</div>

								<!-- Kotak QR Code Scan Edukasi (4 kolom) -->
								<div class="col-span-4 rounded-xl border-2 border-[#0D0D0D] bg-[#F3F6ED] p-3 flex flex-col items-center justify-center text-center shadow-[2px_2px_0px_#0D0D0D]">
									{#if qrCodeMap.get(plant.id)}
										<img
											src={qrCodeMap.get(plant.id)}
											alt="QR {plant.name_local}"
											class="w-28 h-28 border border-[#0D0D0D] rounded-lg bg-white p-1 shadow-xs"
										/>
									{:else}
										<div class="w-28 h-28 border border-[#0D0D0D] rounded-lg bg-white flex items-center justify-center">
											<QrCode class="w-12 h-12 text-stone-400" />
										</div>
									{/if}
									<p class="text-[9px] font-black uppercase tracking-wider text-[#0D0D0D] mt-2 leading-tight">
										PINDAI QR RESMI
									</p>
									<p class="text-[8px] text-stone-600 font-semibold mt-0.5 leading-tight">
										Tonton Video Edukasi &amp; Peta Interaktif
									</p>
								</div>
							</div>

							<!-- Tabel Taksonomi 7 Tingkat -->
							<div>
								<p class="text-[10px] font-black uppercase tracking-wider text-[#0D0D0D] mb-1">
									Taksonomi &amp; Klasifikasi Ilmiah:
								</p>
								{@const taxRanks = [
									{ l: 'Kingdom', v: plant.taxonomy.kingdom || 'Plantae', h: false, i: false },
									{ l: 'Divisio', v: plant.taxonomy.divisio || '-', h: false, i: false },
									{ l: 'Classis', v: plant.taxonomy.classis || '-', h: false, i: false },
									{ l: 'Ordo', v: plant.taxonomy.ordo || '-', h: false, i: false },
									{ l: 'Familia', v: plant.taxonomy.familia || '-', h: true, i: false },
									{ l: 'Genus', v: plant.taxonomy.genus || '-', h: false, i: true },
									{ l: 'Species', v: plant.taxonomy.species || plant.name_latin, h: false, i: true }
								]}
								<div class="grid grid-cols-4 sm:grid-cols-7 gap-1 text-center">
									{#each taxRanks as r}
										<div class="p-1.5 rounded-lg border border-[#0D0D0D] {r.h ? 'bg-[#D4F469]/40' : 'bg-stone-50'}">
											<p class="text-[8px] font-black uppercase {r.h ? 'text-stone-700' : 'text-stone-500'}">{r.l}</p>
											<p class="text-[10px] truncate {r.h ? 'font-black text-[#0D0D0D]' : 'font-bold text-[#0D0D0D]'} {r.i ? 'font-serif italic' : ''}">{r.v}</p>
										</div>
									{/each}
								</div>
							</div>

							<!-- Deskripsi & Khasiat Botani -->
							<div>
								<p class="text-[10px] font-black uppercase tracking-wider text-[#0D0D0D] mb-1">
									Deskripsi Botani &amp; Informasi Agroteknologi:
								</p>
								<div class="p-3.5 rounded-xl border border-[#0D0D0D] bg-[#F3F6ED] text-xs leading-relaxed text-stone-800 font-medium">
									{@html formatMarkdown(plant.description)}
								</div>
							</div>
						</div>

						<!-- Running Footer Spesimen -->
						<div class="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-500">
							<div class="flex items-center gap-2">
								<span>Kontributor: <strong class="text-[#0D0D0D]">{plant.contributor_name || 'Siswa SMK PPN Gorontalo'}</strong></span>
							</div>
							<span>Halaman {pageNum}</span>
						</div>
					</section>
				{/each}
			{:else}
				<!-- Mode Kompak: 2 Spesimen per Halaman A4 -->
				{#each Array(Math.ceil(activePlants.length / 2)) as _, pageIdx}
					{@const p1 = activePlants[pageIdx * 2]}
					{@const p2 = activePlants[pageIdx * 2 + 1]}
					{@const pageNum = pageIdx + 4}
					<section class="book-page a4-page bg-white text-[#0D0D0D] p-6 sm:p-8 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col justify-between gap-4">
						<div class="flex flex-col gap-4">
							<!-- Running Header -->
							<div class="flex items-center justify-between pb-1.5 border-b-2 border-[#0D0D0D] text-[10px] font-black uppercase text-stone-600">
								<span>Katalog Kompak Koleksi Botani</span>
								<span>Hal. {pageNum}</span>
							</div>

							<!-- Spesimen Kompak (Maks 2 per Halaman A4) -->
							{#each [p1, p2].filter((p): p is Plant => Boolean(p)) as p (p.id)}
								<div class="p-3.5 rounded-xl border-2 border-[#0D0D0D] bg-stone-50 flex flex-col gap-2">
									<div class="flex items-start justify-between gap-3">
										<div>
											<div class="flex items-center gap-2 mb-0.5">
												<span class="px-2 py-0.2 rounded-md text-[9px] font-black uppercase bg-[#0D0D0D] text-white">
													{getCategoryBadgeLabel(p.category)}
												</span>
												<span class="text-[10px] font-bold text-stone-600">Populasi: {p.quantity || 1} {p.unit || 'pohon'}</span>
											</div>
											<h3 class="text-lg font-black text-[#0D0D0D] leading-tight">{p.name_local}</h3>
											<p class="font-serif italic font-bold text-xs text-[#0F3E2E]">{p.name_latin}</p>
										</div>
										{#if qrCodeMap.get(p.id)}
											<img src={qrCodeMap.get(p.id)} alt="QR" class="w-14 h-14 border border-[#0D0D0D] rounded bg-white p-0.5 shrink-0" />
										{/if}
									</div>

									<div class="grid grid-cols-12 gap-3 items-center">
										<div class="col-span-4 rounded-lg border border-[#0D0D0D] overflow-hidden aspect-4/3 bg-stone-200">
											<img src={p.photos[0]?.storage_path || '/icons/icon-192.svg'} alt={p.name_local} class="w-full h-full object-cover" />
										</div>
										<div class="col-span-8 text-[11px] leading-relaxed text-stone-700 font-medium">
											<p class="font-bold text-[10px] text-[#0D0D0D] mb-0.5">Famili: {p.taxonomy.familia || '-'}</p>
											<p class="line-clamp-3">{p.description}</p>
										</div>
									</div>
								</div>
							{/each}
						</div>

						<!-- Running Footer Kompak -->
						<div class="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-500">
							<span>Katalog Kompak SMK PPN Gorontalo</span>
							<span>Halaman {pageNum}</span>
						</div>
					</section>
				{/each}
			{/if}

			<!-- ==================================================================== -->
			<!-- HALAMAN INDEKS FAMILIA BOTANI                                       -->
			<!-- ==================================================================== -->
			<section class="book-page a4-page bg-white text-[#0D0D0D] p-8 sm:p-10 rounded-2xl sm:shadow-2xl border-2 border-[#0D0D0D] flex flex-col justify-between gap-4">
				<div class="flex flex-col gap-4">
					<!-- Running Header -->
					<div class="flex items-center justify-between pb-2 border-b-2 border-[#0D0D0D] text-[10px] font-black uppercase text-stone-600">
						<span>Indeks Taksonomi Familia</span>
						<span>{config.identity.appName}</span>
					</div>

					<div class="pb-2 border-b-2 border-[#0D0D0D]">
						<h2 class="text-2xl font-black text-[#0D0D0D] tracking-tight">Indeks Familia Botani</h2>
						<p class="text-xs text-stone-600 font-bold">Daftar Spesies Tanaman Berdasarkan Kerabat Familia (Suku Botani)</p>
					</div>

					<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
						{#each familyGroups as fam}
							<div class="p-3 rounded-xl border border-[#0D0D0D] bg-stone-50">
								<div class="flex items-center justify-between pb-1 border-b border-stone-300 mb-2">
									<h4 class="font-black text-xs text-[#0D0D0D] font-serif uppercase tracking-wider">{fam.family}</h4>
									<span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-[#D4F469] border border-[#0D0D0D]">{fam.count}</span>
								</div>
								<ul class="space-y-1 text-xs">
									{#each fam.plants as p}
										<li class="flex items-center justify-between text-[11px]">
											<span class="font-bold text-stone-800 truncate pr-1">{p.name_local}</span>
											<span class="text-stone-500 text-[10px] font-mono shrink-0">Hal. {pageMap.get(p.id) ?? '-'}</span>
										</li>
									{/each}
								</ul>
							</div>
						{/each}
					</div>
				</div>

				<div class="pt-2 border-t border-stone-200 flex items-center justify-between text-[10px] font-bold text-stone-500">
					<span>Buku Katalog Botani SMK PPN Gorontalo</span>
					<span>Indeks Familia</span>
				</div>
			</section>

			<!-- ==================================================================== -->
			<!-- HALAMAN SAMPUL BELAKANG (BACK COVER)                                -->
			<!-- ==================================================================== -->
			<section class="book-page a4-page bg-[#0D0D0D] text-white p-8 sm:p-12 rounded-2xl sm:shadow-2xl border-4 border-[#0D0D0D] relative flex flex-col justify-between overflow-hidden text-center">
				<div class="relative z-10 flex flex-col items-center gap-3 pt-6">
					<div class="w-16 h-16 rounded-2xl bg-[#D4F469] border-2 border-white text-[#0D0D0D] flex items-center justify-center font-black text-3xl shadow-[3px_3px_0px_#ffffff]">
						🌿
					</div>
					<h3 class="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
						{config.identity.appName}
					</h3>
					<p class="text-xs text-stone-300 font-semibold max-w-md">
						Platform Katalog Botani &amp; Agroteknologi Digital Kebun SMK Pertanian Pembangunan Negeri Gorontalo
					</p>
				</div>

				<div class="relative z-10 my-8 flex flex-col items-center gap-3">
					{#if coverQrCode}
						<div class="bg-white p-3 rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#D4F469]">
							<img src={coverQrCode} alt="QR Code Portal" class="w-32 h-32" />
						</div>
					{/if}
					<p class="text-xs font-black text-[#D4F469] uppercase tracking-wider">
						Akses Versi Online &amp; Video Edukasi Siswa
					</p>
					<p class="text-[11px] text-stone-300 font-mono">
						https://botanidex.app
					</p>
				</div>

				<div class="relative z-10 pt-4 border-t-2 border-white/20 text-stone-400 text-[10px] font-medium leading-relaxed">
					<p class="font-bold text-white mb-0.5">{config.identity.schoolName}</p>
					<p>Jalan Agropolitan, Kebun Praktikum Agroteknologi, Provinsi Gorontalo</p>
					<p class="text-stone-500 mt-1">© {new Date().getFullYear()} Hak Cipta Dilindungi Undang-Undang. Dicetak secara otomatis dari Sistem CMS Botanidex.</p>
				</div>
			</section>

		</div>
	</div>
{/if}

<style>
	/* Dimensi Presisi Lembar A4 di Layar */
	.a4-page {
		width: 100%;
		max-width: 210mm;
		min-height: 297mm;
		box-sizing: border-box;
	}

	/* CSS Khusus Mesin Cetak Browser (Print Engine) */
	@media print {
		/* Pastikan warna latar, badge, dan sampul dicetak akurat tanpa pudar */
		:global(*) {
			-webkit-print-color-adjust: exact !important;
			print-color-adjust: exact !important;
		}

		/* Sembunyikan elemen web yang tidak perlu */
		:global(header),
		:global(footer),
		:global(nav),
		:global(.md\:hidden),
		.no-print {
			display: none !important;
		}

		/* Format Ukuran Kertas A4 & Margin Cetak */
		@page {
			size: A4 portrait;
			margin: 10mm 12mm 12mm 12mm;
		}

		/* Reset background dan hilangkan padding layar */
		:global(body),
		.book-container {
			background: white !important;
			padding: 0 !important;
			margin: 0 !important;
		}

		.book-sheet-wrapper {
			gap: 0 !important;
			max-width: 100% !important;
		}

		/* Pembagian Halaman Cetak yang Bersih */
		.book-page {
			page-break-after: always !important;
			break-after: page !important;
			min-height: 100vh !important;
			border: none !important;
			box-shadow: none !important;
			border-radius: 0 !important;
			padding: 0 !important;
			margin-bottom: 0 !important;
		}

		/* Hindari terpotong di tengah halaman */
		.book-page > div {
			page-break-inside: avoid !important;
			break-inside: avoid !important;
		}
	}
</style>
