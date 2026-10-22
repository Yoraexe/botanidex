<!--
  Flora SMK — Card UI Primitive (Svelte 5 Runes)
  Tujuan: Kontainer kartu modular dengan elevation dan border halus
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
	class="bg-white rounded-xl border border-stone-200/80 shadow-xs overflow-hidden {hoverEffect
		? 'transition-all duration-200 hover:shadow-md hover:-translate-y-0.5'
		: ''} {className}"
>
	{#if children}
		{@render children()}
	{/if}
</div>
