<!--
  Flora SMK — Offline Status Banner (Svelte 5 Runes)
  Tujuan: Menampilkan banner informatif saat pengguna sedang luring (offline)
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { WifiOff } from '@lucide/svelte';
	import { onMount } from 'svelte';

	let isOnline = $state(true);

	onMount(() => {
		isOnline = navigator.onLine;

		const handleOnline = () => {
			isOnline = true;
		};
		const handleOffline = () => {
			isOnline = false;
		};

		window.addEventListener('online', handleOnline);
		window.addEventListener('offline', handleOffline);

		return () => {
			window.removeEventListener('online', handleOnline);
			window.removeEventListener('offline', handleOffline);
		};
	});
</script>

{#if !isOnline}
	<div class="bg-amber-500 text-white text-xs font-medium py-2 px-4 text-center flex items-center justify-center gap-2 shadow-xs z-50 sticky top-0">
		<WifiOff class="w-3.5 h-3.5" />
		<span>Mode Offline Aktif — Anda tetap dapat mengakses katalog tanaman yang tersimpan.</span>
	</div>
{/if}
