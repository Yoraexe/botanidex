<!--
  Botanidex — Interactive School Map Component (Svelte 5 Runes)
  Tujuan: Peta interaktif denah sekolah gaya Neo-Brutalist untuk visualisasi zonasi lahan & lokasi tanaman
  Caller: Halaman /peta
  Dependensi: ConfigService, format.ts, FilterChip.svelte
  Main Functions: zoomIn, zoomOut, resetZoom, handleMouseDown, handleMouseMove
  Side Effects: Mengatur scroll posisi koridor utama dan mendengarkan event flora:config-updated
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlantMarker, SchoolMapInfo } from '#lib/types/map.types';
	import type { CategoryItemConfig } from '#lib/types/config.types';
	import { ConfigService } from '#lib/services/config.service';
	import { getCategoryColorClass, getCategoryBadgeLabel } from '#lib/utils/format';
	import FilterChip from '#lib/components/ui/FilterChip.svelte';
	import { ZoomIn, ZoomOut, RotateCcw, MapPin, X, ArrowRight } from '@lucide/svelte';

	let { mapData }: { mapData: SchoolMapInfo } = $props();

	let zoomLevel = $state(1);
	let activeMarker = $state<PlantMarker | null>(null);
	let selectedCategory = $state<string>('semua');
	let categories = $state<CategoryItemConfig[]>(ConfigService.getCategories());

	let viewportRef = $state<HTMLDivElement | null>(null);
	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;
	let scrollLeft = 0;
	let scrollTop = 0;

	const currentWidth = $derived(Math.round(980 * zoomLevel));
	const filteredMarkers = $derived(
		mapData.markers.filter((m) => selectedCategory === 'semua' || m.category === selectedCategory)
	);

	const getCategoryCount = (catId: string) =>
		catId === 'semua' ? mapData.markers.length : mapData.markers.filter((m) => m.category === catId).length;

	function centerViewport() {
		if (!viewportRef) return;
		const overflowX = viewportRef.scrollWidth - viewportRef.clientWidth;
		viewportRef.scrollLeft = overflowX > 0 ? Math.round(overflowX / 2) : 0;
		viewportRef.scrollTop = 0;
	}

	onMount(() => {
		const handleConfigUpdate = () => (categories = ConfigService.getCategories());
		window.addEventListener('flora:config-updated', handleConfigUpdate);
		centerViewport();
		return () => window.removeEventListener('flora:config-updated', handleConfigUpdate);
	});

	function zoomIn() {
		if (zoomLevel < 2.0) zoomLevel = Number((zoomLevel + 0.25).toFixed(2));
	}

	function zoomOut() {
		if (zoomLevel > 0.75) zoomLevel = Number((zoomLevel - 0.25).toFixed(2));
	}

	function resetZoom() {
		zoomLevel = 1;
		activeMarker = null;
		centerViewport();
	}

	function handleMouseDown(e: MouseEvent) {
		if (e.button !== 0 || (e.target as HTMLElement).closest('button, a') || !viewportRef) return;
		isDragging = true;
		startX = e.pageX - viewportRef.offsetLeft;
		startY = e.pageY - viewportRef.offsetTop;
		scrollLeft = viewportRef.scrollLeft;
		scrollTop = viewportRef.scrollTop;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !viewportRef) return;
		e.preventDefault();
		viewportRef.scrollLeft = scrollLeft - (e.pageX - viewportRef.offsetLeft - startX) * 1.5;
		viewportRef.scrollTop = scrollTop - (e.pageY - viewportRef.offsetTop - startY) * 1.5;
	}
</script>

<div class="relative bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] overflow-hidden flex flex-col">
	<div class="p-4 sm:p-5 border-b-2 border-[#0D0D0D] flex flex-wrap items-center justify-between gap-3 bg-[#F3F6ED]">
		<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1 max-w-full sm:max-w-2xl py-0.5">
			{#each categories as cat (cat.id)}
				<FilterChip active={selectedCategory === cat.id} count={getCategoryCount(cat.id)} onclick={() => (selectedCategory = cat.id)}>
					<span class="w-2 h-2 rounded-full {cat.dotColor}"></span>
					<span>{cat.label}</span>
				</FilterChip>
			{/each}
		</div>

		<div class="flex items-center gap-1.5 ml-auto shrink-0 bg-white p-1 rounded-xl border border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
			<button type="button" onclick={zoomIn} disabled={zoomLevel >= 2.0} class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#D4F469] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5" title="Perbesar Peta (+25%)" aria-label="Zoom in">
				<ZoomIn class="w-4 h-4 stroke-[2.5]" />
			</button>
			<span class="text-xs font-black px-2 text-[#0D0D0D] min-w-10 text-center select-none">{Math.round(zoomLevel * 100)}%</span>
			<button type="button" onclick={zoomOut} disabled={zoomLevel <= 0.75} class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#D4F469] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5" title="Perkecil Peta (-25%)" aria-label="Zoom out">
				<ZoomOut class="w-4 h-4 stroke-[2.5]" />
			</button>
			<button type="button" onclick={resetZoom} class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#D4F469] transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5" title="Reset Posisi &amp; Skala" aria-label="Reset zoom">
				<RotateCcw class="w-4 h-4 stroke-[2.5]" />
			</button>
		</div>
	</div>

	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={viewportRef}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={() => (isDragging = false)}
		onmouseleave={() => (isDragging = false)}
		role="region"
		aria-label="Peta Interaktif Lahan Praktikum SMK PPN Gorontalo"
		class="relative w-full overflow-auto bg-[#F8F9F5] retro-grid-bg p-4 sm:p-6 select-none {isDragging ? 'cursor-grabbing' : 'cursor-grab'}"
		style="min-height: 480px; max-height: 75vh;"
	>
		<div class="mx-auto block" style="width: {currentWidth}px; min-width: {currentWidth}px;">
			<div class="relative transition-all duration-150">
				<img src={mapData.image_url} alt={mapData.title} class="w-full h-auto rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] select-none pointer-events-none bg-white block" />

				{#each filteredMarkers as marker (marker.plant_id)}
					{@const colors = getCategoryColorClass(marker.category)}
					{@const isSelected = activeMarker?.plant_id === marker.plant_id}
					<button
						type="button"
						onclick={(e) => {
							e.stopPropagation();
							activeMarker = marker;
						}}
						class="absolute -translate-x-1/2 -translate-y-full group cursor-pointer transition-all focus:outline-none z-20 {isSelected ? 'scale-115 z-30' : 'hover:scale-110'}"
						style="left: {marker.x}%; top: {marker.y}%;"
						title="{marker.name_local} ({marker.name_latin})"
					>
						<div class="absolute -inset-1 rounded-full animate-ping opacity-35 bg-[#0D0D0D]"></div>
						<div class="relative px-2.5 py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] border-2 border-[#0D0D0D] flex items-center gap-1.5 text-xs font-black text-[#0D0D0D] whitespace-nowrap {colors.bg} {isSelected ? 'ring-2 ring-[#0D0D0D] shadow-[3.5px_3.5px_0px_#0D0D0D]' : ''}">
							<MapPin class="w-3.5 h-3.5 fill-[#0D0D0D] text-transparent" />
							<span class="max-w-[130px] truncate">{marker.name_local}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	{#if activeMarker}
		{@const colors = getCategoryColorClass(activeMarker.category)}
		<div class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-92 bg-white rounded-2xl shadow-[6px_6px_0px_#0D0D0D] border-2 border-[#0D0D0D] p-4 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200">
			<div class="flex items-start gap-3">
				<img src={activeMarker.thumbnail_url} alt={activeMarker.name_local} class="w-18 h-18 rounded-xl object-cover border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] shrink-0" />
				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#0D0D0D] {colors.bg} text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]">
							{getCategoryBadgeLabel(activeMarker.category)}
						</span>
						<button onclick={() => (activeMarker = null)} class="text-stone-500 hover:text-[#0D0D0D] p-1 rounded-lg border border-transparent hover:border-[#0D0D0D] cursor-pointer" aria-label="Tutup preview">
							<X class="w-4 h-4 stroke-[2.5]" />
						</button>
					</div>
					<h4 class="font-black text-sm sm:text-base text-[#0D0D0D] mt-1.5 truncate">{activeMarker.name_local}</h4>
					<p class="font-latin italic text-xs text-stone-700 truncate font-semibold">{activeMarker.name_latin}</p>
					{#if activeMarker.location_label}
						<p class="text-[11px] text-stone-600 mt-1.5 flex items-center gap-1 truncate font-bold">
							<MapPin class="w-3.5 h-3.5 text-[#0D0D0D] shrink-0" />
							<span>{activeMarker.location_label}</span>
						</p>
					{/if}
				</div>
			</div>

			<a href="/katalog/{activeMarker.slug}" class="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] text-xs font-black flex items-center justify-center gap-2 border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all">
				<span>Buka Profil Tanaman</span>
				<ArrowRight class="w-4 h-4 stroke-[2.5]" />
			</a>
		</div>
	{/if}
</div>
