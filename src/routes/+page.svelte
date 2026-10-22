<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Tujuan: Halaman selamat datang gaya Neo-Brutalist / Retro Pop dengan hero botani, pencarian cepat, kategori bento, dan statistik
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
	import { Search, QrCode, Map, Sparkles, Video, BookOpen, ArrowRight, ShieldCheck, PlusCircle, ArrowUpRight } from '@lucide/svelte';

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
	<!-- Hero Section Neo-Brutalist Banner -->
	<section class="relative rounded-3xl bg-[#6BB092] border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] p-6 sm:p-12 text-stone-900 overflow-hidden">
		<!-- Subtle Retro Memphis Graphic Accent in corner -->
		<div class="absolute -right-8 -bottom-8 w-64 h-64 border-4 border-[#18181B]/20 rounded-full pointer-events-none"></div>

		<div class="relative z-10 max-w-3xl flex flex-col gap-4">
			<!-- Tag Sticker -->
			<div class="inline-flex items-center gap-2 px-3 py-1 rounded-xl bg-[#F6BD60] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-stone-900 text-xs font-black w-fit">
				<Sparkles class="w-3.5 h-3.5 stroke-[2.5]" />
				<span>E-KATALOG BOTANI &amp; PRAKTIKUM LAPANGAN SMK</span>
			</div>

			<h1 class="text-3xl sm:text-5xl font-black tracking-tight leading-tight text-stone-900">
				Eksplorasi Seluruh Tanaman di Sekolah Kita
			</h1>

			<p class="text-stone-900 text-sm sm:text-base font-semibold leading-relaxed max-w-2xl">
				Kenali nama ilmiah (Latin), klasifikasi taksonomi, zonasi kebun praktikum, serta tonton video penjelasan budidaya yang dibuat langsung oleh siswa SMK Pertanian.
			</p>

			<!-- Live Search Form in Hero -->
			<form onsubmit={handleSearch} class="mt-2 flex items-center bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl p-1.5 shadow-[4px_4px_0px_#18181B] w-full max-w-xl">
				<div class="pl-3 text-stone-800">
					<Search class="w-5 h-5 stroke-[2.5]" />
				</div>
				<input
					bind:value={searchQuery}
					placeholder="Cari jahe merah, jagung, anggrek, nama Latin..."
					class="w-full px-3 py-2 text-sm text-stone-900 font-bold placeholder:text-stone-400 placeholder:font-medium focus:outline-none bg-transparent"
				/>
				<button
					type="submit"
					class="px-5 py-2.5 bg-[#F6BD60] hover:bg-[#eab052] text-stone-900 text-sm font-black rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer shrink-0"
				>
					Cari
				</button>
			</form>

			<!-- Quick Action Buttons -->
			<div class="flex flex-wrap items-center gap-3 pt-2">
				<a
					href="/scan"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-stone-100 text-stone-900 text-xs font-black border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all"
				>
					<QrCode class="w-4 h-4 stroke-[2.5]" />
					<span>Scan QR di Batang Pohon</span>
				</a>
				<a
					href="/peta"
					class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#93C5FD] hover:bg-[#7cb7fb] text-stone-900 text-xs font-black border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all"
				>
					<Map class="w-4 h-4 stroke-[2.5]" />
					<span>Buka Peta Kebun Sekolah</span>
				</a>
			</div>
		</div>

		<!-- Quick Metric Stats Strip (Bento Boxes) -->
		<div class="mt-8 pt-6 border-t-2 border-[#18181B] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
			<div class="bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="text-2xl sm:text-3xl font-black text-stone-900">{plants.length}</p>
				<p class="text-xs font-extrabold text-stone-600 mt-0.5">Spesies Terkatalog</p>
			</div>
			<div class="bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="text-2xl sm:text-3xl font-black text-stone-900">{totalVideos}</p>
				<p class="text-xs font-extrabold text-stone-600 mt-0.5">Video Edukasi Siswa</p>
			</div>
			<div class="bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="text-2xl sm:text-3xl font-black text-stone-900">5</p>
				<p class="text-xs font-extrabold text-stone-600 mt-0.5">Zonasi Kebun Praktikum</p>
			</div>
			<div class="bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="text-2xl sm:text-3xl font-black text-stone-900">100%</p>
				<p class="text-xs font-extrabold text-stone-600 mt-0.5">Akses PWA Offline</p>
			</div>
		</div>
	</section>

	<!-- Category Quick Filter Bento Grid -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Kategori Komoditas Pertanian</h2>
				<p class="text-xs sm:text-sm text-stone-600 font-medium">Pilih rumpun tanaman untuk melihat koleksi spesifik sekolah</p>
			</div>
			<a href="/katalog" class="text-xs font-black text-stone-900 px-3 py-1.5 rounded-xl border-2 border-[#18181B] bg-white shadow-[2px_2px_0px_#18181B] hover:bg-[#F6BD60] transition-colors flex items-center gap-1">
				<span>Lihat Semua</span>
				<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
			</a>
		</div>

		<div class="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
			<a
				href="/katalog?cat=obat"
				class="p-4 rounded-2xl bg-[#6BB092] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-3xl">🌿</span>
				<span class="text-xs font-black text-stone-900">Tanaman Obat (TOGA)</span>
			</a>
			<a
				href="/katalog?cat=pangan"
				class="p-4 rounded-2xl bg-[#F6BD60] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-3xl">🌽</span>
				<span class="text-xs font-black text-stone-900">Tanaman Pangan</span>
			</a>
			<a
				href="/katalog?cat=hias"
				class="p-4 rounded-2xl bg-[#CDB4DB] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-3xl">🌸</span>
				<span class="text-xs font-black text-stone-900">Florikultura (Hias)</span>
			</a>
			<a
				href="/katalog?cat=industri"
				class="p-4 rounded-2xl bg-[#93C5FD] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group"
			>
				<span class="text-3xl">☕</span>
				<span class="text-xs font-black text-stone-900">Perkebunan &amp; Industri</span>
			</a>
			<a
				href="/katalog?cat=kayu"
				class="p-4 rounded-2xl bg-[#E07A5F] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] hover:shadow-[5px_5px_0px_#18181B] hover:-translate-y-1 transition-all flex flex-col items-center text-center gap-2 group col-span-2 sm:col-span-1"
			>
				<span class="text-3xl">🌲</span>
				<span class="text-xs font-black text-white">Tanaman Kayu &amp; Hutan</span>
			</a>
		</div>
	</section>

	<!-- Featured Plants Section -->
	<section class="flex flex-col gap-4">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Koleksi Tanaman Unggulan</h2>
				<p class="text-xs sm:text-sm text-stone-600 font-medium">Spesies tanaman yang dipelajari dalam praktikum ATPH &amp; Agribisnis</p>
			</div>
			<a href="/katalog" class="text-xs font-black text-stone-900 px-3 py-1.5 rounded-xl border-2 border-[#18181B] bg-white shadow-[2px_2px_0px_#18181B] hover:bg-[#F6BD60] transition-colors flex items-center gap-1">
				<span>Selengkapnya</span>
				<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
			</a>
		</div>

		{#if isLoading}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each [1, 2, 3, 4] as _}
					<div class="bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 h-72 animate-pulse"></div>
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

	<!-- Student Video Feature Callout (Retro Broadcast Frame) -->
	<section class="bg-[#F6BD60] rounded-3xl p-6 sm:p-8 border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] flex flex-col sm:flex-row items-center justify-between gap-6">
		<div class="flex items-start gap-4">
			<div class="w-12 h-12 rounded-2xl bg-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-stone-900 flex items-center justify-center shrink-0">
				<Video class="w-6 h-6 stroke-[2.5]" />
			</div>
			<div>
				<h3 class="text-base sm:text-xl font-black text-stone-900">
					Video Pembelajaran Langsung dari Siswa
				</h3>
				<p class="text-xs sm:text-sm text-stone-900 font-semibold mt-1 max-w-xl leading-relaxed">
					Setiap tanaman dilengkapi dokumentasi video yang dibuat siswa untuk melatih kemampuan presentasi agronomi, identifikasi hama penyakit, dan teknik pemangkasan.
				</p>
			</div>
		</div>
		<div class="flex items-center gap-3 shrink-0 w-full sm:w-auto">
			<a href="/kontribusi/tambah" class="w-full sm:w-auto">
				<Button variant="primary" size="md" fullWidth>
					<PlusCircle class="w-4 h-4 stroke-[2.5]" />
					Unggah Video Tanaman
				</Button>
			</a>
		</div>
	</section>
</div>
