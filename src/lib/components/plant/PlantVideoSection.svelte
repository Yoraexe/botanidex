<!--
  Botanidex — Student Plant Video Section (Svelte 5 Runes)
  Tujuan: Memutar video penjelasan dan identifikasi tanaman karya siswa SMK yang telah disetujui guru (BRD AC2.4)
  Caller: src/routes/katalog/[slug]/+page.svelte
  Dependensi: PlantVideo type, format utils, auth.store.ts
  Main Functions: PlantVideoSection component
  Side Effects: HTML5 video streaming playback
-->
<script lang="ts">
	import type { PlantVideo } from '#lib/types/plant.types';
	import { authUser } from '#lib/stores/auth.store';
	import { formatDuration, formatDateId } from '#lib/utils/format';
	import { UserCheck, PlayCircle, Clock, CheckCircle2, Film } from '@lucide/svelte';

	let { videos, plantName }: { videos: PlantVideo[]; plantName: string } = $props();

	const visibleVideos = $derived(
		(videos || []).filter((v) => v.status === 'approved' || $authUser?.role === 'admin')
	);

	let activeVideoIndex = $state(0);
	const activeVideo = $derived(visibleVideos[activeVideoIndex] || visibleVideos[0]);
</script>

{#if visibleVideos.length > 0 && activeVideo}
	<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[4px_4px_0px_#0D0D0D] p-4 sm:p-6">
		<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-[#0D0D0D] gap-2">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0">
					<Film class="w-5 h-5 stroke-[2.2]" />
				</div>
				<div>
					<h3 class="text-base sm:text-lg font-black text-[#0D0D0D] tracking-tight flex items-center gap-2">Video Edukasi Siswa SMK</h3>
					<p class="text-xs text-stone-600 font-medium">Materi budidaya &amp; identifikasi lapangan langsung dari siswa</p>
				</div>
			</div>
			{#if activeVideo.status === 'approved'}
				<span class="self-start sm:self-auto text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#0F3E2E] text-white border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] uppercase tracking-wider flex items-center gap-1.5">
					<CheckCircle2 class="w-3.5 h-3.5 stroke-[2.5]" /> Terverifikasi Guru
				</span>
			{:else}
				<span class="self-start sm:self-auto text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#FBBF24] text-[#0D0D0D] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] uppercase tracking-wider flex items-center gap-1.5">
					<Clock class="w-3.5 h-3.5 stroke-[2.5]" /> Pratinjau Moderasi ({activeVideo.status})
				</span>
			{/if}
		</div>

		<div class="space-y-4">
			<div class="relative aspect-video w-full rounded-xl overflow-hidden bg-black border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D]">
				<video src={activeVideo.storage_path} poster={activeVideo.thumbnail_path} controls preload="metadata" class="w-full h-full object-contain">
					<track kind="captions" />
					Browser Anda tidak mendukung pemutar video HTML5.
				</video>
			</div>

			<div class="p-4 bg-[#F3F6ED] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
				<h4 class="text-sm sm:text-base font-black text-[#0D0D0D] leading-snug">{activeVideo.title}</h4>
				<div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs text-stone-800">
					{#if activeVideo.uploaded_by_name}
						<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white border border-[#0D0D0D] font-bold shadow-[1px_1px_0px_#0D0D0D]">
							<UserCheck class="w-3.5 h-3.5 text-[#0D0D0D] stroke-[2.2]" />
							<span>Karya: <strong class="text-[#0D0D0D]">{activeVideo.uploaded_by_name}</strong></span>
						</div>
					{/if}
					{#if activeVideo.duration_seconds}
						<div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-[#0D0D0D] font-semibold text-stone-700">
							<Clock class="w-3.5 h-3.5 stroke-[2]" />
							<span>{formatDuration(activeVideo.duration_seconds)}</span>
						</div>
					{/if}
					{#if activeVideo.created_at}
						<div class="text-stone-500 font-medium">Diunggah: {formatDateId(activeVideo.created_at)}</div>
					{/if}
				</div>
			</div>
		</div>

		{#if visibleVideos.length > 1}
			<div class="mt-5 pt-4 border-t-2 border-[#0D0D0D]">
				<p class="text-xs font-black text-[#0D0D0D] uppercase tracking-wider mb-2.5">Video Lainnya untuk {plantName}:</p>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
					{#each visibleVideos as vid, idx}
						<button
							type="button"
							onclick={() => (activeVideoIndex = idx)}
							class="flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border-2 border-[#0D0D0D] {activeVideoIndex === idx ? 'bg-[#D4F469] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] font-black' : 'bg-white text-stone-800 hover:bg-[#F3F6ED] font-bold shadow-[1px_1px_0px_#0D0D0D]'}"
						>
							<div class="w-7 h-7 rounded-lg border border-[#0D0D0D] flex items-center justify-center shrink-0 {activeVideoIndex === idx ? 'bg-[#0D0D0D] text-[#D4F469]' : 'bg-[#F3F6ED] text-[#0D0D0D]'}">
								<PlayCircle class="w-4 h-4 stroke-[2.5]" />
							</div>
							<div class="min-w-0 flex-1">
								<p class="text-xs truncate">{vid.title}</p>
								<span class="text-[10px] opacity-75 font-medium">{formatDuration(vid.duration_seconds)}</span>
							</div>
						</button>
					{/each}
				</div>
			</div>
		{/if}
	</div>
{/if}
