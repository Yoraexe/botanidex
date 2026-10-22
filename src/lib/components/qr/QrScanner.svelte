<!--
  Flora SMK — QR Code Scanner Component (Svelte 5 Runes)
  Tujuan: Memindai QR Code tanaman dari kamera HP atau unggahan foto QR
  Caller: Halaman /scan
  BRD Ref: F3 (QR Code Scanner)
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { Html5Qrcode } from 'html5-qrcode';
	import { onDestroy, onMount } from 'svelte';
	import { Camera, Image as ImageIcon, Search, AlertCircle, RefreshCw } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	let scannerId = 'qr-reader-container';
	let html5QrCode: Html5Qrcode | null = null;
	let isScanning = $state(false);
	let errorMessage = $state<string | null>(null);
	let manualInput = $state('');
	let hasCamera = $state(true);

	function handleScanSuccess(decodedText: string) {
		stopScanner();

		// Parse decoded text (bisa berupa URL lengkap atau slug)
		try {
			if (decodedText.includes('/katalog/')) {
				const parts = decodedText.split('/katalog/');
				const slug = parts[parts.length - 1].replace(/\/+$/, '');
				goto(`/katalog/${slug}`);
			} else if (decodedText.startsWith('http')) {
				window.location.href = decodedText;
			} else {
				// Anggap sebagai slug langsung
				goto(`/katalog/${encodeURIComponent(decodedText)}`);
			}
		} catch {
			goto(`/katalog/${encodeURIComponent(decodedText)}`);
		}
	}

	async function startScanner() {
		errorMessage = null;
		try {
			if (!html5QrCode) {
				html5QrCode = new Html5Qrcode(scannerId);
			}

			const devices = await Html5Qrcode.getCameras();
			if (!devices || devices.length === 0) {
				hasCamera = false;
				errorMessage = 'Tidak ditemukan kamera pada perangkat ini. Gunakan fitur upload gambar atau ketik nama tanaman.';
				return;
			}

			// Prioritaskan kamera belakang (environment)
			await html5QrCode.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
					aspectRatio: 1.0
				},
				handleScanSuccess,
				() => {
					// Ignore per-frame scan misses
				}
			);
			isScanning = true;
		} catch (err: any) {
			console.warn('Gagal memulai kamera:', err);
			isScanning = false;
			errorMessage = err?.message || 'Izin akses kamera ditolak atau kamera sedang digunakan aplikasi lain.';
		}
	}

	async function stopScanner() {
		if (html5QrCode && isScanning) {
			try {
				await html5QrCode.stop();
				isScanning = false;
			} catch (err) {
				console.warn('Gagal stop scanner:', err);
			}
		}
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		errorMessage = null;
		try {
			if (!html5QrCode) {
				html5QrCode = new Html5Qrcode(scannerId);
			}
			const result = await html5QrCode.scanFile(file, true);
			handleScanSuccess(result);
		} catch (err) {
			errorMessage = 'QR Code tidak terdeteksi pada gambar yang diunggah. Pastikan QR code terlihat jelas dan terang.';
		}
	}

	function handleManualSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (manualInput.trim()) {
			goto(`/katalog?q=${encodeURIComponent(manualInput.trim())}`);
		}
	}

	onMount(() => {
		startScanner();
	});

	onDestroy(() => {
		stopScanner();
	});
</script>

<div class="max-w-md mx-auto flex flex-col gap-5">
	<!-- Scanner Viewport Card -->
	<div class="bg-stone-900 rounded-3xl overflow-hidden shadow-xl border border-stone-800 p-4 text-center text-white relative">
		<div class="mb-3 flex items-center justify-between px-2">
			<div class="flex items-center gap-2">
				<Camera class="w-5 h-5 text-emerald-400" />
				<span class="text-sm font-bold tracking-tight">Kamera Pemindai Tanaman</span>
			</div>
			{#if isScanning}
				<span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
					<span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
					Mencari QR...
				</span>
			{/if}
		</div>

		<!-- Scanner Frame Container -->
		<div class="relative w-full aspect-square max-w-[320px] mx-auto rounded-2xl overflow-hidden bg-black flex items-center justify-center">
			<div id={scannerId} class="w-full h-full"></div>

			<!-- Visual Scan Guide Corners Overlay -->
			<div class="absolute inset-8 pointer-events-none border-2 border-dashed border-emerald-400/50 rounded-xl flex items-center justify-center">
				<div class="w-full h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse"></div>
			</div>
		</div>

		<p class="text-xs text-stone-400 mt-3 px-4">
			Arahkan kamera ke label barcode / QR Code yang terpasang di batang pohon atau bedengan tanaman.
		</p>

		{#if errorMessage}
			<div class="mt-3 p-3 bg-red-950/80 border border-red-800/80 rounded-xl text-left flex items-start gap-2.5 text-xs text-red-200">
				<AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
				<div class="flex-1">
					<p class="font-bold">Kendala Kamera</p>
					<p>{errorMessage}</p>
				</div>
				<button onclick={startScanner} class="p-1 hover:text-white" title="Coba Lagi">
					<RefreshCw class="w-4 h-4" />
				</button>
			</div>
		{/if}
	</div>

	<!-- Alternative Actions: Upload Image or Manual Search -->
	<div class="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs flex flex-col gap-4">
		<h3 class="text-sm font-bold text-stone-900 border-b border-stone-100 pb-2">
			Opsi Pemindaian Lainnya
		</h3>

		<!-- File Upload (Screenshot/Photo from Gallery) -->
		<div>
			<span class="block text-xs font-semibold text-stone-700 uppercase tracking-wide mb-1.5">Unggah Foto QR dari Galeri HP</span>
			<label class="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-stone-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-stone-50 hover:bg-emerald-50/50 transition-colors text-xs font-medium text-stone-700">
				<ImageIcon class="w-4 h-4 text-emerald-600" />
				<span>Pilih Foto QR dari Galeri</span>
				<input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
			</label>
		</div>

		<!-- Manual Plant Code or Name Search -->
		<form onsubmit={handleManualSubmit} class="flex flex-col gap-2 pt-2 border-t border-stone-100">
			<label for="manual-plant-input" class="text-xs font-semibold text-stone-700 uppercase tracking-wide">
				Atau Cari Manual Berdasarkan Nama Tanaman
			</label>
			<div class="flex gap-2">
				<input
					id="manual-plant-input"
					bind:value={manualInput}
					placeholder="Contoh: Jahe Merah, Jagung, atau Kopi..."
					class="flex-1 px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
				/>
				<Button type="submit" variant="primary" size="md">
					<Search class="w-4 h-4" />
					Cari
				</Button>
			</div>
		</form>
	</div>
</div>
