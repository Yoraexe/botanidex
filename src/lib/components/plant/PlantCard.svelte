<!--
  Botanidex — Plant Card Component (Svelte 5 Runes)
  Tujuan: Menampilkan ringkasan tanaman dalam format card grid Neo-Brutalist
  Caller: Halaman Katalog, Landing Page, Search Results
  Dependensi: Plant type, format utils, @lucide/svelte
  Main Functions: PlantCard component
  Side Effects: Navigasi ke /katalog/[slug]
-->
<script lang="ts">
	import type { Plant } from '#lib/types/plant.types';
	import { getCategoryShortLabel, getCategoryColorClass } from '#lib/utils/format';
	import { MapPin, Video, ArrowUpRight } from '@lucide/svelte';

	let { plant }: { plant: Plant } = $props();

	const colorClass = $derived(getCategoryColorClass(plant.category));
	const categoryShortLabel = $derived(getCategoryShortLabel(plant.category));
	const thumbnail = $derived(plant.photos[0]?.storage_path || '/icons/icon-192.svg');
	const hasApprovedVideo = $derived(Boolean(plant.videos?.some((v) => v.status === 'approved')));
</script>

<a
	href="/katalog/{plant.slug}"
	class="group block bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] hover:shadow-[6px_6px_0px_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 flex flex-col h-full focus:outline-none focus:ring-2 focus:ring-[#0D0D0D] overflow-hidden"
>
	<div class="relative aspect-4/3 w-full bg-stone-100 border-b-2 border-[#0D0D0D] overflow-hidden">
		<img src={thumbnail} alt={plant.name_local} loading="lazy" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />

		<div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 flex-wrap max-w-[80%]">
			<span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black tracking-wider uppercase border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] {colorClass.bg} text-[#0D0D0D]">
				<span class="w-1.5 h-1.5 rounded-full bg-[#0D0D0D]"></span>
				{categoryShortLabel}
			</span>
			{#if plant.quantity}
				<span class="inline-flex items-center px-2 py-1 rounded-full text-[10px] font-black tracking-wider border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] bg-white text-[#0D0D0D]" title="Populasi Tanaman">
					{plant.quantity} {plant.unit || 'pohon'}
				</span>
			{/if}
		</div>

		<div class="absolute bottom-2.5 right-2.5 flex items-center gap-1.5">
			{#if hasApprovedVideo}
				<span class="px-2 py-0.5 rounded-lg bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] text-[10px] font-black flex items-center gap-1" title="Ada video edukasi siswa terverifikasi">
					<Video class="w-3 h-3 stroke-[2.5]" /> <span>Video</span>
				</span>
			{/if}
			{#if plant.photos.length > 1}
				<span class="px-2 py-0.5 rounded-lg bg-white text-[#0D0D0D] border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] text-[10px] font-black">
					{plant.photos.length} Foto
				</span>
			{/if}
		</div>
	</div>

	<div class="p-4 flex-1 flex flex-col justify-between">
		<div>
			<h3 class="text-base sm:text-lg font-black text-[#0D0D0D] group-hover:text-emerald-800 transition-colors line-clamp-1 leading-snug">{plant.name_local}</h3>
			<p class="text-xs text-stone-700 font-latin italic font-semibold line-clamp-1 mt-0.5">{plant.name_latin}</p>
		</div>

		<div class="mt-4 pt-3 border-t-2 border-stone-200/80 flex items-center justify-between text-xs">
			<div class="flex items-center gap-1.5 truncate max-w-[65%] text-stone-700 font-bold">
				<MapPin class="w-3.5 h-3.5 text-[#0D0D0D] shrink-0" />
				<span class="truncate text-[11px]">{plant.location_label || 'Kebun Sekolah'}</span>
			</div>
			<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D] font-black text-[10px] shadow-[1px_1px_0px_#0D0D0D] group-hover:translate-x-0.5 transition-transform">
				Lihat <ArrowUpRight class="w-3 h-3 stroke-[3]" />
			</span>
		</div>
	</div>
</a>
