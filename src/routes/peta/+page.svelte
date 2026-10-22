<!--
  Flora SMK — School Botanical Map Page (Svelte 5 Runes)
  Tujuan: Menampilkan denah interaktif area SMK Pertanian dengan lokasi seluruh tanaman gaya Neo-Brutalist
  Caller: Route '/peta'
  BRD Ref: F4 (Peta Lokasi Tanaman)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { MapRepository } from '#lib/repositories/map.repository';
	import type { SchoolMapInfo } from '#lib/types/map.types';
	import SchoolMap from '#lib/components/map/SchoolMap.svelte';
	import { Map, ArrowLeft, Info } from '@lucide/svelte';

	let mapData = $state<SchoolMapInfo | null>(null);
	let isLoading = $state(true);

	onMount(async () => {
		try {
			mapData = await MapRepository.getSchoolMapData();
		} catch (err) {
			console.warn('Gagal memuat denah sekolah:', err);
		} finally {
			isLoading = false;
		}
	});
</script>

<svelte:head>
	<title>Peta Kebun &amp; Lokasi Tanaman — Flora SMK</title>
</svelte:head>

<div class="flex flex-col gap-6">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
		<div>
			<h1 class="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight flex items-center gap-2.5">
				<div class="w-9 h-9 rounded-xl bg-[#93C5FD] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-stone-900 shrink-0">
					<Map class="w-5 h-5 stroke-[2.5]" />
				</div>
				Peta Zonasi Kebun &amp; Praktikum
			</h1>
			<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
				Klik pin marker untuk melihat preview tanaman, atau gunakan tombol zoom &amp; geser untuk menjelajahi area kebun.
			</p>
		</div>

		<a
			href="/katalog"
			class="inline-flex items-center gap-2 text-xs font-black text-stone-900 bg-white px-3.5 py-2.5 rounded-full border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#E2EF46] transition-colors w-fit active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D]"
		>
			<ArrowLeft class="w-4 h-4 stroke-[2.5]" />
			<span>Katalog Daftar</span>
		</a>
	</div>

	<!-- Interactive Map Component -->
	{#if isLoading}
		<div class="w-full h-96 bg-[#FFFEF9] rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] animate-pulse flex items-center justify-center text-stone-400 font-bold text-sm">
			Memuat denah kebun sekolah...
		</div>
	{:else if mapData}
		<SchoolMap {mapData} />

		<div class="p-4 bg-[#FFFEF9] rounded-2xl border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] text-xs text-stone-900 flex items-start gap-3">
			<div class="w-8 h-8 rounded-xl bg-[#E2EF46] border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] flex items-center justify-center shrink-0 mt-0.5">
				<Info class="w-4 h-4 text-stone-900 stroke-[2.5]" />
			</div>
			<div>
				<p class="font-black text-sm text-stone-900">Panduan Lokasi Lapangan Praktikum:</p>
				<p class="text-stone-700 font-medium mt-1 leading-relaxed">
					Setiap marker pin menunjukkan posisi tanaman di lapangan praktikum. Di lokasi fisik kebun sekolah, Anda dapat menemukan plang barcode / QR code yang dapat dipindai langsung melalui menu <strong>Scan QR</strong>.
				</p>
			</div>
		</div>
	{/if}
</div>
