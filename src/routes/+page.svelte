<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Visual Style: Proportional Neo-Brutalist Editorial Bento Hero (Crypko-Inspired)
  Caller: Route '/'
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant, PlantCategory } from '#lib/types/plant.types';
	import PlantCard from '#lib/components/plant/PlantCard.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import FilterChip from '#lib/components/ui/FilterChip.svelte';
	import {
		Search,
		QrCode,
		Map,
		Sparkles,
		Video,
		BookOpen,
		ArrowRight,
		PlusCircle,
		ArrowUpRight,
		Camera,
		CheckCircle2
	} from '@lucide/svelte';

	let searchQuery = $state('');
	let selectedCategory = $state<PlantCategory | 'semua'>('semua');
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

	const filteredFeatured = $derived(
		plants
			.filter((p) => {
				if (selectedCategory === 'semua') return true;
				return p.category === selectedCategory;
			})
			.slice(0, 4)
	);

	const totalVideos = $derived(
		plants.reduce((acc, p) => acc + (p.videos ? p.videos.length : 0), 0)
	);
</script>

<svelte:head>
	<title>Flora SMK — Katalog Botani Digital SMK Pertanian</title>
</svelte:head>

<div class="flex flex-col gap-10 sm:gap-14">
	<!-- ========================================================================= -->
	<!-- PROPORTIONAL EDITORIAL HERO SECTION (CRYPKO INSPIRATION) -->
	<!-- ========================================================================= -->
	<section
		class="relative w-full max-w-6xl mx-auto rounded-[32px] sm:rounded-[40px] border-2 border-[#18181B] bg-[#F2EFE9] shadow-[6px_6px_0px_#18181B] p-6 sm:p-10 lg:p-12 overflow-hidden flex flex-col justify-between"
	>
		<!-- 1. TOP MICRO NAVIGATION STRIP (Crypko-style) -->
		<div class="flex items-center justify-between w-full mb-8 sm:mb-12">
			<!-- Brand Logo -->
			<div class="flex items-center gap-1.5 font-black text-2xl sm:text-3xl tracking-tight text-stone-900 select-none">
				<span>flora smk</span>
				<span class="text-sm text-[#E07A5F]">♥</span>
			</div>

			<!-- Center Black Notched Cutout Bar (Desktop) -->
			<div
				class="hidden md:flex items-center gap-6 px-7 py-2.5 bg-[#18181B] text-[#F2EFE9] rounded-b-2xl -mt-6 sm:-mt-12 text-xs font-bold tracking-wide shadow-xs select-none"
			>
				<a href="/katalog" class="hover:text-[#F6BD60] transition-colors">Katalog</a>
				<a href="/katalog?cat=obat" class="hover:text-[#F6BD60] transition-colors">TOGA</a>
				<a href="/katalog?cat=pangan" class="hover:text-[#F6BD60] transition-colors">Pangan</a>
				<a href="/peta" class="hover:text-[#F6BD60] transition-colors">Peta Kebun</a>
				<a href="/scan" class="hover:text-[#F6BD60] transition-colors">Scan QR</a>
			</div>

			<!-- Right Action Pill Button -->
			<a
				href="/katalog"
				class="px-5 py-2 rounded-full border-2 border-[#18181B] bg-white text-stone-900 font-black text-xs hover:bg-[#F6BD60] transition-colors shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 select-none"
			>
				Eksplorasi
			</a>
		</div>

		<!-- 2. MAIN 2-ROW BENTO COMPOSITION -->
		<div class="relative flex flex-col gap-8 sm:gap-10">
			<!-- ROW 1: Giant Headline (Left) & Vertical Portrait Card (Right) -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
				<!-- Top-Left: Giant Headline Typography -->
				<div class="lg:col-span-7 flex flex-col justify-center">
					<h1
						class="font-display text-5xl sm:text-7xl lg:text-[5.75rem] font-black uppercase tracking-tight leading-[0.88] text-[#18181B]"
					>
						KATALOG BOTANI<br />
						SMK PERTANIAN
					</h1>
					<p class="text-stone-600 text-xs sm:text-sm font-semibold tracking-wide uppercase mt-4 max-w-md">
						Platform Digital Identifikasi Spesimen &amp; Praktikum Lapangan
					</p>
				</div>

				<!-- Top-Right: Vertical Portrait Botanical Card -->
				<div class="lg:col-span-5 flex justify-center lg:justify-end">
					<a
						href="/katalog/anggrek-bulan"
						class="relative w-[280px] sm:w-[310px] h-[340px] sm:h-[370px] rounded-tl-[3.5rem] rounded-2xl overflow-hidden border-2 border-[#18181B] bg-white shadow-[4px_4px_0px_#18181B] flex flex-row group hover:-translate-y-1 hover:shadow-[6px_6px_0px_#18181B] transition-all"
					>
						<!-- Image Area -->
						<div class="flex-1 h-full relative overflow-hidden bg-stone-100">
							<img
								src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80"
								alt="Anggrek Bulan Puspa Pesona"
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
							<div
								class="absolute bottom-3 left-3 bg-[#18181B]/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-[10px] font-bold"
							>
								<p class="font-latin italic">Phalaenopsis amabilis</p>
							</div>
						</div>

						<!-- Vertical Yellow Strip (Crypko aesthetic) -->
						<div
							class="w-10 bg-[#F6BD60] border-l-2 border-[#18181B] flex flex-col items-center justify-between py-4 text-stone-900 select-none shrink-0"
						>
							<span class="text-xs font-black tracking-tighter">★★</span>
							<span
								class="writing-mode-vertical text-[10px] font-black uppercase tracking-widest rotate-180 text-center"
							>
								PUSPA PESONA
							</span>
							<span class="text-sm font-black group-hover:-translate-y-0.5 transition-transform">↑</span>
						</div>
					</a>
				</div>
			</div>

			<!-- CENTER ROTATING MEMPHIS STAMP (Floating in the open whitespace) -->
			<div
				class="hidden sm:block absolute left-[48%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
			>
				<div class="relative w-30 h-30 flex items-center justify-center">
					<!-- Rotating SVG Text -->
					<svg class="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
						<path
							id="stampPath"
							d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
							fill="none"
						/>
						<text class="text-[8.5px] font-black uppercase tracking-[0.24em] fill-[#18181B]">
							<textPath href="#stampPath" startOffset="0%">
								★ FLORA SMK OFFICIAL ★ BOTANICAL PLATFORM ★
							</textPath>
						</text>
					</svg>

					<!-- Center Starburst Badge Button -->
					<a
						href="/katalog"
						class="w-18 h-18 rounded-full bg-[#18181B] text-[#F6BD60] hover:bg-[#F6BD60] hover:text-[#18181B] border-2 border-[#18181B] flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#18181B]"
						aria-label="Mulai jelajah katalog"
					>
						<span class="text-[8px] font-black leading-none">★</span>
						<span class="text-[9px] font-black uppercase tracking-tight leading-tight">START<br />JELAJAH</span>
						<span class="text-[8px] font-black leading-none">★</span>
					</a>
				</div>
			</div>

			<!-- ROW 2: Landscape Botanical Card (Left) & Notched Feature Card (Right) -->
			<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
				<!-- Bottom-Left: Landscape Card with attached yellow tab -->
				<div class="lg:col-span-7">
					<div
						class="relative w-full h-[210px] sm:h-[230px] rounded-bl-[3.5rem] rounded-2xl overflow-hidden border-2 border-[#18181B] bg-white shadow-[4px_4px_0px_#18181B] flex flex-row group"
					>
						<!-- Image Area -->
						<div class="flex-1 h-full relative overflow-hidden bg-stone-900">
							<img
								src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1000&q=80"
								alt="Lahan Praktikum Pertanian"
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
							<div
								class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent p-4 sm:p-5 flex flex-col justify-end text-white"
							>
								<span
									class="text-[10px] font-bold text-[#F6BD60] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded w-fit mb-1 border border-white/20"
								>
									Lahan Praktikum Bedeng C-4
								</span>
								<h4 class="text-sm sm:text-base font-bold leading-tight">
									Polinasi Jagung &amp; Budidaya Tanaman Pangan
								</h4>
								<p class="text-xs text-stone-300 font-medium line-clamp-1 mt-0.5">
									Dokumentasi materi praktikum agronomi oleh siswa XI ATPH.
								</p>
							</div>
						</div>

						<!-- Attached Yellow Strip on Right Edge -->
						<a
							href="/katalog?cat=pangan"
							class="w-14 sm:w-16 bg-[#F6BD60] border-l-2 border-[#18181B] flex flex-col items-center justify-center gap-1.5 p-2 text-stone-900 hover:bg-[#eab052] transition-colors shrink-0 group/tab select-none"
							title="Lihat tanaman pangan"
						>
							<span class="text-xl group-hover/tab:scale-110 transition-transform">🌱</span>
							<span class="text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight">
								KEBUN<br />SISWA
							</span>
						</a>
					</div>
				</div>

				<!-- Bottom-Right: Feature Card with 3-dot Notched Tab (Crypko aesthetic) -->
				<div class="lg:col-span-5 flex flex-col">
					<div
						class="relative w-full h-[210px] sm:h-[230px] bg-white rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-5 flex flex-col justify-between"
					>
						<!-- Notched Header with 3 Dots -->
						<div class="flex items-center justify-between border-b-2 border-stone-100 pb-2.5">
							<h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-stone-900">
								APLIKASI PWA LAPANGAN
							</h3>
							<!-- Black pill with 3 dots -->
							<div class="px-2.5 py-1 rounded-full bg-[#18181B] flex items-center gap-1">
								<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
								<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
								<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							</div>
						</div>

						<!-- Description -->
						<p class="text-xs sm:text-sm text-stone-600 font-semibold leading-relaxed">
							Flora SMK dapat diakses langsung secara offline di kebun sekolah. Tersedia identifikasi taksonomi, dokumentasi video buatan siswa, dan pemindai QR barcode fisik.
						</p>

						<!-- Bottom Row: Platform tags & Action pill -->
						<div class="flex items-center justify-between pt-2 border-t border-stone-100">
							<div class="flex items-center gap-1.5">
								<span
									class="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center text-[10px] font-black"
									title="PWA Offline Supported"
								>
									A
								</span>
								<span
									class="w-7 h-7 rounded-full bg-[#18181B] text-white flex items-center justify-center text-[10px] font-black"
									title="Video Player Supported"
								>
									▶
								</span>
							</div>

							<!-- Action Pill Button -->
							<a
								href="/scan"
								class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 border-[#18181B] bg-white hover:bg-[#F6BD60] text-xs font-bold text-stone-900 shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 transition-all select-none"
							>
								<span>Scan QR</span>
								<div
									class="w-5 h-5 rounded-full bg-[#F6BD60] border border-[#18181B] flex items-center justify-center text-[10px] font-black"
								>
									↓
								</div>
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- DEDICATED SEARCH & COMMODITY FILTER BAR (CLEAN & SEPARATE) -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-6xl mx-auto bg-white rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
	>
		<!-- Live Search Input -->
		<form onsubmit={handleSearch} class="flex items-center gap-2 flex-1 max-w-md">
			<div class="relative w-full">
				<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-800 stroke-[2.5]" />
				<input
					bind:value={searchQuery}
					placeholder="Cari jahe merah, jagung, nama Latin..."
					class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#F2EFE9] border-2 border-[#18181B] rounded-xl shadow-[2px_2px_0px_#18181B] focus:shadow-[3px_3px_0px_#18181B] outline-none font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-medium"
				/>
			</div>
			<button
				type="submit"
				class="px-4 py-2.5 bg-[#F6BD60] hover:bg-[#eab052] text-stone-900 text-xs sm:text-sm font-black rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
			>
				Cari
			</button>
		</form>

		<!-- Category Filter Chips -->
		<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar shrink-0">
			<FilterChip
				active={selectedCategory === 'semua'}
				onclick={() => (selectedCategory = 'semua')}
			>
				Semua
			</FilterChip>
			<FilterChip
				active={selectedCategory === 'obat'}
				onclick={() => (selectedCategory = 'obat')}
			>
				🌿 TOGA
			</FilterChip>
			<FilterChip
				active={selectedCategory === 'pangan'}
				onclick={() => (selectedCategory = 'pangan')}
			>
				🌽 Pangan
			</FilterChip>
			<FilterChip
				active={selectedCategory === 'hias'}
				onclick={() => (selectedCategory = 'hias')}
			>
				🌸 Hias
			</FilterChip>
			<FilterChip
				active={selectedCategory === 'industri'}
				onclick={() => (selectedCategory = 'industri')}
			>
				☕ Perkebunan
			</FilterChip>
			<FilterChip
				active={selectedCategory === 'kayu'}
				onclick={() => (selectedCategory = 'kayu')}
			>
				🌲 Kayu
			</FilterChip>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- FEATURED PLANTS GRID -->
	<!-- ========================================================================= -->
	<section class="flex flex-col gap-4 max-w-6xl mx-auto w-full">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Koleksi Tanaman Unggulan</h2>
				<p class="text-xs sm:text-sm text-stone-600 font-medium">Spesies tanaman yang dipelajari dalam praktikum ATPH &amp; Agribisnis</p>
			</div>
			<a
				href="/katalog"
				class="text-xs font-black text-stone-900 px-3.5 py-1.5 rounded-xl border-2 border-[#18181B] bg-white shadow-[2px_2px_0px_#18181B] hover:bg-[#F6BD60] transition-colors flex items-center gap-1"
			>
				<span>Semua ({plants.length})</span>
				<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
			</a>
		</div>

		{#if isLoading}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each [1, 2, 3, 4] as _}
					<div class="bg-white rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 h-72 animate-pulse"></div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each filteredFeatured as plant (plant.id)}
					<PlantCard {plant} />
				{/each}
			</div>
		{/if}
	</section>

	<!-- ========================================================================= -->
	<!-- STUDENT VIDEO CALLOUT -->
	<!-- ========================================================================= -->
	<section
		class="max-w-6xl mx-auto w-full bg-[#F6BD60] rounded-3xl p-6 sm:p-8 border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] flex flex-col sm:flex-row items-center justify-between gap-6"
	>
		<div class="flex items-start gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-white border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-stone-900 flex items-center justify-center shrink-0"
			>
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

<style>
	.writing-mode-vertical {
		writing-mode: vertical-rl;
	}
</style>
