<!--
  Flora SMK — Badge UI Primitive (Svelte 5 Runes)
  Tujuan: Menampilkan label status kategori botani atau status moderasi
  Caller: PlantCard, PlantDetail, Moderation Table
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral';
		size?: 'sm' | 'md';
		children?: Snippet;
		class?: string;
	}

	let {
		variant = 'neutral',
		size = 'sm',
		children,
		class: className = ''
	}: Props = $props();

	const variantStyles = {
		success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
		warning: 'bg-amber-50 text-amber-800 border-amber-200',
		error: 'bg-red-50 text-red-800 border-red-200',
		info: 'bg-blue-50 text-blue-800 border-blue-200',
		neutral: 'bg-stone-100 text-stone-700 border-stone-200'
	};

	const sizeStyles = {
		sm: 'text-[11px] px-2 py-0.5 tracking-wider font-semibold',
		md: 'text-xs px-2.5 py-1 font-semibold'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 uppercase rounded-md border {variantStyles[variant]} {sizeStyles[size]} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</span>
