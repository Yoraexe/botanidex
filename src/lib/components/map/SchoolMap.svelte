<!--
  Flora SMK — Interactive School Map Component (Svelte 5 Runes)
  Tujuan: Peta interaktif denah sekolah gaya Neo-Brutalist untuk visualisasi lokasi tanaman dan kebun praktikum
  Caller: Halaman /peta
  BRD Ref: F4 (Peta Lokasi Tanaman)
-->
<script lang="ts">
	import type { PlantMarker, SchoolMapInfo } from '#lib/types/map.types';
	import type { PlantCategory } from '#lib/types/plant.types';
	import { getCategoryColorClass, getCategoryBadgeLabel } from '#lib/utils/format';
	import { ZoomIn, ZoomOut, RotateCcw, MapPin, X, ArrowRight, Layers } from '@lucide/svelte';

	interface Props {
		mapData: SchoolMapInfo;
	}

	let { mapData }: Props = $props();

	let zoomLevel = $state(1);
	let activeMarker = $state<PlantMarker | null>(null);
	let selectedCategory = $state<PlantCategory | 'semua'>('semua');

	const filteredMarkers = $derived(
		mapData.markers.filter((m) => {
			if (selectedCategory === 'semua') return true;
			return m.category === selectedCategory;
		})
	);

	function zoomIn() {
		if (zoomLevel < 2.5) zoomLevel = Number((zoomLevel + 0.25).toFixed(2));
	}

	function zoomOut() {
		if (zoomLevel > 0.75) zoomLevel = Number((zoomLevel - 0.25).toFixed(2));
	}

	function resetZoom() {
		zoomLevel = 1;
		activeMarker = null;
	}
</script>

<div class="relative w-full rounded-2xl overflow-hidden bg-[#FFFEF9] border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B] flex flex-col">
	<!-- Map Top Controls Bar -->
	<div class="p-3 bg-[#FFFEF9] border-b-2 border-[#18181B] flex flex-wrap items-center justify-between gap-3 z-10">
		<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
			<span class="text-xs font-black text-stone-900 mr-1 flex items-center gap-1 uppercase">
				<Layers class="w-4 h-4 stroke-[2.5]" /> Filter:
			</span>
			{#each ['semua', 'obat', 'pangan', 'hias', 'industri', 'kayu'] as cat}
				<button
					type="button"
					onclick={() => (selectedCategory = cat as any)}
					class="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all cursor-pointer border-2 border-[#18181B] select-none {selectedCategory === cat
						? 'bg-[#F6BD60] text-stone-900 shadow-[2px_2px_0px_#18181B] -translate-y-0.5'
						: 'bg-white text-stone-700 shadow-[1px_1px_0px_#18181B] hover:bg-[#F7F2E7]'}"
				>
					{cat === 'semua' ? 'Semua' : cat}
				</button>
			{/each}
		</div>

		<!-- Zoom Controls -->
		<div class="flex items-center gap-1.5 bg-[#F7F2E7] p-1.5 rounded-xl border-2 border-[#18181B]">
			<button
				type="button"
				onclick={zoomIn}
				class="p-1.5 bg-white border border-[#18181B] rounded-lg text-stone-900 hover:bg-[#F6BD60] transition-colors cursor-pointer shadow-[1px_1px_0px_#18181B]"
				title="Perbesar"
				aria-label="Zoom in"
			>
				<ZoomIn class="w-4 h-4 stroke-[2.5]" />
			</button>
			<button
				type="button"
				onclick={zoomOut}
				class="p-1.5 bg-white border border-[#18181B] rounded-lg text-stone-900 hover:bg-[#F6BD60] transition-colors cursor-pointer shadow-[1px_1px_0px_#18181B]"
				title="Perkecil"
				aria-label="Zoom out"
			>
				<ZoomOut class="w-4 h-4 stroke-[2.5]" />
			</button>
			<button
				type="button"
				onclick={resetZoom}
				class="p-1.5 bg-white border border-[#18181B] rounded-lg text-stone-900 hover:bg-[#F6BD60] transition-colors cursor-pointer shadow-[1px_1px_0px_#18181B]"
				title="Reset Posisi"
				aria-label="Reset zoom"
			>
				<RotateCcw class="w-4 h-4 stroke-[2.5]" />
			</button>
		</div>
	</div>

	<!-- Scrollable Map Canvas Area -->
	<div class="relative w-full overflow-auto max-h-[70vh] min-h-[440px] bg-[#F7F2E7] retro-grid-bg flex items-center justify-center p-6">
		<div
			class="relative inline-block transition-transform duration-200 origin-top-left"
			style="transform: scale({zoomLevel});"
		>
			<!-- Base Map Image (Schematic SVG of school) -->
			<img
				src={mapData.image_url}
				alt={mapData.title}
				class="max-w-none w-[900px] sm:w-[1000px] h-auto rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] select-none pointer-events-none bg-white"
			/>

			<!-- Plant Markers Overlaid on Percentage Coordinates -->
			{#each filteredMarkers as marker (marker.plant_id)}
				{@const colors = getCategoryColorClass(marker.category)}
				<button
					type="button"
					onclick={() => (activeMarker = marker)}
					class="absolute -translate-x-1/2 -translate-y-full group cursor-pointer transition-transform hover:scale-115 focus:outline-none z-20"
					style="left: {marker.x}%; top: {marker.y}%;"
					title="{marker.name_local} ({marker.name_latin})"
				>
					<!-- Animated Ping Ring -->
					<div
						class="absolute -inset-1 rounded-xl animate-ping opacity-50 bg-[#18181B]"
					></div>

					<!-- Marker Pin Tag -->
					<div
						class="relative px-2.5 py-1 rounded-xl shadow-[2.5px_2.5px_0px_#18181B] border-2 border-[#18181B] flex items-center gap-1.5 text-xs font-black text-stone-900 whitespace-nowrap {colors.bg}"
					>
						<MapPin class="w-3.5 h-3.5 fill-[#18181B] text-transparent" />
						<span class="max-w-[120px] truncate">{marker.name_local}</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Active Marker Popup Preview Card -->
	{#if activeMarker}
		{@const colors = getCategoryColorClass(activeMarker.category)}
		<div
			class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-88 bg-[#FFFEF9] rounded-2xl shadow-[6px_6px_0px_#18181B] border-2 border-[#18181B] p-4 z-30"
		>
			<div class="flex items-start gap-3">
				<img
					src={activeMarker.thumbnail_url}
					alt={activeMarker.name_local}
					class="w-18 h-18 rounded-xl object-cover border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] shrink-0"
				/>

				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#18181B] {colors.bg} text-stone-900">
							{getCategoryBadgeLabel(activeMarker.category)}
						</span>
						<button
							onclick={() => (activeMarker = null)}
							class="text-stone-500 hover:text-stone-900 p-1 rounded-lg border border-transparent hover:border-[#18181B] cursor-pointer"
							aria-label="Tutup preview"
						>
							<X class="w-4 h-4 stroke-[2.5]" />
						</button>
					</div>

					<h4 class="font-black text-sm sm:text-base text-stone-900 mt-1 truncate">
						{activeMarker.name_local}
					</h4>
					<p class="font-latin italic text-xs text-stone-700 truncate font-semibold">
						{activeMarker.name_latin}
					</p>
					{#if activeMarker.location_label}
						<p class="text-[11px] text-stone-600 mt-1 flex items-center gap-1 truncate font-bold">
							<MapPin class="w-3.5 h-3.5 text-stone-900 shrink-0" />
							<span>{activeMarker.location_label}</span>
						</p>
					{/if}
				</div>
			</div>

			<a
				href="/katalog/{activeMarker.slug}"
				class="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-[#6BB092] hover:bg-[#5da284] text-stone-900 text-xs font-black flex items-center justify-center gap-2 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all"
			>
				<span>Buka Profil Tanaman Lengkap</span>
				<ArrowRight class="w-4 h-4 stroke-[2.5]" />
			</a>
		</div>
	{/if}
</div>
