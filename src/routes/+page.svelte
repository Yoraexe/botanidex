<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Tujuan: Halaman selamat datang dengan hero botani, pencarian cepat, koleksi unggulan, dan statistik
  Caller: Route '/'
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant } from '#lib/types/plant.types';
	import PlantCard from '#lib/components/plant/PlantCard.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { Search, QrCode, Map, Sparkles, Video, BookOpen, ArrowRight, ShieldCheck, PlusCircle } from '@lucide/svelte';

	let searchQuery = $state('');
	let plants = $state<Plant[]>([...INITIAL_PLANTS_DATA]);
	let isLoading = $state(false);

	onMount(async () => {
		try {
			const updated = await PlantService.getCatalog();
			if (updated && updated.length > 0) {
				plants = updated;
			}
		} catch (err) {
			console.warn('Gagal memuat tanaman:', err);
		}
	});

	function handleSearch(e: SubmitEvent) {
		e.preventDefault();
		if (searchQuery.trim()) {
			goto(`/katalog?q=${encodeURIComponent(searchQuery.trim())}`);
		} else {
			goto('/katalog');
		}
	}

	const totalVideos = $derived(
		plants.reduce((acc, p) => acc + (p.videos ? p.videos.length : 0), 0)
	);
</script>

<svelte:head>
	<title>Flora SMK — Katalog Tanaman Digital SMK Pertanian</title>
</svelte:head>

<div class="flex flex-col gap-10 sm:gap-14">
	<!-- Hero Section -->
	<section class="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-900 via-emerald-800 to-stone-900 text-white p-6 sm:p-12 shadow-lg">
		<!-- Decorative Background Leaf Overlay -->
		<div class="absolute -right-12 -bottom-12 w-96 h-96 opacity-10 pointer-events-none">
			<svg viewBox="0 0 100 100" fill="currentColor">
				<path d="M50 0 C70 30 90 60 90 90 C60 90 30 70 0 50 C30 50 40 20 50 0 Z" />
			</svg>
		</div>

		<div class="relative z-10 max-w-2xl flex flex-col gap-4">
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold w-fit">
				<Sparkles class="w-3.5 h-3.5" />
				<span>E-Katalog Botani &amp; Praktikum Lapangan SMK</span>
			</div>

			<h1 class="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
				Eksplorasi Seluruh Tanaman di Sekolah Kita
			</h1>

			<p class="text-stone-200 text-sm sm:text-base leading-relaxed">
				Kenali nama ilmiah (Latin), klasifikasi taksonomi, zonasi kebun praktikum, serta tonton video penjelasan budidaya yang dibuat langsung oleh siswa SMK Pertanian.
			</p>

			<!-- Live Search Form in Hero -->
			<form onsubmit={handleSearch} class="mt-2 flex items-center bg-white rounded-2xl p-1.5 shadow-md w-full max-w-xl">
				<div class="pl-3 text-stone-400">
					<Search class="w-5 h-5 text-emerald-600" />
				</div>
				<input
					bind:value={searchQuery}
					placeholder="Cari jahe, jagung, anggrek, nama Latin..."
					class="w-full px-3 py-2.5 text-sm text-stone-900 placeholder-stone-400 focus:outline-none bg-transparent"
				/>
				<button
					type="submit"
					class="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer shrink-0"
				>
					Cari
				</button>
			</form>

			<!-- Quick Action Buttons -->
			<div class="flex flex-wrap items-center gap-3 pt-2">
				<a
					href="/scan"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-colors"
				>
					<QrCode class="w-4 h-4 text-emerald-400" />
					<span>Scan QR di Batang Pohon</span>
				</a>
				<a
					href="/peta"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs border border-white/20 transition-colors"
				>
					<Map class="w-4 h-4 text-amber-400" />
					<span>Buka Peta Kebun Sekolah</span>
				</a>
			</div>
		</div>

		<!-- Quick Metric Stats Strip -->
		<div class="mt-8 pt-6 border-t border-emerald-700/50 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
			<div>
				<p class="text-2xl sm:text-3xl font-extrabold text-emerald-400">{plants.length}</p>
				<p class="text-xs text-stone-300">Spesies Terkatalog</p>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-extrabold text-amber-400">{totalVideos}</p>
				<p class="text-xs text-stone-300">Video Edukasi Siswa</p>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-extrabold text-emerald-400">5</p>
				<p class="text-xs text-stone-300">Zonasi Kebun Praktikum</p>
			</div>
			<div>
				<p class="text-2xl sm:text-3xl font-extrabold text-amber-400">100%</p>
				<p class="text-xs text-stone-300">Akses PWA Offline</p>
			</div>
		</div>
	</section>

	<!-- Category Quick Filter Section -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold text-stone-900 tracking-tight">Kategori Komoditas Pertanian</h2>
				<p class="text-xs text-stone-500">Pilih rumpun tanaman untuk melihat koleksi spesifik</p>
			</div>
			<a href="/katalog" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
				<span>Lihat Semua</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
			<a
				href="/katalog?cat=obat"
				class="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 hover:bg-emerald-100/80 transition-colors flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-2xl">🌿</span>
				<span class="text-xs font-bold text-emerald-900 group-hover:text-emerald-700">Tanaman Obat (TOGA)</span>
			</a>
			<a
				href="/katalog?cat=pangan"
				class="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 hover:bg-amber-100/80 transition-colors flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-2xl">🌽</span>
				<span class="text-xs font-bold text-amber-900 group-hover:text-amber-700">Tanaman Pangan</span>
			</a>
			<a
				href="/katalog?cat=hias"
				class="p-4 rounded-2xl bg-pink-50 border border-pink-200/80 hover:bg-pink-100/80 transition-colors flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-2xl">🌸</span>
				<span class="text-xs font-bold text-pink-900 group-hover:text-pink-700">Florikultura (Hias)</span>
			</a>
			<a
				href="/katalog?cat=industri"
				class="p-4 rounded-2xl bg-blue-50 border border-blue-200/80 hover:bg-blue-100/80 transition-colors flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-2xl">☕</span>
				<span class="text-xs font-bold text-blue-900 group-hover:text-blue-700">Perkebunan / Industri</span>
			</a>
			<a
				href="/katalog?cat=kayu"
				class="p-4 rounded-2xl bg-stone-100 border border-stone-200/80 hover:bg-stone-200/80 transition-colors flex flex-col items-center text-center gap-2 group col-span-2 sm:col-span-1"
			>
				<span class="text-2xl">🌲</span>
				<span class="text-xs font-bold text-stone-900 group-hover:text-stone-700">Tanaman Kayu &amp; Hutan</span>
			</a>
		</div>
	</section>

	<!-- Featured Plants Section -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl font-bold text-stone-900 tracking-tight">Koleksi Tanaman Unggulan</h2>
				<p class="text-xs text-stone-500">Spesies tanaman yang dipelajari dalam praktikum ATPH &amp; Agribisnis</p>
			</div>
			<a href="/katalog" class="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
				<span>Selengkapnya</span>
				<ArrowRight class="w-3.5 h-3.5" />
			</a>
		</div>

		{#if isLoading}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
				{#each [1, 2, 3, 4] as _}
					<div class="bg-white rounded-xl border border-stone-200 p-4 h-72 animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each plants.slice(0, 4) as plant (plant.id)}
					<PlantCard {plant} />
				{/each}
			</div>
		{/if}
	</section>

	<!-- Student Video Feature Callout -->
	<section class="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-stone-100 rounded-3xl p-6 sm:p-8 border border-amber-200/60 flex flex-col sm:flex-row items-center justify-between gap-6">
		<div class="flex items-start gap-4">
			<div class="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm">
				<Video class="w-6 h-6" />
			</div>
			<div>
				<h3 class="text-base sm:text-lg font-bold text-stone-900">
					Video Pembelajaran Langsung dari Siswa
				</h3>
				<p class="text-xs sm:text-sm text-stone-600 mt-1 max-w-xl">
					Setiap tanaman dilengkapi dokumentasi video yang dibuat siswa untuk melatih kemampuan presentasi agronomi, identifikasi hama penyakit, dan teknik pemangkasan.
				</p>
			</div>
		</div>
		<div class="flex items-center gap-3 shrink-0 w-full sm:w-auto">
			<a href="/kontribusi/tambah" class="w-full sm:w-auto">
				<Button variant="secondary" size="md" fullWidth>
					<PlusCircle class="w-4 h-4" />
					Unggah Video Tanaman
				</Button>
			</a>
		</div>
	</section>
</div>
