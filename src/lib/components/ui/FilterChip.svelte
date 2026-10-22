<!--
  Flora SMK — Filter Chip UI Primitive (Svelte 5 Runes)
  Tujuan: Pill tombol filter horizontal untuk kategori botani
  Caller: Halaman Katalog
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
	class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 cursor-pointer {active
		? 'bg-emerald-600 text-white shadow-xs'
		: 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'}"
>
	{#if children}
		{@render children()}
	{/if}
	{#if typeof count === 'number'}
		<span
			class="px-1.5 py-0.2 rounded-full text-[10px] font-bold {active
				? 'bg-emerald-800 text-emerald-100'
				: 'bg-stone-100 text-stone-600'}"
		>
			{count}
		</span>
	{/if}
</button>
