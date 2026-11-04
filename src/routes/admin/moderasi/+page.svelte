<!--
  Botanidex — Teacher / Admin Moderation Dashboard (Svelte 5 Runes)
  Tujuan: Menyetujui atau menolak data tanaman dan video edukasi yang diajukan oleh siswa dengan proteksi otorisasi role admin (BRD F5 & AC6.4)
  Caller: Route '/admin/moderasi'
  Dependensi: PlantService, authUser, toast, format utils, Button.svelte
  Main Functions: loadModerationList, handleApprove, openRejectModal, submitReject
  Side Effects: Memperbarui status moderasi tanaman dan video melalui PlantService
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import type { Plant, ContributionStatus } from '#lib/types/plant.types';
	import { formatDateId, getCategoryBadgeLabel } from '#lib/utils/format';
	import { exportPlantsToCsv } from '#lib/utils/csv-export';
	import Button from '#lib/components/ui/Button.svelte';
	import { ShieldCheck, Check, X, Eye, Video, User, Clock, AlertCircle, CheckCircle2, Edit3, Download, CheckSquare, Square, BookOpen } from '@lucide/svelte';

	let plants = $state<Plant[]>([]);
	let isLoading = $state(true);
	let activeTab = $state<ContributionStatus>('pending');
	let rejectingPlant = $state<Plant | null>(null);
	let rejectionReason = $state('');
	let selectedIds = $state<string[]>([]);
	let isBulkProcessing = $state(false);

	onMount(() => {
		if ($authUser?.role === 'admin') {
			loadModerationList();
		} else {
			isLoading = false;
		}
	});

	$effect(() => {
		if ($authUser?.role === 'admin' && plants.length === 0 && !isLoading) {
			loadModerationList();
		}
	});

	async function loadModerationList() {
		// SEC-03 Hardening: Cegah pemuatan data moderasi guru jika bukan admin
		if (!$authUser || $authUser.role !== 'admin') {
			plants = [];
			isLoading = false;
			return;
		}
		isLoading = true;
		selectedIds = [];
		try {
			plants = await PlantService.getAllPlants();
		} catch (err) {
			console.warn('Gagal memuat antrean moderasi:', err);
		} finally {
			isLoading = false;
		}
	}

	const filteredList = $derived(plants.filter((p) => p.status === activeTab));
	const isAllSelected = $derived(
		filteredList.length > 0 && filteredList.every((p) => selectedIds.includes(p.id))
	);

	function setTab(tab: ContributionStatus) {
		activeTab = tab;
		selectedIds = [];
	}

	function toggleSelectAll() {
		if (isAllSelected) selectedIds = [];
		else selectedIds = filteredList.map((p) => p.id);
	}

	function toggleSelect(id: string) {
		if (selectedIds.includes(id)) selectedIds = selectedIds.filter((i) => i !== id);
		else selectedIds = [...selectedIds, id];
	}

	async function handleBulkApprove() {
		if (selectedIds.length === 0) return;
		if (!confirm(`Setujui ${selectedIds.length} pengajuan tanaman terpilih sekaligus?`)) return;

		isBulkProcessing = true;
		try {
			await Promise.all(selectedIds.map((id) => PlantService.moderatePlant(id, 'approve')));
			toast.success('Persetujuan Massal Berhasil!', `${selectedIds.length} tanaman kini resmi tayang.`);
			selectedIds = [];
			await loadModerationList();
		} catch (err: unknown) {
			toast.error('Gagal Memproses Approval Massal', (err as Error)?.message || 'Terjadi kesalahan sistem.');
		} finally {
			isBulkProcessing = false;
		}
	}

	function handleExportCsv() {
		exportPlantsToCsv(plants);
		toast.success('Ekspor CSV Berhasil', 'Data inventaris botani sekolah telah diunduh.');
	}
	const statusTabs = $derived<{ id: ContributionStatus; label: string; count: number; activeBtn: string; activeBadge: string }[]>([
		{ id: 'pending', label: 'Menunggu', count: plants.filter((p) => p.status === 'pending').length, activeBtn: 'bg-[#FBBF24] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] -translate-y-0.5', activeBadge: 'bg-[#0D0D0D] text-[#FBBF24]' },
		{ id: 'approved', label: 'Disetujui', count: plants.filter((p) => p.status === 'approved').length, activeBtn: 'bg-[#D4F469] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] -translate-y-0.5', activeBadge: 'bg-[#0D0D0D] text-[#D4F469]' },
		{ id: 'rejected', label: 'Ditolak', count: plants.filter((p) => p.status === 'rejected').length, activeBtn: 'bg-[#E07A5F] text-white shadow-[2px_2px_0px_#0D0D0D] -translate-y-0.5', activeBadge: 'bg-white text-[#E07A5F]' }
	]);

	async function handleApprove(plant: Plant) {
		try {
			await PlantService.moderatePlant(plant.id, 'approve');
			toast.success('Pengajuan Disetujui!', `${plant.name_local} kini resmi tayang di katalog.`);
			await loadModerationList();
		} catch (err: unknown) {
			toast.error('Gagal memproses approval', (err as Error)?.message || 'Terjadi kesalahan sistem.');
		}
	}

	function openRejectModal(plant: Plant) {
		rejectingPlant = plant;
		rejectionReason = '';
	}

	async function submitReject() {
		if (!rejectingPlant) return;
		if (!rejectionReason.trim()) return toast.error('Alasan Diperlukan', 'Harap isi alasan penolakan untuk catatan siswa.');
		try {
			await PlantService.moderatePlant(rejectingPlant.id, 'reject', rejectionReason.trim());
			toast.info('Pengajuan Ditolak', `Catatan perbaikan telah disimpan untuk ${rejectingPlant.name_local}.`);
			rejectingPlant = null;
			await loadModerationList();
		} catch (err: unknown) {
			toast.error('Gagal menolak submission', (err as Error)?.message || 'Terjadi kesalahan sistem.');
		}
	}
</script>

<svelte:head><title>Moderasi Guru — Botanidex</title></svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	{#if $authUser?.role !== 'admin'}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#E07A5F] text-white border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center"><AlertCircle class="w-7 h-7 stroke-[2.5]" /></div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Akses Terbatas — Khusus Guru / Administrator</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">Halaman moderasi katalog tanaman hanya dapat diakses oleh akun Guru Pembimbing / Administrator SMK PPN Gorontalo.</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-2">
				<a
					href="/login?redirectTo=/admin/moderasi"
					class="px-5 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-xs font-black text-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_#0D0D0D] flex items-center gap-2"
				>
					<ShieldCheck class="w-4 h-4 stroke-[2.5]" />
					<span>Masuk Portal Guru</span>
				</a>
				<a href="/" class="px-4 py-2 rounded-xl border-2 border-[#0D0D0D] bg-white text-xs font-black text-stone-700 shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#F3F6ED]">
					Kembali ke Beranda
				</a>
			</div>
		</div>
	{:else}
		<div class="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D]">
			<div class="flex items-center gap-2">
				<span class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-[#0D0D0D] text-[#D4F469] text-xs font-black shadow-[2px_2px_0px_#0D0D0D] select-none">Moderasi Siswa</span>
				<a href="/admin/pengaturan" class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] text-xs font-bold text-stone-700 hover:bg-stone-100 transition-all select-none">⚙️ Pengaturan CMS &amp; Tampilan</a>
			</div>
			<div class="flex items-center gap-2">
				<a
					href="/katalog/buku"
					class="px-3 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white hover:bg-stone-100 text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
					title="Buka Buku Katalog Ensiklopedia A4 PDF Siap Cetak"
				>
					<BookOpen class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>Buku Katalog</span>
				</a>
				<button
					type="button"
					onclick={handleExportCsv}
					class="px-3 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] hover:bg-[#c5e855] text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center gap-1.5 cursor-pointer active:translate-y-0.5 transition-all"
					title="Ekspor seluruh data inventaris botani ke CSV (kompatibel Excel)"
				>
					<Download class="w-3.5 h-3.5 stroke-[2.5]" />
					<span>Ekspor CSV</span>
				</button>
			</div>
		</div>

		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b-2 border-[#0D0D0D]">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-[#0D0D0D] flex items-center justify-center shrink-0"><ShieldCheck class="w-6 h-6 stroke-[2.5]" /></div>
				<div>
					<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-tight">Dashboard Moderasi Guru</h1>
					<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">Verifikasi data botani, taksonomi, dan video edukasi yang disubmit oleh siswa</p>
				</div>
			</div>

			<div class="flex items-center gap-2">
				{#each statusTabs as tab (tab.id)}
					<button type="button" onclick={() => setTab(tab.id)} class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all border-2 border-[#0D0D0D] cursor-pointer {activeTab === tab.id ? tab.activeBtn : 'bg-white text-stone-700 hover:bg-stone-100 shadow-[1px_1px_0px_#0D0D0D]'}">
						<span>{tab.label}</span>
						<span class="px-1.5 py-0.2 rounded-md text-[10px] border border-[#0D0D0D] {activeTab === tab.id ? tab.activeBadge : 'bg-stone-200 text-[#0D0D0D]'}">{tab.count}</span>
					</button>
				{/each}
			</div>
		</div>

		{#if isLoading}
			<div class="flex flex-col gap-3">
				{#each [1, 2, 3] as _}<div class="p-5 bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] animate-pulse h-28"></div>{/each}
			</div>
		{:else if filteredList.length > 0}
			{#if activeTab === 'pending'}
				<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
					<button
						type="button"
						onclick={toggleSelectAll}
						class="flex items-center gap-2 text-xs font-black text-[#0D0D0D] cursor-pointer select-none"
					>
						{#if isAllSelected}
							<CheckSquare class="w-4 h-4 text-emerald-700 stroke-[2.5]" />
						{:else}
							<Square class="w-4 h-4 text-stone-500 stroke-[2.5]" />
						{/if}
						<span>Pilih Semua Antrean Pending ({filteredList.length})</span>
					</button>

					{#if selectedIds.length > 0}
						<div class="flex items-center gap-2">
							<span class="text-xs font-black text-stone-700">{selectedIds.length} terpilih</span>
							<Button size="sm" variant="primary" onclick={handleBulkApprove} disabled={isBulkProcessing}>
								<Check class="w-3.5 h-3.5 stroke-[2.5]" />
								<span>{isBulkProcessing ? 'Memproses...' : `Setujui Terpilih (${selectedIds.length})`}</span>
							</Button>
						</div>
					{/if}
				</div>
			{/if}

			<div class="flex flex-col gap-4">
				{#each filteredList as item (item.id)}
					<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-4 sm:p-5 shadow-[4px_4px_0px_#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="flex items-start gap-3 sm:gap-4">
							{#if activeTab === 'pending'}
								<button
									type="button"
									onclick={() => toggleSelect(item.id)}
									class="p-1 cursor-pointer self-center sm:self-start mt-1.5"
									title="Pilih item ini"
								>
									{#if selectedIds.includes(item.id)}
										<CheckSquare class="w-5 h-5 text-emerald-700 stroke-[2.5]" />
									{:else}
										<Square class="w-5 h-5 text-stone-400 stroke-[2.5]" />
									{/if}
								</button>
							{/if}
							<img src={item.photos[0]?.storage_path || '/icons/icon-192.svg'} alt={item.name_local} class="w-18 h-18 sm:w-22 sm:h-22 rounded-xl object-cover border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] shrink-0" />
							<div class="flex-1 min-w-0">
								<div class="flex items-center gap-2">
									<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#0D0D0D] bg-[#F3F6ED] text-[#0D0D0D]">{getCategoryBadgeLabel(item.category)}</span>
									{#if item.videos?.length}
										<span class="text-[10px] font-black px-2 py-0.5 rounded-md bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D] flex items-center gap-1"><Video class="w-3 h-3 stroke-[2.5]" /> Ada Video Siswa</span>
									{/if}
								</div>
								<h3 class="text-base sm:text-lg font-black text-[#0D0D0D] mt-1">{item.name_local}</h3>
								<p class="font-latin italic text-xs sm:text-sm text-stone-700 font-bold">{item.name_latin}</p>
								<div class="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-stone-700 font-bold">
									<span class="flex items-center gap-1.5 text-[#0D0D0D]"><User class="w-3.5 h-3.5 stroke-[2.5]" /> {item.contributor_name || 'Siswa SMK'}</span>
									<span class="flex items-center gap-1 text-stone-500 font-medium"><Clock class="w-3.5 h-3.5" /> {formatDateId(item.created_at)}</span>
								</div>
								{#if item.rejection_reason}
									<p class="mt-2.5 text-xs text-[#0D0D0D] bg-[#E07A5F]/20 p-2.5 rounded-xl border border-[#0D0D0D] font-bold"><strong>Catatan Perbaikan:</strong> {item.rejection_reason}</p>
								{/if}
							</div>
						</div>

						<div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t-2 border-[#0D0D0D]/20 sm:border-t-0 pt-3 sm:pt-0">
							<div class="flex items-center gap-1.5">
								<a href="/katalog/{item.slug}" class="px-2.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-[#0D0D0D] hover:bg-stone-100 text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 transition-all"><Eye class="w-3.5 h-3.5 stroke-[2.5]" /> <span>Detail</span></a>
								<a href="/admin/tanaman/{item.id}/edit" class="px-2.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] hover:bg-[#c5e855] text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 transition-all" title="Edit dan perbaiki data"><Edit3 class="w-3.5 h-3.5 stroke-[2.5]" /> <span>Edit</span></a>
							</div>
							{#if item.status === 'pending'}
								<div class="flex items-center gap-2">
									<Button size="sm" variant="danger" onclick={() => openRejectModal(item)}><X class="w-3.5 h-3.5 stroke-[2.5]" /> Tolak</Button>
									<Button size="sm" variant="primary" onclick={() => handleApprove(item)}><Check class="w-3.5 h-3.5 stroke-[2.5]" /> Setujui</Button>
								</div>
							{:else if item.status === 'rejected'}
								<Button size="sm" variant="primary" onclick={() => handleApprove(item)}><Check class="w-3.5 h-3.5 stroke-[2.5]" /> Pulihkan &amp; Setujui</Button>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-12 text-center bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D]">
				<CheckCircle2 class="w-12 h-12 text-[#0F3E2E] mx-auto mb-2 stroke-[2.5]" />
				<h3 class="text-base sm:text-lg font-black text-[#0D0D0D]">{activeTab === 'pending' ? 'Tidak Ada Pengajuan Pending' : 'Daftar Kosong'}</h3>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1">{activeTab === 'pending' ? 'Semua submisi tanaman dari siswa telah selesai diperiksa.' : 'Tidak ada data pada kategori status ini.'}</p>
			</div>
		{/if}
	{/if}
</div>

{#if rejectingPlant}
	<div class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
		<div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-[6px_6px_0px_#0D0D0D] border-2 border-[#0D0D0D] flex flex-col gap-4">
			<div class="flex items-center justify-between pb-3 border-b-2 border-[#0D0D0D]">
				<h3 class="text-base font-black text-[#0D0D0D]">Tolak Pengajuan: {rejectingPlant.name_local}</h3>
				<button type="button" onclick={() => (rejectingPlant = null)} class="p-1 text-stone-500 hover:text-[#0D0D0D] cursor-pointer"><X class="w-5 h-5 stroke-[2.5]" /></button>
			</div>
			<p class="text-xs text-stone-700 font-semibold">Berikan catatan alasan mengapa pengajuan ini belum dapat disetujui (misal: foto kurang jelas, nama ilmiah salah eja, atau deskripsi kurang lengkap):</p>
			<textarea bind:value={rejectionReason} rows="3" placeholder="Contoh: Foto rimpang belum disertakan dan ejaan nama ilmiah salah (seharusnya Zingiber officinale)..." class="w-full px-3.5 py-2.5 text-xs bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D] placeholder:text-stone-400 placeholder:font-normal"></textarea>
			<div class="flex items-center justify-end gap-2.5 pt-3 border-t-2 border-[#0D0D0D]">
				<Button variant="outline" size="sm" onclick={() => (rejectingPlant = null)}>Batal</Button>
				<Button variant="danger" size="sm" onclick={submitReject}>Konfirmasi Tolak</Button>
			</div>
		</div>
	</div>
{/if}
