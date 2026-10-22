<!--
  Flora SMK — Button UI Primitive (Svelte 5 Runes)
  Tujuan: Komponen tombol standar Neo-Brutalist dengan varian pastel retro pop
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
		primary: 'bg-[#6BB092] text-stone-900 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:bg-[#5da284] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181B]',
		secondary: 'bg-[#F6BD60] text-stone-900 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:bg-[#eab052] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181B]',
		outline: 'bg-white text-stone-900 border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:bg-[#F7F2E7] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181B]',
		danger: 'bg-[#E07A5F] text-white border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:bg-[#d0684c] hover:-translate-x-[1px] hover:-translate-y-[1px] hover:shadow-[4px_4px_0px_#18181B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_#18181B]',
		ghost: 'text-stone-800 hover:bg-stone-200/70 border-2 border-transparent active:translate-y-[1px]'
	};
</script>

<button
	class="{baseStyles} {sizeStyles[size]} {variantStyles[variant]} {fullWidth ? 'w-full' : ''} {className}"
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-stone-900" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
