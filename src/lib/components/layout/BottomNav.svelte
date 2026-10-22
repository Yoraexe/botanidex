<!--
  Flora SMK — Mobile Bottom Navigation Bar (Svelte 5 Runes)
  Tujuan: Floating Neo-Brutalist bottom dock untuk navigasi HP yang ramah jempol
  Caller: src/routes/+layout.svelte
-->
<script lang="ts">
	import { page } from '$app/state';
	import { authUser } from '#lib/stores/auth.store';
	import { Home, BookOpen, QrCode, Map, PlusCircle, ShieldCheck } from '@lucide/svelte';

	let currentPath = $derived(page.url.pathname);
</script>

<div class="md:hidden fixed bottom-0 left-0 right-0 z-40 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 pointer-events-none">
	<nav class="pointer-events-auto max-w-md mx-auto bg-[#FFFEF9] border-2 border-[#18181B] rounded-2xl shadow-[4px_4px_0px_#18181B] px-2 py-1.5 flex items-center justify-around">
		<!-- Beranda -->
		<a
			href="/"
			class="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-black transition-all {currentPath === '/'
				? 'bg-[#6BB092] text-stone-900 border border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]'
				: 'text-stone-600 hover:text-stone-900'}"
		>
			<Home class="w-4 h-4 mb-0.5 stroke-[2.2]" />
			<span>Beranda</span>
		</a>

		<!-- Katalog -->
		<a
			href="/katalog"
			class="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-black transition-all {currentPath.startsWith('/katalog')
				? 'bg-[#F6BD60] text-stone-900 border border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]'
				: 'text-stone-600 hover:text-stone-900'}"
		>
			<BookOpen class="w-4 h-4 mb-0.5 stroke-[2.2]" />
			<span>Katalog</span>
		</a>

		<!-- Scan QR Button (Center floating sticker) -->
		<a
			href="/scan"
			class="flex flex-col items-center -mt-6 group"
			aria-label="Scan QR Code Tanaman"
		>
			<div class="w-13 h-13 rounded-2xl bg-[#6BB092] border-2 border-[#18181B] shadow-[3px_3px_0px_#18181B] text-stone-900 flex items-center justify-center transition-transform active:translate-y-1 active:shadow-[1px_1px_0px_#18181B]">
				<QrCode class="w-7 h-7 stroke-[2.5]" />
			</div>
			<span class="text-[9px] font-black text-stone-900 mt-1 uppercase tracking-tight bg-[#F6BD60] px-1.5 rounded border border-[#18181B]">
				Scan QR
			</span>
		</a>

		<!-- Peta -->
		<a
			href="/peta"
			class="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-black transition-all {currentPath.startsWith('/peta')
				? 'bg-[#93C5FD] text-stone-900 border border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]'
				: 'text-stone-600 hover:text-stone-900'}"
		>
			<Map class="w-4 h-4 mb-0.5 stroke-[2.2]" />
			<span>Peta</span>
		</a>

		<!-- Admin / Kontribusi -->
		{#if $authUser?.role === 'admin'}
			<a
				href="/admin/moderasi"
				class="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-black transition-all {currentPath.startsWith('/admin')
					? 'bg-[#CDB4DB] text-stone-900 border border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]'
					: 'text-stone-600 hover:text-stone-900'}"
			>
				<ShieldCheck class="w-4 h-4 mb-0.5 stroke-[2.2]" />
				<span>Moderasi</span>
			</a>
		{:else}
			<a
				href="/kontribusi/tambah"
				class="flex flex-col items-center py-1 px-2.5 rounded-xl text-[10px] font-black transition-all {currentPath.startsWith('/kontribusi')
					? 'bg-[#6BB092] text-stone-900 border border-[#18181B] shadow-[1.5px_1.5px_0px_#18181B]'
					: 'text-stone-600 hover:text-stone-900'}"
			>
				<PlusCircle class="w-4 h-4 mb-0.5 stroke-[2.2]" />
				<span>Tambah</span>
			</a>
		{/if}
	</nav>
</div>
