<!--
  Flora SMK — Input UI Primitive (Svelte 5 Runes)
  Tujuan: Form input dengan label, helper text, dan state error
  Caller: Form kontribusi tanaman, pencarian, dan login
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
		value?: string | number;
	}

	let {
		label,
		error,
		hint,
		value = $bindable(''),
		id = Math.random().toString(36).substring(2, 7),
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 w-full">
	{#if label}
		<label for={id} class="text-xs font-semibold text-stone-700 tracking-wide uppercase">
			{label}
		</label>
	{/if}

	<input
		{id}
		bind:value
		class="w-full px-3.5 py-2.5 text-sm bg-white border rounded-lg transition-colors focus:outline-none focus:ring-2 {error
			? 'border-red-400 focus:ring-red-200 focus:border-red-500'
			: 'border-stone-300 focus:ring-emerald-100 focus:border-emerald-600'} disabled:bg-stone-100 disabled:cursor-not-allowed {className}"
		{...restProps}
	/>

	{#if error}
		<p class="text-xs text-red-600 mt-0.5">{error}</p>
	{:else if hint}
		<p class="text-xs text-stone-500 mt-0.5">{hint}</p>
	{/if}
</div>
