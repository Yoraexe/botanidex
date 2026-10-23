<!--
  Botanidex — Input UI Primitive (Svelte 5 Runes)
  Tujuan: Form input gaya Neo-Brutalist dengan border tegas, shadow taktil, dan ID deterministik SSR-safe
  Caller: Form kontribusi tanaman, pencarian, dan login
  Dependensi: svelte/elements
  Main Functions: Input component
  Side Effects: none
-->
<script lang="ts">
	import type { HTMLInputAttributes } from 'svelte/elements';

	interface Props extends HTMLInputAttributes {
		label?: string;
		error?: string;
		hint?: string;
		value?: string | number;
	}

	const uid = $props.id();

	let {
		label,
		error,
		hint,
		value = $bindable(''),
		id = uid,
		class: className = '',
		...restProps
	}: Props = $props();
</script>

<div class="flex flex-col gap-1.5 w-full">
	{#if label}
		<label for={id} class="text-xs font-extrabold text-[#0D0D0D] tracking-wider uppercase">
			{label}
		</label>
	{/if}

	<input
		{id}
		bind:value
		class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none text-[#0D0D0D] placeholder:text-stone-400 disabled:bg-stone-100 disabled:cursor-not-allowed {error
			? 'border-[#E07A5F] bg-red-50/30'
			: 'focus:border-[#0D0D0D]'} {className}"
		{...restProps}
	/>

	{#if error}
		<p class="text-xs font-bold text-[#E07A5F] mt-0.5">{error}</p>
	{:else if hint}
		<p class="text-xs text-stone-500 mt-0.5 font-medium">{hint}</p>
	{/if}
</div>
