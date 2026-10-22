<!--
  Flora SMK — Scan QR Code Page (Svelte 5 Runes)
  Tujuan: Memindai QR Code tanaman langsung dari browser menggunakan kamera atau upload foto
  Caller: Route '/scan'
  BRD Ref: F3 (QR Code Scanner)
-->
<script lang="ts">
	import QrScanner from '#lib/components/qr/QrScanner.svelte';
	import { QrCode, ArrowLeft } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Scan QR Code Tanaman — Flora SMK</title>
</svelte:head>

<div class="max-w-xl mx-auto flex flex-col gap-5">
	<div class="flex items-center justify-between">
		<a
			href="/katalog"
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 bg-white px-3 py-1.5 rounded-xl border border-stone-200 transition-colors shadow-xs"
		>
			<ArrowLeft class="w-4 h-4" />
			<span>Katalog</span>
		</a>

		<div class="flex items-center gap-1.5 text-emerald-800 font-bold text-sm">
			<QrCode class="w-4 h-4 text-emerald-600" />
			<span>Scanner Lapangan</span>
		</div>
	</div>

	<!-- QR Scanner Component -->
	<QrScanner />
</div>
