<!--
  Flora SMK — Toast Alert Container (Svelte 5 Runes)
  Tujuan: Menampilkan notifikasi popup aksi gaya Neo-Brutalist di sudut layar
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

	const bgAccentMap = {
		success: 'bg-[#6BB092] text-stone-900',
		warning: 'bg-[#F6BD60] text-stone-900',
		error: 'bg-[#E07A5F] text-white',
		info: 'bg-[#93C5FD] text-stone-900'
	};
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none sm:px-0">
	{#each $toast as item (item.id)}
		{@const Icon = iconMap[item.type]}
		<div
			class="pointer-events-auto flex items-start gap-3 p-3.5 bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] transition-all"
		>
			<div class="w-8 h-8 rounded-xl border border-[#18181B] flex items-center justify-center shrink-0 {bgAccentMap[item.type]}">
				<Icon class="w-4 h-4" />
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-sm font-black text-stone-900 leading-tight">{item.title}</p>
				{#if item.message}
					<p class="text-xs text-stone-700 mt-0.5 font-medium">{item.message}</p>
				{/if}
			</div>
			<button
				onclick={() => toast.remove(item.id)}
				class="text-stone-500 hover:text-stone-900 p-1 rounded-lg border border-transparent hover:border-[#18181B] transition-all cursor-pointer"
				aria-label="Tutup notifikasi"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
