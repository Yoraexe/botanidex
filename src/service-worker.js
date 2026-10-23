// ==============================================================================
// Botanidex — PWA Service Worker (SvelteKit 3)
// Tujuan: Menyediakan kapabilitas offline-first untuk caching aset statis dan katalog
// Caller: Browser Service Worker runtime
// Dependensi: $app/manifest, $app/env (SvelteKit 3)
// Main Functions: toUrlPath, install, activate, fetch event listeners
// Side Effects: Cache storage read/write, network fetch interception
// ==============================================================================

import { immutable, assets, prerendered } from '$app/manifest';
import { version } from '$app/env';

const CACHE_NAME = `botanidex-cache-${version}`;

function toUrlPath(item) {
	const raw = typeof item === 'string' ? item : item?.path || '';
	if (!raw) return null;
	return raw.startsWith('/') ? raw : `/${raw}`;
}

const ASSETS_TO_CACHE = Array.from(
	new Set(
		[
			'/',
			...Array.from(immutable || []).map(toUrlPath),
			...Array.from(assets || []).map(toUrlPath),
			...Array.from(prerendered || []).map(toUrlPath)
		].filter(Boolean)
	)
);

self.addEventListener('install', (event) => {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(async (cache) => {
				await cache.addAll(ASSETS_TO_CACHE);
			})
			.then(() => {
				self.skipWaiting();
			})
	);
});

self.addEventListener('activate', (event) => {
	event.waitUntil(
		caches
			.keys()
			.then(async (keys) => {
				for (const key of keys) {
					if (key !== CACHE_NAME) {
						await caches.delete(key);
					}
				}
			})
			.then(() => {
				self.clients.claim();
			})
	);
});

self.addEventListener('fetch', (event) => {
	let url;
	try {
		url = new URL(event.request.url);
	} catch {
		return;
	}

	// Hanya intercept protokol http/https, metode GET, dan bukan internal Vite/Supabase Auth
	if (
		(url.protocol !== 'http:' && url.protocol !== 'https:') ||
		event.request.method !== 'GET' ||
		url.pathname.includes('/auth/v1/') ||
		url.pathname.includes('/storage/v1/') ||
		url.pathname.startsWith('/@') ||
		url.pathname.includes('node_modules') ||
		url.searchParams.has('import') ||
		url.searchParams.has('v') ||
		url.pathname.endsWith('.svelte')
	) {
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cachedResponse) => {
			if (cachedResponse) {
				return cachedResponse;
			}

			return fetch(event.request)
				.then((networkResponse) => {
					if (
						networkResponse &&
						networkResponse.status === 200 &&
						networkResponse.type === 'basic'
					) {
						const responseToCache = networkResponse.clone();
						caches.open(CACHE_NAME).then((cache) => {
							cache.put(event.request, responseToCache);
						});
					}
					return networkResponse;
				})
				.catch(async () => {
					if (event.request.headers.get('accept')?.includes('text/html')) {
						const fallback = await caches.match('/');
						if (fallback) return fallback;
					}
					return new Response('Offline: Konten belum di-cache', {
						status: 503,
						statusText: 'Service Unavailable'
					});
				});
		})
	);
});
