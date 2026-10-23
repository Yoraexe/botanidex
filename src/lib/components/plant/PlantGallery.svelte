<!--
  Botanidex — Plant Photo Gallery Component (Svelte 5 Runes)
  Tujuan: Menampilkan galeri foto multi-sudut tanaman gaya Neo-Brutalist (habitus, daun, bunga, buah)
  Caller: Plant detail page
  Dependensi: PlantPhoto type, @lucide/svelte
  Main Functions: PlantGallery component
  Side Effects: Reset selectedIndex secara reaktif saat daftar foto tanaman berganti
-->
<script lang="ts">
	import type { PlantPhoto } from '#lib/types/plant.types';
	import { Image as ImageIcon } from '@lucide/svelte';

	let { photos, plantName }: { photos: PlantPhoto[]; plantName: string } = $props();

	let selectedIndex = $state(0);

	$effect(() => {
		photos;
		selectedIndex = 0;
	});

	const activePhoto = $derived(
		photos[selectedIndex] || photos[0] || {
			storage_path: '/icons/icon-512.svg',
			label: 'Foto Tanaman'
		}
	);
</script>

<div class="flex flex-col gap-3">
	<div class="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-stone-900 border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D]">
		<img
			src={activePhoto.storage_path}
			alt="{plantName} - {activePhoto.label || 'Koleksi Botani'}"
			class="w-full h-full object-cover transition-opacity duration-200"
		/>

		{#if activePhoto.label}
			<div class="absolute bottom-3 left-3 bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] text-xs px-3 py-1.5 rounded-xl flex items-center gap-2 shadow-[2px_2px_0px_#0D0D0D] font-black">
				<ImageIcon class="w-3.5 h-3.5 stroke-[2.5]" />
				<span>{activePhoto.label}</span>
			</div>
		{/if}
	</div>

	{#if photos.length > 1}
		<div class="flex items-center gap-2.5 overflow-x-auto pb-1 no-scrollbar">
			{#each photos as photo, i}
				<button
					type="button"
					onclick={() => (selectedIndex = i)}
					class="relative aspect-4/3 w-20 sm:w-24 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer {selectedIndex === i
						? 'border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5'
						: 'border-[#0D0D0D]/40 opacity-70 hover:opacity-100 hover:border-[#0D0D0D]'}"
				>
					<img src={photo.storage_path} alt={photo.label || `Foto ${i + 1}`} class="w-full h-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}
</div>
