<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Visual Style: Tight, Interlocking 2-Column Proportional Layout (Crypko Poster Aesthetic)
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

	// Geometry for Right Vertical Card (Crypko 45-degree chamfer top-left)
	let rightCardW = $state(320);
	let rightCardH = $state(280);

	const rightCardPath = $derived.by(() => {
		const w = rightCardW || 320;
		const h = rightCardH || 280;
		const r = 16;
		const cut = 54; // Crisp, proportional 54px 45-degree chamfer
		return `M ${cut} 2
			L ${w - r} 2
			Q ${w - 2} 2, ${w - 2} ${r}
			L ${w - 2} ${h - r}
			Q ${w - 2} ${h - 2}, ${w - r} ${h - 2}
			L ${r} ${h - 2}
			Q 2 ${h - 2}, 2 ${h - r}
			L 2 ${cut}
			Q 2 ${cut - 10}, 8 ${cut - 18}
			L ${cut - 18} 8
			Q ${cut - 10} 2, ${cut} 2
			Z`;
	});

	const rightCardInnerContour = $derived.by(() => {
		const cut = 54;
		return `M 2 ${cut - 6}
			Q 2 ${cut - 14}, 9 ${cut - 21}
			L ${cut - 21} 9
			Q ${cut - 14} 2, ${cut - 6} 2`;
	});
</script>

<svelte:head>
	<title>Flora SMK — Katalog Botani Digital SMK Pertanian</title>
</svelte:head>

<div class="flex flex-col gap-8 sm:gap-10">
	<!-- ========================================================================= -->
	<!-- REFINED, ORDERLY, HARMONIOUS CRYPKO HERO ARTBOARD -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-[1060px] mx-auto rounded-[32px] sm:rounded-[36px] border-[3px] border-[#0D0D0D] bg-[#EAE4D6] shadow-[8px_8px_0px_#0D0D0D] p-5 sm:p-7 lg:p-8 relative overflow-hidden flex flex-col gap-4 sm:gap-5"
	>
		<!-- 1. TOP BRAND BAR (Editorial Top Notch Style) -->
		<div class="flex items-center justify-between w-full pb-2.5 border-b-2 border-[#0D0D0D]/10">
			<a
				href="/"
				class="flex items-center gap-1.5 font-bold text-2xl sm:text-3xl tracking-tight text-[#0D0D0D] select-none hover:opacity-80 transition-opacity"
			>
				<span>flora smk</span>
				<span class="text-sm text-[#0D0D0D]">♥</span>
			</a>
			<div class="hidden sm:flex items-center gap-2">
				<span class="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]/60 border border-[#0D0D0D]/20 px-2.5 py-0.5 rounded-full">
					Katalog Botani Digital • SMK Pertanian
				</span>
			</div>
		</div>

		<!-- 2. TWO-COLUMN BALANCED INTERLOCKING GRID (ORDERLY, SPACED, ZERO-COLLISION) -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-7 items-start w-full">
			<!-- ================= LEFT COLUMN ================= -->
			<div class="lg:col-span-7 flex flex-col gap-3.5 sm:gap-4 w-full">
				<!-- Giant Condensed Headline -->
				<div>
					<h1
						class="font-display text-5xl sm:text-6xl lg:text-[5.4rem] xl:text-[6.2rem] font-black uppercase tracking-tight leading-[0.84] text-[#0D0D0D]"
					>
						KATALOG BOTANI<br />
						SMK PERTANIAN
					</h1>
				</div>

				<!-- Landscape Botanical Card (Asymmetric Leaf Shape: Rounded-TR + Rounded-BL) -->
				<div class="relative w-full h-[235px] sm:h-[250px] lg:h-[260px]">
					<!-- Card Container with Diagonally-Opposed Giant Curves -->
					<div
						class="w-full h-full rounded-tl-2xl rounded-br-2xl rounded-tr-[4.5rem] rounded-bl-[4.5rem] border-2 border-[#0D0D0D] bg-stone-900 overflow-hidden relative group shadow-xs"
					>
						<!-- Double contour line on top-right (Crypko signature motif) -->
						<div
							class="absolute top-2 right-2 w-16 h-16 rounded-tr-[4rem] border-t-2 border-r-2 border-white/50 pointer-events-none z-20"
						></div>

						<!-- Image Area -->
						<img
							src="https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80"
							alt="Greenhouse Pembibitan Tanaman SMK"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
						/>

						<!-- Bottom Gradient Overlay (Padded to clear the bottom-left curve) -->
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 sm:p-5 pl-12 sm:pl-14 pr-16 flex flex-col justify-end text-white z-10"
						>
							<span
								class="text-[9px] sm:text-[10px] font-bold text-[#E2EF46] uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded w-fit mb-1 border border-white/20"
							>
								Greenhouse Florikultura &amp; Bibit
							</span>
							<h4 class="text-sm sm:text-base font-bold leading-tight">
								Budidaya &amp; Observasi Praktikum Agronomi
							</h4>
						</div>

						<!-- Crypko-style Compact Floating Yellow Capsule Tab -->
						<a
							href="/katalog?cat=pangan"
							class="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-12 py-3 px-1.5 bg-[#E2EF46] border-2 border-[#0D0D0D] rounded-full flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#d8e538] hover:scale-105 active:scale-95 transition-all select-none group/tab"
							title="Eksplorasi tanaman budidaya"
						>
							<span class="text-lg group-hover/tab:scale-110 transition-transform">🌱</span>
							<span class="text-[8px] font-black uppercase text-center leading-[1.1] text-[#0D0D0D]">
								JELAJAH<br />BOTANI
							</span>
						</a>
					</div>
				</div>
			</div>

			<!-- ================= RIGHT COLUMN ================= -->
			<div class="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 w-full">
				<!-- Hidden SVG Defs for Right Card Chamfer Clip -->
				<svg class="absolute w-0 h-0 overflow-hidden" aria-hidden="true">
					<defs>
						<clipPath id="right-card-chamfer-clip">
							<path d={rightCardPath} />
						</clipPath>
					</defs>
				</svg>

				<!-- Vertical Specimen Card (Faithful Crypko 45-degree Chamfer Top-Left + Star Strip) -->
				<a
					href="/katalog/anggrek-bulan"
					bind:clientWidth={rightCardW}
					bind:clientHeight={rightCardH}
					class="relative w-full h-[260px] sm:h-[280px] block group hover:-translate-y-1 transition-all shadow-xs"
				>
					<!-- Clipped Content (Photo + Clean Yellow Strip) -->
					<div
						class="w-full h-full flex flex-row bg-[#EAE4D6] overflow-hidden"
						style="clip-path: url(#right-card-chamfer-clip);"
					>
						<!-- Image Area (Vibrant Close-Up Botanical Bloom) -->
						<div class="flex-1 h-full relative overflow-hidden bg-[#EAE4D6] flex items-center justify-center">
							<img
								src="https://images.unsplash.com/photo-1518895949257-7621c3c786d7?auto=format&fit=crop&w=800&q=80"
								alt="Spesimen Botani Puspa Pesona"
								class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
							/>
						</div>

						<!-- Vertical Neon Chartreuse Strip (Two Stars on Top, Empty Middle, Up Arrow at Bottom) -->
						<div
							class="w-10 sm:w-11 bg-[#E2EF46] border-l-2 border-[#0D0D0D] flex flex-col items-center justify-between py-4 text-[#0D0D0D] select-none shrink-0"
						>
							<!-- Two Black Stars Stacked Vertically (Crypko signature) -->
							<div class="flex flex-col items-center gap-1.5 pt-0.5">
								<span class="text-sm font-black leading-none">★</span>
								<span class="text-sm font-black leading-none">★</span>
							</div>

							<!-- Middle: Empty clean yellow space per reference -->
							<div class="flex-1"></div>

							<!-- Upward Arrow at Bottom -->
							<span class="text-base font-black leading-none group-hover:-translate-y-1 transition-transform">↑</span>
						</div>
					</div>

					<!-- Crisp SVG Border & Chamfer Inner Contour Overlay -->
					<svg
						class="absolute inset-0 w-full h-full pointer-events-none z-20"
						viewBox="0 0 {rightCardW || 320} {rightCardH || 280}"
					>
						<!-- Top-Left Inner Contour Chamfer Line -->
						<path
							d={rightCardInnerContour}
							fill="none"
							stroke="#0D0D0D"
							stroke-width="1.8"
							stroke-opacity="0.38"
						/>
						<!-- Outer Solid Border -->
						<path
							d={rightCardPath}
							fill="none"
							stroke="#0D0D0D"
							stroke-width="2.5"
						/>
					</svg>
				</a>

				<!-- Notched App Card (Immediately below vertical card, tight gap) -->
				<div
					class="relative w-full h-[140px] sm:h-[150px] bg-white rounded-2xl border-2 border-[#0D0D0D] p-3.5 sm:p-4 flex flex-col justify-between shadow-xs"
				>
					<!-- Top Chamfer Notch Contour -->
					<div
						class="absolute top-0 left-0 w-7 h-7 rounded-tl-xl border-t-2 border-l-2 border-[#0D0D0D]/30 pointer-events-none"
					></div>

					<!-- Notched Header with 3 Dots Tab -->
					<div class="flex items-center justify-between border-b border-stone-200 pb-1.5">
						<h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0D0D0D]">
							APLIKASI PWA LAPANGAN
						</h3>
						<!-- Black pill tab with 3 white dots -->
						<div class="px-2 py-0.5 rounded-full bg-[#0D0D0D] flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
						</div>
					</div>

					<!-- Description -->
					<p class="text-[11px] sm:text-xs text-stone-600 font-medium leading-snug">
						Katalog botani mandiri SMK Pertanian. Identifikasi taksonomi, video budidaya siswa, dan QR scanner offline.
					</p>

					<!-- Bottom Row: Platform icons & Action pill button -->
					<div class="flex items-center justify-between pt-1 border-t border-stone-100">
						<div class="flex items-center -space-x-1">
							<span
								class="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[9px] font-black z-10"
								title="PWA Offline Supported"
							>
								A
							</span>
							<span
								class="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center text-[9px] font-black"
								title="Video Player Supported"
							>
								▶
							</span>
						</div>

						<!-- Action Pill Button with Yellow Circle Arrow -->
						<a
							href="/scan"
							class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-[#0D0D0D] bg-white hover:bg-stone-50 text-xs font-bold text-[#0D0D0D] shadow-xs active:translate-y-0.5 transition-all select-none"
						>
							<span>Scan QR</span>
							<div
								class="w-4 h-4 rounded-full bg-[#E2EF46] border border-[#0D0D0D] flex items-center justify-center text-[9px] font-black"
							>
								↓
							</div>
						</a>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- SEARCH & COMMODITY FILTER BAR (DEDICATED FULL-WIDTH BAR) -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-[1040px] mx-auto bg-[#E6E1D3] rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
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
	<section class="flex flex-col gap-4 max-w-[1040px] mx-auto w-full">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Koleksi Tanaman Unggulan</h2>
				<p class="text-xs sm:text-sm text-stone-600 font-medium">Spesies tanaman yang dipelajari dalam praktikum ATPH &amp; Agribisnis</p>
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
		class="max-w-[1040px] mx-auto w-full bg-[#E2EF46] rounded-3xl p-6 sm:p-8 border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] flex flex-col sm:flex-row items-center justify-between gap-6"
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
