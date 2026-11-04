<!--
  Botanidex — Global Header / Navbar (Svelte 5 Runes)
  Tujuan: Navigasi utama atas gaya Neo-Brutalist Fresh Modern Agronomy dengan profil peran pengguna & sinkronisasi identitas CMS
  Caller: src/routes/+layout.svelte
  Dependensi: $app/state, auth.store.ts, ConfigService, Button.svelte, @lucide/svelte
  Main Functions: handleSwitchRole, handleLogout, getUserShortName
  Side Effects: Mengubah sesi akun demo, menutup dropdown saat pindah rute/klik luar, dan mendengarkan event flora:config-updated
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { authUser } from '#lib/stores/auth.store';
	import { ConfigService } from '#lib/services/config.service';
	import { QrCode, Map, BookOpen, PlusCircle, ShieldCheck, LogOut, ChevronDown, Sliders, LogIn, Sparkles } from '@lucide/svelte';
	import Button from '../ui/Button.svelte';

	let isDropdownOpen = $state(false);
	let dropdownEl: HTMLElement | null = $state(null);
	const currentPath = $derived(page.url.pathname);
	let identity = $state(ConfigService.getConfig().identity);

	$effect(() => {
		currentPath;
		isDropdownOpen = false;
	});

	const navClass = (prefix: string, darkActive = false) =>
		`h-9 px-2.5 lg:px-3 rounded-xl border-2 transition-all flex items-center gap-1.5 lg:gap-2 text-xs lg:text-sm font-extrabold whitespace-nowrap shrink-0 ${
			currentPath.startsWith(prefix)
				? darkActive
					? 'bg-[#0F3E2E] text-white border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
					: 'bg-[#D4F469] text-[#0D0D0D] border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D]'
				: 'border-transparent text-[#0D0D0D] hover:border-[#0D0D0D] hover:bg-[#F3F6ED] hover:shadow-[2px_2px_0px_#0D0D0D]'
		}`;

	function getUserShortName(name: string): string {
		if (!name) return 'Pengguna';
		const clean = name.split('(')[0].trim();
		const parts = clean.split(/\s+/).filter(Boolean);
		if (parts.length > 1 && /^(Ir\.|Dr\.|Drs\.|Dra\.|Prof\.|H\.|Hj\.)/i.test(parts[0])) {
			return `${parts[0]} ${parts[1].replace(/,.*$/, '')}`;
		}
		return parts[0].replace(/,.*$/, '');
	}

	onMount(() => {
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

	const handleLogout = () => {
		authUser.logout();
		isDropdownOpen = false;
	};
</script>

<svelte:window
	onclick={(e) => {
		if (isDropdownOpen && dropdownEl && !dropdownEl.contains(e.target as Node)) {
			isDropdownOpen = false;
		}
	}}
/>

<header class="bg-white/95 backdrop-blur-md border-b-2 border-[#0D0D0D] sticky top-0 z-40 transition-all">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 md:h-18 flex items-center justify-between gap-3 lg:gap-4">
		<!-- Brand & Logo -->
		<a href="/" class="flex items-center gap-2.5 sm:gap-3 group shrink-0">
			<div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-white border-2 border-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] p-1 flex items-center justify-center shrink-0 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">
				<img src="/SMK-Pertanian-Gorontalo.png" alt="Logo {identity.schoolName}" class="w-full h-full object-contain" />
			</div>
			<div class="flex flex-col">
				<div class="flex items-center gap-2">
					<span class="font-black text-lg sm:text-xl leading-none tracking-tight text-[#0D0D0D]">{identity.appName}</span>
					{#if identity.headerBadge}
						<span class="hidden sm:inline-flex items-center px-2 py-0.5 rounded-md bg-[#D4F469] border border-[#0D0D0D] text-[9px] font-black uppercase tracking-wider text-[#0D0D0D] shadow-[1px_1px_0px_#0D0D0D] whitespace-nowrap leading-none shrink-0">
							{identity.headerBadge}
						</span>
					{/if}
				</div>
				<p class="hidden 2xl:block text-[11px] text-stone-600 font-bold mt-0.5 max-w-[200px] truncate leading-tight">{identity.tagline}</p>
			</div>
		</a>

		<!-- Desktop Navigation Menu -->
		<nav class="hidden md:flex items-center gap-1 lg:gap-1.5 xl:gap-2 text-[#0D0D0D]">
			<a href="/katalog" class={navClass('/katalog')}>
				<BookOpen class="w-4 h-4 stroke-[2.2] shrink-0" />
				<span><span class="hidden xl:inline">Katalog Tanaman</span><span class="xl:hidden">Katalog</span></span>
			</a>
			<a href="/scan" class={navClass('/scan')}>
				<QrCode class="w-4 h-4 stroke-[2.2] shrink-0" />
				<span>Scan QR</span>
			</a>
			<a href="/peta" class={navClass('/peta')}>
				<Map class="w-4 h-4 stroke-[2.2] shrink-0" />
				<span><span class="hidden xl:inline">Peta Kebun</span><span class="xl:hidden">Peta</span></span>
			</a>

			{#if $authUser?.role === 'admin'}
				<div class="h-5 w-[1.5px] bg-stone-300 rounded-full mx-0.5 shrink-0" aria-hidden="true"></div>
				<a href="/admin/moderasi" class={navClass('/admin/moderasi', true)}>
					<ShieldCheck class="w-4 h-4 stroke-[2.2] shrink-0" />
					<span>Portal Guru</span>
				</a>
				<a href="/admin/pengaturan" class={navClass('/admin/pengaturan')}>
					<Sliders class="w-4 h-4 stroke-[2.2] shrink-0" />
					<span>CMS</span>
				</a>
			{/if}

			{#if $authUser?.role === 'contributor'}
				<a href="/kontribusi/saya" class={navClass('/kontribusi/saya')}>
					<Sparkles class="w-4 h-4 stroke-[2.2] shrink-0" />
					<span><span class="hidden xl:inline">Kontribusi Saya</span><span class="xl:hidden">Draf Saya</span></span>
				</a>
			{/if}

			{#if $authUser?.role === 'contributor' || $authUser?.role === 'admin'}
				{#if $authUser?.role === 'contributor'}
					<div class="h-5 w-[1.5px] bg-stone-300 rounded-full mx-0.5 shrink-0" aria-hidden="true"></div>
				{/if}
				<a
					href="/kontribusi/tambah"
					class="h-9 px-2.5 lg:px-3 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D] hover:-translate-y-0.5 active:translate-y-0 active:shadow-[1px_1px_0px_#0D0D0D] font-black text-xs lg:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all {currentPath.startsWith('/kontribusi') ? 'ring-2 ring-[#0D0D0D] ring-offset-1' : ''}"
				>
					<PlusCircle class="w-4 h-4 stroke-[2.4] shrink-0" />
					<span><span class="hidden xl:inline">Tambah Tanaman</span><span class="xl:hidden">+ Tanaman</span></span>
				</a>
			{/if}
		</nav>

		<!-- User Action & Auth Controls -->
		<div class="relative flex items-center gap-2 shrink-0">
			{#if $authUser}
				<div class="relative" bind:this={dropdownEl}>
					<button
						onclick={() => (isDropdownOpen = !isDropdownOpen)}
						class="flex items-center gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl border-2 border-[#0D0D0D] bg-white shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D] transition-all text-left cursor-pointer active:translate-y-0.5 shrink-0"
						aria-expanded={isDropdownOpen}
						aria-label="Menu Pengguna"
					>
						<div
							class="h-7 px-2 rounded-lg border border-[#0D0D0D] font-black text-[10px] tracking-wide flex items-center justify-center shrink-0 {$authUser.role === 'admin'
								? 'bg-[#0F3E2E] text-white'
								: 'bg-[#D4F469] text-[#0D0D0D]'}"
						>
							{$authUser.role === 'admin' ? 'GURU' : 'SISWA'}
						</div>
						<div class="hidden sm:block leading-tight pr-0.5">
							<p class="text-xs font-black text-[#0D0D0D] leading-tight truncate max-w-[120px]">
								{getUserShortName($authUser.display_name)}
							</p>
							<p class="text-[9px] text-stone-500 uppercase tracking-wider font-extrabold leading-none mt-0.5">
								{$authUser.role === 'admin' ? 'Guru Pembimbing' : $authUser.role === 'contributor' ? 'Siswa' : 'Pengguna'}
							</p>
						</div>
						<ChevronDown class="w-3.5 h-3.5 text-stone-700 shrink-0 transition-transform duration-200 {isDropdownOpen ? 'rotate-180' : ''}" />
					</button>

					{#if isDropdownOpen}
						<div class="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-[5px_5px_0px_#0D0D0D] border-2 border-[#0D0D0D] p-2.5 z-50 text-xs text-stone-800">
							<div class="p-2.5 bg-[#F3F6ED] rounded-xl border border-[#0D0D0D] mb-2">
								<p class="font-black text-[#0D0D0D] truncate">{$authUser.display_name}</p>
								<p class="text-[11px] text-stone-600 truncate font-medium">{$authUser.email}</p>
								<span class="inline-block mt-1.5 px-2 py-0.5 rounded-md text-[10px] font-black uppercase border border-[#0D0D0D] {$authUser.role === 'admin' ? 'bg-[#0F3E2E] text-white' : 'bg-[#D4F469] text-[#0D0D0D]'}">
									Peran: {$authUser.role}
								</span>
							</div>
							<p class="px-2 py-1 text-[10px] font-black text-stone-500 uppercase tracking-wider">Aksi Akun</p>
							{#if $authUser.role === 'contributor' || $authUser.role === 'admin'}
								<a
									href="/kontribusi/saya"
									class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#F3F6ED] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
								>
									<BookOpen class="w-4 h-4 text-[#0D0D0D]" />
									<span>Riwayat Kontribusi Saya</span>
								</a>
							{/if}
							<a
								href="/login"
								class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#F3F6ED] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
							>
								<LogIn class="w-4 h-4 text-[#0D0D0D]" />
								<span>Ganti Akun</span>
							</a>
							<div class="border-t-2 border-[#0D0D0D] mt-2 pt-2">
								<button
									onclick={handleLogout}
									class="w-full text-left px-2.5 py-2 rounded-xl hover:bg-[#E07A5F]/20 text-[#0D0D0D] flex items-center gap-2.5 font-bold cursor-pointer transition-colors"
								>
									<LogOut class="w-4 h-4 text-[#E07A5F]" />
									<span>Keluar (Sign Out)</span>
								</button>
							</div>
						</div>
					{/if}
				</div>
			{:else}
				<div class="flex items-center gap-2 shrink-0">
					<a
						href="/login"
						class="h-9 px-3.5 rounded-xl border-2 border-[#0D0D0D] bg-[#D4F469] text-[#0D0D0D] shadow-[2px_2px_0px_#0D0D0D] hover:shadow-[3px_3px_0px_#0D0D0D] hover:-translate-y-0.5 active:translate-y-0 font-black text-xs sm:text-sm flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all"
					>
						<LogIn class="w-4 h-4 stroke-[2.5]" />
						<span>Masuk</span>
					</a>
				</div>
			{/if}
		</div>
	</div>
</header>
