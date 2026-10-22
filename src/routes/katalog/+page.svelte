<!--
  Flora SMK — Plant Catalog List Page (Svelte 5 Runes)
  Tujuan: Menampilkan katalog botani lengkap dengan filter kategori dan pencarian instan gaya Neo-Brutalist
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
			<h1 class="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-[#F6BD60] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-stone-900 shrink-0">
					<BookOpen class="w-5 h-5 stroke-[2.5]" />
				</div>
				Katalog Koleksi Tanaman
			</h1>
			<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
				Seluruh koleksi tanaman, pohon, dan flora budidaya di area SMK Pertanian
			</p>
		</div>

		<!-- Live Search Input -->
		<div class="relative w-full sm:w-88">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-800 stroke-[2.5]" />
			<input
				bind:value={searchQuery}
				placeholder="Cari nama lokal, Latin, famili..."
				class="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border-2 border-[#18181B] rounded-xl shadow-[3px_3px_0px_#18181B] focus:shadow-[4px_4px_0px_#18181B] outline-none font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-medium"
			/>
			{#if searchQuery}
				<button
					onclick={() => (searchQuery = '')}
					class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-900 p-1 cursor-pointer"
					aria-label="Bersihkan pencarian"
				>
					<X class="w-4 h-4 stroke-[2.5]" />
				</button>
			{/if}
		</div>
	</div>

	<!-- Category Filter Chips -->
	<div class="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar py-1">
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
	<div class="flex items-center justify-between text-xs text-stone-700 font-bold border-b-2 border-[#18181B] pb-3">
		<p>
			Menampilkan <span class="font-black text-stone-900 bg-[#F6BD60] px-1.5 py-0.5 rounded border border-[#18181B]">{filteredPlants.length}</span> dari {plants.length} tanaman terdaftar
		</p>
		{#if searchQuery || selectedCategory !== 'semua'}
			<button
				onclick={() => {
					searchQuery = '';
					selectedCategory = 'semua';
				}}
				class="text-stone-900 hover:bg-[#F6BD60] px-2 py-1 rounded-md border border-[#18181B] font-black cursor-pointer shadow-[1px_1px_0px_#18181B]"
			>
				Reset Filter
			</button>
		{/if}
	</div>

	<!-- Plant Cards Grid -->
	{#if isLoading}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
			{#each [1, 2, 3, 4, 5, 6, 7, 8] as _}
				<div class="bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 h-72 animate-pulse"></div>
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
		<div class="p-10 sm:p-14 text-center bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B] max-w-lg mx-auto flex flex-col items-center gap-3">
			<div class="w-14 h-14 rounded-2xl bg-[#F6BD60] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-stone-900 flex items-center justify-center">
				<AlertCircle class="w-7 h-7 stroke-[2.5]" />
			</div>
			<h3 class="text-lg font-black text-stone-900">Tidak Ada Tanaman Ditemukan</h3>
			<p class="text-xs sm:text-sm text-stone-700 font-medium max-w-sm">
				Coba ubah kata kunci pencarian atau pilih filter rumpun komoditas tanaman yang berbeda.
			</p>
			<button
				onclick={() => {
					searchQuery = '';
					selectedCategory = 'semua';
				}}
				class="mt-3 text-xs font-black px-4 py-2.5 bg-[#6BB092] text-stone-900 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] hover:shadow-[3.5px_3.5px_0px_#18181B] cursor-pointer"
			>
				Tampilkan Semua Tanaman
			</button>
		</div>
	{/if}
</div>
