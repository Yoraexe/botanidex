<!--
  Flora SMK — Offline Status Banner (Svelte 5 Runes)
  Tujuan: Menampilkan banner informatif gaya Neo-Brutalist saat pengguna sedang luring (offline)
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
	<div class="bg-[#F6BD60] text-stone-900 text-xs font-black py-2 px-4 text-center flex items-center justify-center gap-2 border-b-2 border-[#18181B] shadow-[0_2px_0px_#18181B] z-50 sticky top-0">
		<WifiOff class="w-4 h-4 text-stone-900" />
		<span>MODE OFFLINE AKTIF — Anda tetap dapat membuka katalog tanaman yang telah tersimpan di cache!</span>
	</div>
{/if}
