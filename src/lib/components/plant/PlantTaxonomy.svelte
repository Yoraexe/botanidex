<!--
  Flora SMK — Plant Taxonomy Component (Svelte 5 Runes)
  Tujuan: Menampilkan hierarki klasifikasi ilmiah botani secara terstruktur
  Caller: Plant detail page
-->
<script lang="ts">
	import type { PlantTaxonomy } from '#lib/types/plant.types';
	import { Dna } from '@lucide/svelte';

	interface Props {
		taxonomy: PlantTaxonomy;
	}

	let { taxonomy }: Props = $props();

	const ranks = $derived([
		{ rank: 'Kingdom (Kerajaan)', value: taxonomy.kingdom || 'Plantae', isLatin: true },
		{ rank: 'Divisio (Divisi)', value: taxonomy.divisio, isLatin: true },
		{ rank: 'Classis (Kelas)', value: taxonomy.classis, isLatin: true },
		{ rank: 'Ordo (Bangsa)', value: taxonomy.ordo, isLatin: true },
		{ rank: 'Familia (Famili/Suku)', value: taxonomy.familia, isLatin: true, isHighlight: true },
		{ rank: 'Genus (Marga)', value: taxonomy.genus, isLatin: true },
		{ rank: 'Species (Spesies)', value: taxonomy.species, isLatin: true, isHighlight: true }
	].filter((item) => Boolean(item.value)));
</script>

<div class="bg-stone-50 rounded-xl border border-stone-200/90 p-4 sm:p-5">
	<div class="flex items-center gap-2 mb-3 pb-2 border-b border-stone-200">
		<Dna class="w-5 h-5 text-emerald-700" />
		<h4 class="text-sm font-bold text-stone-900 tracking-tight">Klasifikasi Ilmiah (Taksonomi Botani)</h4>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
		{#each ranks as item}
			<div class="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/60 {item.isHighlight ? 'bg-emerald-50/40 border-emerald-200/60' : ''}">
				<span class="text-stone-500 font-medium">{item.rank}</span>
				<span class="font-bold {item.isLatin ? 'font-latin italic' : ''} {item.isHighlight ? 'text-emerald-900 font-semibold' : 'text-stone-800'}">
					{item.value}
				</span>
			</div>
		{/each}
	</div>
</div>
