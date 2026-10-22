<!--
  Flora SMK — Plant Taxonomy Component (Svelte 5 Runes)
  Tujuan: Menampilkan hierarki klasifikasi ilmiah botani secara terstruktur gaya Neo-Brutalist
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
		{ rank: 'Kingdom', label: 'Kerajaan', value: taxonomy.kingdom || 'Plantae', isLatin: true },
		{ rank: 'Divisio', label: 'Divisi', value: taxonomy.divisio, isLatin: true },
		{ rank: 'Classis', label: 'Kelas', value: taxonomy.classis, isLatin: true },
		{ rank: 'Ordo', label: 'Bangsa', value: taxonomy.ordo, isLatin: true },
		{ rank: 'Familia', label: 'Famili', value: taxonomy.familia, isLatin: true, isHighlight: true, color: 'bg-[#CDB4DB]' },
		{ rank: 'Genus', label: 'Marga', value: taxonomy.genus, isLatin: true },
		{ rank: 'Species', label: 'Spesies', value: taxonomy.species, isLatin: true, isHighlight: true, color: 'bg-[#6BB092]' }
	].filter((item) => Boolean(item.value)));
</script>

<div class="bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 sm:p-5">
	<div class="flex items-center gap-3 mb-4 pb-3 border-b-2 border-[#18181B]">
		<div class="w-8 h-8 rounded-lg bg-[#6BB092] border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] flex items-center justify-center text-stone-900 shrink-0">
			<Dna class="w-4 h-4 stroke-[2.5]" />
		</div>
		<h4 class="text-sm sm:text-base font-black text-stone-900 tracking-tight">Klasifikasi Ilmiah (Taksonomi Botani)</h4>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
		{#each ranks as item}
			<div class="flex items-center justify-between p-2.5 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] {item.color || 'bg-[#F7F2E7]'}">
				<div class="flex items-center gap-1.5 font-bold text-stone-800">
					<span>{item.rank}</span>
					<span class="text-[10px] text-stone-600 font-semibold">({item.label})</span>
				</div>
				<span class="font-black {item.isLatin ? 'font-latin italic' : ''} text-stone-900 text-sm">
					{item.value}
				</span>
			</div>
		{/each}
	</div>
</div>
