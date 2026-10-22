<!--
  Flora SMK — Badge UI Primitive (Svelte 5 Runes)
  Tujuan: Menampilkan label status kategori botani atau status moderasi gaya retro sticker
  Caller: PlantCard, PlantDetail, Moderation Table
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral' | 'mint' | 'yellow' | 'purple' | 'coral';
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
		success: 'bg-[#6BB092] text-stone-900 border-[#18181B]',
		mint: 'bg-[#6BB092] text-stone-900 border-[#18181B]',
		warning: 'bg-[#F6BD60] text-stone-900 border-[#18181B]',
		yellow: 'bg-[#F6BD60] text-stone-900 border-[#18181B]',
		error: 'bg-[#E07A5F] text-white border-[#18181B]',
		coral: 'bg-[#E07A5F] text-white border-[#18181B]',
		info: 'bg-[#93C5FD] text-stone-900 border-[#18181B]',
		purple: 'bg-[#CDB4DB] text-stone-900 border-[#18181B]',
		neutral: 'bg-white text-stone-900 border-[#18181B]'
	};

	const sizeStyles = {
		sm: 'text-[11px] px-2.5 py-0.5 tracking-wider font-extrabold',
		md: 'text-xs px-3 py-1 font-extrabold'
	};
</script>

<span
	class="inline-flex items-center gap-1.5 uppercase rounded-lg border-2 shadow-[2px_2px_0px_#18181B] select-none {variantStyles[variant]} {sizeStyles[size]} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</span>
