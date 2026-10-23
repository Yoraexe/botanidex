<!--
  Botanidex — Plant Taxonomy Component (Svelte 5 Runes)
  Tujuan: Menampilkan hierarki klasifikasi ilmiah botani secara terstruktur gaya Neo-Brutalist (Option A)
  Caller: Plant detail page
  Dependensi: PlantTaxonomy type, @lucide/svelte
  Main Functions: PlantTaxonomy component
  Side Effects: none
-->
<script lang="ts">
	import type { PlantTaxonomy } from '#lib/types/plant.types';
	import { Dna } from '@lucide/svelte';

	let { taxonomy }: { taxonomy: PlantTaxonomy } = $props();

	const ranks = $derived([
		{ rank: 'Kingdom', label: 'Kerajaan', value: taxonomy.kingdom || 'Plantae', color: '' },
		{ rank: 'Divisio', label: 'Divisi', value: taxonomy.divisio, color: '' },
		{ rank: 'Classis', label: 'Kelas', value: taxonomy.classis, color: '' },
		{ rank: 'Ordo', label: 'Bangsa', value: taxonomy.ordo, color: '' },
		{ rank: 'Familia', label: 'Famili', value: taxonomy.familia, color: 'bg-[#D4F469]' },
		{ rank: 'Genus', label: 'Marga', value: taxonomy.genus, color: '' },
		{ rank: 'Species', label: 'Spesies', value: taxonomy.species, color: 'bg-[#D4F469]' }
	].filter((item) => Boolean(item.value)));
</script>

<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-4 sm:p-5">
	<div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#0D0D0D]">
		<div class="w-8 h-8 rounded-lg bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0">
			<Dna class="w-4 h-4 stroke-[2.5]" />
		</div>
		<h4 class="text-sm sm:text-base font-black text-[#0D0D0D] tracking-tight">Klasifikasi Ilmiah (Taksonomi Botani)</h4>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
		{#each ranks as item}
			<div class="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] {item.color || 'bg-[#F3F6ED]'}">
				<div class="flex items-center gap-1.5 font-bold text-stone-800">
					<span>{item.rank}</span>
					<span class="text-[10px] text-stone-600 font-semibold">({item.label})</span>
				</div>
				<span class="font-black font-latin italic text-[#0D0D0D] text-sm">{item.value}</span>
			</div>
		{/each}
	</div>
</div>
