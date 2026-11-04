<!--
  Botanidex — Root Layout (Svelte 5 Runes)
  Tujuan: Membungkus seluruh halaman dengan tema Neo-Brutalist Fresh Modern Agronomy, Navbar, Banner status offline, Toast, Footer dinamis CMS, dan BottomNav
  Caller: SvelteKit router
  Dependensi: ConfigService, Navbar.svelte, BottomNav.svelte, OfflineBanner.svelte, Toast.svelte
  Main Functions: Layout component
  Side Effects: Menyinkronkan identitas sekolah pada footer dari ConfigService
-->
<script lang="ts">
	import './layout.css';
	import { onMount, type Snippet } from 'svelte';
	import { ConfigService } from '#lib/services/config.service';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import BottomNav from '#lib/components/layout/BottomNav.svelte';
	import OfflineBanner from '#lib/components/layout/OfflineBanner.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';

	let { children }: { children?: Snippet } = $props();
	let identity = $state(ConfigService.getConfig().identity);

	onMount(() => {
		ConfigService.fetchRemoteConfig().catch(() => {});
		const syncIdentity = (e?: Event) => {
			const detail = (e as CustomEvent<{ identity?: typeof identity }>)?.detail;
			identity = detail?.identity ?? ConfigService.getConfig().identity;
		};
		window.addEventListener('flora:config-updated', syncIdentity);
		window.addEventListener('storage', syncIdentity);
		return () => {
			window.removeEventListener('flora:config-updated', syncIdentity);
			window.removeEventListener('storage', syncIdentity);
		};
	});
</script>

<div class="min-h-screen flex flex-col bg-[#F8F9F5] retro-grid-bg text-[#0D0D0D] pb-24 md:pb-0">
	<OfflineBanner />
	<Toast />
	<Navbar />

	<main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<footer class="hidden md:block bg-white border-t-2 border-[#0D0D0D] mt-auto py-6 text-stone-700 text-xs">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2.5">
				<div class="w-8 h-8 rounded-lg bg-white border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] p-0.5 flex items-center justify-center shrink-0">
					<img src="/SMK-Pertanian-Gorontalo.png" alt="Logo {identity.schoolName}" class="w-full h-full object-contain" />
				</div>
				<p class="font-extrabold text-[#0D0D0D]">{identity.appName} — Katalog Botani {identity.schoolName}</p>
			</div>
			<div class="flex items-center gap-3">
				<p class="font-medium text-stone-600">© 2026 {identity.schoolName}. Seluruh hak cipta dilindungi.</p>
			</div>
		</div>
	</footer>

	<BottomNav />
</div>
