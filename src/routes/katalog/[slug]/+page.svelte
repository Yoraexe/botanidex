<!--
  Flora SMK — Plant Detail Page (Svelte 5 Runes)
  Tujuan: Profil lengkap tanaman, galeri foto, taksonomi, video edukasi siswa, lokasi peta, dan QR generator
  Caller: Route '/katalog/[slug]'
  BRD Ref: F2 (Detail Tanaman & Video Siswa)
-->
<script lang="ts">
	import { page } from '$app/state';
	import { onMount } from 'svelte';
	import { PlantService } from '#lib/services/plant.service';
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

	let plant = $state<Plant | null>(null);
	let isLoading = $state(true);
	let showQrModal = $state(false);

	const slug = $derived(page.params.slug);

	onMount(async () => {
		await loadPlantDetail();
	});

	async function loadPlantDetail() {
		isLoading = true;
		try {
			if (slug) {
				plant = await PlantService.getPlantBySlug(slug);
			}
		} catch (err) {
			console.warn('Gagal memuat detail tanaman:', err);
		} finally {
			isLoading = false;
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
			class="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-emerald-700 bg-white px-3 py-2 rounded-xl border border-stone-200 transition-colors shadow-xs"
		>
			<ArrowLeft class="w-4 h-4" />
			<span>Kembali ke Katalog</span>
		</a>

		<div class="flex items-center gap-2">
			<button
				onclick={() => (showQrModal = true)}
				class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-xs"
				title="Lihat Label QR Tanaman"
			>
				<QrCode class="w-4 h-4 text-emerald-600" />
				<span class="hidden sm:inline">Cetak QR</span>
			</button>

			<button
				onclick={handleShare}
				class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 bg-white text-stone-700 border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-xs"
				title="Bagikan Tautan Profil Tanaman"
			>
				<Share2 class="w-4 h-4 text-stone-600" />
				<span>Bagikan</span>
			</button>
		</div>
	</div>

	{#if isLoading}
		<div class="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 animate-pulse flex flex-col gap-6">
			<div class="h-8 bg-stone-200 rounded-lg w-1/3"></div>
			<div class="aspect-video bg-stone-200 rounded-2xl w-full"></div>
			<div class="h-4 bg-stone-200 rounded w-full"></div>
			<div class="h-4 bg-stone-200 rounded w-2/3"></div>
		</div>
	{:else if plant}
		{@const colors = getCategoryColorClass(plant.category)}
		{@const categoryLabel = getCategoryBadgeLabel(plant.category)}

		<!-- Plant Main Profile Card -->
		<article class="bg-white rounded-3xl p-5 sm:p-8 border border-stone-200/90 shadow-sm flex flex-col gap-6">
			<!-- Header Title & Badges -->
			<div class="flex flex-col gap-2 pb-4 border-b border-stone-100">
				<div class="flex items-center gap-2">
					<span class="px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider border {colors.bg} {colors.text} {colors.border}">
						{categoryLabel}
					</span>
					{#if plant.aliases && plant.aliases.length > 0}
						<span class="text-xs text-stone-400 hidden sm:inline">
							Sinonim: {plant.aliases.join(', ')}
						</span>
					{/if}
				</div>

				<h1 class="text-2xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
					{plant.name_local}
				</h1>

				<div class="flex flex-wrap items-baseline gap-2">
					<p class="font-latin italic text-base sm:text-xl text-emerald-800 font-semibold">
						{plant.name_latin}
					</p>
					{#if plant.name_english}
						<span class="text-xs sm:text-sm text-stone-400">
							• Bahasa Inggris: <span class="font-medium text-stone-600">{plant.name_english}</span>
						</span>
					{/if}
				</div>
			</div>

			<!-- Visual Photo Gallery -->
			<PlantGallery photos={plant.photos} plantName={plant.name_local} />

			<!-- Location Badge with Direct Link to Map -->
			{#if plant.location_label}
				<div class="p-3.5 bg-emerald-50/60 rounded-xl border border-emerald-200/60 flex items-center justify-between gap-3">
					<div class="flex items-center gap-2">
						<div class="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
							<MapPin class="w-4 h-4" />
						</div>
						<div>
							<p class="text-[11px] font-bold text-emerald-900 uppercase tracking-wider">Lokasi di Area Sekolah</p>
							<p class="text-xs sm:text-sm font-semibold text-stone-800">{plant.location_label}</p>
						</div>
					</div>
					<a
						href="/peta"
						class="px-3 py-1.5 rounded-lg bg-white border border-emerald-300 text-emerald-800 text-xs font-bold hover:bg-emerald-100/50 transition-colors shrink-0"
					>
						Buka Peta Kebun →
					</a>
				</div>
			{/if}

			<!-- Plant Description -->
			<div class="flex flex-col gap-2">
				<div class="flex items-center gap-2 text-stone-900 font-bold text-sm">
					<FileText class="w-4 h-4 text-emerald-600" />
					<h3>Deskripsi Botani &amp; Budidaya</h3>
				</div>
				<p class="text-sm sm:text-base text-stone-700 leading-relaxed whitespace-pre-line bg-stone-50/60 p-4 rounded-xl border border-stone-200/60">
					{plant.description}
				</p>
			</div>

			<!-- Scientific Taxonomy Hierarchy -->
			<PlantTaxonomy taxonomy={plant.taxonomy} />

			<!-- Student Explanation Video Player Section (BRD Amendment) -->
			<PlantVideoSection videos={plant.videos} plantName={plant.name_local} />

			<!-- Metadata Footer -->
			<div class="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-400">
				{#if plant.contributor_name}
					<div class="flex items-center gap-1.5 text-stone-600">
						<UserCheck class="w-3.5 h-3.5 text-emerald-600" />
						<span>Kontributor: <strong class="text-stone-800">{plant.contributor_name}</strong></span>
					</div>
				{/if}

				<div class="flex items-center gap-1.5">
					<Calendar class="w-3.5 h-3.5" />
					<span>Diperbarui: {formatDateId(plant.updated_at)}</span>
				</div>
			</div>
		</article>
	{:else}
		<div class="p-12 text-center bg-white rounded-3xl border border-stone-200">
			<h2 class="text-lg font-bold text-stone-900">Tanaman Tidak Ditemukan</h2>
			<p class="text-xs text-stone-500 mt-1">Slug URL tidak cocok dengan spesies terdaftar di SMK Pertanian.</p>
			<a href="/katalog" class="mt-4 inline-block text-xs font-semibold px-4 py-2 bg-emerald-600 text-white rounded-xl">
				Lihat Semua Tanaman
			</a>
		</div>
	{/if}
</div>

<!-- Modal QR Code Generator -->
{#if showQrModal && plant}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="relative w-full max-w-sm">
			<button
				onclick={() => (showQrModal = false)}
				class="absolute -top-3 -right-3 z-10 w-8 h-8 rounded-full bg-white text-stone-600 hover:text-stone-900 shadow-md flex items-center justify-center border border-stone-200"
				aria-label="Tutup Modal"
			>
				<X class="w-4 h-4" />
			</button>
			<QrGenerator {plant} />
		</div>
	</div>
{/if}
