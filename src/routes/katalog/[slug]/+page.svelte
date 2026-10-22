<!--
  Flora SMK — Plant Detail Page (Svelte 5 Runes)
  Tujuan: Profil lengkap tanaman gaya Neo-Brutalist, galeri foto, taksonomi, video edukasi siswa, lokasi peta, dan QR generator
  Caller: Route '/katalog/[slug]'
  BRD Ref: F2 (Detail Tanaman & Video Siswa)
-->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
	import { INITIAL_PLANTS_DATA } from '#lib/data/seed-plants';
	import type { Plant } from '#lib/types/plant.types';
	import { getCategoryBadgeLabel, getCategoryColorClass, formatDateId } from '#lib/utils/format';
	import PlantGallery from '#lib/components/plant/PlantGallery.svelte';
	import PlantTaxonomy from '#lib/components/plant/PlantTaxonomy.svelte';
	import PlantVideoSection from '#lib/components/plant/PlantVideoSection.svelte';
	import QrGenerator from '#lib/components/qr/QrGenerator.svelte';
	import Button from '#lib/components/ui/Button.svelte';
	import { toast } from '#lib/stores/toast.store';
	import {
		ArrowLeft,
		MapPin,
		Share2,
		QrCode,
		Calendar,
		UserCheck,
		FileText,
		Check,
		X
	} from '@lucide/svelte';

	const slug = $derived(page.params.slug);
	let plant = $state<Plant | null>(null);
	let isLoading = $state(false);
	let showQrModal = $state(false);

	$effect(() => {
		if (slug && (!plant || plant.slug !== slug)) {
			const initial = INITIAL_PLANTS_DATA.find((p) => p.slug === slug);
			if (initial) {
				plant = initial;
			}
		}
	});

	onMount(async () => {
		await loadPlantDetail();
	});

	async function loadPlantDetail() {
		try {
			if (slug) {
				const fetched = await PlantService.getPlantBySlug(slug);
				if (fetched) {
					plant = fetched;
				}
			}
		} catch (err) {
			console.warn('Gagal memuat detail tanaman:', err);
		}
	}

	async function handleShare() {
		if (typeof window === 'undefined' || !plant) return;

		const shareData = {
			title: `${plant.name_local} (${plant.name_latin}) — Flora SMK`,
			text: `Pelajari tanaman ${plant.name_local} di katalog botani digital SMK Pertanian`,
			url: window.location.href
		};

		if (navigator.share) {
			try {
				await navigator.share(shareData);
			} catch (err) {
				// User cancelled share
			}
		} else {
			// Fallback copy link to clipboard
			try {
				await navigator.clipboard.writeText(window.location.href);
				toast.success('Tautan Tersalin!', 'Link profil tanaman telah disalin ke papan klip.');
			} catch {
				toast.info('Tautan:', window.location.href);
			}
		}
	}
</script>

<svelte:head>
	{#if plant}
		<title>{plant.name_local} ({plant.name_latin}) — Flora SMK</title>
		<meta name="description" content={plant.description.substring(0, 150)} />
	{:else}
		<title>Detail Tanaman — Flora SMK</title>
	{/if}
</svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	<!-- Top Navigation Strip -->
	<div class="flex items-center justify-between">
		<a
			href="/katalog"
			class="inline-flex items-center gap-2 text-xs font-black text-stone-900 bg-white px-3.5 py-2.5 rounded-xl border-2 border-[#18181B] shadow-[2.5px_2.5px_0px_#18181B] hover:bg-[#F6BD60] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all"
		>
			<ArrowLeft class="w-4 h-4 stroke-[2.5]" />
			<span>Kembali ke Katalog</span>
		</a>

		<div class="flex items-center gap-2.5">
			<button
				onclick={() => (showQrModal = true)}
				class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2.5 bg-white text-stone-900 border-2 border-[#18181B] rounded-xl shadow-[2.5px_2.5px_0px_#18181B] hover:bg-[#6BB092] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer"
				title="Lihat Label QR Tanaman"
			>
				<QrCode class="w-4 h-4 stroke-[2.5]" />
				<span class="hidden sm:inline">Cetak QR</span>
			</button>

			<button
				onclick={handleShare}
				class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2.5 bg-white text-stone-900 border-2 border-[#18181B] rounded-xl shadow-[2.5px_2.5px_0px_#18181B] hover:bg-[#F6BD60] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all cursor-pointer"
				title="Bagikan Tautan Profil Tanaman"
			>
				<Share2 class="w-4 h-4 stroke-[2.5]" />
				<span>Bagikan</span>
			</button>
		</div>
	</div>

	{#if isLoading && !plant}
		<div class="bg-[#FFFEF9] rounded-3xl p-6 sm:p-8 border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B] animate-pulse flex flex-col gap-6">
			<div class="h-8 bg-stone-200 rounded-xl w-1/3"></div>
			<div class="aspect-video bg-stone-200 rounded-2xl w-full"></div>
			<div class="h-4 bg-stone-200 rounded w-full"></div>
			<div class="h-4 bg-stone-200 rounded w-2/3"></div>
		</div>
	{:else if plant}
		{@const colors = getCategoryColorClass(plant.category)}
		{@const categoryLabel = getCategoryBadgeLabel(plant.category)}

		<!-- Plant Main Profile Card (Neo-Brutalist) -->
		<article class="bg-[#FFFEF9] rounded-3xl p-5 sm:p-8 border-2 border-[#18181B] shadow-[6px_6px_0px_#18181B] flex flex-col gap-6">
			<!-- Header Title & Badges -->
			<div class="flex flex-col gap-2.5 pb-5 border-b-2 border-[#18181B]">
				<div class="flex flex-wrap items-center gap-2">
					<span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] {colors.bg} text-stone-900">
						{categoryLabel}
					</span>
					{#if plant.aliases && plant.aliases.length > 0}
						<span class="text-xs font-bold text-stone-600 bg-[#F7F2E7] px-2 py-0.5 rounded-md border border-[#18181B]">
							Sinonim: {plant.aliases.join(', ')}
						</span>
					{/if}
				</div>

				<h1 class="text-2xl sm:text-4xl font-black text-stone-900 tracking-tight leading-tight">
					{plant.name_local}
				</h1>

				<div class="flex flex-wrap items-baseline gap-2">
					<p class="font-latin italic text-lg sm:text-2xl text-stone-900 font-bold">
						{plant.name_latin}
					</p>
					{#if plant.name_english}
						<span class="text-xs sm:text-sm font-semibold text-stone-600">
							• Bahasa Inggris: <strong class="text-stone-900">{plant.name_english}</strong>
						</span>
					{/if}
				</div>
			</div>

			<!-- Visual Photo Gallery -->
			<PlantGallery photos={plant.photos} plantName={plant.name_local} />

			<!-- Location Badge with Direct Link to Map -->
			{#if plant.location_label}
				<div class="p-4 bg-[#F7F2E7] rounded-2xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-[#6BB092] border-2 border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B] text-stone-900 flex items-center justify-center shrink-0">
							<MapPin class="w-5 h-5 stroke-[2.5]" />
						</div>
						<div>
							<p class="text-[10px] font-black text-stone-600 uppercase tracking-wider">Lokasi di Area Kebun Sekolah</p>
							<p class="text-sm sm:text-base font-black text-stone-900">{plant.location_label}</p>
						</div>
					</div>
					<a
						href="/peta"
						class="px-4 py-2 rounded-xl bg-[#FFFEF9] border-2 border-[#18181B] text-stone-900 text-xs font-black hover:bg-[#F6BD60] shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 active:shadow-[1px_1px_0px_#18181B] transition-all self-start sm:self-auto shrink-0"
					>
						Buka Peta Kebun →
					</a>
				</div>
			{/if}

			<!-- Plant Description -->
			<div class="flex flex-col gap-2.5">
				<div class="flex items-center gap-2 text-stone-900 font-black text-sm uppercase tracking-wide">
					<FileText class="w-4 h-4 stroke-[2.5]" />
					<h3>Deskripsi Botani &amp; Budidaya</h3>
				</div>
				<p class="text-sm sm:text-base text-stone-800 font-medium leading-relaxed whitespace-pre-line bg-[#F7F2E7] p-5 rounded-2xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
					{plant.description}
				</p>
			</div>

			<!-- Scientific Taxonomy Hierarchy -->
			<PlantTaxonomy taxonomy={plant.taxonomy} />

			<!-- Student Explanation Video Player Section (BRD Ref) -->
			<PlantVideoSection videos={plant.videos} plantName={plant.name_local} />

			<!-- Metadata Footer -->
			<div class="pt-4 border-t-2 border-[#18181B] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700 font-bold">
				{#if plant.contributor_name}
					<div class="flex items-center gap-2">
						<div class="w-6 h-6 rounded-md bg-[#6BB092] border border-[#18181B] flex items-center justify-center text-stone-900">
							<UserCheck class="w-3.5 h-3.5 stroke-[2.5]" />
						</div>
						<span>Kontributor Siswa: <strong class="text-stone-900">{plant.contributor_name}</strong></span>
					</div>
				{/if}

				<div class="flex items-center gap-1.5 text-stone-600 font-medium">
					<Calendar class="w-3.5 h-3.5" />
					<span>Diperbarui: {formatDateId(plant.updated_at)}</span>
				</div>
			</div>
		</article>
	{:else}
		<div class="p-12 text-center bg-[#FFFEF9] rounded-3xl border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B]">
			<h2 class="text-xl font-black text-stone-900">Tanaman Tidak Ditemukan</h2>
			<p class="text-xs sm:text-sm text-stone-600 font-medium mt-1">Slug URL tidak cocok dengan spesies terdaftar di SMK Pertanian.</p>
			<a href="/katalog" class="mt-4 inline-block text-xs font-black px-4 py-2.5 bg-[#6BB092] text-stone-900 rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
				Lihat Semua Tanaman
			</a>
		</div>
	{/if}
</div>

<!-- Modal QR Code Generator -->
{#if showQrModal && plant}
	<div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="relative w-full max-w-sm">
			<button
				onclick={() => (showQrModal = false)}
				class="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-xl bg-[#F6BD60] text-stone-900 hover:bg-[#eab052] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center cursor-pointer active:translate-y-0.5"
				aria-label="Tutup Modal"
			>
				<X class="w-5 h-5 stroke-[2.5]" />
			</button>
			<QrGenerator {plant} />
		</div>
	</div>
{/if}
