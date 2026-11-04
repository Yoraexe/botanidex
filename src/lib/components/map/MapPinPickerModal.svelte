<!--
  Botanidex — Interactive Map Pin Picker Modal (Svelte 5 Runes)
  Tujuan: Modal pemilihan titik koordinat lokasi tanaman (X & Y) secara visual point-and-click di atas denah kebun sekolah
  Caller: Form kontribusi (/kontribusi/tambah, /kontribusi/[id]/edit, /admin/tanaman/[id]/edit)
  Dependensi: Button.svelte, @lucide/svelte
  Main Functions: handleMapClick, handleConfirm
  Side Effects: Mengembalikan koordinat x & y dalam persentase (5.0% - 95.0%)
-->
<script lang="ts">
	import { MapPin, X, Check, Crosshair } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	let {
		show = false,
		initialX = 50,
		initialY = 50,
		locationLabel = '',
		onConfirm,
		onClose
	}: {
		show: boolean;
		initialX?: number;
		initialY?: number;
		locationLabel?: string;
		onConfirm: (coords: { x: number; y: number }) => void;
		onClose: () => void;
	} = $props();

	let selectedX = $state(initialX);
	let selectedY = $state(initialY);

	$effect(() => {
		if (show) {
			selectedX = typeof initialX === 'number' && initialX > 0 ? initialX : 50;
			selectedY = typeof initialY === 'number' && initialY > 0 ? initialY : 50;
		}
	});

	function handleMapClick(e: MouseEvent) {
		const target = e.currentTarget as HTMLElement;
		if (!target || typeof e.clientX !== 'number') return;
		const rect = target.getBoundingClientRect();
		const clientX = e.clientX;
		const clientY = e.clientY;

		const rawX = ((clientX - rect.left) / rect.width) * 100;
		const rawY = ((clientY - rect.top) / rect.height) * 100;
		if (isNaN(rawX) || isNaN(rawY)) return;

		// Clamp koordinat agar pin tidak keluar batas pinggir denah
		selectedX = Math.round(Math.max(5, Math.min(95, rawX)) * 10) / 10;
		selectedY = Math.round(Math.max(5, Math.min(95, rawY)) * 10) / 10;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'ArrowUp') {
			e.preventDefault();
			selectedY = Math.round(Math.max(5, selectedY - 1) * 10) / 10;
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			selectedY = Math.round(Math.min(95, selectedY + 1) * 10) / 10;
		} else if (e.key === 'ArrowLeft') {
			e.preventDefault();
			selectedX = Math.round(Math.max(5, selectedX - 1) * 10) / 10;
		} else if (e.key === 'ArrowRight') {
			e.preventDefault();
			selectedX = Math.round(Math.min(95, selectedX + 1) * 10) / 10;
		} else if (e.key === 'Enter') {
			e.preventDefault();
			handleConfirm();
		}
	}

	function handleConfirm() {
		onConfirm({ x: selectedX, y: selectedY });
		onClose();
	}
</script>

{#if show}
	<div class="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5">
		<div class="bg-white rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-[8px_8px_0px_#0D0D0D] border-2 border-[#0D0D0D] flex flex-col gap-4 max-h-[95vh] overflow-y-auto">
			<div class="flex items-center justify-between pb-3 border-b-2 border-[#0D0D0D]">
				<div class="flex items-center gap-2.5">
					<div class="w-9 h-9 rounded-xl bg-[#D4F469] border-2 border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D]">
						<Crosshair class="w-5 h-5 stroke-[2.5]" />
					</div>
					<div>
						<h3 class="text-sm sm:text-base font-black text-[#0D0D0D] leading-tight">Tentukan Titik di Denah Kebun</h3>
						<p class="text-[11px] text-stone-600 font-semibold mt-0.5">Klik di area denah sekolah untuk menancapkan pin lokasi tanaman.</p>
					</div>
				</div>
				<button type="button" onclick={onClose} class="w-8 h-8 rounded-lg border border-[#0D0D0D] bg-stone-100 hover:bg-[#E07A5F] hover:text-white flex items-center justify-center cursor-pointer transition-colors" aria-label="Tutup Modal">
					<X class="w-4 h-4 stroke-[2.5]" />
				</button>
			</div>

			<!-- Area Peta Interaktif -->
			<div class="flex flex-col gap-2">
				<div
					role="button"
					tabindex="0"
					onclick={handleMapClick}
					onkeydown={handleKeydown}
					aria-label="Peta area kebun interaktif. Gunakan klik atau tombol panah keyboard untuk memindahkan posisi pin."
					class="relative w-full aspect-16/10 rounded-2xl border-2 border-[#0D0D0D] bg-stone-100 overflow-hidden cursor-crosshair shadow-[3px_3px_0px_#0D0D0D] select-none group focus:outline-hidden focus:ring-2 focus:ring-[#0D0D0D]"
				>
					<img src="/map-schematic.svg" alt="Denah Area Kebun Sekolah" class="w-full h-full object-cover pointer-events-none" />

					<!-- Pin Lokasi Terpilih -->
					<div
						class="absolute -translate-x-1/2 -translate-y-full transition-all duration-150 z-20 pointer-events-none"
						style="left: {selectedX}%; top: {selectedY}%;"
					>
						<div class="absolute -inset-1 rounded-full animate-ping opacity-40 bg-[#0D0D0D]"></div>
						<div class="relative px-2.5 py-1 rounded-full shadow-[2px_2px_0px_#0D0D0D] border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] text-[10px] font-black flex items-center gap-1 whitespace-nowrap">
							<MapPin class="w-3.5 h-3.5 fill-[#0D0D0D] text-transparent" />
							<span>{locationLabel || 'Titik Tanaman'}</span>
						</div>
					</div>

					<div class="absolute bottom-2 right-2 bg-black/80 text-white text-[10px] font-mono px-2 py-1 rounded-lg border border-white/20 pointer-events-none">
						X: {selectedX}% | Y: {selectedY}%
					</div>
				</div>

				<p class="text-[11px] text-stone-500 font-medium italic text-center">
					Tip: Klik di mana saja pada gambar denah di atas untuk memindahkan posisi marker.
				</p>
			</div>

			<!-- Footer Modal -->
			<div class="flex items-center justify-between pt-3 border-t-2 border-[#0D0D0D] gap-2">
				<div class="text-xs font-bold text-stone-700">
					Posisi: <strong class="text-[#0D0D0D]">X: {selectedX}%, Y: {selectedY}%</strong>
				</div>
				<div class="flex items-center gap-2">
					<Button variant="outline" size="sm" onclick={onClose}>Batal</Button>
					<Button variant="primary" size="sm" onclick={handleConfirm}>
						<Check class="w-4 h-4 mr-1" />
						<span>Terapkan Titik Lokasi</span>
					</Button>
				</div>
			</div>
		</div>
	</div>
{/if}
