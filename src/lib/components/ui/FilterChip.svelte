<!--
  Flora SMK — Filter Chip UI Primitive (Svelte 5 Runes)
  Tujuan: Pill tombol filter horizontal gaya Neo-Brutalist untuk kategori botani
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
	class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer border-2 border-[#18181B] select-none {active
		? 'bg-[#F6BD60] text-stone-900 shadow-[3px_3px_0px_#18181B] -translate-y-0.5'
		: 'bg-white text-stone-800 shadow-[2px_2px_0px_#18181B] hover:bg-[#F7F2E7] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B]'}"
>
	{#if children}
		{@render children()}
	{/if}
	{#if typeof count === 'number'}
		<span
			class="px-1.5 py-0.2 rounded-md text-[10px] font-black border border-[#18181B] {active
				? 'bg-[#18181B] text-[#F6BD60]'
				: 'bg-stone-100 text-stone-900'}"
		>
			{count}
		</span>
	{/if}
</button>
