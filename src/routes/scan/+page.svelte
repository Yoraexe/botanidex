<!--
  Botanidex — Scan QR Code Page (Svelte 5 Runes)
  Tujuan: Memindai QR Code tanaman langsung dari browser menggunakan kamera atau upload foto gaya Neo-Brutalist (Option A)
  Caller: Route '/scan'
  BRD Ref: F3 (QR Code Scanner)
-->
<script lang="ts">
	import QrScanner from '#lib/components/qr/QrScanner.svelte';
	import { QrCode, ArrowLeft } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Scan QR Code Tanaman — Botanidex</title>
</svelte:head>

<div class="max-w-xl mx-auto flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<a
			href="/katalog"
			class="inline-flex items-center gap-2 text-xs font-black text-[#0D0D0D] bg-white px-3.5 py-2 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#D4F469] transition-colors active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D]"
		>
			<ArrowLeft class="w-4 h-4 stroke-[2.5]" />
			<span>Katalog</span>
		</a>

		<div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-[#0D0D0D] font-black text-xs uppercase tracking-wider">
			<QrCode class="w-4 h-4 stroke-[2.5]" />
			<span>Scanner Lapangan</span>
		</div>
	</div>

	<!-- QR Scanner Component -->
	<QrScanner />
</div>
