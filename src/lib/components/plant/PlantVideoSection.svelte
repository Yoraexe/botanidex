<!--
  Flora SMK — Student Plant Video Section (Svelte 5 Runes)
  Tujuan: Memutar video penjelasan dan identifikasi tanaman yang dibuat oleh siswa SMK
  Caller: Plant detail page
  BRD Ref: F2 Amendment (Video Penjelasan Siswa)
-->
<script lang="ts">
	import type { PlantVideo } from '#lib/types/plant.types';
	import { formatDuration, formatDateId } from '#lib/utils/format';
	import { Video, UserCheck, PlayCircle, Clock } from '@lucide/svelte';

	interface Props {
		videos: PlantVideo[];
		plantName: string;
	}

	let { videos, plantName }: Props = $props();

	let activeVideoIndex = $state(0);

	const activeVideo = $derived(videos[activeVideoIndex]);
</script>

{#if videos && videos.length > 0}
	<div class="bg-white rounded-2xl border border-stone-200/90 p-4 sm:p-6 shadow-xs">
		<!-- Section Header -->
		<div class="flex items-center justify-between pb-3 mb-4 border-b border-stone-100">
			<div class="flex items-center gap-2">
				<div class="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center">
					<Video class="w-4 h-4" />
				</div>
				<div>
					<h3 class="text-sm sm:text-base font-bold text-stone-900">
						Video Edukasi Siswa SMK
					</h3>
					<p class="text-xs text-stone-500">Materi identifikasi & cara budidaya tanaman langsung oleh siswa</p>
				</div>
			</div>
			<span class="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
				Terverifikasi Guru
			</span>
		</div>

		{#if activeVideo}
			<!-- Main Video Player -->
			<div class="space-y-3">
				<div class="relative aspect-video w-full rounded-xl overflow-hidden bg-black shadow-md">
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

				<!-- Video Meta -->
				<div class="p-3 bg-stone-50 rounded-xl border border-stone-200/70">
					<h4 class="text-sm font-bold text-stone-900 leading-snug">
						{activeVideo.title}
					</h4>

					<div class="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-600">
						{#if activeVideo.uploaded_by_name}
							<div class="flex items-center gap-1.5 font-medium text-emerald-800">
								<UserCheck class="w-3.5 h-3.5 text-emerald-600" />
								<span>Dibuat oleh: {activeVideo.uploaded_by_name}</span>
							</div>
						{/if}

						{#if activeVideo.duration_seconds}
							<div class="flex items-center gap-1 text-stone-500">
								<Clock class="w-3.5 h-3.5" />
								<span>Durasi: {formatDuration(activeVideo.duration_seconds)}</span>
							</div>
						{/if}

						{#if activeVideo.created_at}
							<div class="text-stone-400">
								Diunggah: {formatDateId(activeVideo.created_at)}
							</div>
						{/if}
					</div>
				</div>
			</div>

			<!-- Multiple Video Tabs if > 1 -->
			{#if videos.length > 1}
				<div class="mt-4 pt-3 border-t border-stone-100">
					<p class="text-xs font-bold text-stone-700 mb-2">Video Lainnya untuk {plantName}:</p>
					<div class="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{#each videos as vid, idx}
							<button
								type="button"
								onclick={() => (activeVideoIndex = idx)}
								class="flex items-center gap-2.5 p-2 rounded-lg text-left transition-colors cursor-pointer border {activeVideoIndex === idx
									? 'bg-emerald-50 border-emerald-300 text-emerald-900 font-semibold'
									: 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'}"
							>
								<PlayCircle class="w-4 h-4 shrink-0 text-amber-500" />
								<span class="text-xs truncate flex-1">{vid.title}</span>
							</button>
						{/each}
					</div>
				</div>
			{/if}
		{/if}
	</div>
{/if}
