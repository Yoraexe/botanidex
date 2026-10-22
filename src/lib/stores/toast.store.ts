// ==============================================================================
// Botanidex — Toast Notification Store
// Tujuan: State manager untuk menampilkan alert toast melayang (sukses, error, info)
// Caller: UI components, form submitters, error catchers
// Dependensi: svelte/store
// Main Functions: toastStore, showToast, showSuccess, showError
// Side Effects: Timer-based auto-dismissal
// ==============================================================================

import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
}

function createToastStore() {
	const { subscribe, update } = writable<ToastItem[]>([]);

	function remove(id: string) {
		update((items) => items.filter((item) => item.id !== id));
	}

	function add(toast: Omit<ToastItem, 'id'>) {
		const id = Math.random().toString(36).substring(2, 9);
		const newItem: ToastItem = { ...toast, id };
		const duration = toast.duration ?? 4500;

		update((items) => [...items, newItem]);

		if (duration > 0 && typeof window !== 'undefined') {
			setTimeout(() => {
				remove(id);
			}, duration);
		}
		return id;
	}

	return {
		subscribe,
		add,
		remove,
		success: (title: string, message?: string) => add({ type: 'success', title, message }),
		error: (title: string, message?: string) => add({ type: 'error', title, message }),
		warning: (title: string, message?: string) => add({ type: 'warning', title, message }),
		info: (title: string, message?: string) => add({ type: 'info', title, message })
	};
}

export const toast = createToastStore();
