// ==============================================================================
// Flora SMK — Seed & Offline Fallback Plant Dataset
// Tujuan: Data botani referensi SMK PPN Gorontalo untuk offline-first dan inisialisasi awal
// Caller: Plant repository, database seeding
// Dependensi: Plant type
// Main Functions: INITIAL_PLANTS_DATA
// Side Effects: none (static seed data)
// ==============================================================================

import type { Plant } from '../types/plant.types';

export const INITIAL_PLANTS_DATA: Plant[] = [
	{
		id: '11111111-1111-1111-1111-111111111111',
		slug: 'jahe-merah',
		name_local: 'Jahe Merah',
		name_latin: 'Zingiber officinale var. rubrum',
		name_english: 'Red Ginger',
		aliases: ['Haldi Merah', 'Lia Merah', 'Beuing'],
		category: 'obat',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Liliopsida',
			ordo: 'Zingiberales',
			familia: 'Zingiberaceae',
			genus: 'Zingiber',
			species: 'Zingiber officinale'
		},
		description:
			'Jahe merah (Zingiber officinale var. rubrum) merupakan tanaman rimpang terna semusim dengan tinggi 40–100 cm. Kulit rimpang berwarna merah jingga hingga merah tua dengan serat lebih kasar dan rasa pedas yang jauh lebih tajam dibanding jahe gajah atau jahe emprit karena kandungan gingerol dan shogaol yang tinggi. Biasa dibudidayakan di kebun toga SMK PPN Gorontalo sebagai bahan fitofarmaka dan minuman herbal penghangat tubuh.',
		location_x: 38.0,
		location_y: 25.0,
		location_label: 'Kebun Tanaman Obat (TOGA) Blok A-1',
		status: 'approved',
		contributor_name: 'Ahmad Fauzi (Siswa XII Agribisnis)',
		photos: [
			{
				id: 'p-101',
				plant_id: '11111111-1111-1111-1111-111111111111',
				storage_path: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=1200&q=80',
				label: 'Rimpang & Habitus',
				sort_order: 0
			},
			{
				id: 'p-102',
				plant_id: '11111111-1111-1111-1111-111111111111',
				storage_path: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1200&q=80',
				label: 'Daun & Batang Semu',
				sort_order: 1
			}
		],
		videos: [
			{
				id: 'v-101',
				plant_id: '11111111-1111-1111-1111-111111111111',
				storage_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
				thumbnail_path: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=600&q=80',
				title: 'Identifikasi Morfologi & Panen Jahe Merah oleh Siswa ATPH',
				duration_seconds: 154,
				uploaded_by_name: 'Ahmad Fauzi & Tim Praktikum Agribisnis',
				status: 'approved',
				created_at: '2026-10-18T09:30:00Z'
			}
		],
		created_at: '2026-10-15T08:00:00Z',
		updated_at: '2026-10-18T10:00:00Z'
	},
	{
		id: '22222222-2222-2222-2222-222222222222',
		slug: 'jagung-hibrida',
		name_local: 'Jagung Hibrida',
		name_latin: 'Zea mays L.',
		name_english: 'Corn / Maize',
		aliases: ['Milu', 'Jagong', 'Kastela'],
		category: 'pangan',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Liliopsida',
			ordo: 'Poales',
			familia: 'Poaceae',
			genus: 'Zea',
			species: 'Zea mays'
		},
		description:
			'Jagung hibrida merupakan tanaman pangan serealia semusim berakar serabut dengan batang tegak beruas-ruas. Tanaman ini adalah salah satu komoditas praktikum agronomi utama di lahan terbuka SMK PPN Gorontalo, dengan fokus pembelajaran teknik penyerbukan silang, pemupukan berimbang NPK, dan penanganan pascapanen tongkol jagung.',
		location_x: 82.0,
		location_y: 22.0,
		location_label: 'Lahan Praktikum Pangan Bedeng C-4',
		status: 'approved',
		contributor_name: 'Budi Santoso (Siswa XI ATPH 2)',
		photos: [
			{
				id: 'p-201',
				plant_id: '22222222-2222-2222-2222-222222222222',
				storage_path: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=1200&q=80',
				label: 'Tongkol Jagung Siap Panen',
				sort_order: 0
			},
			{
				id: 'p-202',
				plant_id: '22222222-2222-2222-2222-222222222222',
				storage_path: 'https://images.unsplash.com/photo-1595855759920-86582396756a?auto=format&fit=crop&w=1200&q=80',
				label: 'Lahan Pertanaman Jagung',
				sort_order: 1
			}
		],
		videos: [
			{
				id: 'v-201',
				plant_id: '22222222-2222-2222-2222-222222222222',
				storage_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
				thumbnail_path: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=600&q=80',
				title: 'Teknik Polinasi Buatan pada Jagung Hibrida',
				duration_seconds: 188,
				uploaded_by_name: 'Budi Santoso',
				status: 'approved',
				created_at: '2026-10-19T11:00:00Z'
			}
		],
		created_at: '2026-10-16T08:00:00Z',
		updated_at: '2026-10-19T11:00:00Z'
	},
	{
		id: '33333333-3333-3333-3333-333333333333',
		slug: 'anggrek-bulan',
		name_local: 'Anggrek Bulan',
		name_latin: 'Phalaenopsis amabilis (L.) Blume',
		name_english: 'Moon Orchid',
		aliases: ['Puspa Pesona', 'Anggrek Menur'],
		category: 'hias',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Liliopsida',
			ordo: 'Asparagales',
			familia: 'Orchidaceae',
			genus: 'Phalaenopsis',
			species: 'Phalaenopsis amabilis'
		},
		description:
			'Anggrek bulan merupakan salah satu bunga nasional Indonesia bergelar Puspa Pesona. Merupakan tumbuhan epifit dengan daun tebal berdaging dan bunga berwarna putih bersih dengan lidah bercak kekuningan. Di SMK PPN Gorontalo, anggrek bulan dibudidayakan di dalam Greenhouse Florikultura dengan naungan paranet 65% dan sistem kabut otomatis untuk kontrol kelembaban.',
		location_x: 46.0,
		location_y: 52.0,
		location_label: 'Greenhouse Florikultura & Kultur Jaringan',
		status: 'approved',
		contributor_name: 'Siti Rahmawati (Siswa XII Florikultura)',
		photos: [
			{
				id: 'p-301',
				plant_id: '33333333-3333-3333-3333-333333333333',
				storage_path: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=1200&q=80',
				label: 'Bunga Mekar Sempurna',
				sort_order: 0
			},
			{
				id: 'p-302',
				plant_id: '33333333-3333-3333-3333-333333333333',
				storage_path: 'https://images.unsplash.com/photo-1567696911980-2eed69a46042?auto=format&fit=crop&w=1200&q=80',
				label: 'Greenhouse Koleksi Anggrek',
				sort_order: 1
			}
		],
		videos: [
			{
				id: 'v-301',
				plant_id: '33333333-3333-3333-3333-333333333333',
				storage_path: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4',
				thumbnail_path: 'https://images.unsplash.com/photo-1525310072745-f49212b5ac6d?auto=format&fit=crop&w=600&q=80',
				title: 'Perbanyakan Anggrek Bulan Aklimatisasi Planlet',
				duration_seconds: 215,
				uploaded_by_name: 'Siti Rahmawati & Tim Kultur Jaringan',
				status: 'approved',
				created_at: '2026-10-20T14:15:00Z'
			}
		],
		created_at: '2026-10-17T09:00:00Z',
		updated_at: '2026-10-20T14:15:00Z'
	},
	{
		id: '44444444-4444-4444-4444-444444444444',
		slug: 'lidah-buaya',
		name_local: 'Lidah Buaya',
		name_latin: 'Aloe vera (L.) Burm.f.',
		name_english: 'Aloe Vera',
		aliases: ['Jadam', 'Aloe'],
		category: 'obat',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Liliopsida',
			ordo: 'Asparagales',
			familia: 'Asphodelaceae',
			genus: 'Aloe',
			species: 'Aloe vera'
		},
		description:
			'Lidah buaya adalah tanaman sukulen berdaun tebal berdaging dengan tepi bergerigi lunak. Gel bening di dalam daun mengandung polisakarida, vitamin, dan asam amino esensial yang efektif menyembuhkan luka bakar, melembabkan kulit, serta diolah menjadi minuman nata de aloe vera oleh jurusan Agribisnis Pengolahan Hasil Pertanian (APHP).',
		location_x: 52.0,
		location_y: 25.0,
		location_label: 'Kebun Tanaman Obat (TOGA) Blok B-2',
		status: 'approved',
		contributor_name: 'Dewi Lestari (Siswa XI APHP)',
		photos: [
			{
				id: 'p-401',
				plant_id: '44444444-4444-4444-4444-444444444444',
				storage_path: 'https://images.unsplash.com/photo-1596547609652-9cf5d8d76921?auto=format&fit=crop&w=1200&q=80',
				label: 'Daun Sukulen Segar',
				sort_order: 0
			}
		],
		videos: [],
		created_at: '2026-10-18T10:00:00Z',
		updated_at: '2026-10-18T10:00:00Z'
	},
	{
		id: '55555555-5555-5555-5555-555555555555',
		slug: 'kopi-robusta',
		name_local: 'Kopi Robusta',
		name_latin: 'Coffea canephora Pierre ex A.Froehner',
		name_english: 'Robusta Coffee',
		aliases: ['Kopi Kahwa', 'Coffee Robusta'],
		category: 'industri',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Magnoliopsida',
			ordo: 'Gentianales',
			familia: 'Rubiaceae',
			genus: 'Coffea',
			species: 'Coffea canephora'
		},
		description:
			'Kopi Robusta tumbuh optimal di dataran rendah hingga sedang (200–800 mdpl). Memiliki kadar kafein lebih tinggi dibanding Arabika dengan daya tahan lebih kokoh terhadap serangan karat daun (Hemileia vastatrix). Pohon kopi di kebun sekolah digunakan untuk melatih siswa teknik pemangkasan bentuk, okulasi sambung pucuk, dan petik merah ceri.',
		location_x: 75.0,
		location_y: 43.0,
		location_label: 'Kebun Praktikum Perkebunan Blok Selatan',
		status: 'approved',
		contributor_name: 'Rian Hidayat (Siswa XII Agribisnis Perkebunan)',
		photos: [
			{
				id: 'p-501',
				plant_id: '55555555-5555-5555-5555-555555555555',
				storage_path: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=1200&q=80',
				label: 'Buah Ceri Kopi Matang Pohon',
				sort_order: 0
			}
		],
		videos: [],
		created_at: '2026-10-18T14:00:00Z',
		updated_at: '2026-10-18T14:00:00Z'
	},
	{
		id: '66666666-6666-6666-6666-666666666666',
		slug: 'kakao-cokelat',
		name_local: 'Kakao (Pohon Cokelat)',
		name_latin: 'Theobroma cacao L.',
		name_english: 'Cocoa Tree',
		aliases: ['Cokelat', 'Pokok Coklat'],
		category: 'industri',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Magnoliopsida',
			ordo: 'Malvales',
			familia: 'Malvaceae',
			genus: 'Theobroma',
			species: 'Theobroma cacao'
		},
		description:
			'Kakao merupakan pohon berdaun rindang asal Amerika Selatan dengan sifat kauliflori unik, di mana bunga dan buah muncul langsung dari batang pokok atau cabang tua. Buah kakao diolah siswa SMK PPN Gorontalo dari proses fermentasi biji, penjemuran, pemanggangan (roasting), hingga menjadi bubuk cokelat dan pasta cokelat bernilai jual.',
		location_x: 89.0,
		location_y: 43.0,
		location_label: 'Kebun Kakao Pembibitan Terpadu',
		status: 'approved',
		contributor_name: 'Faisal Basri (Siswa XI ATPH 1)',
		photos: [
			{
				id: 'p-601',
				plant_id: '66666666-6666-6666-6666-666666666666',
				storage_path: 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?auto=format&fit=crop&w=1200&q=80',
				label: 'Buah Kakao di Batang Pohon',
				sort_order: 0
			}
		],
		videos: [],
		created_at: '2026-10-19T08:30:00Z',
		updated_at: '2026-10-19T08:30:00Z'
	},
	{
		id: '77777777-7777-7777-7777-777777777777',
		slug: 'kelapa-sawit',
		name_local: 'Kelapa Sawit',
		name_latin: 'Elaeis guineensis Jacq.',
		name_english: 'African Oil Palm',
		aliases: ['Sawit', 'Palma Minyak'],
		category: 'industri',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Liliopsida',
			ordo: 'Arecales',
			familia: 'Arecaceae',
			genus: 'Elaeis',
			species: 'Elaeis guineensis'
		},
		description:
			'Kelapa sawit adalah tanaman penghasil minyak nabati paling efisien per hektar di dunia. Di area demonstrasi plot SMK PPN Gorontalo, tanaman sawit difungsikan untuk pengenalan anatomi tandan buah segar (TBS), pemupukan kalium, kastrasi bunga muda, serta pengenalan kumbang penyerbuk Elaeidobius kamerunicus.',
		location_x: 82.0,
		location_y: 57.0,
		location_label: 'Demplot Perkebunan Sawit Percobaan',
		status: 'approved',
		contributor_name: 'Hendra Gunawan (Siswa XII Agribisnis)',
		photos: [
			{
				id: 'p-701',
				plant_id: '77777777-7777-7777-7777-777777777777',
				storage_path: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?auto=format&fit=crop&w=1200&q=80',
				label: 'Pohon Sawit & Tandan Buah',
				sort_order: 0
			}
		],
		videos: [],
		created_at: '2026-10-19T10:00:00Z',
		updated_at: '2026-10-19T10:00:00Z'
	},
	{
		id: '88888888-8888-8888-8888-888888888888',
		slug: 'pohon-jati-emas',
		name_local: 'Jati Emas',
		name_latin: 'Tectona grandis L.f.',
		name_english: 'Teak Tree',
		aliases: ['Jati Unggul', 'Dulang Kayu'],
		category: 'kayu',
		taxonomy: {
			kingdom: 'Plantae',
			divisio: 'Tracheophyta',
			classis: 'Magnoliopsida',
			ordo: 'Lamiales',
			familia: 'Lamiaceae',
			genus: 'Tectona',
			species: 'Tectona grandis'
		},
		description:
			'Jati emas merupakan klon unggul jati dengan laju pertumbuhan vegetatif lebih cepat dan batang lurus silindris. Ditanam di batas terluar lahan SMK PPN Gorontalo sebagai sabuk hijau (windbreak) sekaligus media praktikum silvikultur, pengukuran diameter setinggi dada (DBH), dan taksasi volume kayu berdiri.',
		location_x: 13.0,
		location_y: 50.0,
		location_label: 'Hutan Sekolah & Pembatas Angin Barat',
		status: 'approved',
		contributor_name: 'Ir. Suhardi, M.P. (Guru Kehutanan & Pertanian)',
		photos: [
			{
				id: 'p-801',
				plant_id: '88888888-8888-8888-8888-888888888888',
				storage_path: 'https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?auto=format&fit=crop&w=1200&q=80',
				label: 'Tegakan Pohon Jati Emas',
				sort_order: 0
			}
		],
		videos: [],
		created_at: '2026-10-19T11:00:00Z',
		updated_at: '2026-10-19T11:00:00Z'
	}
];
