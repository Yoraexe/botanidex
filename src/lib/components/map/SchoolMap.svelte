<!--
  Flora SMK — Interactive School Map Component (Svelte 5 Runes)
  Tujuan: Peta interaktif denah sekolah gaya Neo-Brutalist untuk visualisasi zonasi lahan & lokasi tanaman
  Caller: Halaman /peta
  BRD Ref: F4 (Peta Lokasi Tanaman)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { PlantMarker, SchoolMapInfo } from '#lib/types/map.types';
	import type { CategoryItemConfig } from '#lib/types/config.types';
	import { ConfigService } from '#lib/services/config.service';
	import { getCategoryColorClass, getCategoryBadgeLabel } from '#lib/utils/format';
	import FilterChip from '#lib/components/ui/FilterChip.svelte';
	import { ZoomIn, ZoomOut, RotateCcw, MapPin, X, ArrowRight, Layers } from '@lucide/svelte';

	interface Props {
		mapData: SchoolMapInfo;
	}

	let { mapData }: Props = $props();

	// Zoom & Navigation State
	let zoomLevel = $state(1);
	let activeMarker = $state<PlantMarker | null>(null);
	let selectedCategory = $state<string>('semua');
	let categories = $state<CategoryItemConfig[]>(ConfigService.getCategories());

	// Drag & Pan state
	let viewportRef = $state<HTMLDivElement | null>(null);
	let isDragging = $state(false);
	let startX = 0;
	let startY = 0;
	let scrollLeft = 0;
	let scrollTop = 0;

	const baseWidth = 980;
	const currentWidth = $derived(Math.round(baseWidth * zoomLevel));

	// Sinkronisasi kategori dengan event dinamis CMS
	onMount(() => {
		categories = ConfigService.getCategories();

		const handleConfigUpdate = () => {
			categories = ConfigService.getCategories();
		};
		window.addEventListener('flora:config-updated', handleConfigUpdate);

		// Center horizontal scroll saat awal muat agar langsung fokus ke koridor utama
		if (viewportRef) {
			const overflowX = viewportRef.scrollWidth - viewportRef.clientWidth;
			if (overflowX > 0) {
				viewportRef.scrollLeft = Math.round(overflowX / 2);
			}
			viewportRef.scrollTop = 0;
		}

		return () => {
			window.removeEventListener('flora:config-updated', handleConfigUpdate);
		};
	});

	const filteredMarkers = $derived(
		mapData.markers.filter((m) => {
			if (selectedCategory === 'semua') return true;
			return m.category === selectedCategory;
		})
	);

	const getCategoryCount = (catId: string) => {
		if (catId === 'semua') return mapData.markers.length;
		return mapData.markers.filter((m) => m.category === catId).length;
	};

	function zoomIn() {
		if (zoomLevel < 2.0) {
			zoomLevel = Number((zoomLevel + 0.25).toFixed(2));
		}
	}

	function zoomOut() {
		if (zoomLevel > 0.75) {
			zoomLevel = Number((zoomLevel - 0.25).toFixed(2));
		}
	}

	function resetZoom() {
		zoomLevel = 1;
		activeMarker = null;
		if (viewportRef) {
			viewportRef.scrollTop = 0;
			const overflowX = viewportRef.scrollWidth - viewportRef.clientWidth;
			viewportRef.scrollLeft = overflowX > 0 ? Math.round(overflowX / 2) : 0;
		}
	}

	function handleMouseDown(e: MouseEvent) {
		// Abaikan jika klik berasal dari tombol kontrol, marker, atau preview link
		if (e.button !== 0 || (e.target as HTMLElement).closest('button, a')) return;
		if (!viewportRef) return;
		isDragging = true;
		startX = e.pageX - viewportRef.offsetLeft;
		startY = e.pageY - viewportRef.offsetTop;
		scrollLeft = viewportRef.scrollLeft;
		scrollTop = viewportRef.scrollTop;
	}

	function handleMouseMove(e: MouseEvent) {
		if (!isDragging || !viewportRef) return;
		e.preventDefault();
		const x = e.pageX - viewportRef.offsetLeft;
		const y = e.pageY - viewportRef.offsetTop;
		const walkX = x - startX;
		const walkY = y - startY;
		viewportRef.scrollLeft = scrollLeft - walkX;
		viewportRef.scrollTop = scrollTop - walkY;
	}

	function handleMouseUp() {
		isDragging = false;
	}
</script>

<div class="relative w-full rounded-2xl overflow-hidden bg-[#FFFEF9] border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D] flex flex-col">
	<!-- Map Top Controls Bar -->
	<div class="p-3 bg-[#FFFEF9] border-b-2 border-[#0D0D0D] flex flex-wrap items-center justify-between gap-3 z-10">
		<!-- Category Filter Chips (Dynamic from CMS) -->
		<div class="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
			<Layers class="w-4 h-4 stroke-[2.5] text-[#0D0D0D] shrink-0 mr-0.5" />
			{#each categories as cat (cat.id)}
				<FilterChip
					active={selectedCategory === cat.id}
					count={getCategoryCount(cat.id)}
					onclick={() => {
						selectedCategory = cat.id;
					}}
				>
					<span class="w-2 h-2 rounded-full {cat.dotColor}"></span>
					<span>{cat.label}</span>
				</FilterChip>
			{/each}
		</div>

		<!-- Zoom Controls -->
		<div class="flex items-center gap-1.5 bg-[#F7F2E7] p-1.5 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] shrink-0">
			<button
				type="button"
				onclick={zoomIn}
				disabled={zoomLevel >= 2.0}
				class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#E2EF46] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5"
				title="Perbesar Peta (+25%)"
				aria-label="Zoom in"
			>
				<ZoomIn class="w-4 h-4 stroke-[2.5]" />
			</button>
			<span class="px-2 py-0.5 text-[11px] font-black text-stone-900 bg-white border border-[#0D0D0D] rounded-md shadow-[1px_1px_0px_#0D0D0D] select-none min-w-[46px] text-center">
				{Math.round(zoomLevel * 100)}%
			</span>
			<button
				type="button"
				onclick={zoomOut}
				disabled={zoomLevel <= 0.75}
				class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#E2EF46] disabled:opacity-40 disabled:hover:bg-white transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5"
				title="Perkecil Peta (-25%)"
				aria-label="Zoom out"
			>
				<ZoomOut class="w-4 h-4 stroke-[2.5]" />
			</button>
			<button
				type="button"
				onclick={resetZoom}
				class="p-1.5 bg-white border border-[#0D0D0D] rounded-lg text-stone-900 hover:bg-[#E2EF46] transition-colors cursor-pointer shadow-[1px_1px_0px_#0D0D0D] active:translate-y-0.5"
				title="Reset Posisi &amp; Skala"
				aria-label="Reset zoom"
			>
				<RotateCcw class="w-4 h-4 stroke-[2.5]" />
			</button>
		</div>
	</div>

	<!-- Scrollable Map Canvas Viewport (Fixed flex-centering bug: natural block layout with mx-auto) -->
	<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
	<div
		bind:this={viewportRef}
		onmousedown={handleMouseDown}
		onmousemove={handleMouseMove}
		onmouseup={handleMouseUp}
		onmouseleave={handleMouseUp}
		role="region"
		aria-label="Peta Interaktif Lahan Praktikum SMK PPN Gorontalo"
		class="relative w-full overflow-auto bg-[#F7F2E7] retro-grid-bg p-4 sm:p-6 select-none {isDragging ? 'cursor-grabbing' : 'cursor-grab'}"
		style="min-height: 480px; max-height: 75vh;"
	>
		<!-- Centered Map Container Wrapper (Natural block layout with mx-auto prevents clipping top & left) -->
		<div
			class="mx-auto block"
			style="width: {currentWidth}px; min-width: {currentWidth}px;"
		>
			<div class="relative transition-all duration-150">
				<!-- Base Map Image (Schematic SVG of school) -->
				<img
					src={mapData.image_url}
					alt={mapData.title}
					class="w-full h-auto rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] select-none pointer-events-none bg-white block"
				/>

				<!-- Plant Markers Overlaid on Percentage Coordinates -->
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
						<!-- Animated Ping Ring -->
						<div
							class="absolute -inset-1 rounded-full animate-ping opacity-35 bg-[#0D0D0D]"
						></div>

						<!-- Marker Pin Tag -->
						<div
							class="relative px-2.5 py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] border-2 border-[#0D0D0D] flex items-center gap-1.5 text-xs font-black text-stone-900 whitespace-nowrap {colors.bg} {isSelected ? 'ring-2 ring-[#0D0D0D] shadow-[3.5px_3.5px_0px_#0D0D0D]' : ''}"
						>
							<MapPin class="w-3.5 h-3.5 fill-[#0D0D0D] text-transparent" />
							<span class="max-w-[130px] truncate">{marker.name_local}</span>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Active Marker Popup Preview Card -->
	{#if activeMarker}
		{@const colors = getCategoryColorClass(activeMarker.category)}
		<div
			class="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-92 bg-[#FFFEF9] rounded-2xl shadow-[6px_6px_0px_#0D0D0D] border-2 border-[#0D0D0D] p-4 z-30 animate-in fade-in slide-in-from-bottom-2 duration-200"
		>
			<div class="flex items-start gap-3">
				<img
					src={activeMarker.thumbnail_url}
					alt={activeMarker.name_local}
					class="w-18 h-18 rounded-xl object-cover border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] shrink-0"
				/>

				<div class="flex-1 min-w-0">
					<div class="flex items-center justify-between">
						<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#0D0D0D] {colors.bg} text-stone-900 shadow-[1px_1px_0px_#0D0D0D]">
							{getCategoryBadgeLabel(activeMarker.category)}
						</span>
						<button
							onclick={() => (activeMarker = null)}
							class="text-stone-500 hover:text-stone-900 p-1 rounded-lg border border-transparent hover:border-[#0D0D0D] cursor-pointer"
							aria-label="Tutup preview"
						>
							<X class="w-4 h-4 stroke-[2.5]" />
						</button>
					</div>

					<h4 class="font-black text-sm sm:text-base text-stone-900 mt-1.5 truncate">
						{activeMarker.name_local}
					</h4>
					<p class="font-latin italic text-xs text-stone-700 truncate font-semibold">
						{activeMarker.name_latin}
					</p>
					{#if activeMarker.location_label}
						<p class="text-[11px] text-stone-600 mt-1.5 flex items-center gap-1 truncate font-bold">
							<MapPin class="w-3.5 h-3.5 text-stone-900 shrink-0" />
							<span>{activeMarker.location_label}</span>
						</p>
					{/if}
				</div>
			</div>

			<a
				href="/katalog/{activeMarker.slug}"
				class="mt-3.5 w-full py-2.5 px-3 rounded-xl bg-[#6BB092] hover:bg-[#5da284] text-stone-900 text-xs font-black flex items-center justify-center gap-2 border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all"
			>
				<span>Buka Profil Tanaman</span>
				<ArrowRight class="w-4 h-4 stroke-[2.5]" />
			</a>
		</div>
	{/if}
</div>
