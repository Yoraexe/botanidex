# Flora SMK — Architecture Document
## Engineering Layer Output — v1.0

---

## 1. Tech Stack (Final)

| Layer | Technology | Version |
|---|---|---|
| Framework | SvelteKit | 2.x (latest) |
| Language | TypeScript | 5.x |
| Styling | Tailwind CSS | 4.x |
| Database | Supabase (PostgreSQL) | Hosted |
| Auth | Supabase Auth | Built-in |
| Storage | Supabase Storage | Built-in |
| QR Code | `qrcode` (npm) | Client-side generation |
| QR Scanner | Native `BarcodeDetector` API → fallback `html5-qrcode` | Browser-native first |
| Map | Custom canvas/SVG overlay on image | No external map lib |
| Deployment | Vercel | adapter-vercel |
| Package Manager | pnpm | 9.x |

---

## 2. Folder Structure

```
flora-smk/
├── .astesia/                          # Astesia pipeline artifacts
├── src/
│   ├── lib/
│   │   ├── components/
│   │   │   ├── ui/                    # Reusable UI primitives
│   │   │   │   ├── Button.svelte
│   │   │   │   ├── Input.svelte
│   │   │   │   ├── Badge.svelte
│   │   │   │   ├── Card.svelte
│   │   │   │   ├── Toast.svelte
│   │   │   │   ├── Modal.svelte
│   │   │   │   ├── Skeleton.svelte
│   │   │   │   └── FilterChip.svelte
│   │   │   ├── plant/                 # Plant domain components
│   │   │   │   ├── PlantCard.svelte
│   │   │   │   ├── PlantDetail.svelte
│   │   │   │   ├── PlantForm.svelte
│   │   │   │   ├── PlantGallery.svelte
│   │   │   │   ├── PlantTaxonomy.svelte
│   │   │   │   └── PlantVideoSection.svelte
│   │   │   ├── map/                   # Map components
│   │   │   │   ├── SchoolMap.svelte
│   │   │   │   ├── MapMarker.svelte
│   │   │   │   └── MapEditor.svelte
│   │   │   ├── qr/                    # QR components
│   │   │   │   ├── QrScanner.svelte
│   │   │   │   └── QrGenerator.svelte
│   │   │   └── layout/               # Layout components
│   │   │       ├── Navbar.svelte
│   │   │       ├── BottomNav.svelte
│   │   │       ├── SearchBar.svelte
│   │   │       └── OfflineBanner.svelte
│   │   ├── services/                  # Business logic (framework-agnostic)
│   │   │   ├── plant.service.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── contribution.service.ts
│   │   │   ├── storage.service.ts
│   │   │   └── map.service.ts
│   │   ├── repositories/             # Data access (Supabase queries)
│   │   │   ├── plant.repository.ts
│   │   │   ├── user.repository.ts
│   │   │   ├── contribution.repository.ts
│   │   │   └── map.repository.ts
│   │   ├── types/                     # TypeScript types
│   │   │   ├── plant.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── contribution.types.ts
│   │   │   └── map.types.ts
│   │   ├── schemas/                   # Zod validation schemas
│   │   │   ├── plant.schema.ts
│   │   │   └── contribution.schema.ts
│   │   ├── utils/                     # Pure utilities
│   │   │   ├── image-compress.ts
│   │   │   ├── slug.ts
│   │   │   └── format.ts
│   │   ├── stores/                    # Svelte stores (global state)
│   │   │   ├── auth.store.ts
│   │   │   └── toast.store.ts
│   │   └── supabase.ts               # Supabase client init
│   ├── routes/
│   │   ├── +layout.svelte             # Root layout (navbar, toast)
│   │   ├── +layout.server.ts          # Root server load (auth session)
│   │   ├── +page.svelte               # Landing / Beranda
│   │   ├── katalog/
│   │   │   ├── +page.svelte           # Catalog grid
│   │   │   ├── +page.server.ts        # Load plants with search/filter
│   │   │   └── [slug]/
│   │   │       ├── +page.svelte       # Plant detail
│   │   │       └── +page.server.ts    # Load single plant
│   │   ├── peta/
│   │   │   └── +page.svelte           # Interactive map
│   │   ├── scan/
│   │   │   └── +page.svelte           # QR scanner
│   │   ├── login/
│   │   │   └── +page.svelte           # Login form
│   │   ├── register/
│   │   │   └── +page.svelte           # Student registration
│   │   ├── kontribusi/
│   │   │   ├── +page.svelte           # My contributions
│   │   │   ├── +page.server.ts
│   │   │   └── tambah/
│   │   │       ├── +page.svelte       # Add plant form
│   │   │       └── +page.server.ts    # Form action
│   │   └── admin/
│   │       ├── +layout.svelte         # Admin layout (sidebar)
│   │       ├── +layout.server.ts      # Admin auth guard
│   │       ├── +page.svelte           # Dashboard stats
│   │       ├── moderasi/
│   │       │   ├── +page.svelte       # Moderation queue
│   │       │   └── +page.server.ts
│   │       ├── tanaman/
│   │       │   ├── +page.svelte       # All plants CRUD
│   │       │   ├── +page.server.ts
│   │       │   ├── tambah/
│   │       │   │   └── +page.svelte
│   │       │   └── [id]/
│   │       │       ├── +page.svelte   # Edit plant
│   │       │       └── +page.server.ts
│   │       ├── peta/
│   │       │   └── +page.svelte       # Map editor
│   │       └── users/
│   │           └── +page.svelte       # User management
│   ├── app.css                        # Global styles + Tailwind + tokens
│   ├── app.html                       # HTML shell
│   ├── hooks.server.ts                # Supabase auth hook
│   └── service-worker.ts             # PWA service worker
├── static/
│   ├── manifest.json                  # PWA manifest
│   ├── favicon.ico
│   ├── icons/                         # PWA icons
│   └── placeholder-plant.webp         # Fallback image
├── supabase/
│   └── migrations/                    # SQL migrations
│       └── 001_initial_schema.sql
├── tests/
│   ├── unit/
│   │   ├── plant.service.test.ts
│   │   └── slug.test.ts
│   └── setup.ts
├── svelte.config.js
├── tailwind.config.ts
├── vite.config.ts
├── tsconfig.json
├── package.json
└── .env.example
```

---

## 3. Database Schema (Supabase PostgreSQL)

```sql
-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE plant_category AS ENUM (
  'hias', 'pangan', 'obat', 'kayu', 'industri', 'lainnya'
);

CREATE TYPE contribution_status AS ENUM (
  'pending', 'approved', 'rejected'
);

CREATE TYPE user_role AS ENUM (
  'viewer', 'contributor', 'admin'
);

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'contributor',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plants table
CREATE TABLE public.plants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name_local TEXT NOT NULL,
  name_latin TEXT NOT NULL,
  name_english TEXT,
  aliases TEXT[] DEFAULT '{}',
  category plant_category NOT NULL DEFAULT 'lainnya',
  -- Taxonomy
  taxonomy_kingdom TEXT DEFAULT 'Plantae',
  taxonomy_divisio TEXT,
  taxonomy_classis TEXT,
  taxonomy_ordo TEXT,
  taxonomy_familia TEXT,
  taxonomy_genus TEXT,
  taxonomy_species TEXT,
  -- Content
  description TEXT NOT NULL,
  -- Location on school map
  location_x REAL,
  location_y REAL,
  location_label TEXT,
  -- Meta
  status contribution_status NOT NULL DEFAULT 'approved',
  contributor_id UUID REFERENCES public.profiles(id),
  reviewed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plant photos
CREATE TABLE public.plant_photos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  label TEXT, -- habitus, daun, bunga, buah, biji
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Plant videos (student explanations)
CREATE TABLE public.plant_videos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plant_id UUID NOT NULL REFERENCES public.plants(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  thumbnail_path TEXT,
  title TEXT NOT NULL,
  duration_seconds INT,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  status contribution_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES public.profiles(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- School map
CREATE TABLE public.school_maps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  image_path TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  uploaded_by UUID NOT NULL REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_plants_slug ON public.plants(slug);
CREATE INDEX idx_plants_category ON public.plants(category);
CREATE INDEX idx_plants_status ON public.plants(status);
CREATE INDEX idx_plants_name_local ON public.plants USING gin(to_tsvector('indonesian', name_local));
CREATE INDEX idx_plants_name_latin ON public.plants USING gin(to_tsvector('simple', name_latin));
CREATE INDEX idx_plant_photos_plant_id ON public.plant_photos(plant_id);
CREATE INDEX idx_plant_videos_plant_id ON public.plant_videos(plant_id);
CREATE INDEX idx_plant_videos_status ON public.plant_videos(status);

-- Full-text search function
CREATE OR REPLACE FUNCTION search_plants(search_query TEXT)
RETURNS SETOF public.plants AS $$
  SELECT *
  FROM public.plants
  WHERE status = 'approved'
    AND (
      to_tsvector('indonesian', name_local) @@ plainto_tsquery('indonesian', search_query)
      OR to_tsvector('simple', name_latin) @@ plainto_tsquery('simple', search_query)
      OR to_tsvector('english', COALESCE(name_english, '')) @@ plainto_tsquery('english', search_query)
      OR name_local ILIKE '%' || search_query || '%'
      OR name_latin ILIKE '%' || search_query || '%'
      OR search_query = ANY(aliases)
    )
  ORDER BY
    ts_rank(to_tsvector('indonesian', name_local), plainto_tsquery('indonesian', search_query)) DESC,
    name_local ASC;
$$ LANGUAGE sql STABLE;

-- RLS Policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plant_videos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.school_maps ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read all, update own
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Plants: public read approved, contributors insert, admins full
CREATE POLICY "Approved plants are viewable by everyone" ON public.plants
  FOR SELECT USING (status = 'approved' OR contributor_id = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Contributors can insert plants" ON public.plants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update plants" ON public.plants
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Admins can delete plants" ON public.plants
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Photos: public read, auth insert, admins delete
CREATE POLICY "Photos are viewable by everyone" ON public.plant_photos FOR SELECT USING (true);
CREATE POLICY "Auth users can insert photos" ON public.plant_photos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can delete photos" ON public.plant_photos
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Videos: read approved or own, auth insert, admin update
CREATE POLICY "Approved videos viewable by everyone" ON public.plant_videos
  FOR SELECT USING (status = 'approved' OR uploaded_by = auth.uid() OR EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
CREATE POLICY "Auth users can insert videos" ON public.plant_videos
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Admins can update videos" ON public.plant_videos
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));

-- Maps: public read, admin write
CREATE POLICY "Maps are viewable by everyone" ON public.school_maps FOR SELECT USING (true);
CREATE POLICY "Admins can manage maps" ON public.school_maps
  FOR ALL USING (EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  ));
```

---

## 4. Task Waves (Execution Plan)

### Wave 1: Foundation
1. Project scaffolding (SvelteKit + Tailwind + TypeScript)
2. Supabase client setup + environment config
3. Database migration (schema above)
4. Auth hook + session management
5. Root layout + global styles (design tokens)
6. PWA manifest + service worker skeleton

### Wave 2: Core Domain
7. Types + Zod schemas
8. Repository layer (plant, user, contribution)
9. Service layer (plant, auth, contribution, storage)
10. Plant catalog page (search + filter + grid)
11. Plant detail page (gallery, taxonomy, video, map link)
12. UI primitives (Button, Input, Badge, Card, Toast, Skeleton)
13. PlantCard component

### Wave 3: Interactive Features
14. QR Scanner page (BarcodeDetector API + fallback)
15. QR Generator (admin)
16. Interactive map (custom image + markers)
17. Map editor (admin drag-drop markers)
18. Contribution form (student plant submission)
19. Moderation dashboard (admin)

### Wave 4: Polish & Integration
20. Login + Register pages
21. Student contributions dashboard
22. Admin plant CRUD
23. Offline support (service worker caching strategy)
24. Image compression utility
25. Toast notifications
26. Landing page (hero + stats)

---

*Architecture document complete. Ready for Engineering execution.*
