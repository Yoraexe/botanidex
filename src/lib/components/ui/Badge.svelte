<!--
  Flora SMK — Badge UI Primitive (Svelte 5 Runes)
  Tujuan: Menampilkan label status kategori botani atau status moderasi gaya retro sticker (Fresh Modern Agronomy)
  Caller: PlantCard, PlantDetail, Moderation Table
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'mint' | 'yellow' | 'purple' | 'coral' | 'forest';
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
		success: 'bg-[#D4F469] text-[#0D0D0D] border-[#0D0D0D]',
		mint: 'bg-[#D4F469] text-[#0D0D0D] border-[#0D0D0D]',
		forest: 'bg-[#0F3E2E] text-white border-[#0D0D0D]',
		warning: 'bg-[#FBBF24] text-[#0D0D0D] border-[#0D0D0D]',
		yellow: 'bg-[#FBBF24] text-[#0D0D0D] border-[#0D0D0D]',
		error: 'bg-[#E07A5F] text-white border-[#0D0D0D]',
		coral: 'bg-[#E07A5F] text-white border-[#0D0D0D]',
		info: 'bg-[#93C5FD] text-[#0D0D0D] border-[#0D0D0D]',
		purple: 'bg-[#CDB4DB] text-[#0D0D0D] border-[#0D0D0D]',
		neutral: 'bg-white text-[#0D0D0D] border-[#0D0D0D]'
	};

	const sizeStyles = {
		sm: 'text-[11px] px-2.5 py-0.5 tracking-wider font-extrabold',
		md: 'text-xs px-3 py-1 font-extrabold'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 uppercase rounded-lg border-2 shadow-[2px_2px_0px_#0D0D0D] select-none {variantStyles[variant]} {sizeStyles[size]} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</span>
