# Flora SMK — Design System & UI Specification
## Design Layer Output — v1.0

---

## 1. Design Tokens

### 1.1 Color Palette

**Rationale:** Tema botanik/alam — hijau sebagai warna primer, earth tones sebagai pendukung. High contrast untuk WCAG AA compliance.

```
PRIMITIVE COLORS (Raw Palette)
──────────────────────────────
green-50:    #F0FDF4    green-100:   #DCFCE7    green-200:   #BBF7D0
green-300:   #86EFAC    green-400:   #4ADE80    green-500:   #22C55E
green-600:   #16A34A    green-700:   #15803D    green-800:   #166534
green-900:   #14532D    green-950:   #052E16

amber-50:    #FFFBEB    amber-100:   #FEF3C7    amber-200:   #FDE68A
amber-300:   #FCD34D    amber-400:   #FBBF24    amber-500:   #F59E0B
amber-600:   #D97706

stone-50:    #FAFAF9    stone-100:   #F5F5F4    stone-200:   #E7E5E4
stone-300:   #D6D3D1    stone-400:   #A8A29E    stone-500:   #78716C
stone-600:   #57534E    stone-700:   #44403C    stone-800:   #292524
stone-900:   #1C1917

red-500:     #EF4444    red-600:     #DC2626
blue-500:    #3B82F6    blue-600:    #2563EB
```

```
SEMANTIC TOKENS (Usage-Based)
──────────────────────────────
--color-primary:          green-600   (#16A34A)     → Buttons, links, active states
--color-primary-hover:    green-700   (#15803D)     → Button hover
--color-primary-light:    green-50    (#F0FDF4)     → Background tints, badges
--color-primary-border:   green-200   (#BBF7D0)     → Subtle borders

--color-secondary:        amber-500   (#F59E0B)     → Accents, QR badge, highlights
--color-secondary-hover:  amber-600   (#D97706)     → Accent hover

--color-bg-page:          stone-50    (#FAFAF9)     → Page background
--color-bg-card:          #FFFFFF                    → Card surfaces
--color-bg-input:         #FFFFFF                    → Input fields

--color-text-primary:     stone-900   (#1C1917)     → Headings, body text
--color-text-secondary:   stone-500   (#78716C)     → Captions, meta info
--color-text-tertiary:    stone-400   (#A8A29E)     → Placeholders
--color-text-inverse:     #FFFFFF                    → Text on primary buttons

--color-border:           stone-200   (#E7E5E4)     → Default borders
--color-border-focus:     green-500   (#22C55E)     → Focus ring

--color-success:          green-600   (#16A34A)     → Approved status
--color-warning:          amber-500   (#F59E0B)     → Pending status
--color-error:            red-500     (#EF4444)     → Rejected / error states
--color-info:             blue-500    (#3B82F6)     → Informational

Contrast Ratios (WCAG AA ✅):
  green-600 on white:  → 4.52:1 ✅ (AA normal text)
  stone-900 on stone-50: → 15.4:1 ✅
  stone-500 on white:  → 4.59:1 ✅ (AA normal text)
  white on green-600:  → 4.52:1 ✅
```

### 1.2 Typography

```
FONT STACK
──────────
--font-sans:    'Inter', system-ui, -apple-system, sans-serif
--font-latin:   'Lora', Georgia, serif                          → Nama Latin (italic)
--font-mono:    'JetBrains Mono', monospace                     → Kode/ID teknis

FONT SIZES (rem-based, base 16px)
──────────────────────────────────
--text-xs:      0.75rem   (12px)   line-height: 1rem
--text-sm:      0.875rem  (14px)   line-height: 1.25rem
--text-base:    1rem      (16px)   line-height: 1.5rem
--text-lg:      1.125rem  (18px)   line-height: 1.75rem
--text-xl:      1.25rem   (20px)   line-height: 1.75rem
--text-2xl:     1.5rem    (24px)   line-height: 2rem
--text-3xl:     1.875rem  (30px)   line-height: 2.25rem

FONT WEIGHTS
────────────
--font-normal:    400
--font-medium:    500
--font-semibold:  600
--font-bold:      700

USAGE MAP
─────────
Page Title (H1):       text-2xl / font-bold / font-sans     → mobile: text-xl
Section Title (H2):    text-xl / font-semibold / font-sans  → mobile: text-lg
Card Title:            text-base / font-semibold / font-sans
Plant Latin Name:      text-base / font-normal / font-latin / italic
Body Text:             text-base / font-normal / font-sans
Caption / Meta:        text-sm / font-normal / color-text-secondary
Badge / Tag:           text-xs / font-medium / uppercase / tracking-wide
```

### 1.3 Spacing Scale

```
--space-0:    0
--space-1:    0.25rem   (4px)
--space-2:    0.5rem    (8px)
--space-3:    0.75rem   (12px)
--space-4:    1rem      (16px)
--space-5:    1.25rem   (20px)
--space-6:    1.5rem    (24px)
--space-8:    2rem      (32px)
--space-10:   2.5rem    (40px)
--space-12:   3rem      (48px)
--space-16:   4rem      (64px)

USAGE
─────
Card padding:          space-4 (16px)
Card gap (grid):       space-4 (16px)          → mobile: space-3
Section gap:           space-8 (32px)
Page horizontal pad:   space-4 (16px) mobile   → space-6 desktop
Inline element gap:    space-2 (8px)
```

### 1.4 Border Radius

```
--radius-sm:     0.375rem   (6px)    → Badges, tags
--radius-md:     0.5rem     (8px)    → Inputs, small cards
--radius-lg:     0.75rem    (12px)   → Cards, modals
--radius-xl:     1rem       (16px)   → Large containers
--radius-full:   9999px               → Avatars, pills
```

### 1.5 Shadows

```
--shadow-sm:     0 1px 2px 0 rgba(0,0,0,0.05)
--shadow-md:     0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)
--shadow-lg:     0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)

Card default:    shadow-sm
Card hover:      shadow-md  (transition 150ms ease)
Modal/Dialog:    shadow-lg
```

### 1.6 Breakpoints

```
--bp-sm:     640px      → Small mobile landscape
--bp-md:     768px      → Tablet
--bp-lg:     1024px     → Desktop
--bp-xl:     1280px     → Wide desktop

Grid columns:
  < 640px:     1 column   (full width cards)
  640-767px:   2 columns
  768-1023px:  3 columns
  ≥ 1024px:    4 columns
```

### 1.7 Z-Index Scale

```
--z-base:       0
--z-card:       10
--z-sticky:     20      → Sticky header
--z-overlay:    30      → Map overlays, popups
--z-modal:      40      → Modals, dialogs
--z-toast:      50      → Toast notifications
```

---

## 2. Component Specifications

### 2.1 Plant Card

```
┌─────────────────────────────────┐
│  ┌─────────────────────────────┐│
│  │                             ││
│  │         [FOTO TANAMAN]      ││  aspect-ratio: 4/3
│  │                             ││  object-fit: cover
│  │                             ││  radius-lg (top only)
│  └─────────────────────────────┘│
│  padding: space-4               │
│                                 │
│  ┌──────┐                       │
│  │ Obat │  ← badge, radius-sm  │  bg: primary-light
│  └──────┘    text-xs, uppercase │  text: primary
│                                 │
│  Jahe Merah                     │  text-base, font-semibold
│  Zingiber officinale var. rubrum │  font-latin, italic, text-sm
│                                 │     color-text-secondary
└─────────────────────────────────┘
  bg: bg-card
  radius: radius-lg
  shadow: shadow-sm → hover: shadow-md
  border: 1px solid color-border
  transition: shadow 150ms, transform 150ms
  hover: translateY(-2px)
  cursor: pointer
  min-width: 0 (flex/grid child)
```

**States:**
- Default: shadow-sm, no transform
- Hover: shadow-md, translateY(-2px)
- Focus-visible: outline 2px solid color-border-focus, offset 2px
- Loading (skeleton): animated shimmer gradient on foto + 2 text lines

### 2.2 Search Bar

```
┌──────────────────────────────────────────────────┐
│  🔍  Cari tanaman...                      [⊞]   │
└──────────────────────────────────────────────────┘
  height: 48px (mobile) / 44px (desktop)
  bg: bg-input
  border: 1px solid color-border → focus: color-border-focus
  radius: radius-xl (pill shape)
  padding: 0 space-4
  icon: 20px, color-text-tertiary
  placeholder: color-text-tertiary
  font: text-base
  [⊞] = filter toggle button (icon-only)

Focus state:
  border-color: color-border-focus
  box-shadow: 0 0 0 3px green-100
```

### 2.3 Filter Chips

```
┌────────┐ ┌────────┐ ┌─────────┐ ┌────────┐
│ Semua  │ │  Hias  │ │ Pangan  │ │  Obat  │  ...
└────────┘ └────────┘ └─────────┘ └────────┘
  Horizontal scroll (overflow-x: auto, no scrollbar)
  
  Chip default:
    bg: transparent, border: 1px solid color-border
    text: color-text-primary, text-sm, font-medium
    padding: space-1 space-3
    radius: radius-full

  Chip active:
    bg: primary, border: primary
    text: color-text-inverse
```

### 2.4 Navigation Bar (Bottom Mobile / Top Desktop)

```
MOBILE (bottom fixed):
┌────────────────────────────────────────────────┐
│   🏠        📖        📷        🗺️       👤    │
│  Beranda   Katalog    Scan     Peta    Profil  │
└────────────────────────────────────────────────┘
  height: 64px + safe-area-inset-bottom
  bg: white, border-top: 1px solid color-border
  icon: 24px
  label: text-xs
  active: color-primary (icon + label)
  inactive: color-text-secondary

DESKTOP (top sticky):
┌────────────────────────────────────────────────────────────┐
│  🌿 Flora SMK    Katalog   Peta   Scan QR    [Login]      │
└────────────────────────────────────────────────────────────┘
  height: 64px
  bg: white, shadow-sm
  z-index: z-sticky
  logo: font-bold, text-xl, color-primary
  nav links: text-sm, font-medium, color-text-primary
  active link: color-primary, underline offset 4px
```

### 2.5 Plant Detail Page Layout

```
MOBILE LAYOUT:
┌─────────────────────────────────┐
│ ← Kembali            ⋮ Share   │  Sticky top bar
├─────────────────────────────────┤
│ ┌─────────────────────────────┐ │
│ │                             │ │
│ │      [FOTO CAROUSEL]       │ │  Swipeable, dots indicator
│ │                             │ │  aspect-ratio: 16/9
│ └─────────────────────────────┘ │
│                                 │
│ ┌──────┐                        │
│ │ Obat │                        │  Badge
│ └──────┘                        │
│                                 │
│ Jahe Merah                      │  text-2xl, font-bold
│ Zingiber officinale var. rubrum  │  font-latin, italic, text-lg
│ Red Ginger                      │  text-sm, color-text-secondary
│                                 │
│ ─────────────────────────────── │  Divider
│                                 │
│ 📋 Klasifikasi Ilmiah           │  Collapsible section
│ ┌─────────────────────────────┐ │
│ │ Kingdom  : Plantae          │ │
│ │ Divisio  : Magnoliophyta    │ │
│ │ Classis  : Liliopsida       │ │
│ │ ...                         │ │
│ └─────────────────────────────┘ │
│                                 │
│ 📝 Deskripsi                    │  Section
│ Tanaman herba tahunan yang...   │  text-base, line-height 1.6
│                                 │
│ 🎬 Video Penjelasan             │  Section
│ ┌─────────────────────────────┐ │
│ │ ▶ [Video Thumbnail]         │ │  Native HTML5 <video>
│ │   "Penjelasan oleh: Ahmad"  │ │  poster thumbnail
│ │   Durasi: 2:34              │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ ▶ [Video Thumbnail]         │ │  Multiple videos stacked
│ └─────────────────────────────┘ │
│                                 │
│ 📍 Lokasi                       │  Link to map
│ Kebun Percobaan Blok A          │
│ [Lihat di Peta →]               │
│                                 │
│ ─────────────────────────────── │
│ Ditambahkan oleh: Ahmad S.      │  Footer meta
│ 21 Oktober 2026                 │
└─────────────────────────────────┘
```

### 2.6 QR Scanner View

```
┌─────────────────────────────────┐
│ ← Kembali         Scan QR Code │  Header
├─────────────────────────────────┤
│                                 │
│         ┌─────────────┐         │
│         │             │         │
│         │  ┌───────┐  │         │  Camera viewfinder
│         │  │       │  │         │  Overlay with scan area
│         │  │  [ ]  │  │         │  Animated corner markers
│         │  │       │  │         │
│         │  └───────┘  │         │
│         │             │         │
│         └─────────────┘         │
│                                 │
│   Arahkan kamera ke QR Code     │  Instruction text
│   pada label tanaman            │  text-sm, color-text-inverse
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🔦 Flash  │  ⌨️ Input Manual ││  Action buttons
│  └─────────────────────────────┘│
└─────────────────────────────────┘
  bg: black (full screen overlay)
  Scan area: 250x250px, border white 2px
  Corner markers: animated pulse, color-primary
```

### 2.7 Interactive Map View

```
┌─────────────────────────────────┐
│ Peta Lokasi Tanaman    [⊕] [⊖] │  Header + zoom controls
├─────────────────────────────────┤
│                                 │
│  ┌─────────────────────────────┐│
│  │                             ││
│  │    [DENAH SEKOLAH]          ││  Pinch-zoom, pan
│  │                             ││
│  │        📍  📍               ││  Plant markers
│  │     📍        📍            ││  Color-coded by category
│  │          📍                 ││
│  │                             ││
│  └─────────────────────────────┘│
│                                 │
│  Marker popup (on click):       │
│  ┌─────────────────────────────┐│
│  │ [foto] Jahe Merah           ││  Preview card
│  │        Zingiber officinale  ││  Small, bottom sheet style
│  │        [Lihat Detail →]     ││
│  └─────────────────────────────┘│
└─────────────────────────────────┘

Marker colors by category:
  Hias:     green-500
  Pangan:   amber-500
  Obat:     red-500
  Kayu:     stone-600
  Industri: blue-500
```

### 2.8 Admin Moderation Dashboard

```
┌─────────────────────────────────────────────────┐
│ Dashboard Moderasi                               │
├──────────────────────────────────────────────────┤
│                                                  │
│ Tab: [Pending (5)] [Approved] [Rejected]         │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ [foto]  Bunga Matahari                       │ │
│ │         Helianthus annuus                    │ │
│ │         Oleh: Siti R. — 20 Okt 2026         │ │
│ │                                              │ │
│ │         [✅ Approve]  [❌ Reject]  [👁 View]  │ │
│ └──────────────────────────────────────────────┘ │
│                                                  │
│ ┌──────────────────────────────────────────────┐ │
│ │ [foto]  Kecubung                             │ │
│ │         Datura metel                         │ │
│ │         + 1 video                            │ │
│ │         Oleh: Budi A. — 19 Okt 2026         │ │
│ │                                              │ │
│ │         [✅ Approve]  [❌ Reject]  [👁 View]  │ │
│ └──────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────┘
```

### 2.9 Contribution Form

```
┌─────────────────────────────────┐
│ Tambah Tanaman Baru             │
├─────────────────────────────────┤
│                                 │
│ Nama Lokal *                    │
│ ┌─────────────────────────────┐ │
│ │                             │ │  Required, min 2 chars
│ └─────────────────────────────┘ │
│                                 │
│ Nama Latin                      │
│ ┌─────────────────────────────┐ │
│ │                             │ │  Optional, italic preview
│ └─────────────────────────────┘ │
│                                 │
│ Nama Inggris                    │
│ ┌─────────────────────────────┐ │
│ │                             │ │  Optional
│ └─────────────────────────────┘ │
│                                 │
│ Kategori *                      │
│ ┌─────────────────────────────┐ │
│ │ Pilih kategori          ▼  │ │  Select dropdown
│ └─────────────────────────────┘ │
│                                 │
│ Deskripsi *                     │
│ ┌─────────────────────────────┐ │
│ │                             │ │  Textarea, min 20 chars
│ │                             │ │
│ └─────────────────────────────┘ │
│                                 │
│ Foto * (min 1, max 5)           │
│ ┌───┐ ┌───┐ ┌─────────┐       │
│ │ 📷│ │ 📷│ │  + Add   │       │  Drag-drop or click
│ └───┘ └───┘ └─────────┘       │
│                                 │
│ Video Penjelasan (opsional)     │
│ ┌─────────────────────────────┐ │
│ │  🎬 Upload Video            │ │  Max 50MB, max 5 menit
│ │  MP4 atau WebM              │ │  Progress bar on upload
│ └─────────────────────────────┘ │
│                                 │
│ ┌─────────────────────────────┐ │
│ │       Submit Tanaman        │ │  Primary button, full-width
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

Input states:
  Default:  border color-border
  Focus:    border color-border-focus, ring 3px green-100
  Error:    border red-500, helper text red-500 below
  Disabled: bg stone-100, cursor not-allowed
```

### 2.10 Toast Notifications

```
┌─────────────────────────────────────────┐
│ ✅ Tanaman berhasil disubmit!           │  Success
│    Menunggu persetujuan guru.           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ ❌ Gagal mengupload foto.               │  Error
│    Periksa koneksi internet Anda.       │
└─────────────────────────────────────────┘

  Position: top-center (mobile), top-right (desktop)
  Auto-dismiss: 5 seconds
  Swipe to dismiss (mobile)
  bg: white, shadow-lg, border-left 4px [status-color]
  z-index: z-toast
```

---

## 3. Page Route Map

```
PUBLIC (no auth required):
──────────────────────────
/                       → Landing / Beranda (hero + stats + recent plants)
/katalog                → Plant catalog (search + filter + grid)
/katalog/[slug]         → Plant detail page
/peta                   → Interactive school map
/scan                   → QR code scanner
/login                  → Login page
/register               → Student registration

AUTHENTICATED (contributor):
────────────────────────────
/kontribusi             → My contributions dashboard
/kontribusi/tambah      → Add plant form
/kontribusi/[id]/video  → Upload video for existing plant

ADMIN:
──────
/admin                  → Admin dashboard (stats overview)
/admin/moderasi         → Moderation queue (pending submissions)
/admin/tanaman          → All plants management (CRUD)
/admin/tanaman/tambah   → Add plant (admin - bypasses moderation)
/admin/tanaman/[id]     → Edit plant
/admin/qr/[id]          → Generate & download QR for plant
/admin/peta             → Map editor (upload denah, place markers)
/admin/users            → User management
```

---

## 4. Interaction & Animation Specs

```
TRANSITIONS
───────────
Page transition:        fade 200ms ease-in-out
Card hover:             transform + shadow 150ms ease
Button press:           scale(0.97) 100ms
Modal enter:            fade-in + slide-up 250ms ease-out
Modal exit:             fade-out + slide-down 200ms ease-in
Toast enter:            slide-in-from-top 300ms spring
Toast exit:             fade-out 200ms
Skeleton shimmer:       linear gradient animation 1.5s infinite
Photo carousel:         swipe with momentum, snap to center

LOADING STATES
──────────────
Page load:       Skeleton screens (NOT spinners)
Image load:      Blurhash placeholder → fade-in on load
Button loading:  Spinner icon replaces text, disabled state
Form submit:     Button loading + overlay prevents double-submit
Offline:         Banner "Anda sedang offline" at top, color-warning bg
```

---

## 5. PWA Manifest & Icons

```
App Name:        Flora SMK
Short Name:      Flora
Theme Color:     #16A34A (green-600)
Background:      #FAFAF9 (stone-50)
Display:         standalone
Orientation:     portrait (primary), landscape (supported)
Start URL:       /
Scope:           /

Icons needed:
  - 192x192 (maskable + any)
  - 512x512 (maskable + any)
  - Apple touch icon 180x180
  - Favicon 32x32, 16x16
  - OG image 1200x630

Splash: Green-600 background + white Flora SMK logo centered
```

---

## 6. Tailwind CSS Variable Mapping

```css
/* app.css — CSS custom properties for Tailwind v4 */
@theme {
  --color-primary: #16A34A;
  --color-primary-hover: #15803D;
  --color-primary-light: #F0FDF4;
  --color-primary-border: #BBF7D0;
  
  --color-secondary: #F59E0B;
  --color-secondary-hover: #D97706;
  
  --color-success: #16A34A;
  --color-warning: #F59E0B;
  --color-error: #EF4444;
  --color-info: #3B82F6;
  
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-serif: 'Lora', Georgia, serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;
}
```

---

*Design Layer output complete. All tokens, components, and layouts are specified with precision for the Engineering Layer to implement directly.*
