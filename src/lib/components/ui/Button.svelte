<!--
  Flora SMK — Button UI Primitive (Svelte 5 Runes)
  Tujuan: Komponen tombol standar dengan varian primary, secondary, outline, danger
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

	const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-[0.98]';

	const sizeStyles = {
		sm: 'text-xs px-3 py-1.5 gap-1.5',
		md: 'text-sm px-4 py-2.5 gap-2',
		lg: 'text-base px-6 py-3.5 gap-2.5'
	};

	const variantStyles = {
		primary: 'bg-emerald-600 hover:bg-emerald-700 text-white focus:ring-emerald-500 shadow-sm',
		secondary: 'bg-amber-500 hover:bg-amber-600 text-white focus:ring-amber-400 shadow-sm',
		outline: 'border border-stone-300 bg-white hover:bg-stone-50 text-stone-700 focus:ring-emerald-500',
		danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 shadow-sm',
		ghost: 'text-stone-600 hover:bg-stone-100 focus:ring-stone-400'
	};
</script>

<button
	class="{baseStyles} {sizeStyles[size]} {variantStyles[variant]} {fullWidth ? 'w-full' : ''} {className}"
	disabled={disabled || loading}
	{...restProps}
>
	{#if loading}
		<svg class="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
			<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
			<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
		</svg>
	{/if}
	{#if children}
		{@render children()}
	{/if}
</button>
