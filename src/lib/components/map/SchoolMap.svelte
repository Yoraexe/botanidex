<!--
  Flora SMK — Interactive School Map Component (Svelte 5 Runes)
  Tujuan: Peta interaktif denah sekolah untuk visualisasi lokasi tanaman dan kebun praktikum
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

<div class="relative w-full rounded-2xl overflow-hidden bg-stone-100 border border-stone-200 shadow-sm flex flex-col">
	<!-- Map Top Controls Bar -->
	<div class="p-3 bg-white/95 backdrop-blur-md border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 z-10">
		<div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
			<span class="text-xs font-bold text-stone-500 mr-1 flex items-center gap-1">
				<Layers class="w-3.5 h-3.5" /> Filter:
			</span>
			{#each ['semua', 'obat', 'pangan', 'hias', 'industri', 'kayu'] as cat}
				<button
					type="button"
					onclick={() => (selectedCategory = cat as any)}
					class="px-2.5 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider transition-colors cursor-pointer {selectedCategory === cat
						? 'bg-emerald-600 text-white shadow-xs'
						: 'bg-stone-100 text-stone-600 hover:bg-stone-200'}"
				>
					{cat === 'semua' ? 'Semua' : cat}
				</button>
			{/each}
		</div>

		<!-- Zoom Controls -->
		<div class="flex items-center gap-1 bg-stone-100 p-1 rounded-lg">
			<button
				type="button"
				onclick={zoomIn}
				class="p-1.5 hover:bg-white rounded-md text-stone-700 transition-colors"
				title="Perbesar"
				aria-label="Zoom in"
			>
				<ZoomIn class="w-4 h-4" />
			</button>
			<button
				type="button"
				onclick={zoomOut}
				class="p-1.5 hover:bg-white rounded-md text-stone-700 transition-colors"
				title="Perkecil"
				aria-label="Zoom out"
			>
				<ZoomOut class="w-4 h-4" />
			</button>
			<button
				type="button"
				onclick={resetZoom}
				class="p-1.5 hover:bg-white rounded-md text-stone-700 transition-colors"
				title="Reset Posisi"
				aria-label="Reset zoom"
			>
				<RotateCcw class="w-4 h-4" />
			</button>
		</div>
	</div>

	<!-- Scrollable Map Canvas Area -->
	<div class="relative w-full overflow-auto max-h-[70vh] min-h-[420px] bg-stone-50 flex items-center justify-center p-4">
		<div
			class="relative inline-block transition-transform duration-200 origin-top-left"
			style="transform: scale({zoomLevel});"
		>
			<!-- Base Map Image (Schematic SVG of school) -->
			<img
				src={mapData.image_url}
				alt={mapData.title}
				class="max-w-none w-[900px] sm:w-[1000px] h-auto rounded-xl shadow-xs select-none pointer-events-none"
			/>

			<!-- Plant Markers Overlaid on Percentage Coordinates -->
			{#each filteredMarkers as marker (marker.plant_id)}
				{@const colors = getCategoryColorClass(marker.category)}
				<button
					type="button"
					onclick={() => (activeMarker = marker)}
					class="absolute -translate-x-1/2 -translate-y-full group cursor-pointer transition-transform hover:scale-125 focus:outline-none z-20"
					style="left: {marker.x}%; top: {marker.y}%;"
					title="{marker.name_local} ({marker.name_latin})"
				>
					<!-- Animated Pulse Ring -->
					<div
						class="absolute -inset-1 rounded-full animate-ping opacity-60"
						style="background-color: {colors.dot};"
					></div>

					<!-- Marker Icon Pin -->
					<div
						class="relative px-2 py-1 rounded-lg shadow-md border-2 border-white flex items-center gap-1 text-[11px] font-bold text-white whitespace-nowrap"
						style="background-color: {colors.dot};"
					>
						<MapPin class="w-3.5 h-3.5 fill-white text-transparent" />
						<span class="hidden sm:inline-block max-w-[100px] truncate">{marker.name_local}</span>
					</div>
				</button>
			{/each}
		</div>
	</div>

	<!-- Active Marker Popup Preview Card -->
	{#if activeMarker}
		{@const colors = getCategoryColorClass(activeMarker.category)}
		<div
			class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 bg-white rounded-2xl shadow-xl border border-stone-200 p-4 z-30 animate-in fade-in slide-in-from-bottom-3 duration-200"
		>
			<div class="flex items-start gap-3">
				<img
					src={activeMarker.thumbnail_url}
					alt={activeMarker.name_local}
					class="w-16 h-16 rounded-xl object-cover border border-stone-200 shrink-0"
				/>

				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm {colors.bg} {colors.text}">
							{getCategoryBadgeLabel(activeMarker.category)}
						</span>
						<button
							onclick={() => (activeMarker = null)}
							class="text-stone-400 hover:text-stone-700 p-1 rounded-md"
							aria-label="Tutup preview"
						>
							<X class="w-4 h-4" />
						</button>
					</div>

					<h4 class="font-bold text-sm text-stone-900 mt-1 truncate">
						{activeMarker.name_local}
					</h4>
					<p class="font-latin italic text-xs text-stone-500 truncate">
						{activeMarker.name_latin}
					</p>
					{#if activeMarker.location_label}
						<p class="text-[11px] text-stone-600 mt-1 flex items-center gap-1 truncate">
							<MapPin class="w-3 h-3 text-emerald-600 shrink-0" />
							<span>{activeMarker.location_label}</span>
						</p>
					{/if}
				</div>
			</div>

			<a
				href="/katalog/{activeMarker.slug}"
				class="mt-3 w-full py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
			>
				<span>Buka Profil Tanaman Lengkap</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>
	{/if}
</div>
