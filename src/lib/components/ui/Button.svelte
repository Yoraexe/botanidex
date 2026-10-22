<!--
  Flora SMK — Button UI Primitive (Svelte 5 Runes)
  Tujuan: Komponen tombol standar Neo-Brutalist dengan varian Fresh Modern Agronomy
  Caller: Seluruh form, navbar, card, dan modal
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';

	interface Props extends HTMLButtonAttributes {
		variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
		size?: 'sm' | 'md' | 'lg';
		loading?: boolean;
		fullWidth?: boolean;
		children?: Snippet;
	}

	let {
		variant = 'primary',
		size = 'md',
		loading = false,
		fullWidth = false,
		disabled = false,
		children,
		class: className = '',
		...restProps
	}: Props = $props();

	const baseStyles = 'inline-flex items-center justify-center font-bold rounded-xl transition-all duration-100 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer select-none';

	const sizeStyles = {
		sm: 'text-xs px-3 py-1.5 gap-1.5',
		md: 'text-sm px-4 py-2.5 gap-2',
		lg: 'text-base px-6 py-3.5 gap-2.5'
	};

	const variantStyles = {
		primary: 'bg-[#D4F469] text-[#0D0D0D] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:bg-[#c5e855] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#0D0D0D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0D0D0D]',
		secondary: 'bg-[#0F3E2E] text-white border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:bg-[#16513d] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#0D0D0D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0D0D0D]',
		outline: 'bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:bg-[#F3F6ED] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#0D0D0D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0D0D0D]',
		danger: 'bg-[#E07A5F] text-white border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:bg-[#d0684c] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#0D0D0D] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#0D0D0D]',
		ghost: 'text-[#0D0D0D] hover:bg-[#F3F6ED] border-2 border-transparent active:translate-y-[1px]'
	};
</script>

<button
	class="{baseStyles} {sizeStyles[size]} {variantStyles[variant]} {fullWidth ? 'w-full' : ''} {className}"
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-[#0D0D0D]" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
