<!--
  Botanidex — Plant Catalog List Page (Svelte 5 Runes)
  Tujuan: Menampilkan katalog botani lengkap dengan filter kategori dan pencarian instan gaya Neo-Brutalist
  Caller: Route '/katalog'
  Dependensi: PlantService, ConfigService, PlantCard.svelte, FilterChip.svelte
  Main Functions: getCategoryCount
  Side Effects: Membaca query URL (?q= & ?cat=) dan mendengarkan event flora:config-updated
-->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { ConfigService } from '#lib/services/config.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant } from '#lib/types/plant.types';
	import PlantCard from '#lib/components/plant/PlantCard.svelte';
	import FilterChip from '#lib/components/ui/FilterChip.svelte';
	import { Search, X, BookOpen, AlertCircle } from '@lucide/svelte';

	let plants = $state<Plant[]>([...INITIAL_PLANTS_DATA]);
	let searchQuery = $state('');
	let selectedCategory = $state<string>('semua');
	let categories = $state(ConfigService.getCategories());

	$effect(() => {
		const q = page.url.searchParams.get('q');
		const cat = page.url.searchParams.get('cat');
		if (q !== null) searchQuery = q;
		if (cat !== null) selectedCategory = cat;
	});

	onMount(() => {
		const handleConfigChange = (e: any) => { if (e.detail?.categories) categories = e.detail.categories; };
		window.addEventListener('flora:config-updated', handleConfigChange);
		PlantService.getCatalog().then((updated) => { if (updated?.length) plants = updated; }).catch((err) => console.warn('Gagal memuat katalog:', err));
		return () => window.removeEventListener('flora:config-updated', handleConfigChange);
	});

	const filteredPlants = $derived(
		plants.filter((plant) => {
			if (selectedCategory !== 'semua' && plant.category !== selectedCategory) return false;
			const q = searchQuery.toLowerCase().trim();
			if (!q) return true;
			return [plant.name_local, plant.name_latin, plant.name_english, plant.taxonomy.familia, ...(plant.aliases || [])].some((f) => f?.toLowerCase().includes(q));
		})
	);

	const getCategoryCount = (catId: string) => catId === 'semua' ? plants.length : plants.filter((p) => p.category === catId).length;
</script>

<svelte:head><title>Katalog Tanaman — Botanidex</title></svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<h1 class="text-2xl sm:text-3xl font-black text-[#0D0D0D] tracking-tight flex items-center gap-2.5">
			<div class="w-9 h-9 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0"><BookOpen class="w-5 h-5 stroke-[2.5]" /></div>
			<span>Katalog Koleksi Tanaman</span>
		</h1>

		<div class="relative w-full sm:w-88">
			<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-800 stroke-[2.5]" />
			<input bind:value={searchQuery} placeholder="Cari nama lokal, Latin, famili..." class="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm bg-white border-2 border-[#0D0D0D] rounded-full shadow-[2.5px_2.5px_0px_#0D0D0D] focus:shadow-[3.5px_3.5px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D] placeholder:text-stone-400 placeholder:font-medium transition-all" />
			{#if searchQuery}
				<button onclick={() => (searchQuery = '')} class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#0D0D0D] p-1 cursor-pointer" aria-label="Bersihkan pencarian"><X class="w-4 h-4 stroke-[2.5]" /></button>
			{/if}
		</div>
	</div>

	<div class="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar py-1">
		{#each categories as cat (cat.id)}
			<FilterChip active={selectedCategory === cat.id} count={getCategoryCount(cat.id)} onclick={() => (selectedCategory = cat.id)}>
				<span class="w-2 h-2 rounded-full {cat.dotColor}"></span> <span>{cat.label}</span>
			</FilterChip>
		{/each}
	</div>

	<div class="flex items-center justify-between text-xs text-stone-700 font-bold border-b-2 border-[#0D0D0D] pb-3">
		<p class="flex items-center gap-1.5">
			<span class="font-black text-[#0D0D0D] bg-[#D4F469] px-2 py-0.5 rounded-full border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]">{filteredPlants.length}</span>
			<span>dari {plants.length} tanaman</span>
		</p>
		{#if searchQuery || selectedCategory !== 'semua'}
			<button onclick={() => { searchQuery = ''; selectedCategory = 'semua'; }} class="text-[#0D0D0D] hover:bg-[#D4F469] px-2.5 py-1 rounded-full border border-[#0D0D0D] font-black cursor-pointer shadow-[1px_1px_0px_#0D0D0D] transition-colors">Reset Filter</button>
		{/if}
	</div>

	{#if filteredPlants.length > 0}
		<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
			{#each filteredPlants as plant (plant.id)}<PlantCard {plant} />{/each}
		</div>
	{:else}
		<div class="p-10 sm:p-14 text-center bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D] max-w-lg mx-auto flex flex-col items-center gap-3">
			<div class="w-14 h-14 rounded-2xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-[#0D0D0D] flex items-center justify-center"><AlertCircle class="w-7 h-7 stroke-[2.5]" /></div>
			<h3 class="text-lg font-black text-[#0D0D0D]">Tidak Ada Tanaman Ditemukan</h3>
			<p class="text-xs sm:text-sm text-stone-700 font-medium max-w-sm">Coba ubah kata kunci pencarian atau pilih filter rumpun komoditas tanaman yang berbeda.</p>
			<button onclick={() => { searchQuery = ''; selectedCategory = 'semua'; }} class="mt-3 text-xs font-black px-4 py-2.5 bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] rounded-xl border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] hover:shadow-[3.5px_3.5px_0px_#0D0D0D] cursor-pointer transition-all">Tampilkan Semua Tanaman</button>
		</div>
	{/if}
</div>
