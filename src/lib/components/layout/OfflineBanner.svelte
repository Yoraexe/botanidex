<!--
  Botanidex — Offline Status Banner (Svelte 5 Runes)
  Tujuan: Menampilkan banner informatif gaya Neo-Brutalist saat pengguna sedang luring (offline)
  Caller: src/routes/+layout.svelte
  Dependensi: svelte, @lucide/svelte
  Main Functions: OfflineBanner component
  Side Effects: Window online/offline event listeners
-->
<script lang="ts">
	import { WifiOff } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let isOnline = $state(true);

	onMount(() => {
		isOnline = navigator.onLine;
		const setOnline = () => (isOnline = true);
		const setOffline = () => (isOnline = false);
		window.addEventListener('online', setOnline);
		window.addEventListener('offline', setOffline);
		return () => {
			window.removeEventListener('online', setOnline);
			window.removeEventListener('offline', setOffline);
		};
	});
</script>

{#if !isOnline}
	<div class="bg-[#D4F469] text-[#0D0D0D] text-xs font-black py-2 px-4 text-center flex items-center justify-center gap-2 border-b-2 border-[#0D0D0D] shadow-[0_2px_0px_#0D0D0D] z-50 sticky top-0">
		<WifiOff class="w-4 h-4 text-[#0D0D0D]" />
		<span>MODE OFFLINE AKTIF — Anda tetap dapat membuka katalog tanaman yang telah tersimpan di cache!</span>
	</div>
{/if}
