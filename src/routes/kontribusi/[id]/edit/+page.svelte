<!--
  Botanidex — Student Plant Revision & Resubmission Form (Svelte 5 Runes)
  Tujuan: Memungkinkan siswa memperbaiki submisi tanaman yang ditolak berdasarkan catatan guru dan mengajukan ulang (resubmit) ke antrean moderasi
  Caller: Route '/kontribusi/[id]/edit'
  Dependensi: PlantService, StorageService, ConfigService, plantFormSchema, authUser, toast, Button.svelte, Input.svelte
  Main Functions: loadPlantData, handlePhotoSelect, removeExistingPhoto, removeNewPhoto, handleSubmit
  Side Effects: Memperbarui data tanaman, mereset status ke 'pending', dan menghapus catatan penolakan
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { onDestroy, onMount } from 'svelte';
	import { authUser } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import { PlantService } from '#lib/services/plant.service';
	import { StorageService } from '#lib/services/storage.service';
	import { ConfigService } from '#lib/services/config.service';
	import { plantFormSchema } from '#lib/schemas/plant.schema';
	import type { Plant, PlantCategory } from '#lib/types/plant.types';
	import type { CategoryItemConfig } from '#lib/types/config.types';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import MapPinPickerModal from '#lib/components/map/MapPinPickerModal.svelte';
	import { Send, ArrowLeft, Image as ImageIcon, AlertCircle, ShieldAlert, CheckCircle2, X, MapPin, Crosshair } from '@lucide/svelte';

	const plantId = $derived(page.params.id);
	const initialCategories = ConfigService.getCategories().filter((c) => c.id !== 'semua');

	let plant = $state<Plant | null>(null);
	let isLoading = $state(true);
	let isSubmitting = $state(false);
	let showMapPicker = $state(false);
	let errors = $state<Record<string, string>>({});
	let availableCategories = $state(initialCategories);

	let form = $state({
		name_local: '',
		name_latin: '',
		name_english: '',
		aliases_raw: '',
		category: (initialCategories[0]?.id || 'obat') as PlantCategory,
		quantity: 1,
		unit: 'pohon',
		description: '',
		location_label: '',
		location_x: 50,
		location_y: 50,
		taxonomy_kingdom: 'Plantae',
		taxonomy_divisio: '',
		taxonomy_classis: '',
		taxonomy_ordo: '',
		taxonomy_familia: '',
		taxonomy_genus: '',
		taxonomy_species: '',
		video_title: ''
	});

	const taxFields = [
		{ key: 'taxonomy_divisio', label: 'Divisio', ph: 'Tracheophyta' },
		{ key: 'taxonomy_classis', label: 'Classis', ph: 'Liliopsida' },
		{ key: 'taxonomy_ordo', label: 'Ordo', ph: 'Zingiberales' },
		{ key: 'taxonomy_familia', label: 'Familia', ph: 'Zingiberaceae' },
		{ key: 'taxonomy_genus', label: 'Genus', ph: 'Zingiber' }
	] as const;

	let existingPhotos = $state<{ id: string; storage_path: string }[]>([]);
	let newPhotoFiles = $state<File[]>([]);
	let newPhotoPreviews = $state<string[]>([]);

	onMount(async () => {
		const handleConfigChange = (e: Event) => {
			const detail = (e as CustomEvent<{ categories?: CategoryItemConfig[] }>)?.detail;
			if (detail?.categories) availableCategories = detail.categories.filter((c) => c.id !== 'semua');
		};
		window.addEventListener('flora:config-updated', handleConfigChange);

		await loadPlantData();
		return () => window.removeEventListener('flora:config-updated', handleConfigChange);
	});

	onDestroy(() => newPhotoPreviews.forEach((url) => URL.revokeObjectURL(url)));

	async function loadPlantData() {
		if (!plantId) return;
		isLoading = true;
		try {
			const fetched = await PlantService.getPlantById(plantId);
			if (fetched) {
				plant = fetched;
				form = {
					name_local: fetched.name_local,
					name_latin: fetched.name_latin,
					name_english: fetched.name_english || '',
					aliases_raw: (fetched.aliases || []).join(', '),
					category: fetched.category as PlantCategory,
					quantity: fetched.quantity || 1,
					unit: fetched.unit || 'pohon',
					description: fetched.description,
					location_label: fetched.location_label || '',
					location_x: fetched.location_x ?? 50,
					location_y: fetched.location_y ?? 50,
					taxonomy_kingdom: fetched.taxonomy.kingdom || 'Plantae',
					taxonomy_divisio: fetched.taxonomy.divisio || '',
					taxonomy_classis: fetched.taxonomy.classis || '',
					taxonomy_ordo: fetched.taxonomy.ordo || '',
					taxonomy_familia: fetched.taxonomy.familia || '',
					taxonomy_genus: fetched.taxonomy.genus || '',
					taxonomy_species: fetched.taxonomy.species || '',
					video_title: fetched.videos?.[0]?.title || ''
				};
				existingPhotos = (fetched.photos || []).map((p) => ({ id: p.id, storage_path: p.storage_path }));
			}
		} catch (err) {
			console.warn('Gagal memuat draf tanaman:', err);
		} finally {
			isLoading = false;
		}
	}

	const isOwnerOrAdmin = $derived(
		Boolean(
			$authUser &&
				plant &&
				($authUser.role === 'admin' ||
					(plant.contributor_id && plant.contributor_id === $authUser.id))
		)
	);

	function handlePhotoSelect(event: Event) {
		const target = event.target as HTMLInputElement;
		if (!target.files?.length) return;
		const totalCurrent = existingPhotos.length + newPhotoFiles.length;
		const allowedNew = 5 - totalCurrent;
		if (allowedNew <= 0) {
			toast.info('Batas Maksimal Foto', 'Maksimal 5 foto per tanaman.');
			target.value = '';
			return;
		}
		const newFiles = Array.from(target.files).slice(0, allowedNew);
		newPhotoFiles = [...newPhotoFiles, ...newFiles];
		newPhotoPreviews = [...newPhotoPreviews, ...newFiles.map((f) => URL.createObjectURL(f))];
		target.value = '';
	}

	function removeExistingPhoto(index: number) {
		existingPhotos = existingPhotos.filter((_, i) => i !== index);
	}

	function removeNewPhoto(index: number) {
		if (newPhotoPreviews[index]) URL.revokeObjectURL(newPhotoPreviews[index]);
		newPhotoFiles = newPhotoFiles.filter((_, i) => i !== index);
		newPhotoPreviews = newPhotoPreviews.filter((_, i) => i !== index);
	}

	async function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (!plant) return;
		errors = {};

		const validationResult = plantFormSchema.safeParse({
			...form,
			video_duration_seconds: plant.videos?.[0]?.duration_seconds
		});

		if (!validationResult.success) {
			for (const issue of validationResult.error.issues) errors[issue.path[0] as string] = issue.message;
			return toast.error('Validasi Gagal', 'Harap periksa isian formulir yang belum valid.');
		}

		if (existingPhotos.length === 0 && newPhotoFiles.length === 0) {
			errors.photos = 'Minimal sertakan 1 foto tanaman.';
			return toast.error('Foto Wajib', 'Minimal sertakan 1 foto tanaman untuk dokumentasi.');
		}

		isSubmitting = true;
		try {
			const uploadedNewPhotos = await Promise.all(newPhotoFiles.map((f) => StorageService.uploadPlantPhoto(f)));
			const allPhotoUrls = [...existingPhotos.map((p) => p.storage_path), ...uploadedNewPhotos];

			await PlantService.updatePlant(plant.id, validationResult.data, {
				uploadedPhotos: allPhotoUrls,
				status: 'pending' // Ajukan ulang draf ke antrean moderasi guru
			});

			toast.success(
				'Revisi Berhasil Diajukan Ulang!',
				'Draf tanaman Anda telah diperbarui dan masuk kembali ke antrean moderasi guru.'
			);
			goto('/kontribusi/saya');
		} catch (err: unknown) {
			toast.error('Gagal Menyimpan Revisi', (err as Error)?.message || 'Terjadi kesalahan sistem.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head><title>Revisi Submisi Tanaman — Botanidex</title></svelte:head>

<div class="max-w-3xl mx-auto flex flex-col gap-6">
	{#if !$authUser}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<div class="w-14 h-14 rounded-2xl bg-[#FBBF24] border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center text-[#0D0D0D]"><AlertCircle class="w-7 h-7 stroke-[2.5]" /></div>
			<div>
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Login Diperlukan</h1>
				<p class="text-xs sm:text-sm text-stone-600 font-semibold mt-1 max-w-md mx-auto">Silakan masuk untuk merevisi data tanaman Anda.</p>
			</div>
			<a href="/login?redirectTo=/kontribusi/{plantId}/edit" class="px-5 py-2.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-xs font-black text-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D]">Masuk Akun</a>
		</div>
	{:else if isLoading}
		<div class="p-12 text-center bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D] animate-pulse">
			<h2 class="text-lg font-black text-[#0D0D0D]">Memuat Draf Tanaman...</h2>
		</div>
	{:else if !plant || !isOwnerOrAdmin}
		<div class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-10 text-center flex flex-col items-center gap-4">
			<AlertCircle class="w-12 h-12 text-red-500 mx-auto" />
			<h2 class="text-xl font-black text-[#0D0D0D]">Akses Tidak Diizinkan</h2>
			<p class="text-xs sm:text-sm text-stone-600 font-medium">Anda hanya dapat merevisi draf tanaman yang Anda ajukan sendiri.</p>
			<a href="/kontribusi/saya" class="mt-2 px-4 py-2 bg-[#D4F469] text-[#0D0D0D] rounded-xl border-2 border-[#0D0D0D] text-xs font-black shadow-[2px_2px_0px_#0D0D0D]">Kembali ke Kontribusi Saya</a>
		</div>
	{:else}
		<div class="flex items-center justify-between">
			<a href="/kontribusi/saya" class="inline-flex items-center gap-2 text-xs font-black text-[#0D0D0D] bg-white px-3.5 py-2 rounded-xl border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] hover:bg-[#D4F469] transition-all">
				<ArrowLeft class="w-4 h-4 stroke-[2.5]" /> <span>Kembali ke Kontribusi Saya</span>
			</a>
			<span class="text-xs font-black px-2.5 py-1 rounded-lg border border-[#0D0D0D] bg-[#FBBF24]">Mode Revisi Siswa</span>
		</div>

		{#if plant.status === 'rejected' && plant.rejection_reason}
			<div class="bg-red-50 border-2 border-red-500 rounded-2xl p-4 sm:p-5 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-2">
				<div class="flex items-center gap-2 text-red-900 font-black text-sm">
					<ShieldAlert class="w-5 h-5 text-red-600 shrink-0 stroke-[2.5]" />
					<span>Catatan Perbaikan dari Guru Pembimbing:</span>
				</div>
				<p class="text-xs sm:text-sm text-red-800 font-bold bg-white p-3 rounded-xl border border-red-300 leading-relaxed">{plant.rejection_reason}</p>
				<p class="text-[11px] text-red-700 font-medium">Silakan perbaiki isian formulir di bawah ini sesuai arahan guru, lalu klik tombol <strong>"Ajukan Ulang Draf Revisi"</strong>.</p>
			</div>
		{/if}

		<form onsubmit={handleSubmit} class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-8 flex flex-col gap-6">
			<div class="border-b-2 border-[#0D0D0D] pb-4">
				<h1 class="text-xl sm:text-2xl font-black text-[#0D0D0D]">Perbaiki Draf: {plant.name_local}</h1>
				<p class="text-xs text-stone-600 font-medium mt-1">Lengkapi data botani, ejaan nama Latin, taksonomi, dan foto sesuai catatan verifikator.</p>
			</div>

			<div class="flex flex-col gap-4">
				<h2 class="text-xs font-black uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">1. Identitas &amp; Klasifikasi Dasar</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
					<Input id="name_local" label="Nama Lokal / Indonesia *" bind:value={form.name_local} placeholder="Mis: Jahe Merah" error={errors.name_local} />
					<Input id="name_latin" label="Nama Latin (Ilmiah) *" bind:value={form.name_latin} placeholder="Mis: Zingiber officinale var. rubrum" error={errors.name_latin} />
					<Input id="name_english" label="Nama Bahasa Inggris" bind:value={form.name_english} placeholder="Mis: Red Ginger" />
					<Input id="aliases_raw" label="Nama Lain / Sinonim (Pisahkan koma)" bind:value={form.aliases_raw} placeholder="Mis: Halia bara, Jahe sunti" />
					<div class="flex flex-col gap-1.5">
						<label for="category" class="text-xs font-black text-[#0D0D0D]">Kategori Botani *</label>
						<select id="category" bind:value={form.category} class="px-3.5 py-2.5 text-xs bg-[#F8F9F5] border-2 border-[#0D0D0D] rounded-xl font-bold outline-none">
							{#each availableCategories as cat (cat.id)}<option value={cat.id}>{cat.label}</option>{/each}
						</select>
					</div>
					<div class="grid grid-cols-2 gap-2">
						<Input id="quantity" type="number" label="Jumlah Populasi *" bind:value={form.quantity} min={1} error={errors.quantity} />
						<div class="flex flex-col gap-1.5">
							<label for="unit" class="text-xs font-black text-[#0D0D0D]">Satuan *</label>
							<select id="unit" bind:value={form.unit} class="px-3 py-2.5 text-xs bg-[#F8F9F5] border-2 border-[#0D0D0D] rounded-xl font-bold outline-none">
								<option value="pohon">Pohon</option>
								<option value="rumpun">Rumpun</option>
								<option value="polybag">Polybag</option>
								<option value="pot">Pot</option>
								<option value="bedeng">Bedeng</option>
								<option value="batang">Batang</option>
							</select>
						</div>
					</div>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h2 class="text-xs font-black uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">2. Taksonomi 7 Tingkat</h2>
				<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
					<Input id="tax_kingdom" label="Kingdom" bind:value={form.taxonomy_kingdom} disabled />
					{#each taxFields as f (f.key)}
						<Input id={f.key} label={f.label} bind:value={form[f.key]} placeholder={f.ph} />
					{/each}
					<Input id="tax_species" label="Species" bind:value={form.taxonomy_species} placeholder="Zingiber officinale" />
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h2 class="text-xs font-black uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">3. Deskripsi &amp; Lokasi Kebun</h2>
				<div class="flex flex-col gap-1.5">
					<label for="description" class="text-xs font-black text-[#0D0D0D]">Deskripsi Tanaman, Khasiat, &amp; Morfologi *</label>
					<textarea id="description" bind:value={form.description} rows="4" class="px-3.5 py-2.5 text-xs bg-[#F8F9F5] border-2 border-[#0D0D0D] rounded-xl font-bold outline-none leading-relaxed" placeholder="Deskripsikan morfologi dan khasiat tanaman..."></textarea>
					{#if errors.description}<p class="text-xs text-red-600 font-bold">{errors.description}</p>{/if}
				</div>
				<Input id="location_label" label="Label Lokasi Kebun" bind:value={form.location_label} placeholder="Mis: Blok Kebun Obat Herbal Depan Lab" />
				<div class="p-3 bg-[#F3F6ED] rounded-xl border-2 border-[#0D0D0D] flex items-center justify-between text-xs font-bold text-stone-700">
					<div class="flex items-center gap-2">
						<MapPin class="w-4 h-4 text-[#0D0D0D] stroke-[2.5]" />
						<span>Koordinat Peta: <strong>X: {form.location_x}%, Y: {form.location_y}%</strong></span>
					</div>
					<button type="button" onclick={() => (showMapPicker = true)} class="px-3 py-1 rounded-lg border border-[#0D0D0D] bg-[#D4F469] text-xs font-black text-stone-900 cursor-pointer hover:bg-[#c5e855] transition-colors flex items-center gap-1">
						<Crosshair class="w-3.5 h-3.5" />
						<span>Pilih Titik di Denah</span>
					</button>
				</div>
			</div>

			<div class="flex flex-col gap-4">
				<h2 class="text-xs font-black uppercase tracking-wider text-stone-700 pb-1 border-b border-stone-200">4. Dokumentasi Foto (Maksimal 5)</h2>
				<div class="grid grid-cols-2 sm:grid-cols-5 gap-3">
					{#each existingPhotos as p, i (p.id)}
						<div class="relative aspect-square rounded-xl border-2 border-[#0D0D0D] overflow-hidden group">
							<img src={p.storage_path} alt="Foto {i + 1}" class="w-full h-full object-cover" />
							<button type="button" onclick={() => removeExistingPhoto(i)} class="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center border border-[#0D0D0D] cursor-pointer" title="Hapus foto"><X class="w-3.5 h-3.5" /></button>
							<span class="absolute bottom-1 left-1 bg-black/75 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">Foto {i + 1}</span>
						</div>
					{/each}
					{#each newPhotoPreviews as preview, i (preview)}
						<div class="relative aspect-square rounded-xl border-2 border-dashed border-emerald-600 overflow-hidden group bg-emerald-50">
							<img src={preview} alt="Upload baru {i + 1}" class="w-full h-full object-cover" />
							<button type="button" onclick={() => removeNewPhoto(i)} class="absolute top-1 right-1 w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center border border-[#0D0D0D] cursor-pointer" title="Batalkan foto"><X class="w-3.5 h-3.5" /></button>
							<span class="absolute bottom-1 left-1 bg-emerald-700 text-white px-1.5 py-0.5 rounded text-[9px] font-bold">Baru</span>
						</div>
					{/each}
					{#if existingPhotos.length + newPhotoFiles.length < 5}
						<label class="aspect-square rounded-xl border-2 border-dashed border-[#0D0D0D] bg-[#F8F9F5] hover:bg-[#F3F6ED] flex flex-col items-center justify-center gap-1 cursor-pointer transition-all">
							<ImageIcon class="w-6 h-6 text-stone-500" />
							<span class="text-[10px] font-black text-stone-600">+ Tambah</span>
							<input type="file" accept="image/*" multiple onchange={handlePhotoSelect} class="hidden" />
						</label>
					{/if}
				</div>
				{#if errors.photos}<p class="text-xs text-red-600 font-bold">{errors.photos}</p>{/if}
			</div>

			<div class="pt-4 border-t-2 border-[#0D0D0D] flex items-center justify-end gap-3">
				<a href="/kontribusi/saya" class="px-4 py-2.5 rounded-xl border-2 border-[#0D0D0D] text-xs font-black text-stone-700 hover:bg-stone-100">Batal</a>
				<Button type="submit" variant="primary" disabled={isSubmitting}>
					<Send class="w-4 h-4 mr-1.5" />
					<span>{isSubmitting ? 'Mengirimkan Revisi...' : 'Ajukan Ulang Draf Revisi'}</span>
				</Button>
			</div>
		</form>
	{/if}
</div>

<MapPinPickerModal
	show={showMapPicker}
	initialX={form.location_x}
	initialY={form.location_y}
	locationLabel={form.location_label || form.name_local}
	onConfirm={(coords) => {
		form.location_x = coords.x;
		form.location_y = coords.y;
	}}
	onClose={() => (showMapPicker = false)}
/>
