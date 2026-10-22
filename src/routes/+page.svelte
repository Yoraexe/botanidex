<!--
  Flora SMK — Landing Page / Beranda (Svelte 5 Runes)
  Visual Style: Tight, Interlocking 2-Column Proportional Layout (Crypko Poster Aesthetic)
  Caller: Route '/'
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import { ConfigService } from '#lib/services/config.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant } from '#lib/types/plant.types';
	import type { AppConfig } from '#lib/types/config.types';
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
		Camera,
		Smartphone
	} from '@lucide/svelte';

	let searchQuery = $state('');
	let selectedCategory = $state<string>('semua');
	let plants = $state<Plant[]>([...INITIAL_PLANTS_DATA]);
	let isLoading = $state(false);

	// Dynamic App Configuration (Managed by Admin CMS)
	let appConfig = $state<AppConfig>(ConfigService.getConfig());
	const schoolGardenPhotos = $derived(appConfig.hero.gardenPhotos);
	const specimenPhotos = $derived(appConfig.hero.specimens);
	const categories = $derived(appConfig.categories);
	const appDownload = $derived(appConfig.hero.appDownload);

	// Direct PWA Install State
	let deferredPrompt = $state<any>(null);
	let isInstalled = $state(false);

	let currentGardenIndex = $state(0);
	const currentGarden = $derived(schoolGardenPhotos[currentGardenIndex] || schoolGardenPhotos[0]);

	let currentSpecimenIndex = $state(0);
	const currentSpecimen = $derived(specimenPhotos[currentSpecimenIndex] || specimenPhotos[0]);

	onMount(() => {
		let gardenInterval: ReturnType<typeof setInterval> | undefined;
		let specimenInterval: ReturnType<typeof setInterval> | undefined;

		// Listen to real-time configuration changes from Admin CMS
		const handleConfigChange = (e: any) => {
			if (e.detail) {
				appConfig = e.detail;
				if (currentGardenIndex >= appConfig.hero.gardenPhotos.length) {
					currentGardenIndex = 0;
				}
				if (currentSpecimenIndex >= appConfig.hero.specimens.length) {
					currentSpecimenIndex = 0;
				}
			}
		};

		if (typeof window !== 'undefined') {
			window.addEventListener('flora:config-updated', handleConfigChange);

			if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
				isInstalled = true;
			}

			window.addEventListener('beforeinstallprompt', (e) => {
				e.preventDefault();
				deferredPrompt = e;
			});

			window.addEventListener('appinstalled', () => {
				isInstalled = true;
				deferredPrompt = null;
				toast.success('Pemasangan Berhasil!', 'Flora SMK berhasil ditambahkan ke perangkat Anda.');
			});

			// Auto-cycling interval for showcases
			gardenInterval = setInterval(() => {
				if (schoolGardenPhotos.length > 0) {
					currentGardenIndex = (currentGardenIndex + 1) % schoolGardenPhotos.length;
				}
			}, 6000);

			specimenInterval = setInterval(() => {
				if (specimenPhotos.length > 0) {
					currentSpecimenIndex = (currentSpecimenIndex + 1) % specimenPhotos.length;
				}
			}, 7000);
		}

		(async () => {
			try {
				const updated = await PlantService.getCatalog();
				if (updated && updated.length > 0) {
					plants = updated;
				}
			} catch (err) {
				console.warn('Gagal memuat tanaman:', err);
			}
		})();

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('flora:config-updated', handleConfigChange);
			}
			if (gardenInterval) clearInterval(gardenInterval);
			if (specimenInterval) clearInterval(specimenInterval);
		};
	});

	async function handleDirectInstall() {
		if (deferredPrompt) {
			deferredPrompt.prompt();
			const { outcome } = await deferredPrompt.userChoice;
			if (outcome === 'accepted') {
				toast.success('Pemasangan Berhasil!', 'Flora SMK berhasil ditambahkan ke perangkat Anda.');
				deferredPrompt = null;
				isInstalled = true;
			}
		} else if (isInstalled) {
			toast.info('Aplikasi Sudah Terpasang', 'Flora SMK sudah terpasang di perangkat ini dan siap digunakan offline.');
		} else {
			const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
			if (isIOS) {
				toast.info('Pasang di iOS Safari', 'Ketuk tombol Bagikan (Share) 📤 di Safari, lalu pilih "Tambah ke Layar Utama" ➕.');
			} else {
				toast.info('Pasang Aplikasi', 'Ketuk ikon pasang (⊕) di bilah alamat browser atau menu titik tiga (⋮) → "Instal Aplikasi".');
			}
		}
	}

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
				<span>{appConfig.identity.appName.toLowerCase()}</span>
			</a>
			<div class="hidden sm:flex items-center gap-2">
				<span class="text-[10px] font-black uppercase tracking-widest text-[#0D0D0D]/70 border border-[#0D0D0D]/20 px-3 py-1 rounded-full">
					{appConfig.identity.headerBadge}
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
						{appConfig.hero.headlineLine1}<br />
						{appConfig.hero.headlineLine2}
					</h1>
				</div>

				<!-- Landscape Botanical Card: School & Garden Photo Showcase (Pure Display, NOT an active button) -->
				<div class="relative w-full h-[235px] sm:h-[250px] lg:h-[260px]">
					<!-- Card Container with Diagonally-Opposed Giant Curves -->
					<div
						class="w-full h-full rounded-tl-2xl rounded-br-2xl rounded-tr-[4.5rem] rounded-bl-[4.5rem] border-2 border-[#0D0D0D] bg-stone-900 overflow-hidden relative shadow-xs"
					>
						<!-- Double contour line on top-right (Crypko signature motif) -->
						<div
							class="absolute top-2 right-2 w-16 h-16 rounded-tr-[4rem] border-t-2 border-r-2 border-white/50 pointer-events-none z-20"
						></div>

						<!-- Photo Display: School Gardens & Facilities -->
						<img
							src={currentGarden.url}
							alt={currentGarden.title}
							class="w-full h-full object-cover transition-all duration-700 opacity-95"
						/>

						<!-- Bottom Gradient Overlay with Garden Title & Slide Indicator Dots -->
						<div
							class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent p-4 sm:p-5 pl-12 sm:pl-14 pr-5 flex items-end justify-between text-white z-10"
						>
							<div class="flex flex-col pr-4">
								<span
									class="text-[9px] sm:text-[10px] font-bold text-[#E2EF46] uppercase tracking-wider bg-black/70 px-2 py-0.5 rounded w-fit mb-1 border border-white/20"
								>
									{currentGarden.badge}
								</span>
								<h4 class="text-sm sm:text-base font-bold leading-tight">
									{currentGarden.title}
								</h4>
							</div>

							<!-- Slide Dots Indicator for School Garden Photos -->
							<div class="flex items-center gap-1.5 shrink-0 pb-1">
								{#each schoolGardenPhotos as _, idx}
									<button
										type="button"
										onclick={() => (currentGardenIndex = idx)}
										class="h-1.5 rounded-full transition-all cursor-pointer {idx === currentGardenIndex ? 'w-5 bg-[#E2EF46]' : 'w-1.5 bg-white/60 hover:bg-white'}"
										aria-label="Pilih foto kebun {idx + 1}"
									></button>
								{/each}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- ================= RIGHT COLUMN ================= -->
			<div class="lg:col-span-5 flex flex-col gap-3.5 sm:gap-4 w-full">
				<!-- Vertical Specimen Card: Plant Collection Showcase (Pure Display, Uniform Rounded Corner) -->
				<div
					class="relative w-full h-[260px] sm:h-[280px] rounded-tl-[4.5rem] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl border-2 border-[#0D0D0D] bg-[#EAE4D6] overflow-hidden flex flex-row shadow-xs"
				>
					<!-- Double contour line on top-left (Mirrors Left Card's signature motif) -->
					<div
						class="absolute top-2 left-2 w-16 h-16 rounded-tl-[4rem] border-t-2 border-l-2 border-[#0D0D0D]/40 pointer-events-none z-20"
					></div>

					<!-- Image Area: Plant Specimens Showcase -->
					<div class="flex-1 h-full relative overflow-hidden bg-[#EAE4D6] flex items-center justify-center">
						<img
							src={currentSpecimen.url}
							alt={currentSpecimen.commonName}
							class="w-full h-full object-cover transition-all duration-700"
						/>
						<!-- Plant Identity Tag at Bottom-Left of Photo (Indonesian Common Name) -->
						<div class="absolute bottom-3 left-3 bg-[#0D0D0D]/85 text-white px-3 py-1.5 rounded-lg text-xs font-bold z-10 shadow-xs border border-white/10 backdrop-blur-xs">
							<span>{currentSpecimen.commonName}</span>
						</div>
					</div>

					<!-- Vertical Neon Chartreuse Strip (Scientific Latin Botanical Name) -->
					<div
						class="w-10 sm:w-11 bg-[#E2EF46] border-l-2 border-[#0D0D0D] flex flex-col items-center justify-center py-4 text-[#0D0D0D] select-none shrink-0"
					>
						<div class="flex-1 flex items-center justify-center overflow-hidden my-1">
							<span
								class="font-latin italic font-black text-xs sm:text-[13px] tracking-wide text-[#0D0D0D] select-none whitespace-nowrap"
								style="writing-mode: vertical-rl;"
							>
								{currentSpecimen.latinName}
							</span>
						</div>
					</div>
				</div>

				<!-- App Download Card (Direct Install without AI Slop Gimmicks) -->
				<div
					class="relative w-full h-[140px] sm:h-[150px] bg-white rounded-2xl border-2 border-[#0D0D0D] p-3.5 sm:p-4 flex flex-col justify-between shadow-xs"
				>
					<!-- Header -->
					<div class="flex items-center justify-between border-b border-stone-200 pb-1.5">
						<h3 class="text-xs sm:text-sm font-black uppercase tracking-wider text-[#0D0D0D]">
							{appDownload.title}
						</h3>
					</div>

					<!-- Description -->
					<p class="text-[11px] sm:text-xs text-stone-600 font-medium leading-snug">
						{appDownload.description}
					</p>

					<!-- Bottom Row: iOS & Android Badges + Direct Install Pill Button -->
					<div class="flex items-center justify-between pt-1 border-t border-stone-100">
						<!-- Two overlapping black circles: Apple (iOS) and Android -->
						<div class="flex items-center -space-x-1.5">
							{#if appDownload.showIosBadge}
								<!-- Apple / iOS Logo Circle -->
								<div
									class="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center z-10 shadow-xs border border-stone-800"
									title="Tersedia untuk Apple iOS"
								>
									<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 170 170" aria-label="Apple iOS Logo">
										<path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.03-7.61-7.79-11.73-14.28-5.78-9.04-10.37-19.34-13.78-30.9-3.41-11.56-5.12-22.61-5.12-33.16 0-14.82 3.6-27.28 10.81-37.38 7.21-10.1 16.59-15.34 28.14-15.72 4.7 0 10.13 1.34 16.29 4.02 6.16 2.68 10.02 4.09 11.58 4.23 2.12-.27 6.22-1.74 12.31-4.41 6.09-2.68 11.43-3.9 16.03-3.66 11.97.64 21.6 4.72 28.9 12.24-10.51 6.35-15.68 15.15-15.52 26.39.16 8.7 3.48 16.14 9.97 22.31 6.49 6.17 14.28 9.61 23.36 10.32-2.12 6.64-4.8 13.51-8.04 20.61zM119.22 33.64c0-7.39 2.68-14.33 8.04-20.82 5.36-6.49 11.83-10.51 19.41-12.06.33 1.12.51 2.24.51 3.35 0 7.39-2.83 14.5-8.49 21.32-5.67 6.82-12.2 10.8-19.59 11.95-.11-1.23-.23-2.34-.37-3.74z"/>
									</svg>
								</div>
							{/if}

							{#if appDownload.showAndroidBadge}
								<!-- Android Robot Logo Circle -->
								<div
									class="w-6 h-6 rounded-full bg-[#0D0D0D] text-white flex items-center justify-center shadow-xs border border-stone-800"
									title="Tersedia untuk Android"
								>
									<svg class="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24" aria-label="Android Logo">
										<path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.551 0 .9993.4482.9993.9993.0001.5511-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4482.9993.9993 0 .5511-.4482.9997-.9993.9997m11.4045-6.02l1.996-3.4572c.156-.2701.063-.6158-.207-.7719-.2702-.1561-.6159-.063-.772.207l-2.023 3.504c-1.523-.6926-3.232-1.0772-5.064-1.0772-1.832 0-3.541.3846-5.064 1.0772l-2.023-3.504c-.1561-.27-.5018-.3631-.772-.207-.27.1561-.363.5018-.207.7719l1.996 3.4572c-3.144 1.704-5.289 4.8872-5.467 8.6366h21.046c-.178-3.7494-2.323-6.9326-5.467-8.6366"/>
									</svg>
								</div>
							{/if}
						</div>

						<!-- Action Pill Button: Direct Install App -->
						<button
							type="button"
							onclick={handleDirectInstall}
							class="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#0D0D0D] bg-white hover:bg-[#E2EF46]/30 text-xs font-bold text-[#0D0D0D] shadow-xs active:translate-y-0.5 transition-all cursor-pointer select-none"
							title="Pasang aplikasi Flora SMK langsung ke perangkat Anda"
						>
							<Smartphone class="w-3.5 h-3.5 stroke-[2.2]" />
							<span>{appDownload.buttonLabel}</span>
						</button>
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- SEARCH & BOTANICAL CATEGORY CONTROL DECK (PRECISE & PROPORTIONAL) -->
	<!-- ========================================================================= -->
	<section
		class="w-full max-w-[1060px] mx-auto bg-[#EAE4D6] rounded-[28px] border-[2.5px] border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-4 sm:p-5 flex flex-col gap-3.5 sm:gap-4"
	>
		<!-- 1. Top Deck: Live Search Input with Direct Action Button -->
		<form onsubmit={handleSearch} class="flex items-center gap-2.5 sm:gap-3 w-full">
			<div class="relative flex-1">
				<Search class="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0D0D0D] stroke-[2.5]" />
				<input
					bind:value={searchQuery}
					placeholder="Cari jahe merah, jagung, anggrek, nama Latin..."
					class="w-full pl-11 pr-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-white border-2 border-[#0D0D0D] rounded-full shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[3px_3px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D] placeholder:text-stone-400 placeholder:font-medium transition-all"
				/>
			</div>
			<button
				type="submit"
				class="px-5 sm:px-6 py-2.5 sm:py-3 bg-[#E2EF46] hover:bg-[#d8e538] text-[#0D0D0D] text-xs sm:text-sm font-black rounded-full border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 transition-all cursor-pointer shrink-0 uppercase tracking-wider select-none"
			>
				Cari
			</button>
		</form>

		<!-- 2. Bottom Deck: Proportional Category Filter Pills -->
		<div class="flex items-center gap-2 sm:gap-2.5 overflow-x-auto pb-1 no-scrollbar w-full pt-2.5 border-t border-[#0D0D0D]/10">
			{#each categories as cat (cat.id)}
				<FilterChip
					active={selectedCategory === cat.id}
					onclick={() => (selectedCategory = cat.id)}
				>
					<span class="w-2 h-2 rounded-full {cat.dotColor}"></span>
					<span>{cat.label}</span>
				</FilterChip>
			{/each}
		</div>
	</section>

	<!-- ========================================================================= -->
	<!-- FEATURED PLANTS GRID -->
	<!-- ========================================================================= -->
	<section class="flex flex-col gap-4 max-w-[1060px] mx-auto w-full">
		<div class="flex items-center justify-between">
			<div>
				<h2 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">Koleksi Tanaman Unggulan</h2>
			</div>
			<a
				href="/katalog"
				class="text-xs font-black text-[#0D0D0D] px-3.5 py-1.5 rounded-full border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#E2EF46] transition-colors flex items-center gap-1.5"
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
					Video Pembelajaran Siswa
				</h3>
				<p class="text-xs sm:text-sm text-[#0D0D0D] font-bold mt-1">
					Dokumentasi morfologi dan agronomi lapangan.
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
