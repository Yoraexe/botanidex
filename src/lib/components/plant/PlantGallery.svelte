<!--
  Flora SMK — Plant Photo Gallery Component (Svelte 5 Runes)
  Tujuan: Menampilkan galeri foto multi-sudut tanaman (habitus, daun, bunga, buah)
  Caller: Plant detail page
-->
<script lang="ts">
	import type { PlantPhoto } from '#lib/types/plant.types';
	import { Image as ImageIcon } from '@lucide/svelte';

	interface Props {
		photos: PlantPhoto[];
		plantName: string;
	}

	let { photos, plantName }: Props = $props();

	let selectedIndex = $state(0);

	const activePhoto = $derived(photos[selectedIndex] || photos[0] || {
		storage_path: '/icons/icon-512.svg',
		label: 'Foto Tanaman'
	});
</script>

<div class="flex flex-col gap-3">
	<!-- Active Photo Frame -->
	<div class="relative aspect-16/10 w-full rounded-2xl overflow-hidden bg-stone-900 border border-stone-200 shadow-sm">
		<img
			src={activePhoto.storage_path}
			alt="{plantName} - {activePhoto.label || 'Koleksi Botani'}"
			class="w-full h-full object-cover transition-opacity duration-200"
		/>

		{#if activePhoto.label}
			<div class="absolute bottom-3 left-3 bg-stone-900/80 backdrop-blur-md text-white text-xs px-3 py-1.5 rounded-lg flex items-center gap-1.5 shadow-sm">
				<ImageIcon class="w-3.5 h-3.5 text-emerald-400" />
				<span>{activePhoto.label}</span>
			</div>
		{/if}
	</div>

	<!-- Thumbnail Selector Strip (if > 1 photo) -->
	{#if photos.length > 1}
		<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
			{#each photos as photo, i}
				<button
					type="button"
					onclick={() => (selectedIndex = i)}
					class="relative aspect-4/3 w-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 cursor-pointer {selectedIndex === i
						? 'border-emerald-600 ring-2 ring-emerald-200'
						: 'border-stone-200 opacity-70 hover:opacity-100'}"
				>
					<img src={photo.storage_path} alt={photo.label || `Foto ${i + 1}`} class="w-full h-full object-cover" />
				</button>
			{/each}
		</div>
	{/if}
</div>
