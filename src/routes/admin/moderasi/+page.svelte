<!--
  Flora SMK — Teacher / Admin Moderation Dashboard (Svelte 5 Runes)
  Tujuan: Menyetujui atau menolak data tanaman dan video edukasi yang diajukan oleh siswa gaya Neo-Brutalist
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
	<!-- Top Navigation Tabs (Moderasi vs CMS Settings) -->
	<div class="flex items-center justify-between bg-white p-3.5 rounded-2xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
		<div class="flex items-center gap-2">
			<span class="px-3.5 py-1.5 rounded-xl border-2 border-[#18181B] bg-[#18181B] text-[#E2EF46] text-xs font-black shadow-[2px_2px_0px_#18181B] select-none">
				Moderasi Siswa
			</span>
			<a
				href="/admin/pengaturan"
				class="px-3.5 py-1.5 rounded-xl border-2 border-[#18181B] text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all select-none"
			>
				⚙️ Pengaturan CMS &amp; Tampilan
			</a>
		</div>
		<span class="text-[10px] font-black uppercase tracking-wider text-stone-500 hidden sm:inline">
			Portal Administrator
		</span>
	</div>

	<!-- Page Header -->
	<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#18181B]">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#CDB4DB] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] text-stone-900 flex items-center justify-center shrink-0">
				<ShieldCheck class="w-6 h-6 stroke-[2.5]" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
					Dashboard Moderasi Guru
				</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
					Verifikasi data botani, taksonomi, dan video edukasi yang disubmit oleh siswa
				</p>
			</div>
		</div>

		<!-- Status Tabs Neo-Brutalist -->
		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={() => (activeTab = 'pending')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#18181B] cursor-pointer {activeTab === 'pending'
					? 'bg-[#F6BD60] text-stone-900 shadow-[2px_2px_0px_#18181B] -translate-y-0.5'
					: 'bg-white text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#18181B]'}"
			>
				<span>Menunggu</span>
				<span class="px-1.5 py-0.2 rounded-md text-[10px] border border-[#18181B] {activeTab === 'pending' ? 'bg-[#18181B] text-[#F6BD60]' : 'bg-stone-200 text-stone-900'}">
					{counts.pending}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'approved')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#18181B] cursor-pointer {activeTab === 'approved'
					? 'bg-[#6BB092] text-stone-900 shadow-[2px_2px_0px_#18181B] -translate-y-0.5'
					: 'bg-white text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#18181B]'}"
			>
				<span>Disetujui</span>
				<span class="px-1.5 py-0.2 rounded-md text-[10px] border border-[#18181B] {activeTab === 'approved' ? 'bg-[#18181B] text-[#6BB092]' : 'bg-stone-200 text-stone-900'}">
					{counts.approved}
				</span>
			</button>

			<button
				type="button"
				onclick={() => (activeTab = 'rejected')}
				class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#18181B] cursor-pointer {activeTab === 'rejected'
					? 'bg-[#E07A5F] text-white shadow-[2px_2px_0px_#18181B] -translate-y-0.5'
					: 'bg-white text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#18181B]'}"
			>
				<span>Ditolak</span>
				<span class="px-1.5 py-0.2 rounded-md text-[10px] border border-[#18181B] {activeTab === 'rejected' ? 'bg-white text-[#E07A5F]' : 'bg-stone-200 text-stone-900'}">
					{counts.rejected}
				</span>
			</button>
		</div>
	</div>

	<!-- Moderation Item List -->
	{#if isLoading}
		<div class="flex flex-col gap-3">
			{#each [1, 2, 3] as _}
				<div class="p-5 bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] animate-pulse h-28"></div>
			{/each}
		</div>
	{:else if filteredList.length > 0}
		<div class="flex flex-col gap-4">
			{#each filteredList as item (item.id)}
				<div class="bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] p-4 sm:p-5 shadow-[4px_4px_0px_#18181B] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
					<div class="flex items-start gap-4">
						<img
							src={item.photos[0]?.storage_path || '/icons/icon-192.svg'}
							alt={item.name_local}
							class="w-18 h-18 sm:w-22 sm:h-22 rounded-xl object-cover border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] shrink-0"
						/>

						<div class="flex-1 min-w-0">
							<div class="flex items-center gap-2">
								<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#18181B] bg-[#F7F2E7] text-stone-900">
									{getCategoryBadgeLabel(item.category)}
								</span>
								{#if item.videos && item.videos.length > 0}
									<span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#F6BD60] text-stone-900 border border-[#18181B] flex items-center gap-1">
										<Video class="w-3 h-3 stroke-[2.5]" />
										Ada Video Siswa
									</span>
								{/if}
							</div>

							<h3 class="text-base sm:text-lg font-black text-stone-900 mt-1">
								{item.name_local}
							</h3>
							<p class="font-latin italic text-xs sm:text-sm text-stone-700 font-bold">
								{item.name_latin}
							</p>

							<div class="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-stone-700 font-bold">
								<span class="flex items-center gap-1.5 text-stone-900">
									<User class="w-3.5 h-3.5 stroke-[2.5]" />
									{item.contributor_name || 'Siswa SMK'}
								</span>
								<span class="flex items-center gap-1 text-stone-500 font-medium">
									<Clock class="w-3.5 h-3.5" />
									{formatDateId(item.created_at)}
								</span>
							</div>

							{#if item.rejection_reason}
								<p class="mt-2.5 text-xs text-stone-900 bg-[#E07A5F]/20 p-2.5 rounded-xl border border-[#18181B] font-bold">
									<strong>Catatan Perbaikan:</strong> {item.rejection_reason}
								</p>
							{/if}
						</div>
					</div>

					<!-- Moderation Actions -->
					<div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t-2 border-[#18181B]/20 sm:border-t-0 pt-3 sm:pt-0">
						<a
							href="/katalog/{item.slug}"
							target="_blank"
							class="px-3 py-1.5 rounded-xl border-2 border-[#18181B] bg-white text-stone-900 hover:bg-[#F6BD60] text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#18181B] active:translate-y-0.5 transition-all"
						>
							<Eye class="w-3.5 h-3.5 stroke-[2.5]" />
							<span>Lihat Detail</span>
						</a>

						{#if item.status === 'pending'}
							<div class="flex items-center gap-2">
								<Button size="sm" variant="danger" onclick={() => openRejectModal(item)}>
									<X class="w-3.5 h-3.5 stroke-[2.5]" />
									Tolak
								</Button>
								<Button size="sm" variant="primary" onclick={() => handleApprove(item)}>
									<Check class="w-3.5 h-3.5 stroke-[2.5]" />
									Setujui
								</Button>
							</div>
						{:else if item.status === 'rejected'}
							<Button size="sm" variant="primary" onclick={() => handleApprove(item)}>
								<Check class="w-3.5 h-3.5 stroke-[2.5]" />
								Pulihkan &amp; Setujui
							</Button>
						{/if}
					</div>
				</div>
			{/each}
		</div>
	{:else}
		<div class="p-12 text-center bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[5px_5px_0px_#18181B]">
			<CheckCircle2 class="w-12 h-12 text-[#6BB092] mx-auto mb-2 stroke-[2.5]" />
			<h3 class="text-base sm:text-lg font-black text-stone-900">
				{activeTab === 'pending' ? 'Tidak Ada Pengajuan Pending' : 'Daftar Kosong'}
			</h3>
			<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1">
				{activeTab === 'pending'
					? 'Semua submisi tanaman dari siswa telah selesai diperiksa.'
					: 'Tidak ada data pada kategori status ini.'}
			</p>
		</div>
	{/if}
</div>

<!-- Modal Dialog Alasan Penolakan -->
{#if rejectingPlant}
	<div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-[#FFFEF9] rounded-2xl max-w-md w-full p-6 shadow-[6px_6px_0px_#18181B] border-2 border-[#18181B] flex flex-col gap-4">
			<div class="flex items-center justify-between pb-3 border-b-2 border-[#18181B]">
				<h3 class="text-base font-black text-stone-900">
					Tolak Pengajuan: {rejectingPlant.name_local}
				</h3>
				<button onclick={() => (rejectingPlant = null)} class="p-1 text-stone-500 hover:text-stone-900 cursor-pointer">
					<X class="w-5 h-5 stroke-[2.5]" />
				</button>
			</div>

			<p class="text-xs text-stone-700 font-semibold">
				Berikan catatan alasan mengapa pengajuan ini belum dapat disetujui (misal: foto kurang jelas, nama ilmiah salah eja, atau deskripsi kurang lengkap):
			</p>

			<textarea
				bind:value={rejectionReason}
				rows="3"
				placeholder="Contoh: Foto rimpang belum disertakan dan ejaan nama ilmiah salah (seharusnya Zingiber officinale)..."
				class="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-[#18181B] rounded-xl shadow-[2px_2px_0px_#18181B] outline-none font-bold text-stone-900 placeholder:text-stone-400 placeholder:font-normal"
			></textarea>

			<div class="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#18181B]">
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
