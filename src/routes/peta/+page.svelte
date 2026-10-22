<!--
  Flora SMK — School Botanical Map Page (Svelte 5 Runes)
  Tujuan: Menampilkan denah interaktif area SMK Pertanian dengan lokasi seluruh tanaman
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

<div class="flex flex-col gap-5">
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
		<div>
			<h1 class="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
				<Map class="w-7 h-7 text-emerald-600" />
				Peta Zonasi Kebun &amp; Praktikum
			</h1>
			<p class="text-xs sm:text-sm text-stone-500 mt-1">
				Klik pin marker untuk melihat preview tanaman, atau gunakan tombol zoom untuk menjelajahi area kebun.
			</p>
		</div>

		<a
			href="/katalog"
			class="inline-flex items-center gap-1.5 text-xs font-semibold text-stone-600 hover:text-emerald-700 bg-white px-3 py-2 rounded-xl border border-stone-200 transition-colors shadow-xs w-fit"
		>
			<ArrowLeft class="w-4 h-4" />
			<span>Katalog Daftar</span>
		</a>
	</div>

	<!-- Interactive Map Component -->
	{#if isLoading}
		<div class="w-full h-96 bg-white rounded-2xl border border-stone-200 animate-pulse flex items-center justify-center text-stone-400 text-sm">
			Memuat denah kebun sekolah...
		</div>
	{:else if mapData}
		<SchoolMap {mapData} />

		<div class="p-4 bg-emerald-50 rounded-xl border border-emerald-200/80 text-xs text-emerald-900 flex items-start gap-2.5">
			<Info class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
			<div>
				<p class="font-bold">Panduan Lokasi Lapangan:</p>
				<p class="text-emerald-800 mt-0.5">
					Setiap marker pin menunjukkan posisi tanaman di lapangan praktikum. Di lokasi fisik, Anda akan menemukan plang barcode / QR code yang dapat dipindai langsung dengan menu <strong>Scan QR</strong>.
				</p>
			</div>
		</div>
	{/if}
</div>
