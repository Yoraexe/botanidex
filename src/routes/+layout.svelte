<!--
  Flora SMK — Root Layout (Svelte 5 Runes)
  Tujuan: Membungkus seluruh halaman dengan tema Neo-Brutalist, Navbar, Banner status offline, Toast, dan BottomNav
  Caller: SvelteKit router
-->
<script lang="ts">
	import './layout.css';
	import type { Snippet } from 'svelte';
	import Navbar from '#lib/components/layout/Navbar.svelte';
	import BottomNav from '#lib/components/layout/BottomNav.svelte';
	import OfflineBanner from '#lib/components/layout/OfflineBanner.svelte';
	import Toast from '#lib/components/ui/Toast.svelte';

	interface Props {
		children?: Snippet;
	}

	let { children }: Props = $props();
</script>

<div class="min-h-screen flex flex-col bg-[#F7F2E7] retro-grid-bg text-[#18181B] pb-24 md:pb-0">
	<!-- Offline status alert -->
	<OfflineBanner />

	<!-- Toast alert overlay -->
	<Toast />

	<!-- Main navigation header -->
	<Navbar />

	<!-- Dynamic Page Content -->
	<main class="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
		{#if children}
			{@render children()}
		{/if}
	</main>

	<!-- Footer Desktop -->
	<footer class="hidden md:block bg-[#FFFEF9] border-t-2 border-[#0D0D0D] mt-auto py-6 text-stone-700 text-xs">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
			<div class="flex items-center gap-2.5">
				<div class="w-7 h-7 rounded-lg bg-[#6BB092] border-2 border-[#0D0D0D] shadow-[1.5px_1.5px_0px_#0D0D0D] flex items-center justify-center text-stone-900 text-xs font-black">
					FS
				</div>
				<p class="font-extrabold text-stone-900">Flora SMK — Katalog Botani SMK Pertanian</p>
			</div>
			<div class="flex items-center gap-3">
				<p class="font-medium text-stone-600">© 2026 SMK Pertanian. Seluruh hak cipta dilindungi.</p>
			</div>
		</div>
	</footer>

	<!-- Mobile bottom tab navigation -->
	<BottomNav />
</div>
