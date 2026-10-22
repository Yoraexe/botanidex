<!--
  Flora SMK — Input UI Primitive (Svelte 5 Runes)
  Tujuan: Form input gaya Neo-Brutalist dengan border tegas dan shadow taktil
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
		<label for={id} class="text-xs font-extrabold text-stone-900 tracking-wider uppercase">
			{label}
		</label>
	{/if}

	<input
		{id}
		bind:value
		class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#18181B] rounded-xl shadow-[2px_2px_0px_#18181B] focus:shadow-[4px_4px_0px_#18181B] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none text-stone-900 placeholder:text-stone-400 disabled:bg-stone-100 disabled:cursor-not-allowed {error
			? 'border-[#E07A5F] bg-red-50/30'
			: 'focus:border-[#18181B]'} {className}"
		{...restProps}
	/>

	{#if error}
		<p class="text-xs font-bold text-[#E07A5F] mt-0.5">{error}</p>
	{:else if hint}
		<p class="text-xs text-stone-500 mt-0.5 font-medium">{hint}</p>
	{/if}
</div>
