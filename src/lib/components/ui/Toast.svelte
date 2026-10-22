<!--
  Botanidex — Toast Alert Container (Svelte 5 Runes)
  Tujuan: Menampilkan notifikasi popup aksi gaya Neo-Brutalist di sudut layar (Fresh Modern Agronomy)
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
		success: 'bg-[#D4F469] text-[#0D0D0D]',
		warning: 'bg-[#FBBF24] text-[#0D0D0D]',
		error: 'bg-[#E07A5F] text-white',
		info: 'bg-[#93C5FD] text-[#0D0D0D]'
	};
</script>

<div class="fixed top-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full px-4 pointer-events-none sm:px-0">
	{#each $toast as item (item.id)}
		{@const Icon = iconMap[item.type]}
		<div
			class="pointer-events-auto flex items-start gap-3 p-3.5 bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] transition-all"
		>
			<div class="w-8 h-8 rounded-xl border border-[#0D0D0D] flex items-center justify-center shrink-0 {bgAccentMap[item.type]}">
				<Icon class="w-4 h-4" />
			</div>
			<div class="flex-1 min-w-0 pt-0.5">
				<p class="text-sm font-black text-[#0D0D0D] leading-tight">{item.title}</p>
				{#if item.message}
					<p class="text-xs text-stone-700 mt-0.5 font-medium">{item.message}</p>
				{/if}
			</div>
			<button
				onclick={() => toast.remove(item.id)}
				class="text-stone-500 hover:text-[#0D0D0D] p-1 rounded-lg border border-transparent hover:border-[#0D0D0D] transition-all cursor-pointer"
				aria-label="Tutup notifikasi"
			>
				<X class="w-4 h-4" />
			</button>
		</div>
	{/each}
</div>
