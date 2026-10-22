<!--
  Flora SMK — Filter Chip UI Primitive (Svelte 5 Runes)
  Tujuan: Pill tombol filter horizontal gaya Neo-Brutalist untuk kategori botani (Fresh Modern Agronomy)
  Caller: Halaman Katalog & Peta
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		active?: boolean;
		count?: number;
		children?: Snippet;
		onclick?: () => void;
	}

	let {
		active = false,
		count,
		children,
		onclick
	}: Props = $props();
</script>

<button
	type="button"
	{onclick}
	class="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black transition-all shrink-0 cursor-pointer border-2 border-[#0D0D0D] select-none {active
		? 'bg-[#0D0D0D] text-[#D4F469] shadow-[3px_3px_0px_#0D0D0D] -translate-y-0.5'
		: 'bg-white text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#F3F6ED] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#0D0D0D]'}"
>
	{#if children}
		{@render children()}
	{/if}
	{#if typeof count === 'number'}
		<span
			class="px-2 py-0.5 rounded-full text-[10px] font-black border border-[#0D0D0D] {active
				? 'bg-[#D4F469] text-[#0D0D0D]'
				: 'bg-stone-100 text-[#0D0D0D]'}"
		>
			{count}
		</span>
	{/if}
</button>
