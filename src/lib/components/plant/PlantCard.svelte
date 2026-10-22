<!--
  Flora SMK — Plant Card Component (Svelte 5 Runes)
  Tujuan: Menampilkan ringkasan tanaman dalam format card grid Neo-Brutalist
  Caller: Halaman Katalog, Landing Page, Search Results
  Dependensi: Plant type, format utils
-->
<script lang="ts">
	import type { Plant } from '#lib/types/plant.types';
	import { getCategoryBadgeLabel, getCategoryColorClass } from '#lib/utils/format';
	import { MapPin, Video, ArrowUpRight } from '@lucide/svelte';

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
	class="group block bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] hover:shadow-[6px_6px_0px_#18181B] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[#18181B] overflow-hidden"
>
	<!-- Card Image Banner with Neo-Brutalist Divider -->
	<div class="relative aspect-4/3 w-full bg-stone-100 border-b-2 border-[#18181B] overflow-hidden">
		<img
			src={thumbnail}
			alt={plant.name_local}
			loading="lazy"
			class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
		/>

		<!-- Category Sticker Badge -->
		<div class="absolute top-2.5 left-2.5">
			<span
				class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] {colorClass.bg} text-[#0D0D0D]"
			>
				<span class="w-1.5 h-1.5 rounded-full bg-[#0D0D0D]"></span>
				{categoryLabel.split(' ')[1] || categoryLabel}
			</span>
		</div>

		<!-- Video & Photo Indicators -->
		<div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
			{#if plant.videos && plant.videos.length > 0}
				<span
					class="px-2 py-0.5 rounded-lg bg-[#F6BD60] text-stone-900 border border-[#18181B] shadow-[1px_1px_0px_#18181B] text-[10px] font-black flex items-center gap-1"
					title="Ada video edukasi siswa"
				>
					<Video class="w-3 h-3 stroke-[2.5]" />
					<span>Video</span>
				</span>
			{/if}
			{#if plant.photos.length > 1}
				<span class="px-2 py-0.5 rounded-lg bg-white text-stone-900 border border-[#18181B] shadow-[1px_1px_0px_#18181B] text-[10px] font-black">
					{plant.photos.length} Foto
				</span>
			{/if}
		</div>
	</div>

	<!-- Card Content -->
	<div class="p-4 flex-1 flex flex-col justify-between">
		<div>
			<h3 class="text-base sm:text-lg font-black text-stone-900 group-hover:text-emerald-800 transition-colors line-clamp-1 leading-snug">
				{plant.name_local}
			</h3>
			<p class="text-xs text-stone-700 font-latin italic font-semibold line-clamp-1 mt-0.5">
				{plant.name_latin}
			</p>
			{#if plant.name_english}
				<p class="text-[11px] text-stone-500 font-medium line-clamp-1 mt-0.5">
					EN: {plant.name_english}
				</p>
			{/if}
		</div>

		<div class="mt-4 pt-3 border-t-2 border-stone-200/80 flex items-center justify-between text-xs">
			<div class="flex items-center gap-1.5 truncate max-w-[65%] text-stone-700 font-bold">
				<MapPin class="w-3.5 h-3.5 text-stone-900 shrink-0" />
				<span class="truncate text-[11px]">{plant.location_label || 'Kebun Sekolah'}</span>
			</div>
			<span class="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#6BB092] text-stone-900 border border-[#18181B] font-black text-[10px] shadow-[1px_1px_0px_#18181B] group-hover:translate-x-0.5 transition-transform">
				Lihat
				<ArrowUpRight class="w-3 h-3 stroke-[3]" />
			</span>
		</div>
	</div>
</a>
