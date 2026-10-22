<!--
  Flora SMK — Student Plant Video Section (Svelte 5 Runes)
  Tujuan: Memutar video penjelasan dan identifikasi tanaman karya siswa SMK dengan gaya Retro Player Neo-Brutalist
  Caller: Plant detail page
  BRD Ref: F2 Amendment (Video Penjelasan Siswa)
-->
<script lang="ts">
	import type { PlantVideo } from '#lib/types/plant.types';
	import { formatDuration, formatDateId } from '#lib/utils/format';
	import { Video, UserCheck, PlayCircle, Clock, CheckCircle2, Film } from '@lucide/svelte';

	interface Props {
		videos: PlantVideo[];
		plantName: string;
	}

	let { videos, plantName }: Props = $props();

	let activeVideoIndex = $state(0);
	const activeVideo = $derived(videos[activeVideoIndex]);
</script>

{#if videos && videos.length > 0}
	<div class="bg-[#FFFEF9] rounded-2xl border-2 border-[#18181B] shadow-[4px_4px_0px_#18181B] p-4 sm:p-6">
		<!-- Section Header -->
		<div class="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b-2 border-[#18181B] gap-2">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-[#F6BD60] border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] flex items-center justify-center text-stone-900 shrink-0">
					<Film class="w-5 h-5 stroke-[2.2]" />
				</div>
				<div>
					<h3 class="text-base sm:text-lg font-black text-stone-900 tracking-tight flex items-center gap-2">
						Video Edukasi Siswa SMK
					</h3>
					<p class="text-xs text-stone-600 font-medium">Materi budidaya & identifikasi lapangan langsung dari siswa</p>
				</div>
			</div>
			<span class="self-start sm:self-auto text-[10px] font-black px-2.5 py-1 rounded-lg bg-[#6BB092] text-stone-900 border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B] uppercase tracking-wider flex items-center gap-1.5">
				<CheckCircle2 class="w-3.5 h-3.5 stroke-[2.5]" />
				Terverifikasi Guru
			</span>
		</div>

		{#if activeVideo}
			<!-- Main Video Player Screen -->
			<div class="space-y-4">
				<div class="relative aspect-video w-full rounded-xl overflow-hidden bg-black border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B]">
					<video
						src={activeVideo.storage_path}
						poster={activeVideo.thumbnail_path}
						controls
						preload="metadata"
						class="w-full h-full object-contain"
					>
						<track kind="captions" />
						Browser Anda tidak mendukung pemutar video HTML5.
					</video>
				</div>

				<!-- Video Meta Card -->
				<div class="p-4 bg-[#F7F2E7] rounded-xl border-2 border-[#18181B] shadow-[2px_2px_0px_#18181B]">
					<h4 class="text-sm sm:text-base font-black text-stone-900 leading-snug">
						{activeVideo.title}
					</h4>

					<div class="flex flex-wrap items-center gap-3 sm:gap-4 mt-2.5 text-xs text-stone-800">
						{#if activeVideo.uploaded_by_name}
							<div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#FFFEF9] border border-[#18181B] font-bold shadow-[1px_1px_0px_#18181B]">
								<UserCheck class="w-3.5 h-3.5 text-stone-900 stroke-[2.2]" />
								<span>Karya: <strong class="text-stone-900">{activeVideo.uploaded_by_name}</strong></span>
							</div>
						{/if}

						{#if activeVideo.duration_seconds}
							<div class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#FFFEF9] border border-[#18181B] font-semibold text-stone-700">
								<Clock class="w-3.5 h-3.5 stroke-[2]" />
								<span>{formatDuration(activeVideo.duration_seconds)}</span>
							</div>
						{/if}

						{#if activeVideo.created_at}
							<div class="text-stone-500 font-medium">
								Diunggah: {formatDateId(activeVideo.created_at)}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Multiple Video Tabs if > 1 -->
			{#if videos.length > 1}
				<div class="mt-5 pt-4 border-t-2 border-[#18181B]">
					<p class="text-xs font-black text-stone-900 uppercase tracking-wider mb-2.5">
						Video Lainnya untuk {plantName}:
					</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
						{#each videos as vid, idx}
							<button
								type="button"
								onclick={() => (activeVideoIndex = idx)}
								class="flex items-center gap-3 p-2.5 rounded-xl text-left transition-all cursor-pointer border-2 border-[#18181B] {activeVideoIndex === idx
									? 'bg-[#F6BD60] text-stone-900 shadow-[2px_2px_0px_#18181B] font-black'
									: 'bg-white text-stone-800 hover:bg-[#F7F2E7] font-bold shadow-[1px_1px_0px_#18181B]'}"
							>
								<div class="w-7 h-7 rounded-lg border border-[#18181B] flex items-center justify-center shrink-0 {activeVideoIndex === idx ? 'bg-[#18181B] text-[#F6BD60]' : 'bg-[#6BB092] text-stone-900'}">
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
		{/if}
	</div>
{/if}
