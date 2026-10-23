<!--
  Botanidex — QR Code Scanner Component (Svelte 5 Runes)
  Tujuan: Memindai QR Code tanaman gaya Neo-Brutalist dari kamera HP atau unggahan foto QR dengan proteksi lifecycle & anti-Open-Redirect
  Caller: Halaman /scan
  Dependensi: html5-qrcode, $app/navigation, Button.svelte
  Main Functions: startScanner, stopScanner, handleFileUpload, handleScanSuccess
  Side Effects: Mengakses kamera perangkat (MediaDevices API) dan navigasi internal ke /katalog/[slug]
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
	let isMounted = false;
	let errorMessage = $state<string | null>(null);
	let manualInput = $state('');
	let hasCamera = $state(true);

	async function handleScanSuccess(decodedText: string) {
		await stopScanner();
		const cleaned = decodedText.trim();
		if (!cleaned) return;

		try {
			if (cleaned.includes('/katalog/')) {
				const parts = cleaned.split('/katalog/');
				const rawSlug = parts[parts.length - 1].split(/[?#]/)[0].replace(/\/+$/, '');
				if (rawSlug) {
					goto(`/katalog/${encodeURIComponent(rawSlug)}`);
					return;
				}
			}

			if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
				const parsedUrl = new URL(cleaned);
				// Hanya izinkan redirect pada origin yang sama untuk mencegah Open Redirect berbahaya
				if (typeof window !== 'undefined' && parsedUrl.origin === window.location.origin) {
					goto(parsedUrl.pathname + parsedUrl.search);
					return;
				}
				errorMessage =
					'QR Code berasal dari luar sistem Botanidex SMK PPN Gorontalo. Gunakan QR resmi tanaman sekolah.';
				return;
			}

			// Anggap sebagai slug tanaman langsung
			const safeSlug = cleaned.replace(/^\/+|\/+$/g, '');
			goto(`/katalog/${encodeURIComponent(safeSlug)}`);
		} catch {
			errorMessage = 'Format QR Code tidak dikenali.';
		}
	}

	async function startScanner() {
		errorMessage = null;
		try {
			if (!html5QrCode) {
				html5QrCode = new Html5Qrcode(scannerId);
			}

			const devices = await Html5Qrcode.getCameras();
			if (!isMounted) return;

			if (!devices || devices.length === 0) {
				hasCamera = false;
				errorMessage =
					'Tidak ditemukan kamera pada perangkat ini. Gunakan fitur upload gambar atau ketik nama tanaman.';
				return;
			}

			await html5QrCode.start(
				{ facingMode: 'environment' },
				{
					fps: 10,
					qrbox: { width: 250, height: 250 },
					aspectRatio: 1.0
				},
				(decoded) => {
					handleScanSuccess(decoded);
				},
				() => {
					// Ignore per-frame scan misses
				}
			);

			if (!isMounted) {
				await html5QrCode.stop().catch(() => {});
				return;
			}
			isScanning = true;
		} catch (err: any) {
			console.warn('Gagal memulai kamera:', err);
			isScanning = false;
			errorMessage =
				err?.message ||
				'Izin akses kamera ditolak atau kamera sedang digunakan aplikasi lain.';
		}
	}

	async function stopScanner() {
		if (html5QrCode && isScanning) {
			try {
				await html5QrCode.stop();
			} catch (err) {
				console.warn('Gagal stop scanner:', err);
			} finally {
				isScanning = false;
			}
		}
	}

	async function handleFileUpload(event: Event) {
		const target = event.target as HTMLInputElement;
		const file = target.files?.[0];
		if (!file) return;

		errorMessage = null;
		try {
			// Wajib hentikan kamera aktif sebelum memindai file gambar statis
			await stopScanner();

			if (!html5QrCode) {
				html5QrCode = new Html5Qrcode(scannerId);
			}
			const result = await html5QrCode.scanFile(file, true);
			await handleScanSuccess(result);
		} catch {
			errorMessage =
				'QR Code tidak terdeteksi pada gambar yang diunggah. Pastikan QR code terlihat jelas dan terang.';
		} finally {
			target.value = '';
		}
	}

	function handleManualSubmit(e: SubmitEvent) {
		e.preventDefault();
		if (manualInput.trim()) {
			goto(`/katalog?q=${encodeURIComponent(manualInput.trim())}`);
		}
	}

	onMount(() => {
		isMounted = true;
		startScanner();
	});

	onDestroy(() => {
		isMounted = false;
		stopScanner();
	});
</script>

<div class="max-w-md mx-auto flex flex-col gap-6">
	<!-- Scanner Viewport Card -->
	<div
		class="bg-white rounded-2xl border-2 border-[#0D0D0D] shadow-[5px_5px_0px_#0D0D0D] p-4 sm:p-5 text-center text-[#0D0D0D] relative"
	>
		<div class="mb-3.5 flex items-center justify-between px-1">
			<div class="flex items-center gap-2">
				<div
					class="w-8 h-8 rounded-lg bg-[#D4F469] border border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D]"
				>
					<Camera class="w-4 h-4 stroke-[2.5]" />
				</div>
				<span class="text-sm font-black tracking-tight">Kamera Pemindai Tanaman</span>
			</div>
			{#if isScanning}
				<span
					class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black bg-[#D4F469] text-[#0D0D0D] border border-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D]"
				>
					<span class="w-1.5 h-1.5 rounded-full bg-[#0D0D0D] animate-ping"></span>
					Mencari QR...
				</span>
			{/if}
		</div>

		<!-- Scanner Frame Container -->
		<div
			class="relative w-full aspect-square max-w-[320px] mx-auto rounded-xl overflow-hidden bg-black border-2 border-[#0D0D0D] shadow-[3px_3px_0px_#0D0D0D] flex items-center justify-center"
		>
			<div id={scannerId} class="w-full h-full"></div>

			<!-- Visual Scan Guide Corners Overlay -->
			<div
				class="absolute inset-8 pointer-events-none border-2 border-dashed border-[#D4F469] rounded-xl flex items-center justify-center"
			>
				<div class="w-full h-0.5 bg-[#D4F469] shadow-[0_0_8px_#D4F469] animate-pulse"></div>
			</div>
		</div>

		{#if errorMessage}
			<div
				class="mt-3.5 p-3.5 bg-[#E07A5F]/20 border-2 border-[#0D0D0D] rounded-xl text-left flex items-start gap-2.5 text-xs text-[#0D0D0D]"
			>
				<AlertCircle class="w-4 h-4 shrink-0 mt-0.5 text-[#E07A5F] stroke-[2.5]" />
				<div class="flex-1 font-bold">
					<p class="font-black text-[#0D0D0D]">Kendala Pemindaian</p>
					<p class="text-stone-700 mt-0.5">{errorMessage}</p>
				</div>
				{#if hasCamera}
					<button
						type="button"
						onclick={startScanner}
						class="p-1 hover:bg-[#F3F6ED] rounded-md cursor-pointer"
						title="Coba Lagi"
					>
						<RefreshCw class="w-4 h-4 stroke-[2.5]" />
					</button>
				{/if}
			</div>
		{/if}
	</div>

	<!-- Alternative Actions: Upload Image or Manual Search -->
	<div
		class="bg-white rounded-2xl border-2 border-[#0D0D0D] p-5 shadow-[4px_4px_0px_#0D0D0D] flex flex-col gap-4"
	>
		<h3
			class="text-sm font-black text-[#0D0D0D] border-b-2 border-[#0D0D0D] pb-2 uppercase tracking-wide"
		>
			Opsi Pemindaian Lainnya
		</h3>

		<!-- File Upload (Screenshot/Photo from Gallery) -->
		<div>
			<label
				class="flex items-center justify-center gap-2 p-3.5 border-2 border-dashed border-[#0D0D0D] hover:bg-[#D4F469]/30 rounded-xl cursor-pointer bg-[#F3F6ED] transition-colors text-xs font-black text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] active:translate-y-0.5 active:shadow-[1px_1px_0px_#0D0D0D]"
			>
				<ImageIcon class="w-4 h-4 text-[#0D0D0D] stroke-[2.5]" />
				<span>Pilih Foto QR dari Galeri</span>
				<input type="file" accept="image/*" onchange={handleFileUpload} class="hidden" />
			</label>
		</div>

		<!-- Manual Plant Code or Name Search -->
		<form
			onsubmit={handleManualSubmit}
			class="flex flex-col gap-2 pt-2 border-t-2 border-[#0D0D0D]/20"
		>
			<label
				for="manual-plant-input"
				class="text-xs font-black text-[#0D0D0D] uppercase tracking-wide"
			>
				Cari Manual
			</label>
			<div class="flex gap-2">
				<input
					id="manual-plant-input"
					bind:value={manualInput}
					placeholder="Contoh: Jahe Merah, Jagung, atau Kopi..."
					class="flex-1 px-3.5 py-2.5 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[3px_3px_0px_#0D0D0D] outline-none font-bold placeholder:text-stone-400"
				/>
				<Button type="submit" variant="primary" size="md">
					<Search class="w-4 h-4 stroke-[2.5]" />
					Cari
				</Button>
			</div>
		</form>
	</div>
</div>
