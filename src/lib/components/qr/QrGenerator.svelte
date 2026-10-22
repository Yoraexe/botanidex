<!--
  Flora SMK — Printable QR Plant Tag Generator (Svelte 5 Runes)
  Tujuan: Menghasilkan label fisik siap cetak berukuran standar untuk tanaman sekolah
  Caller: Halaman detail tanaman, panel admin
  BRD Ref: F3 (QR Code Generator)
-->
<script lang="ts">
	import type { Plant } from '#lib/types/plant.types';
	import { PlantService } from '#lib/services/plant.service';
	import { onMount } from 'svelte';
	import { Printer, Download, QrCode } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	interface Props {
		plant: Plant;
	}

	let { plant }: Props = $props();

	let qrDataUrl = $state<string | null>(null);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			qrDataUrl = await PlantService.generateQrDataUrl(plant.slug);
		} catch (err) {
			console.warn('Gagal generate QR:', err);
		} finally {
			isLoading = false;
		}
	});

	function handlePrint() {
		window.print();
	}

	function handleDownload() {
		if (!qrDataUrl) return;
		const a = document.createElement('a');
		a.href = qrDataUrl;
		a.download = `QR-FloraSMK-${plant.slug}.png`;
		a.click();
	}
</script>

<div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col items-center text-center">
	<div class="flex items-center gap-2 mb-3 text-stone-900 font-bold text-sm">
		<QrCode class="w-4 h-4 text-emerald-600" />
		<span>Label QR Botani Fisik</span>
	</div>

	<!-- Printable Physical Tag Preview Box -->
	<div
		id="printable-tag"
		class="w-64 p-4 rounded-xl border-2 border-stone-800 bg-white shadow-sm flex flex-col items-center text-stone-900 my-2"
	>
		<p class="text-[10px] font-black uppercase tracking-widest text-emerald-800 border-b border-stone-200 pb-1 w-full text-center">
			SMK PERTANIAN • FLORA DIGITAL
		</p>

		{#if qrDataUrl}
			<div class="p-2 my-2 bg-white rounded-lg border border-stone-200">
				<img src={qrDataUrl} alt="QR Code {plant.name_local}" class="w-36 h-36 mx-auto object-contain" />
			</div>
		{:else if isLoading}
			<div class="w-36 h-36 flex items-center justify-center text-xs text-stone-400">
				Membuat QR...
			</div>
		{/if}

		<h4 class="font-bold text-sm text-stone-900 leading-tight">
			{plant.name_local}
		</h4>
		<p class="font-latin italic text-xs text-stone-600 mt-0.5">
			{plant.name_latin}
		</p>
		{#if plant.taxonomy.familia}
			<p class="text-[10px] text-stone-500 uppercase font-semibold mt-1">
				Famili: {plant.taxonomy.familia}
			</p>
		{/if}
		<p class="text-[9px] text-stone-400 mt-2 border-t border-stone-100 pt-1 w-full">
			Scan menggunakan kamera HP untuk informasi lengkap
		</p>
	</div>

	<!-- Action Buttons -->
	<div class="flex items-center gap-2 mt-4 w-full">
		<Button variant="outline" size="sm" fullWidth onclick={handleDownload} disabled={!qrDataUrl}>
			<Download class="w-3.5 h-3.5" />
			Download PNG
		</Button>
		<Button variant="primary" size="sm" fullWidth onclick={handlePrint} disabled={!qrDataUrl}>
			<Printer class="w-3.5 h-3.5" />
			Cetak Label
		</Button>
	</div>
</div>

<style>
	@media print {
		:global(body *) {
			visibility: hidden;
		}
		#printable-tag,
		#printable-tag * {
			visibility: visible;
		}
		#printable-tag {
			position: absolute;
			left: 50%;
			top: 50%;
			transform: translate(-50%, -50%);
			box-shadow: none;
			border: 2px solid #000;
		}
	}
</style>
