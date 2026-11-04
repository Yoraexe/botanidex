<!--
  Botanidex — Student Contribution Portal & History (Svelte 5 Runes)
  Tujuan: Menampilkan riwayat submisi tanaman siswa, status verifikasi (pending, approved, rejected), catatan perbaikan dari guru, dan tombol revisi draf
  Caller: Route '/kontribusi/saya'
  Dependensi: PlantService, authUser, format.ts, Button.svelte
  Main Functions: loadMyContributions
  Side Effects: Mengambil data submisi siswa dari PlantService
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { PlantService } from '#lib/services/plant.service';
	import type { Plant, ContributionStatus } from '#lib/types/plant.types';
	import { formatDateId, getCategoryBadgeLabel } from '#lib/utils/format';
	import Button from '#lib/components/ui/Button.svelte';
	import { User, Clock, CheckCircle2, AlertCircle, PlusCircle, Edit3, Eye, ArrowRight, ShieldAlert, Sparkles } from '@lucide/svelte';

	let myPlants = $state<Plant[]>([]);
	let isLoading = $state(true);
	let activeTab = $state<ContributionStatus | 'semua'>('semua');

	onMount(() => loadMyContributions());

	async function loadMyContributions() {
		if (!$authUser) {
			isLoading = false;
			return;
		}
		isLoading = true;
		try {
			const all = await PlantService.getAllPlants();
			// SEC-04 Hardening: Filter berbasis UUID contributor_id unik untuk mencegah IDOR / spoofing nama
			myPlants = all.filter((p) => p.contributor_id && p.contributor_id === $authUser?.id);
		} catch (err) {
			console.warn('Gagal memuat kontribusi saya:', err);
		} finally {
			isLoading = false;
		}
	}

	const filteredList = $derived(
		activeTab === 'semua' ? myPlants : myPlants.filter((p) => p.status === activeTab)
	);

	const counts = $derived({
		semua: myPlants.length,
		pending: myPlants.filter((p) => p.status === 'pending').length,
		approved: myPlants.filter((p) => p.status === 'approved').length,
		rejected: myPlants.filter((p) => p.status === 'rejected').length
	});

	const tabs = $derived<{ id: ContributionStatus | 'semua'; label: string; count: number; color: string }[]>([
		{ id: 'semua', label: 'Semua', count: counts.semua, color: 'bg-stone-100' },
		{ id: 'pending', label: 'Menunggu Guru', count: counts.pending, color: 'bg-[#FBBF24]' },
		{ id: 'approved', label: 'Disetujui', count: counts.approved, color: 'bg-[#D4F469]' },
		{ id: 'rejected', label: 'Perlu Revisi', count: counts.rejected, color: 'bg-[#E07A5F] text-white' }
	]);
</script>

<svelte:head><title>Kontribusi Saya — Botanidex</title></svelte:head>

<div class="max-w-4xl mx-auto flex flex-col gap-6">
	{#if !$authUser}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#FBBF24] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D]">
				<AlertCircle class="w-7 h-7 stroke-[2.5]" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Login Diperlukan</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">Masuk sebagai Siswa Kontributor untuk memantau status persetujuan tanaman dan memperbaiki draf catatan guru.</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-2">
				<a href="/login?redirectTo=/kontribusi/saya" class="px-5 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-xs font-black text-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] hover:shadow-[4px_4px_0px_#0D0D0D] flex items-center gap-2">
					<User class="w-4 h-4 stroke-[2.5]" />
					<span>Masuk Akun</span>
				</a>
				<a href="/katalog" class="px-4 py-2 rounded-xl border-2 border-[#0D0D0D] bg-white text-xs font-black text-stone-700 shadow-[2px_2px_0px_#0D0D0D] hover:bg-[#F3F6ED]">Lihat Katalog</a>
			</div>
		</div>
	{:else}
		<div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D]">
			<div class="flex items-center gap-3">
				<div class="w-12 h-12 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D] font-black shadow-[2px_2px_0px_#0D0D0D]">
					<Sparkles class="w-6 h-6 stroke-[2.5]" />
				</div>
				<div>
					<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Kontribusi Botani Saya</h1>
					<p class="text-xs text-stone-600 font-semibold mt-0.5">Hai <strong>{$authUser.display_name}</strong>, pantau submisi tanaman dan tindak lanjuti catatan guru di sini.</p>
				</div>
			</div>
			<a href="/kontribusi/tambah" class="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] text-xs font-black shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#c5e855] transition-all shrink-0">
				<PlusCircle class="w-4 h-4 stroke-[2.5]" />
				<span>+ Tambah Tanaman Baru</span>
			</a>
		</div>

		<div class="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
			{#each tabs as tab (tab.id)}
				<button type="button" onclick={() => (activeTab = tab.id)} class="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black transition-all border-2 border-[#0D0D0D] cursor-pointer shrink-0 {activeTab === tab.id ? 'bg-[#0D0D0D] text-[#D4F469] shadow-[2.5px_2.5px_0px_#0D0D0D] -translate-y-0.5' : 'bg-white text-stone-700 hover:bg-stone-100'}">
					<span>{tab.label}</span>
					<span class="px-1.5 py-0.2 rounded-md text-[10px] border border-[#0D0D0D] {activeTab === tab.id ? 'bg-[#D4F469] text-[#0D0D0D]' : tab.color}">{tab.count}</span>
				</button>
			{/each}
		</div>

		{#if isLoading}
			<div class="flex flex-col gap-3">
				{#each [1, 2] as _}<div class="p-5 bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] animate-pulse h-28"></div>{/each}
			</div>
		{:else if filteredList.length > 0}
			<div class="flex flex-col gap-4">
				{#each filteredList as item (item.id)}
					<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-4 sm:p-5 shadow-[4px_4px_0px_#0D0D0D] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
						<div class="flex items-start gap-4">
							<img src={item.photos[0]?.storage_path || '/icons/icon-192.svg'} alt={item.name_local} class="w-18 h-18 sm:w-22 sm:h-22 rounded-xl object-cover border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] shrink-0" />
							<div class="flex-1 min-w-0">
								<div class="flex flex-wrap items-center gap-2">
									<span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-[#0D0D0D] bg-[#F3F6ED] text-[#0D0D0D]">{getCategoryBadgeLabel(item.category)}</span>
									{#if item.status === 'pending'}
										<span class="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-[#FBBF24] text-[#0D0D0D] border border-[#0D0D0D]">⏳ Sedang Diperiksa Guru</span>
									{:else if item.status === 'approved'}
										<span class="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D]">✅ Resmi Tayang</span>
									{:else if item.status === 'rejected'}
										<span class="text-[10px] font-black px-2.5 py-0.5 rounded-md bg-[#E07A5F] text-white border border-[#0D0D0D]">⚠️ Perlu Revisi Siswa</span>
									{/if}
								</div>
								<h3 class="text-base sm:text-lg font-black text-[#0D0D0D] mt-1">{item.name_local}</h3>
								<p class="font-latin italic text-xs sm:text-sm text-stone-700 font-bold">{item.name_latin}</p>
								<div class="flex items-center gap-2 mt-2 text-[11px] text-stone-500 font-medium">
									<Clock class="w-3.5 h-3.5" /> <span>Diajukan: {formatDateId(item.created_at)}</span>
								</div>

								{#if item.status === 'rejected' && item.rejection_reason}
									<div class="mt-2.5 bg-red-50 border-2 border-red-500 rounded-xl p-3 flex flex-col gap-1">
										<p class="text-xs font-black text-red-900 flex items-center gap-1.5">
											<ShieldAlert class="w-4 h-4 text-red-600" />
											<span>Catatan Perbaikan dari Guru:</span>
										</p>
										<p class="text-xs text-red-800 font-medium">{item.rejection_reason}</p>
									</div>
								{/if}
							</div>
						</div>

						<div class="flex sm:flex-col items-center sm:items-end gap-2 shrink-0 border-t-2 border-[#0D0D0D]/20 sm:border-t-0 pt-3 sm:pt-0">
							{#if item.status === 'rejected'}
								<a href="/kontribusi/{item.id}/edit" class="px-3.5 py-2 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] hover:bg-[#c5e855] text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 transition-all">
									<Edit3 class="w-3.5 h-3.5 stroke-[2.5]" />
									<span>Perbaiki &amp; Ajukan Ulang</span>
								</a>
							{:else if item.status === 'approved'}
								<a href="/katalog/{item.slug}" class="px-3.5 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-[#0D0D0D] hover:bg-[#D4F469] text-xs font-black flex items-center gap-1.5 shadow-[2px_2px_0px_#0D0D0D]">
									<Eye class="w-3.5 h-3.5 stroke-[2.5]" />
									<span>Lihat di Katalog</span>
								</a>
							{:else}
								<a href="/katalog/{item.slug}" class="px-3 py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white text-stone-700 text-xs font-bold flex items-center gap-1 shadow-[1.5px_1.5px_0px_#0D0D0D]">
									<Eye class="w-3.5 h-3.5" />
									<span>Pratinjau Draf</span>
								</a>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{:else}
			<div class="p-12 text-center bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D]">
				<CheckCircle2 class="w-12 h-12 text-[#0F3E2E] mx-auto mb-2 stroke-[2.5]" />
				<h3 class="text-base sm:text-lg font-black text-[#0D0D0D]">Belum Ada Kontribusi Tanaman</h3>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1">Anda belum memiliki submisi tanaman pada filter status ini.</p>
				<a href="/kontribusi/tambah" class="mt-4 inline-flex items-center gap-1.5 text-xs font-black px-4 py-2.5 bg-[#D4F469] text-[#0D0D0D] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
					<PlusCircle class="w-4 h-4" />
					<span>Mulai Berkontribusi Sekarang</span>
				</a>
			</div>
		{/if}
	{/if}
</div>
