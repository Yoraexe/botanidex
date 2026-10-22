<!--
  Flora SMK — Plant Catalog List Page (Svelte 5 Runes)
  Tujuan: Menampilkan katalog botani lengkap dengan filter kategori dan pencarian instan
  Caller: Route '/katalog'
  BRD Ref: F1 (Katalog Tanaman)
-->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant, PlantCategory } from '#lib/types/plant.types';
	import PlantCard from '#lib/components/plant/PlantCard.svelte';
	import FilterChip from '#lib/components/ui/FilterChip.svelte';
	import { Search, X, BookOpen, AlertCircle, RefreshCw } from '@lucide/svelte';

	let plants = $state<Plant[]>([...INITIAL_PLANTS_DATA]);
	let isLoading = $state(false);
	let searchQuery = $state('');
	let selectedCategory = $state<PlantCategory | 'semua'>('semua');

	onMount(async () => {
		// Baca initial query param jika ada (misal dari /katalog?q=... atau /katalog?cat=...)
		const urlParams = page.url.searchParams;
		const queryParam = urlParams.get('q');
		const catParam = urlParams.get('cat') as PlantCategory | null;

		if (queryParam) searchQuery = queryParam;
		if (catParam) selectedCategory = catParam;

		await loadPlants();
	});

	async function loadPlants() {
		try {
			const updated = await PlantService.getCatalog();
			if (updated && updated.length > 0) {
				plants = updated;
			}
		} catch (err) {
			console.warn('Gagal memuat katalog:', err);
		}
	}

	const filteredPlants = $derived(
		plants.filter((plant) => {
			if (selectedCategory !== 'semua' && plant.category !== selectedCategory) {
				return false;
			}
			if (searchQuery.trim().length > 0) {
				const q = searchQuery.toLowerCase().trim();
				const matchName = plant.name_local.toLowerCase().includes(q);
				const matchLatin = plant.name_latin.toLowerCase().includes(q);
				const matchEn = plant.name_english?.toLowerCase().includes(q);
				const matchFamily = plant.taxonomy.familia?.toLowerCase().includes(q);
				const matchAlias = plant.aliases?.some((a) => a.toLowerCase().includes(q));
				if (!matchName && !matchLatin && !matchEn && !matchFamily && !matchAlias) {
					return false;
				}
			}
			return true;
		})
	);

	const categoryCounts = $derived({
		semua: plants.length,
		obat: plants.filter((p) => p.category === 'obat').length,
		pangan: plants.filter((p) => p.category === 'pangan').length,
		hias: plants.filter((p) => p.category === 'hias').length,
		industri: plants.filter((p) => p.category === 'industri').length,
		kayu: plants.filter((p) => p.category === 'kayu').length
	});
</script>

<svelte:head>
	<title>Katalog Tanaman — Flora SMK</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
				<BookOpen class="w-7 h-7 text-emerald-600" />
				Katalog Koleksi Tanaman
			</h1>
			<p class="text-xs sm:text-sm text-stone-500 mt-1">
				Seluruh koleksi tanaman, pohon, dan flora budidaya di area SMK Pertanian
			</p>
		</div>

		<!-- Live Search Input -->
		<div class="relative w-full sm:w-80">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
			<input
				bind:value={searchQuery}
				placeholder="Cari nama lokal, Latin, famili..."
				class="w-full pl-9 pr-9 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-xs"
			/>
			{#if searchQuery}
				<button
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5"
					aria-label="Bersihkan pencarian"
				>
					<X class="w-4 h-4" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Category Filter Chips -->
	<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
		<FilterChip
			active={selectedCategory === 'semua'}
			count={categoryCounts.semua}
			onclick={() => (selectedCategory = 'semua')}
		>
			Semua Tanaman
		</FilterChip>
		<FilterChip
			active={selectedCategory === 'obat'}
			count={categoryCounts.obat}
			onclick={() => (selectedCategory = 'obat')}
		>
			Tanaman Obat (TOGA)
		</FilterChip>
		<FilterChip
			active={selectedCategory === 'pangan'}
			count={categoryCounts.pangan}
			onclick={() => (selectedCategory = 'pangan')}
		>
			Tanaman Pangan
		</FilterChip>
		<FilterChip
			active={selectedCategory === 'hias'}
			count={categoryCounts.hias}
			onclick={() => (selectedCategory = 'hias')}
		>
			Florikultura (Hias)
		</FilterChip>
		<FilterChip
			active={selectedCategory === 'industri'}
			count={categoryCounts.industri}
			onclick={() => (selectedCategory = 'industri')}
		>
			Perkebunan / Industri
		</FilterChip>
		<FilterChip
			active={selectedCategory === 'kayu'}
			count={categoryCounts.kayu}
			onclick={() => (selectedCategory = 'kayu')}
		>
			Kayu &amp; Kehutanan
		</FilterChip>
	</div>

	<!-- Results Count & Active Filters -->
	<div class="flex items-center justify-between text-xs text-stone-500 border-b border-stone-200 pb-3">
		<p>
			Menampilkan <span class="font-bold text-stone-900">{filteredPlants.length}</span> dari {plants.length} tanaman terdaftar
		</p>
		{#if searchQuery || selectedCategory !== 'semua'}
			<button
				onclick={() => {
					searchQuery = '';
					selectedCategory = 'semua';
				}}
				class="text-emerald-700 hover:underline font-semibold cursor-pointer"
			>
				Reset Filter
			</button>
		{/if}
	</div>

	<!-- Plant Cards Grid -->
	{#if isLoading}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as _}
				<div class="bg-white rounded-xl border border-stone-200 p-4 h-72 animate-pulse"></div>
			{/each}
		</div>
	{:else if filteredPlants.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
			{#each filteredPlants as plant (plant.id)}
				<PlantCard {plant} />
			{/each}
		</div>
	{:else}
		<!-- Empty State -->
		<div class="p-12 text-center bg-white rounded-2xl border border-stone-200 max-w-lg mx-auto flex flex-col items-center gap-3">
			<div class="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center">
				<AlertCircle class="w-6 h-6" />
			</div>
			<h3 class="text-base font-bold text-stone-900">Tidak ada tanaman ditemukan</h3>
			<p class="text-xs text-stone-500">
				Coba ubah kata kunci pencarian atau pilih kategori tanaman yang berbeda.
			</p>
			<button
				onclick={() => {
					searchQuery = '';
					selectedCategory = 'semua';
				}}
				class="mt-2 text-xs font-semibold px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-100 transition-colors cursor-pointer"
			>
				Tampilkan Semua Tanaman
			</button>
		</div>
	{/if}
</div>
