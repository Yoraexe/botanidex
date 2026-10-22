<!--
  Botanidex — Student Plant Contribution Form (Svelte 5 Runes)
  Tujuan: Formulir pengajuan data tanaman baru gaya Neo-Brutalist lengkap dengan foto dan video penjelasan siswa (Option A - Fresh Modern Agronomy)
  Caller: Route '/kontribusi/tambah'
  BRD Ref: F5 (Kontribusi Siswa & Moderasi)
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import { StorageService } from '#lib/services/storage.service';
	import { plantFormSchema } from '#lib/schemas/plant.schema';
	import type { PlantCategory } from '#lib/types/plant.types';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import {
		PlusCircle,
		Image as ImageIcon,
		Video,
		UploadCloud,
		AlertCircle,
		Dna,
		CheckCircle2,
		X
	} from '@lucide/svelte';

	let isSubmitting = $state(false);
	let errors = $state<Record<string, string>>({});

	// Form values
	let nameLocal = $state('');
	let nameLatin = $state('');
	let nameEnglish = $state('');
	let aliasesRaw = $state('');
	let category = $state<PlantCategory>('obat');
	let description = $state('');
	let locationLabel = $state('');
	let locationX = $state<number>(50);
	let locationY = $state<number>(50);

	// Taxonomy
	let taxonomyKingdom = $state('Plantae');
	let taxonomyDivisio = $state('');
	let taxonomyClassis = $state('');
	let taxonomyOrdo = $state('');
	let taxonomyFamilia = $state('');
	let taxonomyGenus = $state('');
	let taxonomySpecies = $state('');

	// Media uploads
	let photoFiles = $state<File[]>([]);
	let photoPreviews = $state<string[]>([]);
	let videoFile = $state<File | null>(null);
	let videoTitle = $state('');

	function handlePhotoSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const files = target.files;
		if (!files || files.length === 0) return;

		const remainingSlots = 5 - photoFiles.length;
		const newFiles = Array.from(files).slice(0, remainingSlots);

		photoFiles = [...photoFiles, ...newFiles];

		// Generate preview URLs
		for (const file of newFiles) {
			const url = URL.createObjectURL(file);
			photoPreviews = [...photoPreviews, url];
		}
	}

	function removePhoto(index: number) {
		photoFiles = photoFiles.filter((_, i) => i !== index);
		photoPreviews = photoPreviews.filter((_, i) => i !== index);
	}

	function handleVideoSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		// Validasi durasi / ukuran
		if (file.size > 50 * 1024 * 1024) {
			toast.error('Ukuran Video Terlalu Besar', 'Maksimal ukuran video adalah 50MB.');
			target.value = '';
			return;
		}

		videoFile = file;
		if (!videoTitle) {
			videoTitle = `Video Penjelasan: ${nameLocal || 'Tanaman'}`;
		}
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		errors = {};

		// Validasi dengan Zod
		const validationResult = plantFormSchema.safeParse({
			name_local: nameLocal,
			name_latin: nameLatin,
			name_english: nameEnglish || undefined,
			aliases_raw: aliasesRaw || undefined,
			category,
			description,
			taxonomy_kingdom: taxonomyKingdom,
			taxonomy_divisio: taxonomyDivisio || undefined,
			taxonomy_classis: taxonomyClassis || undefined,
			taxonomy_ordo: taxonomyOrdo || undefined,
			taxonomy_familia: taxonomyFamilia || undefined,
			taxonomy_genus: taxonomyGenus || undefined,
			taxonomy_species: taxonomySpecies || undefined,
			location_label: locationLabel || undefined,
			location_x: locationX,
			location_y: locationY,
			video_title: videoTitle || undefined
		});

		if (!validationResult.success) {
			for (const issue of validationResult.error.issues) {
				const field = issue.path[0] as string;
				errors[field] = issue.message;
			}
			toast.error('Validasi Gagal', 'Harap periksa kembali isian formulir.');
			return;
		}

		// Validasi minimal 1 foto
		if (photoFiles.length === 0) {
			errors['photos'] = 'Minimal sertakan 1 foto tanaman.';
			toast.error('Foto Wajib', 'Minimal sertakan 1 foto tanaman untuk dokumentasi.');
			return;
		}

		isSubmitting = true;

		try {
			// Upload photos
			const uploadedPhotoUrls: string[] = [];
			for (const photo of photoFiles) {
				const url = await StorageService.uploadPlantPhoto(photo);
				uploadedPhotoUrls.push(url);
			}

			// Upload video jika ada
			let uploadedVideoUrl: string | undefined = undefined;
			if (videoFile) {
				uploadedVideoUrl = await StorageService.uploadPlantVideo(videoFile);
			}

			const isAdmin = $authUser?.role === 'admin';
			const contributorName = $authUser?.display_name || 'Siswa SMK PPN Gorontalo';
			const contributorId = $authUser?.id;

			const createdPlant = await PlantService.submitPlant(validationResult.data, {
				uploadedPhotos: uploadedPhotoUrls,
				uploadedVideoUrl,
				contributorName,
				contributorId,
				isAdmin
			});

			if (isAdmin) {
				toast.success('Tanaman Berhasil Diterbitkan!', 'Data langsung tayang di katalog publik.');
				goto(`/katalog/${createdPlant.slug}`);
			} else {
				toast.success(
					'Pengajuan Berhasil Disubmit!',
					'Data tanaman telah masuk ke antrean moderasi guru untuk diperiksa.'
				);
				goto('/katalog');
			}
		} catch (err: any) {
			console.error('Gagal submit tanaman:', err);
			toast.error('Gagal Menyimpan Data', err?.message || 'Terjadi kesalahan sistem.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>Tambah Data Tanaman — Botanidex</title>
</svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
	<!-- Page Header -->
	<div class="pb-4 border-b-2 border-[#0D0D0D]">
		<div class="flex items-center gap-3">
			<div class="w-10 h-10 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0">
				<PlusCircle class="w-6 h-6 stroke-[2.5]" />
			</div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D] tracking-tight">
					Tambah Tanaman Baru ke Katalog
				</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-0.5">
					Dokumentasikan koleksi tanaman di lingkungan SMK PPN Gorontalo beserta taksonomi dan video penjelasan.
				</p>
			</div>
		</div>

		{#if $authUser?.role !== 'admin'}
			<div class="mt-4 p-3.5 bg-[#FBBF24] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] text-xs text-[#0D0D0D] font-black flex items-center gap-2.5">
				<AlertCircle class="w-4 h-4 text-[#0D0D0D] stroke-[2.5] shrink-0" />
				<span>Pengajuan oleh siswa akan dimoderasi oleh guru pembimbing sebelum muncul di katalog publik.</span>
			</div>
		{/if}
	</div>

	<!-- Main Form -->
	<form onsubmit={handleSubmit} class="flex flex-col gap-6">
		<!-- Section 1: Informasi Dasar -->
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
			<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">
				1. Informasi Pokok Tanaman
			</h2>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Nama Lokal (Indonesia) *"
					placeholder="Contoh: Jahe Merah, Jagung Hibrida"
					bind:value={nameLocal}
					error={errors.name_local}
					required
				/>

				<div class="flex flex-col gap-1.5 w-full">
					<label for="latin-input" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">
						Nama Latin Ilmiah *
					</label>
					<input
						id="latin-input"
						bind:value={nameLatin}
						placeholder="Contoh: Zingiber officinale"
						class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-latin italic font-bold text-[#0D0D0D]"
						required
					/>
					{#if errors.name_latin}
						<p class="text-xs font-black text-[#E07A5F]">{errors.name_latin}</p>
					{/if}
				</div>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<Input
					label="Nama Bahasa Inggris (Opsional)"
					placeholder="Contoh: Red Ginger"
					bind:value={nameEnglish}
					error={errors.name_english}
				/>

				<div class="flex flex-col gap-1.5 w-full">
					<label for="category-select" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">
						Kategori Komoditas *
					</label>
					<select
						id="category-select"
						bind:value={category}
						class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-bold text-[#0D0D0D]"
					>
						<option value="obat">Tanaman Obat / Herbal (TOGA)</option>
						<option value="pangan">Tanaman Pangan &amp; Palawija</option>
						<option value="hias">Tanaman Hias / Florikultura</option>
						<option value="industri">Tanaman Perkebunan / Industri</option>
						<option value="kayu">Tanaman Kayu &amp; Silvikultur</option>
						<option value="lainnya">Lainnya</option>
					</select>
				</div>
			</div>

			<Input
				label="Nama Lain / Sinonim Daerah (Pisahkan dengan koma)"
				placeholder="Contoh: Haldi Merah, Lia Merah, Beuing"
				bind:value={aliasesRaw}
			/>

			<div class="flex flex-col gap-1.5 w-full">
				<label for="desc-textarea" class="text-xs font-black text-[#0D0D0D] tracking-wider uppercase">
					Deskripsi Morfologi, Habitat, &amp; Manfaat Praktikum *
				</label>
				<textarea
					id="desc-textarea"
					bind:value={description}
					rows="4"
					placeholder="Jelaskan ciri-ciri daun, batang, rimpang/buah, kebutuhan cahaya, serta materi praktikum yang terkait..."
					class="w-full px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] outline-none font-medium text-[#0D0D0D]"
					required
				></textarea>
				{#if errors.description}
					<p class="text-xs font-black text-[#E07A5F]">{errors.description}</p>
				{/if}
			</div>
		</div>

		<!-- Section 2: Taksonomi Ilmiah -->
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
			<div class="flex items-center gap-2.5 pb-2 border-b-2 border-[#0D0D0D]">
				<Dna class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" />
				<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider">
					2. Klasifikasi Taksonomi Ilmiah (Opsional)
				</h2>
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
				<Input label="Kingdom" bind:value={taxonomyKingdom} />
				<Input label="Divisio" placeholder="Tracheophyta" bind:value={taxonomyDivisio} />
				<Input label="Classis" placeholder="Liliopsida" bind:value={taxonomyClassis} />
				<Input label="Ordo" placeholder="Zingiberales" bind:value={taxonomyOrdo} />
				<Input label="Familia" placeholder="Zingiberaceae" bind:value={taxonomyFamilia} />
				<Input label="Genus" placeholder="Zingiber" bind:value={taxonomyGenus} />
			</div>
		</div>

		<!-- Section 3: Foto & Video Penjelasan Siswa -->
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
			<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">
				3. Dokumentasi Foto &amp; Video Edukasi
			</h2>

			<!-- Photo Upload Box -->
			<div>
				<span class="block text-xs font-black text-[#0D0D0D] tracking-wider uppercase mb-2">Foto Tanaman * (Maksimal 5 foto, min 1 foto)</span>

				<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
					{#each photoPreviews as url, idx}
						<div class="relative aspect-square rounded-xl overflow-hidden border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
							<img src={url} alt="Preview {idx + 1}" class="w-full h-full object-cover" />
							<button
								type="button"
								onclick={() => removePhoto(idx)}
								class="absolute top-1.5 right-1.5 p-1 bg-[#E07A5F] text-white rounded-lg border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] cursor-pointer"
								title="Hapus foto"
							>
								<X class="w-3.5 h-3.5 stroke-[2.5]" />
							</button>
						</div>
					{/each}

					{#if photoFiles.length < 5}
						<label class="aspect-square rounded-xl border-2 border-dashed border-[#0D0D0D] hover:bg-[#D4F469]/20 bg-[#F3F6ED] flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-colors text-[#0D0D0D] text-xs font-black shadow-[2px_2px_0px_#0D0D0D]">
							<ImageIcon class="w-6 h-6 stroke-[2]" />
							<span>+ Tambah Foto</span>
							<input type="file" accept="image/*" multiple onchange={handlePhotoSelect} class="hidden" />
						</label>
					{/if}
				</div>
				{#if errors.photos}
					<p class="text-xs font-black text-[#E07A5F] mt-1.5">{errors.photos}</p>
				{/if}
				<p class="text-[11px] text-stone-500 font-semibold mt-1.5">Foto otomatis dikompresi agar hemat kuota.</p>
			</div>

			<!-- Student Explanation Video Upload (BRD Ref) -->
			<div class="pt-4 border-t-2 border-[#0D0D0D] flex flex-col gap-3">
				<div class="flex items-center gap-2">
					<Video class="w-4 h-4 text-[#0D0D0D] stroke-[2.5]" />
					<span class="text-xs font-black text-[#0D0D0D] uppercase tracking-wide">Video Penjelasan Siswa (Opsional)</span>
				</div>

				<p class="text-xs text-stone-600 font-medium">
					Unggah video penjelasan identifikasi botani, morfologi, atau cara pemeliharaan tanaman (Maks. 50MB, format MP4 atau WebM).
				</p>

				{#if videoFile}
					<div class="p-3.5 bg-[#F3F6ED] rounded-xl border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] flex items-center justify-between">
						<div class="flex items-center gap-2.5">
							<Video class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" />
							<div>
								<p class="text-xs font-black text-[#0D0D0D]">{videoFile.name}</p>
								<p class="text-[10px] text-stone-700 font-bold">{(videoFile.size / (1024 * 1024)).toFixed(1)} MB</p>
							</div>
						</div>
						<button
							type="button"
							onclick={() => (videoFile = null)}
							class="text-xs text-[#0D0D0D] hover:text-red-700 font-black underline cursor-pointer"
						>
							Hapus Video
						</button>
					</div>

					<Input
						label="Judul Video Edukasi"
						placeholder="Contoh: Praktikum Pemupukan dan Morfologi Tanaman Kakao"
						bind:value={videoTitle}
					/>
				{:else}
					<label class="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-[#0D0D0D] hover:bg-[#D4F469]/20 rounded-xl cursor-pointer bg-[#F3F6ED] transition-colors text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]">
						<UploadCloud class="w-5 h-5 text-[#0D0D0D] stroke-[2.5]" />
						<span>Pilih File Video (MP4 / WebM)</span>
						<input type="file" accept="video/mp4,video/webm" onchange={handleVideoSelect} class="hidden" />
					</label>
				{/if}
			</div>
		</div>

		<!-- Section 4: Lokasi di Sekolah -->
		<div class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 sm:p-6 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4">
			<h2 class="text-sm font-black text-[#0D0D0D] uppercase tracking-wider pb-2 border-b-2 border-[#0D0D0D]">
				4. Lokasi Kebun Sekolah
			</h2>

			<Input
				label="Keterangan Lokasi Fisik"
				placeholder="Contoh: Kebun Percobaan TOGA Blok A-2, Dekat Kolam Ikan"
				bind:value={locationLabel}
			/>

			<div class="grid grid-cols-2 gap-4">
				<div>
					<label for="pos-x-range" class="text-xs font-black text-[#0D0D0D]">Posisi Peta X: {locationX}%</label>
					<input id="pos-x-range" type="range" min="5" max="95" bind:value={locationX} class="w-full accent-stone-900 mt-1 cursor-pointer" />
				</div>
				<div>
					<label for="pos-y-range" class="text-xs font-black text-[#0D0D0D]">Posisi Peta Y: {locationY}%</label>
					<input id="pos-y-range" type="range" min="5" max="95" bind:value={locationY} class="w-full accent-stone-900 mt-1 cursor-pointer" />
				</div>
			</div>
		</div>

		<!-- Submit Button -->
		<Button type="submit" variant="primary" size="lg" loading={isSubmitting} fullWidth>
			<CheckCircle2 class="w-5 h-5 stroke-[2.5]" />
			<span>Simpan &amp; Ajukan Data Tanaman</span>
		</Button>
	</form>
</div>
