<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Visual Style: High-Impact Neo-Brutalist / Crypko-Inspired Editorial Bento Hero
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
	import {
		Search,
		QrCode,
		Map,
		Sparkles,
		Video,
		BookOpen,
		ArrowRight,
		ShieldCheck,
		PlusCircle,
		ArrowUpRight,
		Sprout,
		Play,
		Camera,
		Compass,
		Layers
	} from '@lucide/svelte';

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
	<title>Flora SMK — Katalog Botani Digital SMK Pertanian</title>
</svelte:head>

<div class="flex flex-col gap-10 sm:gap-14">
	<!-- ========================================================================= -->
	<!-- HIGH-IMPACT EDITORIAL NEO-BRUTALIST HERO (CRYPKO-INSPIRED) -->
	<!-- ========================================================================= -->
	<section class="relative rounded-[2.5rem] border-[3px] border-[#18181B] bg-[#ECE8DC] shadow-[6px_6px_0px_#18181B] p-5 sm:p-8 lg:p-10 overflow-hidden flex flex-col gap-6 sm:gap-8">
		<!-- Inner Top Micro-Bar (Crypko aesthetic tab cutout) -->
		<div class="flex items-center justify-between gap-3 border-b-2 border-[#18181B]/15 pb-4">
			<div class="flex items-center gap-2">
				<span class="font-display text-2xl sm:text-3xl font-black tracking-wider text-stone-900 uppercase">
					FLORA•SMK
				</span>
				<span class="text-xs">♥</span>
				<span class="hidden sm:inline-block text-[11px] font-black uppercase px-2 py-0.5 rounded-md bg-[#F6BD60] text-stone-900 border border-[#18181B]">
					VER 1.0 OFFICIAL
				</span>
			</div>

			<!-- Center Notch Nav Links (Desktop) -->
			<div class="hidden md:flex items-center gap-4 text-xs font-black uppercase text-stone-700">
				<a href="/katalog?cat=pangan" class="hover:text-stone-900 hover:underline">Pangan</a>
				<span class="text-stone-400">•</span>
				<a href="/katalog?cat=obat" class="hover:text-stone-900 hover:underline">TOGA</a>
				<span class="text-stone-400">•</span>
				<a href="/katalog?cat=hias" class="hover:text-stone-900 hover:underline">Florikultura</a>
				<span class="text-stone-400">•</span>
				<a href="/katalog?cat=industri" class="hover:text-stone-900 hover:underline">Perkebunan</a>
				<span class="text-stone-400">•</span>
				<a href="/peta" class="hover:text-stone-900 hover:underline">Denah Kebun</a>
			</div>

			<a
				href="/scan"
				class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-stone-900 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] hover:bg-[#F6BD60] text-xs font-black active:translate-y-0.5 transition-all"
			>
				<Camera class="w-3.5 h-3.5 stroke-[2.5]" />
				<span>Scan Lapangan</span>
			</a>
		</div>

		<!-- Main Hero Editorial Grid -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start relative">
			<!-- LEFT COLUMN: Giant Headline & Intro (Lg: col-span-7) -->
			<div class="lg:col-span-7 flex flex-col justify-between gap-6">
				<div>
					<div class="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#6BB092] text-stone-900 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-[11px] font-black uppercase tracking-wider mb-4">
						<Sparkles class="w-3.5 h-3.5 stroke-[2.5]" />
						<span>E-Katalog Botani Lapangan Siswa</span>
					</div>

					<h1 class="font-display text-5xl sm:text-7xl md:text-8xl lg:text-[5.5rem] font-black uppercase tracking-tight leading-[0.88] text-[#18181B]">
						KATALOG BOTANI<br />
						FLORA SEKOLAH
					</h1>

					<p class="text-stone-800 text-sm sm:text-base font-semibold leading-relaxed mt-4 max-w-xl">
						Dokumentasi digital spesimen tanaman di lingkungan SMK Pertanian. Dilengkapi tata nama ilmiah Latin, zonasi kebun, barcode QR fisik, dan video edukasi budidaya buatan siswa.
					</p>
				</div>

				<!-- Live Search Bar inside Hero -->
				<form onsubmit={handleSearch} class="flex items-center bg-white rounded-2xl p-1.5 border-2 border-[#18181B] shadow-[3.5px_3.5px_0px_#18181B] w-full max-w-lg">
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
						class="px-5 py-2.5 bg-[#F6BD60] hover:bg-[#eab052] text-stone-900 text-xs sm:text-sm font-black rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer shrink-0"
					>
						Cari
					</button>
				</form>
			</div>

			<!-- RIGHT COLUMN: Tall Character/Plant Card (Lg: col-span-5) -->
			<div class="lg:col-span-5 flex justify-center lg:justify-end">
				<!-- Tall Asymmetrical Card (Mirroring Crypko Character Card) -->
				<a
					href="/katalog/anggrek-bulan"
					class="relative w-full max-w-xs sm:max-w-sm rounded-tl-[3.5rem] rounded-2xl overflow-hidden border-[2.5px] border-[#18181B] bg-white shadow-[5px_5px_0px_#18181B] flex flex-row group hover:-translate-y-1 hover:shadow-[7px_7px_0px_#18181B] transition-all"
				>
					<!-- Plant Photo Area -->
					<div class="flex-1 relative aspect-3/4 overflow-hidden bg-stone-100">
						<img
							src="https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1200&q=80"
							alt="Anggrek Bulan Puspa Pesona"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
						/>
						<!-- Gradient info overlay at bottom -->
						<div class="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 via-black/40 to-transparent text-white">
							<p class="text-[10px] font-black uppercase text-[#F6BD60] tracking-wider">Koleksi Florikultura</p>
							<h3 class="text-sm font-black leading-tight">Anggrek Bulan</h3>
							<p class="font-latin italic text-xs text-stone-300">Phalaenopsis amabilis</p>
						</div>
					</div>

					<!-- Attached Vertical Yellow Strip (Crypko style) -->
					<div class="w-10 bg-[#F6BD60] border-l-2 border-[#18181B] flex flex-col items-center justify-between py-3 text-stone-900 select-none shrink-0">
						<div class="text-xs font-black tracking-tighter">★★</div>
						<div class="writing-mode-vertical text-[10px] font-black uppercase tracking-widest rotate-180 text-center">
							PUSPA PESONA
						</div>
						<div class="w-6 h-6 rounded-full bg-white border border-[#18181B] flex items-center justify-center font-black text-xs shadow-[1px_1px_0px_#18181B] group-hover:translate-y-[-2px] transition-transform">
							↑
						</div>
					</div>
				</a>
			</div>
		</div>

		<!-- CENTER MEMPHIS ROTATING STAMP (Floating between rows) -->
		<div class="flex items-center justify-center -my-2 sm:-my-4 z-20">
			<a
				href="/katalog"
				class="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full flex items-center justify-center group cursor-pointer hover:scale-105 active:scale-95 transition-transform"
				aria-label="Mulai jelajah katalog tanaman"
			>
				<!-- Rotating SVG Ring Text -->
				<svg class="absolute inset-0 w-full h-full animate-spin-slow pointer-events-none" viewBox="0 0 100 100">
					<path
						id="textPath-hero-seal"
						d="M 50, 50 m -37, 0 a 37,37 0 1,1 74,0 a 37,37 0 1,1 -74,0"
						fill="none"
					></path>
					<text class="text-[8.5px] font-black uppercase tracking-[0.25em] fill-stone-900">
						<textPath href="#textPath-hero-seal" startOffset="0%">
							★ SMK PERTANIAN ★ FLORA DIGITAL PLATFORM ★
						</textPath>
					</text>
				</svg>

				<!-- Center Black Starburst Seal -->
				<div class="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-[#18181B] text-[#F6BD60] border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#F6BD60] flex flex-col items-center justify-center text-center p-1 group-hover:bg-[#F6BD60] group-hover:text-stone-900 transition-colors">
					<span class="text-[9px] font-black leading-none">★</span>
					<span class="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter leading-tight">
						START<br />JELAJAH
					</span>
					<span class="text-[9px] font-black leading-none">★</span>
				</div>
			</a>
		</div>

		<!-- BOTTOM ROW: Wide Asymmetrical Card + Notched Feature Card -->
		<div class="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-stretch">
			<!-- BOTTOM-LEFT: Wide Landscape Botanical Card (Lg: col-span-7) -->
			<div class="lg:col-span-7">
				<div class="relative w-full rounded-bl-[3.5rem] rounded-2xl overflow-hidden border-[2.5px] border-[#18181B] bg-white shadow-[5px_5px_0px_#18181B] flex flex-row group h-full min-h-[220px] sm:min-h-[240px]">
					<!-- Photo of Practical Agriculture / Botany -->
					<div class="flex-1 relative overflow-hidden bg-stone-900">
						<img
							src="https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80"
							alt="Lahan Praktikum Pertanian SMK"
							class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90"
						/>
						<div class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent p-4 sm:p-5 flex flex-col justify-end text-white">
							<span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#6BB092] text-stone-900 w-fit mb-1 border border-[#18181B]">
								Praktikum Agronomi Siswa
							</span>
							<h3 class="text-base sm:text-lg font-black leading-snug">
								Lahan Percobaan Bedeng C-4: Polinasi Silang &amp; Pemupukan
							</h3>
							<p class="text-xs text-stone-300 font-medium line-clamp-1 mt-0.5">
								Dokumentasi budidaya jagung hibrida &amp; tanaman pangan oleh siswa XI ATPH.
							</p>
						</div>
					</div>

					<!-- Attached Yellow Action Strip on Right Side -->
					<a
						href="/katalog?cat=pangan"
						class="w-14 sm:w-16 bg-[#F6BD60] border-l-2 border-[#18181B] flex flex-col items-center justify-center gap-2 p-2 text-stone-900 select-none hover:bg-[#eab052] transition-colors shrink-0 group/pill"
						title="Eksplorasi tanaman pangan"
					>
						<span class="text-2xl group-hover/pill:rotate-12 transition-transform">🌽</span>
						<span class="text-[9px] sm:text-[10px] font-black uppercase text-center leading-tight">
							LIHAT<br />PANGAN
						</span>
						<div class="w-6 h-6 rounded-full bg-white border border-[#18181B] flex items-center justify-center font-black text-xs shadow-[1px_1px_0px_#18181B]">
							→
						</div>
					</a>
				</div>
			</div>

			<!-- BOTTOM-RIGHT: Notched Feature Card (Mirroring Crypko App Card) (Lg: col-span-5) -->
			<div class="lg:col-span-5 flex flex-col justify-between">
				<div class="relative bg-white rounded-2xl border-[2.5px] border-[#18181B] shadow-[5px_5px_0px_#18181B] p-5 sm:p-6 flex flex-col justify-between h-full gap-4">
					<!-- Notched Header with 3 Dots (Crypko aesthetic) -->
					<div class="flex items-center justify-between border-b-2 border-[#18181B]/15 pb-3">
						<div class="flex items-center gap-2">
							<span class="text-xs font-black uppercase tracking-wider text-stone-900">
								APLIKASI PWA LAPANGAN
							</span>
						</div>
						<!-- 3 Dots Black Pill -->
						<div class="px-2.5 py-1 rounded-full bg-[#18181B] text-white flex items-center gap-1">
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
							<span class="w-1.5 h-1.5 rounded-full bg-white"></span>
						</div>
					</div>

					<!-- Body Description -->
					<p class="text-xs sm:text-sm text-stone-700 font-semibold leading-relaxed">
						Flora SMK dapat diinstal langsung ke layar HP Anda (PWA). Akses database botani, klasifikasi ilmiah, dan denah praktikum sekolah tanpa sambungan internet.
					</p>

					<!-- Bottom Row Action Buttons -->
					<div class="flex items-center justify-between gap-3 pt-2 border-t border-stone-200">
						<!-- Mini Platform Icons -->
						<div class="flex items-center gap-1.5">
							<span class="px-2 py-1 rounded-md bg-[#ECE8DC] border border-[#18181B] text-[10px] font-black text-stone-800">
								PWA
							</span>
							<span class="px-2 py-1 rounded-md bg-[#ECE8DC] border border-[#18181B] text-[10px] font-black text-stone-800">
								OFFLINE
							</span>
						</div>

						<!-- Action Button Pill -->
						<a
							href="/scan"
							class="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6BB092] hover:bg-[#5da284] text-stone-900 font-black text-xs border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all"
						>
							<span>Scan QR Pohon</span>
							<div class="w-5 h-5 rounded-full bg-[#F6BD60] border border-[#18181B] flex items-center justify-center text-[10px]">
								↓
							</div>
						</a>
					</div>
				</div>
			</div>
		</div>

		<!-- Quick Metric Stats Bento (4 Boxes) -->
		<div class="pt-4 border-t-2 border-[#18181B] grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-center">
			<div class="bg-white border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="font-display text-3xl sm:text-4xl font-black text-stone-900 leading-none">{plants.length}</p>
				<p class="text-[11px] font-black uppercase text-stone-600 mt-1">Spesies Terkatalog</p>
			</div>
			<div class="bg-white border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="font-display text-3xl sm:text-4xl font-black text-stone-900 leading-none">{totalVideos}</p>
				<p class="text-[11px] font-black uppercase text-stone-600 mt-1">Video Edukasi Siswa</p>
			</div>
			<div class="bg-white border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="font-display text-3xl sm:text-4xl font-black text-stone-900 leading-none">5</p>
				<p class="text-[11px] font-black uppercase text-stone-600 mt-1">Zonasi Kebun Praktikum</p>
			</div>
			<div class="bg-white border-2 border-[#18181B] rounded-2xl p-3 shadow-[3px_3px_0px_#18181B]">
				<p class="font-display text-3xl sm:text-4xl font-black text-stone-900 leading-none">100%</p>
				<p class="text-[11px] font-black uppercase text-stone-600 mt-1">Akses PWA Offline</p>
			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- CATEGORY BENTO SECTION -->
	<!-- ========================================================================= -->
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

	<!-- ========================================================================= -->
	<!-- FEATURED PLANTS SECTION -->
	<!-- ========================================================================= -->
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

	<!-- ========================================================================= -->
	<!-- STUDENT VIDEO CALLOUT -->
	<!-- ========================================================================= -->
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

<style>
	.writing-mode-vertical {
		writing-mode: vertical-rl;
	}
</style>
