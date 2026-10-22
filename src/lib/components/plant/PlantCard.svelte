<!--
  Flora SMK — Plant Card Component (Svelte 5 Runes)
  Tujuan: Menampilkan ringkasan tanaman dalam format card grid responsif
  Caller: Halaman Katalog, Landing Page, Search Results
  Dependensi: Plant type, format utils, Badge component
-->
<script lang="ts">
	import type { Plant } from '#lib/types/plant.types';
	import { getCategoryBadgeLabel, getCategoryColorClass } from '#lib/utils/format';
	import { MapPin, Video, Eye } from '@lucide/svelte';

	interface Props {
		plant: Plant;
	}

	let { plant }: Props = $props();

	const colorClass = $derived(getCategoryColorClass(plant.category));
	const categoryLabel = $derived(getCategoryBadgeLabel(plant.category));
	const thumbnail = $derived(plant.photos[0]?.storage_path || '/icons/icon-192.svg');
</script>

<a
	href="/katalog/{plant.slug}"
	class="group block bg-white rounded-xl border border-stone-200/80 overflow-hidden shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-200 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-emerald-500"
>
	<!-- Card Image Banner -->
	<div class="relative aspect-4/3 w-full bg-stone-100 overflow-hidden">
		<img
			src={thumbnail}
			alt={plant.name_local}
			loading="lazy"
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
		/>

		<!-- Category Badge Overlay -->
		<div class="absolute top-2.5 left-2.5">
			<span
				class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wider uppercase border shadow-xs {colorClass.bg} {colorClass.text} {colorClass.border}"
			>
				<span class="w-1.5 h-1.5 rounded-full" style="background-color: {colorClass.dot}"></span>
				{categoryLabel.split(' ')[1] || categoryLabel}
			</span>
		</div>

		<!-- Video & Photo Indicators -->
		<div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
			{#if plant.videos && plant.videos.length > 0}
				<span
					class="px-2 py-0.5 rounded-md bg-stone-900/80 text-white text-[10px] font-semibold flex items-center gap-1 backdrop-blur-xs"
					title="Ada video edukasi siswa"
				>
					<Video class="w-3 h-3 text-amber-400" />
					<span>Video</span>
				</span>
			{/if}
			{#if plant.photos.length > 1}
				<span class="px-2 py-0.5 rounded-md bg-stone-900/70 text-white text-[10px] font-semibold backdrop-blur-xs">
					{plant.photos.length} Foto
				</span>
			{/if}
		</div>
	</div>

	<!-- Card Content -->
	<div class="p-4 flex-1 flex flex-col justify-between">
		<div>
			<h3 class="text-base font-bold text-stone-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
				{plant.name_local}
			</h3>
			<p class="text-xs text-stone-600 font-latin italic line-clamp-1 mt-0.5">
				{plant.name_latin}
			</p>
			{#if plant.name_english}
				<p class="text-[11px] text-stone-400 line-clamp-1">
					EN: {plant.name_english}
				</p>
			{/if}
		</div>

		<div class="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-xs text-stone-500">
			<div class="flex items-center gap-1 truncate max-w-[70%]">
				<MapPin class="w-3.5 h-3.5 text-emerald-600 shrink-0" />
				<span class="truncate">{plant.location_label || 'Kebun Sekolah'}</span>
			</div>
			<span class="text-emerald-600 font-semibold text-[11px] flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
				Detail →
			</span>
		</div>
	</div>
</a>
