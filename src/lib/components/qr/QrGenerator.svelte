<!--
  Botanidex — Printable QR Plant Tag Generator (Svelte 5 Runes)
  Tujuan: Menghasilkan label fisik siap cetak berukuran standar untuk tanaman sekolah gaya Neo-Brutalist (Option A)
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
		a.download = `QR-Botanidex-${plant.slug}.png`;
		a.click();
	}
</script>

<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[5px_5px_0px_#0D0D0D] flex flex-col items-center text-center">
	<div class="flex items-center gap-2 mb-3 text-[#0D0D0D] font-black text-sm uppercase tracking-wide">
		<QrCode class="w-4 h-4 stroke-[2.5]" />
		<span>Label QR Botani Fisik</span>
	</div>

	<!-- Printable Physical Tag Preview Box -->
	<div
		id="printable-tag"
		class="w-68 p-4 rounded-xl border-2 border-[#0D0D0D] bg-white shadow-[3px_3px_0px_#0D0D0D] flex flex-col items-center text-[#0D0D0D] my-2"
	>
		<p class="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D] border-b-2 border-[#0D0D0D] pb-1 w-full text-center bg-[#D4F469] py-1 rounded-md">
			SMK PPN GORONTALO • KOLEKSI BOTANI
		</p>

		{#if qrDataUrl}
			<div class="p-2.5 my-3 bg-white rounded-xl border-2 border-[#0D0D0D]">
				<img src={qrDataUrl} alt="QR Code {plant.name_local}" class="w-36 h-36 mx-auto object-contain" />
			</div>
		{:else if isLoading}
			<div class="w-36 h-36 flex items-center justify-center text-xs text-stone-400 font-bold">
				Membuat QR...
			</div>
		{/if}

		<h4 class="font-black text-base text-[#0D0D0D] leading-tight">
			{plant.name_local}
		</h4>
		<p class="font-latin italic text-xs text-stone-700 font-bold mt-0.5">
			{plant.name_latin}
		</p>
		{#if plant.taxonomy.familia}
			<p class="text-[10px] text-stone-600 uppercase font-black mt-1">
				Famili: {plant.taxonomy.familia}
			</p>
		{/if}
		<p class="text-[9px] text-stone-500 font-bold mt-2.5 border-t border-[#0D0D0D]/30 pt-1.5 w-full">
			Scan menggunakan kamera HP untuk video &amp; profil botani
		</p>
	</div>

	<!-- Action Buttons -->
	<div class="flex items-center gap-2.5 mt-4 w-full">
		<Button variant="outline" size="sm" fullWidth onclick={handleDownload} disabled={!qrDataUrl}>
			<Download class="w-3.5 h-3.5 stroke-[2.5]" />
			Download PNG
		</Button>
		<Button variant="primary" size="sm" fullWidth onclick={handlePrint} disabled={!qrDataUrl}>
			<Printer class="w-3.5 h-3.5 stroke-[2.5]" />
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
			top: 20%;
			transform: translateX(-50%);
			box-shadow: none;
			border: 2px solid #000;
		}
	}
</style>
