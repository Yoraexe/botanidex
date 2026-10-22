<!--
  Flora SMK — Card UI Primitive (Svelte 5 Runes)
  Tujuan: Kontainer kartu modular dengan gaya Neo-Brutalist (solid border & tactile shadow)
  Caller: PlantCard, Detail sections, Form wrappers
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	interface Props {
		children?: Snippet;
		class?: string;
		hoverEffect?: boolean;
	}

	let {
		children,
		class: className = '',
		hoverEffect = false
	}: Props = $props();
</script>

<div
	class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] overflow-hidden {hoverEffect
		? 'transition-all duration-150 hover:shadow-[6px_6px_0px_#0D0D0D] hover:-translate-x-0.5 hover:-translate-y-0.5'
		: ''} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</div>
