<!--
  Flora SMK — Toast Alert Container (Svelte 5 Runes)
  Tujuan: Menampilkan notifikasi popup aksi di sudut layar
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { toast } from '#lib/stores/toast.store';
	import { CheckCircle2, AlertTriangle, XCircle, Info, X } from '@lucide/svelte';

	const iconMap = {
		success: CheckCircle2,
		warning: AlertTriangle,
		error: XCircle,
		info: Info
	};

	const borderStyles = {
		success: 'border-l-emerald-600',
		warning: 'border-l-amber-500',
		error: 'border-l-red-600',
		info: 'border-l-blue-600'
	};

	const iconStyles = {
		success: 'text-emerald-600',
		warning: 'text-amber-500',
		error: 'text-red-600',
		info: 'text-blue-600'
	};
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none sm:px-0">
	{#each $toast as item (item.id)}
		{@const Icon = iconMap[item.type]}
		<div
			class="pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-xl shadow-lg border border-stone-200 border-l-4 {borderStyles[
				item.type
			]} transition-all animate-in fade-in slide-in-from-top-2 duration-200"
		>
			<Icon class="w-5 h-5 mt-0.5 shrink-0 {iconStyles[item.type]}" />
			<div class="flex-1 min-w-0">
				<p class="text-sm font-semibold text-stone-900">{item.title}</p>
				{#if item.message}
					<p class="text-xs text-stone-600 mt-0.5">{item.message}</p>
				{/if}
			</div>
			<button
				onclick={() => toast.remove(item.id)}
				class="text-stone-400 hover:text-stone-700 p-1 rounded-md transition-colors"
				aria-label="Tutup notifikasi"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
