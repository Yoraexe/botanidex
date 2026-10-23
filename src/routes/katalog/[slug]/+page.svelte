<!--
  Botanidex — Plant Detail Page (Svelte 5 Runes)
  Tujuan: Profil lengkap tanaman gaya Neo-Brutalist dengan proteksi moderasi publik (BRD F5 & AC2.4), galeri foto, taksonomi, video edukasi siswa, lokasi peta, dan QR generator
  Caller: Route '/katalog/[slug]'
  Dependensi: PlantService, authUser, format.ts, PlantGallery, PlantTaxonomy, PlantVideoSection, QrGenerator, toast
  Main Functions: handleShare
  Side Effects: Mengambil data tanaman secara reaktif via PlantService saat slug berubah dan menyalin tautan/membuka Web Share API
-->
<script lang="ts">
	import { page } from '$app/state';
	import { authUser } from '#lib/stores/auth.store';
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
	import { ArrowLeft, MapPin, Share2, QrCode, Calendar, UserCheck, FileText, X, Clock, AlertCircle, ShieldCheck } from '@lucide/svelte';

	const slug = $derived(page.params.slug);
	let plant = $state<Plant | null>(null);
	let showQrModal = $state(false);

	const canViewPlant = $derived(
		Boolean(plant && (plant.status === 'approved' || $authUser?.role === 'admin' || (plant.contributor_id && $authUser?.id === plant.contributor_id)))
	);

	$effect(() => {
		const currentSlug = slug;
		if (!currentSlug) { plant = null; return; }
		const seedMatch = INITIAL_PLANTS_DATA.find((p) => p.slug === currentSlug);
		if (seedMatch && (!plant || plant.slug !== currentSlug)) plant = seedMatch;
		PlantService.getPlantBySlug(currentSlug)
			.then((fetched) => { if (slug === currentSlug) plant = fetched ?? seedMatch ?? null; })
			.catch((err) => console.warn('Gagal memuat detail tanaman:', err));
	});

	async function handleShare() {
		if (typeof window === 'undefined' || !plant) return;
		const shareData = {
			title: `${plant.name_local} (${plant.name_latin}) — Botanidex`,
			text: `Pelajari tanaman ${plant.name_local} di katalog botani digital Botanidex SMK PPN Gorontalo`,
			url: window.location.href
		};
		if (navigator.share) {
			await navigator.share(shareData).catch(() => {});
		} else {
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
	{#if plant && canViewPlant}
		<title>{plant.name_local} ({plant.name_latin}) — Botanidex</title>
		<meta name="description" content={plant.description.substring(0, 150)} />
	{:else}
		<title>Detail Tanaman — Botanidex</title>
	{/if}
</svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	<div class="flex items-center justify-between">
		<a href="/katalog" class="inline-flex items-center gap-2 text-xs font-black text-[#0D0D0D] bg-white px-3.5 py-2.5 rounded-xl border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#D4F469] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all">
			<ArrowLeft class="w-4 h-4 stroke-[2.5]" /> <span>Kembali ke Katalog</span>
		</a>
		{#if plant && canViewPlant}
			<div class="flex items-center gap-2.5">
				<button onclick={() => (showQrModal = true)} class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2.5 bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#D4F469] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all cursor-pointer" title="Lihat Label QR Tanaman">
					<QrCode class="w-4 h-4 stroke-[2.5]" /> <span class="hidden sm:inline">Cetak QR</span>
				</button>
				<button onclick={handleShare} class="inline-flex items-center gap-1.5 text-xs font-black px-3.5 py-2.5 bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] rounded-xl shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#D4F469] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all cursor-pointer" title="Bagikan Tautan Profil Tanaman">
					<Share2 class="w-4 h-4 stroke-[2.5]" /> <span>Bagikan</span>
				</button>
			</div>
		{/if}
	</div>

	{#if plant && !canViewPlant}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#FBBF24] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D]"><Clock class="w-7 h-7 stroke-[2.5]" /></div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Tanaman Sedang Dalam Moderasi Guru</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">Dokumentasi tanaman ini berstatus <strong>{plant.status}</strong> dan belum dipublikasikan ke katalog umum. Masuk sebagai Guru Pembimbing untuk meninjau pengajuan ini.</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-2">
				<a
					href="/login?redirectTo=/katalog/{plant.slug}"
					class="px-5 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-xs font-black text-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_#0D0D0D] flex items-center gap-2"
				>
					<ShieldCheck class="w-4 h-4 stroke-[2.5]" />
					<span>Masuk sebagai Guru / Admin</span>
				</a>
				<a href="/katalog" class="px-4 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#F3F6ED]">Lihat Katalog Publik</a>
			</div>
		</div>
	{:else if plant}
		{@const colors = getCategoryColorClass(plant.category)}
		{#if plant.status !== 'approved'}
			<div class="p-4 rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-3 {plant.status === 'pending' ? 'bg-[#FBBF24]' : 'bg-[#E07A5F] text-white'}">
				<div class="flex items-start gap-3">
					<AlertCircle class="w-5 h-5 stroke-[2.5] shrink-0 mt-0.5" />
					<div class="text-xs font-bold">
						<p class="font-black uppercase tracking-wider">{plant.status === 'pending' ? 'Mode Pratinjau Moderasi — Menunggu Verifikasi Guru' : 'Pengajuan Ditolak — Belum Tayang di Katalog Publik'}</p>
						{#if plant.rejection_reason}<p class="mt-1">Catatan Perbaikan: <strong>{plant.rejection_reason}</strong></p>{/if}
					</div>
				</div>
				{#if $authUser?.role === 'admin'}
					<a href="/admin/moderasi" class="px-3.5 py-2 rounded-xl bg-white text-[#0D0D0D] border-2 border-[#0D0D0D] text-xs font-black shadow-[2px_2px_0px_#0D0D0D] shrink-0 self-start sm:self-auto">Buka Panel Moderasi →</a>
				{/if}
			</div>
		{/if}

		<article class="bg-white rounded-3xl p-5 sm:p-8 border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] flex flex-col gap-6">
			<div class="flex flex-col gap-2.5 pb-5 border-b-2 border-[#0D0D0D]">
				<div class="flex flex-wrap items-center gap-2">
					<span class="px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] {colors.bg} text-[#0D0D0D]">{getCategoryBadgeLabel(plant.category)}</span>
					{#if plant.aliases?.length}
						<span class="text-xs font-bold text-stone-600 bg-[#F3F6ED] px-2 py-0.5 rounded-md border border-[#0D0D0D]">Sinonim: {plant.aliases.join(', ')}</span>
					{/if}
				</div>
				<h1 class="text-2xl sm:text-4xl font-black text-[#0D0D0D] tracking-tight leading-tight">{plant.name_local}</h1>
				<div class="flex flex-wrap items-baseline gap-2">
					<p class="font-latin italic text-lg sm:text-2xl text-[#0D0D0D] font-bold">{plant.name_latin}</p>
					{#if plant.name_english}<span class="text-xs sm:text-sm font-semibold text-stone-600">• Bahasa Inggris: <strong class="text-[#0D0D0D]">{plant.name_english}</strong></span>{/if}
				</div>
			</div>

			<PlantGallery photos={plant.photos} plantName={plant.name_local} />

			{#if plant.location_label}
				<div class="p-4 bg-[#F3F6ED] rounded-2xl border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
					<div class="flex items-center gap-3">
						<div class="w-10 h-10 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] text-[#0D0D0D] flex items-center justify-center shrink-0"><MapPin class="w-5 h-5 stroke-[2.5]" /></div>
						<div>
							<p class="text-[10px] font-black text-stone-600 uppercase tracking-wider">Lokasi</p>
							<p class="text-sm sm:text-base font-black text-[#0D0D0D]">{plant.location_label}</p>
						</div>
					</div>
					<a href="/peta" class="px-4 py-2 rounded-full bg-white border-2 border-[#0D0D0D] text-[#0D0D0D] text-xs font-black hover:bg-[#D4F469] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D] transition-all self-start sm:self-auto shrink-0">Lihat Peta →</a>
				</div>
			{/if}

			<div class="flex flex-col gap-2.5">
				<div class="flex items-center gap-2 text-[#0D0D0D] font-black text-sm uppercase tracking-wide"><FileText class="w-4 h-4 stroke-[2.5]" /> <h3>Deskripsi</h3></div>
				<p class="text-sm sm:text-base text-stone-800 font-medium leading-relaxed whitespace-pre-line bg-[#F3F6ED] p-5 rounded-2xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">{plant.description}</p>
			</div>

			<PlantTaxonomy taxonomy={plant.taxonomy} />
			<PlantVideoSection videos={plant.videos} plantName={plant.name_local} />

			<div class="pt-4 border-t-2 border-[#0D0D0D] flex flex-wrap items-center justify-between gap-3 text-xs text-stone-700 font-bold">
				{#if plant.contributor_name}
					<div class="flex items-center gap-2">
						<div class="w-6 h-6 rounded-md bg-[#D4F469] border border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D]"><UserCheck class="w-3.5 h-3.5 stroke-[2.5]" /></div>
						<span>Kontributor: <strong class="text-[#0D0D0D]">{plant.contributor_name}</strong></span>
					</div>
				{/if}
				<div class="flex items-center gap-1.5 text-stone-600 font-medium"><Calendar class="w-3.5 h-3.5" /> <span>Diperbarui: {formatDateId(plant.updated_at)}</span></div>
			</div>
		</article>
	{:else}
		<div class="p-12 text-center bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D]">
			<h2 class="text-xl font-black text-[#0D0D0D]">Tanaman Tidak Ditemukan</h2>
			<p class="text-xs sm:text-sm text-stone-600 font-medium mt-1">Slug URL tidak cocok dengan spesies terdaftar di SMK PPN Gorontalo.</p>
			<a href="/katalog" class="mt-4 inline-block text-xs font-black px-4 py-2.5 bg-[#D4F469] hover:bg-[#c5e855] text-[#0D0D0D] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">Lihat Semua Tanaman</a>
		</div>
	{/if}
</div>

{#if showQrModal && plant && canViewPlant}
	<div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="relative w-full max-w-sm">
			<button onclick={() => (showQrModal = false)} class="absolute -top-3 -right-3 z-10 w-9 h-9 rounded-xl bg-[#D4F469] text-[#0D0D0D] hover:bg-[#c5e855] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center cursor-pointer active:translate-y-0.5" aria-label="Tutup Modal"><X class="w-5 h-5 stroke-[2.5]" /></button>
			<QrGenerator {plant} />
		</div>
	</div>
{/if}
