<!--
  Flora SMK — Teacher / Admin Moderation Dashboard (Svelte 5 Runes)
  Tujuan: Menyetujui atau menolak data tanaman dan video edukasi yang diajukan oleh siswa
  Caller: Route '/admin/moderasi'
  BRD Ref: F5 (Moderasi Guru)
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import type { Plant, ContributionStatus } from '#lib/types/plant.types';
	import { formatDateId, getCategoryBadgeLabel } from '#lib/utils/format';
	import Button from '#lib/components/ui/Button.svelte';
	import {
		ShieldCheck,
		Check,
		X,
		Eye,
		Video,
		User,
		Clock,
		AlertCircle,
		CheckCircle2,
		XCircle
	} from '@lucide/svelte';

	let plants = $state<Plant[]>([]);
	let isLoading = $state(true);
	let activeTab = $state<ContributionStatus>('pending');

	// Reject modal state
	let rejectingPlant = $state<Plant | null>(null);
	let rejectionReason = $state('');

	onMount(async () => {
		// Auto login as admin if not logged in for easier demo review
		if (!$authUser) {
			authUser.loginAsDemo('admin');
		}
		await loadModerationList();
	});

	async function loadModerationList() {
		isLoading = true;
		try {
			plants = await PlantService.getAllPlants();
		} catch (err) {
			console.warn('Gagal memuat antrean moderasi:', err);
		} finally {
			isLoading = false;
		}
	}

	const filteredList = $derived(plants.filter((p) => p.status === activeTab));

	const counts = $derived({
		pending: plants.filter((p) => p.status === 'pending').length,
		approved: plants.filter((p) => p.status === 'approved').length,
		rejected: plants.filter((p) => p.status === 'rejected').length
	});

	async function handleApprove(plant: Plant) {
		try {
			await PlantService.moderatePlant(plant.id, 'approve');
			toast.success('Pengajuan Disetujui!', `${plant.name_local} kini resmi tayang di katalog.`);
			await loadModerationList();
		} catch (err: any) {
			toast.error('Gagal memproses approval', err?.message);
		}
	}

	function openRejectModal(plant: Plant) {
		rejectingPlant = plant;
		rejectionReason = '';
	}

	async function submitReject() {
		if (!rejectingPlant) return;
		if (!rejectionReason.trim()) {
			toast.error('Alasan Diperlukan', 'Harap isi alasan penolakan untuk catatan siswa.');
			return;
		}

		try {
			await PlantService.moderatePlant(rejectingPlant.id, 'reject', rejectionReason.trim());
			toast.info('Pengajuan Ditolak', `Catatan perbaikan telah disimpan untuk ${rejectingPlant.name_local}.`);
			rejectingPlant = null;
			await loadModerationList();
		} catch (err: any) {
			toast.error('Gagal menolak', err?.message);
		}
	}
</script>

<svelte:head>
	<title>Dashboard Moderasi Guru — Flora SMK</title>
</svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
		<div class="flex items-center gap-2.5">
			<div class="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
				<ShieldCheck class="w-6 h-6" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
					Dashboard Moderasi Guru
				</h1>
				<p class="text-xs text-stone-500">
					Verifikasi data botani, taksonomi, dan video edukasi yang disubmit oleh siswa
				</p>
			</div>
		</div>

		<!-- Status Tabs -->
		<div class="flex items-center bg-stone-100 p-1 rounded-xl">
			<button
				type="button"
				onclick={() => (activeTab = 'pending')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all {activeTab === 'pending'
					? 'bg-white text-stone-900 shadow-xs'
					: 'text-stone-600 hover:text-stone-900'}"
			>
				<span>Menunggu</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] {activeTab === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-600'}">
					{counts.pending}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'approved')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all {activeTab === 'approved'
					? 'bg-white text-stone-900 shadow-xs'
					: 'text-stone-600 hover:text-stone-900'}"
			>
				<span>Disetujui</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800">
					{counts.approved}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'rejected')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all {activeTab === 'rejected'
					? 'bg-white text-stone-900 shadow-xs'
					: 'text-stone-600 hover:text-stone-900'}"
			>
				<span>Ditolak</span>
				<span class="px-1.5 py-0.2 rounded-full text-[10px] bg-stone-200 text-stone-600">
					{counts.rejected}
				</span>
			</button>
		</div>
	</div>

	<!-- Moderation Item List -->
	{#if isLoading}
		<div class="flex flex-col gap-3">
			{#each [1, 2, 3] as _}
				<div class="p-5 bg-white rounded-2xl border border-stone-200 animate-pulse h-28"></div>
			{/each}
		</div>
	{:else if filteredList.length > 0}
		<div class="flex flex-col gap-3">
			{#each filteredList as item (item.id)}
				<div class="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div class="flex items-start gap-4">
						<img
							src={item.photos[0]?.storage_path || '/icons/icon-192.svg'}
							alt={item.name_local}
							class="w-18 h-18 sm:w-20 sm:h-20 rounded-xl object-cover border border-stone-200 shrink-0"
						/>

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-stone-100 text-stone-700">
									{getCategoryBadgeLabel(item.category)}
								</span>
								{#if item.videos && item.videos.length > 0}
									<span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 flex items-center gap-1">
										<Video class="w-3 h-3 text-amber-600" />
										Ada Video
									</span>
								{/if}
							</div>

							<h3 class="text-base font-bold text-stone-900 mt-1">
								{item.name_local}
							</h3>
							<p class="font-latin italic text-xs text-stone-500">
								{item.name_latin}
							</p>

							<div class="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-stone-500">
								<span class="flex items-center gap-1 text-emerald-800 font-medium">
									<User class="w-3 h-3 text-emerald-600" />
									{item.contributor_name || 'Siswa SMK'}
								</span>
								<span class="flex items-center gap-1">
									<Clock class="w-3 h-3" />
									{formatDateId(item.created_at)}
								</span>
							</div>

							{#if item.rejection_reason}
								<p class="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded-lg border border-red-200">
									<strong>Catatan Penolakan:</strong> {item.rejection_reason}
								</p>
							{/if}
						</div>
					</div>

					<!-- Moderation Actions -->
					<div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t sm:border-t-0 pt-3 sm:pt-0">
						<a
							href="/katalog/{item.slug}"
							target="_blank"
							class="px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1 transition-colors"
						>
							<Eye class="w-3.5 h-3.5" />
							<span>Lihat Detail</span>
						</a>

						{#if item.status === 'pending'}
							<div class="flex items-center gap-2">
								<Button size="sm" variant="danger" onclick={() => openRejectModal(item)}>
									<X class="w-3.5 h-3.5" />
									Tolak
								</Button>
								<Button size="sm" variant="primary" onclick={() => handleApprove(item)}>
									<Check class="w-3.5 h-3.5" />
									Setujui
								</Button>
							</div>
						{:else if item.status === 'rejected'}
							<Button size="sm" variant="primary" onclick={() => handleApprove(item)}>
								<Check class="w-3.5 h-3.5" />
								Pulihkan &amp; Setujui
							</Button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="p-12 text-center bg-white rounded-2xl border border-stone-200">
			<CheckCircle2 class="w-10 h-10 text-emerald-600 mx-auto mb-2" />
			<h3 class="text-base font-bold text-stone-900">
				{activeTab === 'pending' ? 'Tidak Ada Pengajuan Pending' : 'Daftar Kosong'}
			</h3>
			<p class="text-xs text-stone-500 mt-1">
				{activeTab === 'pending'
					? 'Semua submisi tanaman dari siswa telah selesai diperiksa.'
					: 'Tidak ada data pada kategori status ini.'}
			</p>
		</div>
	{/if}
</div>

<!-- Modal Dialog Alasan Penolakan -->
{#if rejectingPlant}
	<div class="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-stone-200 flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-150">
			<div class="flex items-center justify-between pb-2 border-b border-stone-100">
				<h3 class="text-base font-bold text-stone-900">
					Tolak Pengajuan: {rejectingPlant.name_local}
				</h3>
				<button onclick={() => (rejectingPlant = null)} class="text-stone-400 hover:text-stone-700">
					<X class="w-4 h-4" />
				</button>
			</div>

			<p class="text-xs text-stone-600">
				Berikan catatan alasan mengapa pengajuan ini belum dapat disetujui (misal: foto kurang jelas, nama ilmiah salah eja, atau deskripsi kurang lengkap):
			</p>

			<textarea
				bind:value={rejectionReason}
				rows="3"
				placeholder="Contoh: Foto bunga belum disertakan dan ejaan nama ilmiah salah (seharusnya Zingiber officinale)..."
				class="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white"
			></textarea>

			<div class="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
				<Button variant="outline" size="sm" onclick={() => (rejectingPlant = null)}>
					Batal
				</Button>
				<Button variant="danger" size="sm" onclick={submitReject}>
					Konfirmasi Tolak
				</Button>
			</div>
		</div>
	</div>
{/if}
