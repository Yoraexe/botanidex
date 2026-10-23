<!--
  Botanidex — Student Plant Contribution Form (Svelte 5 Runes)
  Tujuan: Formulir pengajuan data tanaman baru gaya Neo-Brutalist lengkap dengan foto, taksonomi 7 tingkat, kategori dinamis CMS, dan validasi durasi video 5 menit
  Caller: Route '/kontribusi/tambah'
  Dependensi: PlantService, StorageService, ConfigService, plantFormSchema, authUser, toast
  Main Functions: handlePhotoSelect, removePhoto, handleVideoSelect, handleSubmit
  Side Effects: Upload media via StorageService, simpan tanaman via PlantService, revoke Object URL
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { onDestroy, onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import { StorageService } from '#lib/services/storage.service';
	import { ConfigService } from '#lib/services/config.service';
	import { plantFormSchema } from '#lib/schemas/plant.schema';
	import { formatDuration } from '#lib/utils/format';
	import type { PlantCategory } from '#lib/types/plant.types';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import { PlusCircle, Image as ImageIcon, Video, UploadCloud, AlertCircle, Dna, CheckCircle2, ShieldCheck, X } from '@lucide/svelte';

	const initialCategories = ConfigService.getCategories().filter((c) => c.id !== 'semua');
	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});
	let availableCategories = $state(initialCategories);

	let form = $state({
		name_local: '', name_latin: '', name_english: '', aliases_raw: '',
		category: (initialCategories[0]?.id || 'obat') as PlantCategory,
		description: '', location_label: '', location_x: 50, location_y: 50,
		taxonomy_kingdom: 'Plantae', taxonomy_divisio: '', taxonomy_classis: '',
		taxonomy_ordo: '', taxonomy_familia: '', taxonomy_genus: '', taxonomy_species: '',
		video_title: ''
	});

	const taxFields = [
		{ key: 'taxonomy_divisio', label: 'Divisio', ph: 'Tracheophyta' },
		{ key: 'taxonomy_classis', label: 'Classis', ph: 'Liliopsida' },
		{ key: 'taxonomy_ordo', label: 'Ordo', ph: 'Zingiberales' },
		{ key: 'taxonomy_familia', label: 'Familia', ph: 'Zingiberaceae' },
		{ key: 'taxonomy_genus', label: 'Genus', ph: 'Zingiber' }
	] as const;

	let photoFiles = $state<File[]>([]);
	let photoPreviews = $state<string[]>([]);
	let videoFile = $state<File | null>(null);
	let videoDurationSeconds = $state<number | undefined>(undefined);

	onMount(() => {
		const handleConfigChange = (e: any) => {
			if (e.detail?.categories) availableCategories = e.detail.categories.filter((c: any) => c.id !== 'semua');
		};
		window.addEventListener('flora:config-updated', handleConfigChange);
		return () => window.removeEventListener('flora:config-updated', handleConfigChange);
	});

	onDestroy(() => photoPreviews.forEach((url) => URL.revokeObjectURL(url)));

	function handlePhotoSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files?.length) return;
		const newFiles = Array.from(target.files).slice(0, 5 - photoFiles.length);
		photoFiles = [...photoFiles, ...newFiles];
		photoPreviews = [...photoPreviews, ...newFiles.map((f) => URL.createObjectURL(f))];
		target.value = '';
	}

	function removePhoto(index: number) {
		if (photoPreviews[index]) URL.revokeObjectURL(photoPreviews[index]);
		photoFiles = photoFiles.filter((_, i) => i !== index);
		photoPreviews = photoPreviews.filter((_, i) => i !== index);
	}

	async function handleVideoSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;
		try {
			const { durationSeconds } = await StorageService.validateVideoFile(file);
			videoFile = file;
			videoDurationSeconds = durationSeconds > 0 ? durationSeconds : undefined;
			if (!form.video_title) form.video_title = `Video Penjelasan: ${form.name_local || 'Tanaman'}`;
		} catch (err: any) {
			toast.error('Video Tidak Memenuhi Syarat', err?.message || 'Maksimal ukuran 50MB dan durasi maksimal 5 menit (MP4/WebM).');
			videoFile = null;
			videoDurationSeconds = undefined;
			target.value = '';
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};
		const validationResult = plantFormSchema.safeParse({ ...form, video_duration_seconds: videoDurationSeconds });
		if (!validationResult.success) {
			for (const issue of validationResult.error.issues) errors[issue.path[0] as string] = issue.message;
			return toast.error('Validasi Gagal', 'Harap periksa kembali isian formulir.');
		}
		if (photoFiles.length === 0) {
			errors.photos = 'Minimal sertakan 1 foto tanaman.';
			return toast.error('Foto Wajib', 'Minimal sertakan 1 foto tanaman untuk dokumentasi.');
		}

		isSubmitting = true;
		try {
			const uploadedPhotos = await Promise.all(photoFiles.map((f) => StorageService.uploadPlantPhoto(f)));
			const uploadedVideoUrl = videoFile ? await StorageService.uploadPlantVideo(videoFile) : undefined;
			const isAdmin = $authUser?.role === 'admin';
			const created = await PlantService.submitPlant(validationResult.data, {
				uploadedPhotos, uploadedVideoUrl, videoDurationSeconds,
				contributorName: $authUser?.display_name || 'Siswa SMK PPN Gorontalo',
				contributorId: $authUser?.id, isAdmin
			});
			toast.success(
				isAdmin ? 'Tanaman Berhasil Diterbitkan!' : 'Pengajuan Berhasil Disubmit!',
				isAdmin ? 'Data langsung tayang di katalog publik.' : 'Data tanaman telah masuk ke antrean moderasi guru untuk diperiksa.'
			);
			goto(isAdmin ? `/katalog/${created.slug}` : '/katalog');
		} catch (err: any) {
			toast.error('Gagal Menyimpan Data', err?.message || 'Terjadi kesalahan sistem.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head><title>Tambah Data Tanaman — Botanidex</title></svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
	{#if !$authUser || ($authUser.role !== 'contributor' && $authUser.role !== 'admin')}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#FBBF24] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D]"><AlertCircle class="w-7 h-7 stroke-[2.5]" /></div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Login Diperlukan untuk Berkontribusi</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">Silakan masuk sebagai Siswa Kontributor atau Guru Pembimbing untuk menambahkan dokumentasi tanaman baru ke katalog SMK PPN Gorontalo.</p>
			</div>
			<div class="flex flex-wrap items-center justify-center gap-3 mt-2">
				<Button variant="primary" onclick={() => authUser.loginAsDemo('contributor')}><PlusCircle class="w-4 h-4 stroke-[2.5]" /> Masuk sebagai Siswa</Button>
				<Button variant="secondary" onclick={() => authUser.loginAsDemo('admin')}><ShieldCheck class="w-4 h-4 stroke-[2.5]" /> Masuk sebagai Guru / Admin</Button>
			</div>
		</div>
	{:else}
		<div class="pb-4 border-b-2 border-[#0D0D0D]">
			<div class="flex items-center gap-3">
				<div class="w-10 h-10 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0"><PlusCircle class="w-6 h-6 stroke-[2.5]" /></div>
				<div>
					<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-tight">Tambah Tanaman Baru ke Katalog</h1>
					<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">Dokumentasikan koleksi tanaman di lingkungan SMK PPN Gorontalo beserta taksonomi dan video penjelasan.</p>
				</div>
			</div>
			{#if $authUser.role !== 'admin'}
				<div class="mt-4 p-3.5 bg-[#FBBF24] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-xs text-[#0D0D0D] font-black flex items-center gap-2.5">
					<AlertCircle class="w-4 h-4 text-[#0D0D0D] stroke-[2.5] shrink-0" />
					<span>Pengajuan oleh siswa akan dimoderasi oleh guru pembimbing sebelum muncul di katalog publik.</span>
				</div>
			{/if}
		</div>

		<form onsubmit={handleSubmit} class="flex flex-col gap-6">
			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
				<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">1. Informasi Pokok Tanaman</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Nama Lokal (Indonesia) *" placeholder="Contoh: Jahe Merah, Jagung Hibrida" bind:value={form.name_local} error={errors.name_local} required />
					<div class="flex flex-col gap-1.5 w-full">
						<label for="latin-input" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">Nama Latin Ilmiah *</label>
						<input id="latin-input" bind:value={form.name_latin} placeholder="Contoh: Zingiber officinale" class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-latin italic font-bold text-[#0D0D0D]" required />
						{#if errors.name_latin}<p class="text-xs font-black text-[#E07A5F]">{errors.name_latin}</p>{/if}
					</div>
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input label="Nama Bahasa Inggris (Opsional)" placeholder="Contoh: Red Ginger" bind:value={form.name_english} error={errors.name_english} />
					<div class="flex flex-col gap-1.5 w-full">
						<label for="category-select" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">Kategori Komoditas *</label>
						<select id="category-select" bind:value={form.category} class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D]">
							{#each availableCategories as cat (cat.id)}<option value={cat.id}>{cat.label}</option>{/each}
							{#if !availableCategories.some((c) => c.id === 'lainnya')}<option value="lainnya">Lainnya</option>{/if}
						</select>
						{#if errors.category}<p class="text-xs font-black text-[#E07A5F]">{errors.category}</p>{/if}
					</div>
				</div>

				<Input label="Nama Lain / Sinonim Daerah (Pisahkan dengan koma)" placeholder="Contoh: Haldi Merah, Lia Merah, Beuing" bind:value={form.aliases_raw} />

				<div class="flex flex-col gap-1.5 w-full">
					<label for="desc-textarea" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">Deskripsi Morfologi, Habitat, &amp; Manfaat Praktikum *</label>
					<textarea id="desc-textarea" bind:value={form.description} rows="4" placeholder="Jelaskan ciri-ciri daun, batang, rimpang/buah, kebutuhan cahaya, serta materi praktikum yang terkait..." class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-medium text-[#0D0D0D]" required></textarea>
					{#if errors.description}<p class="text-xs font-black text-[#E07A5F]">{errors.description}</p>{/if}
				</div>
			</div>

			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
				<div class="flex items-center gap-2.5 pb-2 border-b-2 border-[#0D0D0D]"><Dna class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" /><h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider">2. Klasifikasi Taksonomi Ilmiah (Opsional)</h2></div>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
					<Input label="Kingdom" bind:value={form.taxonomy_kingdom} />
					{#each taxFields as tf (tf.key)}<Input label={tf.label} placeholder={tf.ph} bind:value={form[tf.key]} />{/each}
					<div class="col-span-2 sm:col-span-3"><Input label="Species (Spesies)" placeholder="Contoh: Zingiber officinale" bind:value={form.taxonomy_species} /></div>
				</div>
			</div>

			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
				<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">3. Dokumentasi Foto &amp; Video Edukasi</h2>
				<div>
					<span class="block text-xs font-black text-[#0D0D0D] tracking-wider uppercase mb-2">Foto Tanaman * (Maksimal 5 foto, min 1 foto)</span>
					<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
						{#each photoPreviews as url, idx}
							<div class="relative aspect-square rounded-xl overflow-hidden border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
								<img src={url} alt="Preview {idx + 1}" class="w-full h-full object-cover" />
								<button type="button" onclick={() => removePhoto(idx)} class="absolute top-1.5 right-1.5 p-1 bg-[#E07A5F] text-white rounded-lg border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] cursor-pointer" title="Hapus foto"><X class="w-3.5 h-3.5 stroke-[2.5]" /></button>
							</div>
						{/each}
						{#if photoFiles.length < 5}
							<label class="aspect-square rounded-xl border-2 border-dashed border-[#0D0D0D] hover:bg-[#D4F469]/20 bg-[#F3F6ED] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-[#0D0D0D] text-xs font-black shadow-[2px_2px_0px_#0D0D0D]">
								<ImageIcon class="w-6 h-6 stroke-[2]" /> <span>+ Tambah Foto</span>
								<input type="file" accept="image/*" multiple onchange={handlePhotoSelect} class="hidden" />
							</label>
						{/if}
					</div>
					{#if errors.photos}<p class="text-xs font-black text-[#E07A5F] mt-1.5">{errors.photos}</p>{/if}
					<p class="text-[11px] text-stone-500 font-semibold mt-1.5">Foto otomatis dikompresi agar hemat kuota.</p>
				</div>

				<div class="pt-4 border-t-2 border-[#0D0D0D] flex flex-col gap-3">
					<div class="flex items-center gap-2"><Video class="w-4 h-4 text-[#0D0D0D] stroke-[2.5]" /><span class="text-xs font-black text-[#0D0D0D] uppercase tracking-wide">Video Penjelasan Siswa (Opsional)</span></div>
					<p class="text-xs text-stone-600 font-medium">Unggah video penjelasan identifikasi botani, morfologi, atau cara pemeliharaan tanaman (Maks. 50MB, durasi maks. 5 menit, format MP4 atau WebM).</p>
					{#if videoFile}
						<div class="p-3.5 bg-[#F3F6ED] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-between">
							<div class="flex items-center gap-2.5">
								<Video class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" />
								<div>
									<p class="text-xs font-black text-[#0D0D0D]">{videoFile.name}</p>
									<p class="text-[10px] text-stone-700 font-bold">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB {#if videoDurationSeconds}• Durasi: {formatDuration(videoDurationSeconds)}{/if}</p>
								</div>
							</div>
							<button type="button" onclick={() => { videoFile = null; videoDurationSeconds = undefined; }} class="text-xs text-[#0D0D0D] hover:text-red-700 font-black underline cursor-pointer">Hapus Video</button>
						</div>
						<Input label="Judul Video Edukasi" placeholder="Contoh: Praktikum Pemupukan dan Morfologi Tanaman Kakao" bind:value={form.video_title} />
					{:else}
						<label class="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#0D0D0D] hover:bg-[#D4F469]/20 rounded-xl cursor-pointer bg-[#F3F6ED] transition-colors text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
							<UploadCloud class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" /> <span>Pilih File Video (MP4 / WebM — Maks 5 Menit)</span>
							<input type="file" accept="video/mp4,video/webm" onchange={handleVideoSelect} class="hidden" />
						</label>
					{/if}
				</div>
			</div>

			<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
				<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">4. Lokasi Kebun Sekolah</h2>
				<Input label="Keterangan Lokasi Fisik" placeholder="Contoh: Kebun Percobaan TOGA Blok A-2, Dekat Kolam Ikan" bind:value={form.location_label} />
				<div class="grid grid-cols-2 gap-4">
					<div><label for="pos-x-range" class="text-xs font-black text-[#0D0D0D]">Posisi Peta X: {form.location_x}%</label><input id="pos-x-range" type="range" min="5" max="95" bind:value={form.location_x} class="w-full accent-stone-900 mt-1 cursor-pointer" /></div>
					<div><label for="pos-y-range" class="text-xs font-black text-[#0D0D0D]">Posisi Peta Y: {form.location_y}%</label><input id="pos-y-range" type="range" min="5" max="95" bind:value={form.location_y} class="w-full accent-stone-900 mt-1 cursor-pointer" /></div>
				</div>
			</div>

			<Button type="submit" variant="primary" size="lg" loading={isSubmitting} fullWidth>
				<CheckCircle2 class="w-5 h-5 stroke-[2.5]" /> <span>Simpan &amp; Ajukan Data Tanaman</span>
			</Button>
		</form>
	{/if}
</div>
