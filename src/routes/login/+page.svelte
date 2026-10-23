<!--
  Botanidex — User Login Page (Svelte 5 Runes)
  Tujuan: Halaman masuk minimalis, bersih, dan cepat gaya Neo-Brutalist Fresh Modern Agronomy
  Caller: Route '/login'
  Dependensi: $app/navigation, $app/state, auth.store.ts, toast.store.ts, Button.svelte, Input.svelte, @lucide/svelte
  Main Functions: handleLogin, handleResetPassword
  Side Effects: Autentikasi sesi via authUser, penyimpanan sesi, navigasi redirect
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { authUser, authLoading } from '#lib/stores/auth.store';
	import { toast } from '#lib/stores/toast.store';
	import Button from '#lib/components/ui/Button.svelte';
	import Input from '#lib/components/ui/Input.svelte';
	import {
		Lock,
		Mail,
		Eye,
		EyeOff,
		LogIn,
		AlertCircle,
		CheckCircle2,
		ArrowLeft,
		KeyRound,
		X
	} from '@lucide/svelte';

	const redirectTo = $derived(page.url.searchParams.get('redirectTo') || '/');
	const queryMessage = $derived(page.url.searchParams.get('message'));

	let email = $state('');
	let password = $state('');
	let showPassword = $state(false);
	let rememberMe = $state(true);

	let isSubmitting = $state(false);
	let formError = $state<string | null>(null);
	let fieldErrors = $state<{ email?: string; password?: string }>({});

	// Modal Reset Kata Sandi
	let showResetModal = $state(false);
	let resetEmail = $state('');
	let isResetting = $state(false);
	let resetSuccess = $state(false);
	let resetError = $state<string | null>(null);

	async function handleLogin(e: SubmitEvent) {
		e.preventDefault();
		formError = null;
		fieldErrors = {};

		if (!email.trim()) {
			fieldErrors = { ...fieldErrors, email: 'Email wajib diisi' };
		}
		if (!password) {
			fieldErrors = { ...fieldErrors, password: 'Kata sandi wajib diisi' };
		}
		if (Object.keys(fieldErrors).length > 0) return;

		isSubmitting = true;
		try {
			const res = await authUser.login({ email, password });
			if (res.success && res.data) {
				toast.success('Berhasil Masuk', `Selamat datang, ${res.data.display_name}.`);
				goto(redirectTo);
			} else if (res.error) {
				formError = res.error.message;
				if (res.error.field === 'email') fieldErrors = { email: res.error.message };
				if (res.error.field === 'password') fieldErrors = { password: res.error.message };
			}
		} catch (err: any) {
			formError = err?.message || 'Terjadi kesalahan sistem saat proses masuk.';
		} finally {
			isSubmitting = false;
		}
	}

	async function handleResetPassword(e: SubmitEvent) {
		e.preventDefault();
		resetError = null;
		resetSuccess = false;

		if (!resetEmail.trim() || !resetEmail.includes('@')) {
			resetError = 'Masukkan alamat email yang valid.';
			return;
		}

		isResetting = true;
		try {
			const res = await authUser.resetPassword(resetEmail);
			if (res.success) {
				resetSuccess = true;
				toast.info('Instruksi Terkirim', 'Tautan pemulihan kata sandi telah dikirim ke email Anda.');
			} else if (res.error) {
				resetError = res.error.message;
			}
		} catch (err: any) {
			resetError = err?.message || 'Gagal mengirim email pemulihan.';
		} finally {
			isResetting = false;
		}
	}
</script>

<svelte:head>
	<title>Masuk — Botanidex</title>
</svelte:head>

<div class="max-w-md mx-auto py-6 sm:py-12">
	<!-- Tombol Kembali -->
	<a
		href="/"
		class="inline-flex items-center gap-2 text-xs font-black text-stone-600 hover:text-[#0D0D0D] mb-4 transition-colors"
	>
		<ArrowLeft class="w-4 h-4 stroke-[2.5]" />
		<span>Kembali</span>
	</a>

	<!-- Kartu Utama Form Login Neo-Brutalist -->
	<div
		class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] p-6 sm:p-8 flex flex-col gap-6"
	>
		<!-- Header Kartu Bersih -->
		<div class="flex items-center gap-3.5">
			<div
				class="w-12 h-12 rounded-2xl bg-white border-2 border-[#0D0D0D] shadow-[2.5px_2.5px_0px_#0D0D0D] p-1 flex items-center justify-center shrink-0"
			>
				<img
					src="/SMK-Pertanian-Gorontalo.png"
					alt="Logo SMK PPN Gorontalo"
					class="w-full h-full object-contain"
				/>
			</div>
			<div>
				<h1 class="text-2xl font-black text-[#0D0D0D] tracking-tight leading-tight">Masuk Akun</h1>
				<p class="text-xs text-stone-500 font-bold">Botanidex SMK PPN Gorontalo</p>
			</div>
		</div>

		<!-- Pesan Query Redirect jika ada -->
		{#if queryMessage}
			<div
				class="p-3 bg-[#FFFBEB] border-2 border-[#0D0D0D] rounded-xl text-xs font-bold text-[#0D0D0D] flex items-center gap-2 shadow-[2px_2px_0px_#0D0D0D]"
			>
				<AlertCircle class="w-4 h-4 text-[#D97706] shrink-0 stroke-[2.5]" />
				<span>{queryMessage}</span>
			</div>
		{/if}

		<!-- Error Form Banner -->
		{#if formError}
			<div
				class="p-3.5 bg-red-50 border-2 border-[#E07A5F] rounded-xl text-xs font-bold text-[#E07A5F] flex items-start gap-2.5 shadow-[2px_2px_0px_#E07A5F]"
			>
				<AlertCircle class="w-4 h-4 text-[#E07A5F] shrink-0 mt-0.5 stroke-[2.5]" />
				<div class="flex-1 leading-relaxed">
					<p class="font-black text-[#0D0D0D]">Gagal Masuk</p>
					<p>{formError}</p>
				</div>
			</div>
		{/if}

		<!-- FORM LOGIN -->
		<form onsubmit={handleLogin} class="flex flex-col gap-4">
			<!-- Input Email -->
			<div class="flex flex-col gap-1.5">
				<label for="login-email" class="text-xs font-black text-[#0D0D0D] uppercase tracking-wider flex items-center gap-1.5">
					<Mail class="w-3.5 h-3.5 text-stone-600 stroke-[2.5]" />
					<span>Email</span>
				</label>
				<Input
					id="login-email"
					type="email"
					placeholder="nama@sekolah.id"
					bind:value={email}
					error={fieldErrors.email}
					autocomplete="email"
					required
				/>
			</div>

			<!-- Input Password -->
			<div class="flex flex-col gap-1.5">
				<div class="flex items-center justify-between">
					<label for="login-password" class="text-xs font-black text-[#0D0D0D] uppercase tracking-wider flex items-center gap-1.5">
						<Lock class="w-3.5 h-3.5 text-stone-600 stroke-[2.5]" />
						<span>Kata Sandi</span>
					</label>
					<button
						type="button"
						onclick={() => (showResetModal = true)}
						class="text-[11px] font-bold text-stone-500 hover:text-[#0D0D0D] underline decoration-stone-300 cursor-pointer"
					>
						Lupa kata sandi?
					</button>
				</div>
				<div class="relative">
					<input
						id="login-password"
						type={showPassword ? 'text' : 'password'}
						placeholder="••••••••"
						bind:value={password}
						autocomplete="current-password"
						required
						class="w-full px-3.5 py-2.5 pr-10 text-sm bg-white border-2 border-[#0D0D0D] rounded-xl shadow-[2px_2px_0px_#0D0D0D] focus:shadow-[4px_4px_0px_#0D0D0D] focus:-translate-x-0.5 focus:-translate-y-0.5 transition-all outline-none text-[#0D0D0D] placeholder:text-stone-400 {fieldErrors.password
							? 'border-[#E07A5F] bg-red-50/30'
							: 'focus:border-[#0D0D0D]'}"
					/>
					<button
						type="button"
						onclick={() => (showPassword = !showPassword)}
						class="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-[#0D0D0D] cursor-pointer"
						aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
					>
						{#if showPassword}
							<EyeOff class="w-4 h-4 stroke-[2.2]" />
						{:else}
							<Eye class="w-4 h-4 stroke-[2.2]" />
						{/if}
					</button>
				</div>
				{#if fieldErrors.password}
					<p class="text-xs font-bold text-[#E07A5F] mt-0.5">{fieldErrors.password}</p>
				{/if}
			</div>

			<!-- Checkbox Ingat Saya -->
			<label class="flex items-center gap-2 cursor-pointer select-none text-xs font-bold text-stone-700 mt-0.5">
				<input
					type="checkbox"
					bind:checked={rememberMe}
					class="w-4 h-4 rounded border-2 border-[#0D0D0D] accent-[#D4F469] cursor-pointer"
				/>
				<span>Ingat saya</span>
			</label>

			<!-- Tombol Submit -->
			<Button
				type="submit"
				variant="primary"
				fullWidth
				loading={isSubmitting || $authLoading}
				class="mt-1 text-sm font-black py-3"
			>
				<LogIn class="w-4 h-4 stroke-[2.5]" />
				<span>Masuk</span>
			</Button>
		</form>
	</div>
</div>

<!-- MODAL RESET KATA SANDI -->
{#if showResetModal}
	<div
		class="fixed inset-0 z-50 bg-[#0D0D0D]/60 backdrop-blur-xs flex items-center justify-center p-4"
	>
		<div
			class="bg-white rounded-3xl border-2 border-[#0D0D0D] shadow-[6px_6px_0px_#0D0D0D] max-w-sm w-full p-6 flex flex-col gap-4 relative animate-in fade-in duration-200"
		>
			<button
				type="button"
				onclick={() => (showResetModal = false)}
				class="absolute top-4 right-4 text-stone-500 hover:text-[#0D0D0D] cursor-pointer"
				aria-label="Tutup modal"
			>
				<X class="w-5 h-5 stroke-[2.5]" />
			</button>

			<div class="flex items-center gap-3">
				<div
					class="w-10 h-10 rounded-xl bg-[#FBBF24] border border-[#0D0D0D] flex items-center justify-center text-[#0D0D0D] shrink-0"
				>
					<KeyRound class="w-5 h-5 stroke-[2.5]" />
				</div>
				<div>
					<h3 class="text-base font-black text-[#0D0D0D]">Lupa Kata Sandi</h3>
					<p class="text-xs text-stone-600 font-semibold">Kirim instruksi pemulihan via email</p>
				</div>
			</div>

			{#if resetSuccess}
				<div class="p-3 bg-green-50 border border-green-300 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2">
					<CheckCircle2 class="w-4 h-4 text-green-600 shrink-0" />
					<span>Instruksi pemulihan kata sandi telah dikirim ke {resetEmail}. Silakan periksa inbox Anda.</span>
				</div>
				<Button variant="outline" onclick={() => (showResetModal = false)} fullWidth>
					Tutup
				</Button>
			{:else}
				{#if resetError}
					<div class="p-2.5 bg-red-50 border border-red-300 rounded-xl text-xs font-bold text-[#E07A5F]">
						{resetError}
					</div>
				{/if}

				<form onsubmit={handleResetPassword} class="flex flex-col gap-3">
					<Input
						label="Email Terdaftar"
						type="email"
						placeholder="nama@sekolah.id"
						bind:value={resetEmail}
						required
					/>
					<div class="flex items-center justify-end gap-2 mt-2">
						<button
							type="button"
							onclick={() => (showResetModal = false)}
							class="px-3.5 py-2 text-xs font-bold text-stone-600 hover:text-[#0D0D0D] cursor-pointer"
						>
							Batal
						</button>
						<Button type="submit" variant="primary" size="sm" loading={isResetting}>
							Kirim Tautan
						</Button>
					</div>
				</form>
			{/if}
		</div>
	</div>
{/if}
