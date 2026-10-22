<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Visual Style: Tight, Interlocking, Proportional Replica of Crypko Poster Aesthetic
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
		Video,
		BookOpen,
		ArrowRight,
		PlusCircle,
		ArrowUpRight,
		Camera
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

<div class="flex flex-col gap-10 sm:gap-12">
	<!-- ========================================================================= -->
	<!-- EXACT PROPORTIONAL CRYPKO ARTBOARD (TIGHT, COMPACT & DENSE) -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-[1080px] mx-auto rounded-[32px] border-[3px] border-[#0D0D0D] bg-[#E6E1D3] shadow-[8px_8px_0px_#0D0D0D] p-5 sm:p-7 lg:p-8 relative overflow-hidden flex flex-col gap-5 sm:gap-6"
	>
		<!-- 1. TOP BAR (Logo + Inverted Center Black Tab + Pill Action) -->
		<div class="flex items-center justify-between w-full pb-1">
			<!-- Brand Logo -->
			<a href="/" class="flex items-center gap-1 font-bold text-2xl sm:text-3xl tracking-tight text-[#0D0D0D] select-none hover:opacity-80 transition-opacity">
				<span>flora smk</span>
				<span class="text-sm text-[#0D0D0D]">♥</span>
			</a>

			<!-- Center Black Notched Cutout Bar (Exact Crypko style) -->
			<div
				class="hidden md:flex items-center gap-7 px-8 py-2.5 bg-[#0D0D0D] text-[#E6E1D3] rounded-b-2xl -mt-5 sm:-mt-8 text-xs font-semibold tracking-wider select-none shadow-xs"
			>
				<a href="/katalog" class="hover:text-[#E2EF46] transition-colors">Katalog</a>
				<a href="/katalog?cat=obat" class="hover:text-[#E2EF46] transition-colors">TOGA</a>
				<a href="/katalog?cat=pangan" class="hover:text-[#E2EF46] transition-colors">Pangan</a>
				<a href="/peta" class="hover:text-[#E2EF46] transition-colors">Peta Kebun</a>
				<a href="/scan" class="hover:text-[#E2EF46] transition-colors">Scan QR</a>
			</div>

			<!-- Right Pill Action Button -->
			<a
				href="/katalog"
				class="px-6 py-2 rounded-full border-2 border-[#0D0D0D] bg-white text-[#0D0D0D] font-bold text-xs hover:bg-[#E2EF46] transition-colors shadow-xs select-none active:translate-y-0.5"
			>
				Eksplorasi
			</a>
		</div>

		<!-- 2. INTERLOCKING 2-ROW CONTENT AREA -->
		<div class="relative grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
			<!-- ROW 1 LEFT: Giant Condensed Headline (Takes full left column) -->
			<div class="lg:col-span-8 flex flex-col justify-center">
				<h1
					class="font-display text-6xl sm:text-7xl md:text-8xl lg:text-[6.8rem] xl:text-[7.2rem] font-black uppercase tracking-tight leading-[0.82] text-[#0D0D0D]"
				>
					KATALOG BOTANI<br />
					SMK PERTANIAN
				</h1>
			</div>

			<!-- ROW 1 RIGHT: Vertical Card with Yellow Strip -->
			<div class="lg:col-span-4 flex justify-center lg:justify-end">
				<a
					href="/katalog/anggrek-bulan"
					class="relative w-[280px] sm:w-[310px] h-[370px] sm:h-[400px] rounded-2xl rounded-tl-[3.5rem] border-2 border-[#0D0D0D] bg-[#D5D0C3] overflow-hidden flex flex-row group hover:-translate-y-1 hover:shadow-[5px_5px_0px_#0D0D0D] transition-all shadow-xs"
				>
					<!-- Double contour line on top-left notch (Crypko detail) -->
					<div
						class="absolute top-2 left-2 w-16 h-16 rounded-tl-[2.8rem] border-t-2 border-l-2 border-[#0D0D0D]/40 pointer-events-none z-10"
					></div>

					<!-- Image Area -->
					<div class="flex-1 h-full relative overflow-hidden bg-[#D5D0C3] flex items-center justify-center p-2">
						<img
							src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=800&q=80"
							alt="Anggrek Bulan Puspa Pesona"
							class="w-full h-full object-cover rounded-tl-[3rem] group-hover:scale-105 transition-transform duration-500"
						/>
						<div
							class="absolute bottom-3 left-3 bg-[#0D0D0D]/85 text-white px-2.5 py-1 rounded-md text-[10px] font-bold z-10"
						>
							<p class="font-latin italic">Phalaenopsis amabilis</p>
						</div>
					</div>

					<!-- Vertical Neon Chartreuse Strip -->
					<div
						class="w-9 sm:w-10 bg-[#E2EF46] border-l-2 border-[#0D0D0D] flex flex-col items-center justify-between py-4 text-[#0D0D0D] select-none shrink-0"
					>
						<span class="text-xs font-black tracking-tighter">✦ ✦</span>
						<span
							class="writing-mode-vertical text-[10px] font-black uppercase tracking-widest rotate-180 text-center"
						>
							PUSPA PESONA
						</span>
						<span class="text-sm font-black group-hover:-translate-y-0.5 transition-transform">↑</span>
					</div>
				</a>
			</div>

			<!-- ROW 2 LEFT: Landscape Botanical Card with Attached Pill Button -->
			<div class="lg:col-span-8 flex justify-start">
				<div
					class="relative w-full max-w-[560px] h-[240px] sm:h-[260px] rounded-2xl rounded-bl-[3.5rem] border-2 border-[#0D0D0D] bg-white overflow-hidden flex flex-row group shadow-xs"
				>
					<!-- Photo of Botanical Greenhouse / Crops -->
					<div class="flex-1 h-full relative overflow-hidden bg-stone-900">
						<img
							src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80"
							alt="Greenhouse Pembibitan Tanaman SMK"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
						/>
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent p-4 flex flex-col justify-end text-white"
						>
							<span
								class="text-[9px] font-bold text-[#E2EF46] uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded w-fit mb-1 border border-white/20"
							>
								Greenhouse Florikultura &amp; Bibit
							</span>
							<h4 class="text-sm sm:text-base font-bold leading-tight">
								Budidaya &amp; Observasi Praktikum Agronomi
							</h4>
						</div>
					</div>

					<!-- Attached Yellow Pill on Right Edge (Exact Crypko styling) -->
					<a
						href="/katalog?cat=pangan"
						class="w-14 sm:w-16 bg-[#E2EF46] border-l-2 border-[#0D0D0D] flex flex-col items-center justify-center gap-1.5 p-2 text-[#0D0D0D] hover:bg-[#d4e138] transition-colors shrink-0 group/tab select-none"
						title="Eksplorasi tanaman"
					>
						<span class="text-2xl group-hover/tab:scale-110 transition-transform">🌱</span>
						<span class="text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight">
							JELAJAH<br />BOTANI
						</span>
					</a>
				</div>
			</div>

			<!-- ROW 2 RIGHT: Notched App Card (Aligned with Vertical Card above) -->
			<div class="lg:col-span-4 flex justify-center lg:justify-end">
				<div
					class="relative w-[280px] sm:w-[310px] h-[240px] sm:h-[260px] bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 flex flex-col justify-between shadow-xs"
				>
					<!-- Top Chamfer Notch Contour (Crypko detail) -->
					<div
						class="absolute top-0 left-0 w-8 h-8 rounded-tl-xl border-t-2 border-l-2 border-[#0D0D0D] pointer-events-none"
					></div>

					<!-- Notched Header with 3 Dots Tab -->
					<div class="flex items-center justify-between border-b border-stone-200 pb-2.5">
						<h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0D0D0D]">
							APLIKASI PWA LAPANGAN
						</h3>
						<!-- Black pill tab with 3 white dots -->
						<div class="px-2.5 py-0.5 rounded-full bg-[#0D0D0D] flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
						</div>
					</div>

					<!-- Description -->
					<p class="text-xs text-stone-600 font-medium leading-relaxed">
						Aplikasi katalog botani mandiri untuk siswa dan guru SMK Pertanian. Dilengkapi taksonomi ilmiah, video budidaya, dan QR scanner offline.
					</p>

					<!-- Bottom Row: Interconnected circular icons & Action pill button -->
					<div class="flex items-center justify-between pt-2 border-t border-stone-100">
						<div class="flex items-center -space-x-1">
							<span
								class="w-7 h-7 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[10px] font-black z-10"
								title="PWA Offline Supported"
							>
								A
							</span>
							<span
								class="w-7 h-7 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[10px] font-black"
								title="Video Player Supported"
							>
								▶
							</span>
						</div>

						<!-- Action Pill Button with Yellow Circle Arrow -->
						<a
							href="/scan"
							class="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#0D0D0D] bg-white hover:bg-stone-50 text-xs font-bold text-[#0D0D0D] shadow-xs active:translate-y-0.5 transition-all select-none"
						>
							<span>Scan QR</span>
							<div
								class="w-5 h-5 rounded-full bg-[#E2EF46] border border-[#0D0D0D] flex items-center justify-center text-[10px] font-black"
							>
								↓
							</div>
						</a>
					</div>
				</div>
			</div>

			<!-- 3. CENTER ROTATING MEMPHIS STAMP (Tightly Bridging the 4 Quadrants) -->
			<div
				class="hidden lg:block absolute left-[54%] top-[50%] -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto"
			>
				<div class="relative w-32 h-32 flex items-center justify-center">
					<!-- Rotating SVG Text -->
					<svg class="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
						<path
							id="stampPath"
							d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
							fill="none"
						/>
						<text class="text-[8.5px] font-black uppercase tracking-[0.24em] fill-[#0D0D0D]">
							<textPath href="#stampPath" startOffset="0%">
								★ OFFICIAL RELEASE • FLORA SMK BOTANICAL PLATFORM V1.0 • ★
							</textPath>
						</text>
					</svg>

					<!-- Center Starburst Badge Button -->
					<a
						href="/katalog"
						class="w-18 h-18 rounded-full bg-[#0D0D0D] text-[#E2EF46] hover:bg-[#E2EF46] hover:text-[#0D0D0D] border-2 border-[#0D0D0D] flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-all hover:scale-105 active:scale-95 shadow-[2px_2px_0px_#0D0D0D]"
						aria-label="Mulai jelajah katalog"
					>
						<span class="text-[8px] font-black leading-none">★</span>
						<span class="text-[9px] font-black uppercase tracking-tight leading-tight">START<br />JELAJAH</span>
						<span class="text-[8px] font-black leading-none">★</span>
					</a>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- SEARCH & COMMODITY FILTER BAR (DEDICATED FULL-WIDTH BAR) -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-[1080px] mx-auto bg-[#E6E1D3] rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
	>
		<!-- Live Search Input -->
		<form onsubmit={handleSearch} class="flex items-center gap-2 flex-1 max-w-md">
			<div class="relative w-full">
				<Search class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-800 stroke-[2.5]" />
				<input
					bind:value={searchQuery}
					placeholder="Cari jahe merah, jagung, nama Latin..."
					class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[3px_3px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D] placeholder:text-stone-400 placeholder:font-medium"
				/>
			</div>
			<button
				type="submit"
				class="px-4 py-2.5 bg-[#E2EF46] hover:bg-[#d4e138] text-[#0D0D0D] text-xs sm:text-sm font-black rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 transition-all cursor-pointer shrink-0"
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
	<section class="flex flex-col gap-4 max-w-[1080px] mx-auto w-full">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-white tracking-tight">Koleksi Tanaman Unggulan</h2>
				<p class="text-xs sm:text-sm text-stone-200 font-medium">Spesies tanaman yang dipelajari dalam praktikum ATPH &amp; Agribisnis</p>
			</div>
			<a
				href="/katalog"
				class="text-xs font-black text-[#0D0D0D] px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#E2EF46] transition-colors flex items-center gap-1"
			>
				<span>Semua ({plants.length})</span>
				<ArrowRight class="w-3.5 h-3.5 stroke-[2.5]" />
			</a>
		</div>

		{#if isLoading}
			<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
				{#each [1, 2, 3, 4] as _}
					<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-4 h-72 animate-pulse"></div>
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
		class="max-w-[1080px] mx-auto w-full bg-[#E2EF46] rounded-3xl p-6 sm:p-8 border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] flex flex-col sm:flex-row items-center justify-between gap-6"
	>
		<div class="flex items-start gap-4">
			<div
				class="w-12 h-12 rounded-2xl bg-white border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-[#0D0D0D] flex items-center justify-center shrink-0"
			>
				<Video class="w-6 h-6 stroke-[2.5]" />
			</div>
			<div>
				<h3 class="text-base sm:text-xl font-black text-[#0D0D0D]">
					Video Pembelajaran Langsung dari Siswa
				</h3>
				<p class="text-xs sm:text-sm text-[#0D0D0D] font-semibold mt-1 max-w-xl leading-relaxed">
					Setiap tanaman dilengkapi dokumentasi video yang dibuat siswa untuk melatih kemampuan presentasi agronomi, identifikasi hama penyakit, dan teknik pemangkasan.
				</p>
			</div>
		</div>
		<div class="flex items-center gap-3 shrink-0 w-full sm:w-auto">
			<a href="/kontribusi/tambah" class="w-full sm:w-auto">
				<Button variant="outline" size="md" fullWidth>
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
