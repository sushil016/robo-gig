# RoboRoot Frontend UI Redesign

**Date:** 2026-05-10  
**Scope:** Visual/UI layer only — no content, no data, no logic changes

---

## Color System

| Role | Value | Usage |
|---|---|---|
| Page background | `#F5F5DC` (beige) | `<body>`, page sections, `LandingPage` wrapper |
| Card surface | `#ffffff` (white) | All cards, dropdowns, mega-menu panels |
| Primary text | `#09090b` (zinc-950) | Headings, body text, topbar background, footer background |
| Secondary text | `#52525b` (zinc-600) | Descriptions, nav inactive links |
| Muted text | `#71717a` (zinc-500) | Prices, timestamps, placeholders |
| Border | `#d4d4b8` (warm gray) | Card borders, input borders, dividers |
| Accent / CTA | `#1CA2D1` (info blue) | Buttons, underlines, left-border bars, eyebrow labels, logo accent, cart badge |
| Dark surface | `#18181b` (zinc-900) | Footer background |

No other colors. All existing `blue-*`, `slate-*`, `cyan-*` Tailwind classes are replaced with this palette.

---

## Hover Animation Rules

**Allowed:** translate, underline reveal (scaleX), left-border slide (width), shadow, opacity, letter-spacing  
**Not allowed:** background-color transitions, text-color transitions, scale()

### Nav links (Header)
- `::after` pseudo-element: 2px `#1CA2D1` bar, `scaleX(0 → 1)` from left, `duration-[280ms]`
- Text color snaps to `zinc-950` (no transition)

### Product & Category cards
- `::before` pseudo-element: 3px `#1CA2D1` left bar, `width(0 → 3px)`, `duration-[250ms]`
- `border-color` snaps to `#1CA2D1` (border-color is permitted as a border-property change, not a fill/text color)
- `box-shadow` adds `0 4px 18px rgba(0,0,0,0.08)`

### CTA / "View All" buttons (blue filled)
- `::after` pseudo-element: 2px `rgba(255,255,255,0.6)` underline slides from left, `duration-[300ms]`

### Header icon buttons
- `border-color` snaps to `zinc-950`
- `box-shadow` adds `0 2px 8px rgba(0,0,0,0.12)`

### Footer links
- `::after` pseudo-element: 1px white underline slides from left, `duration-[280ms]`

---

## Files to Change

| File | What changes |
|---|---|
| `frontend/app/globals.css` | CSS variables for `--background`, `--foreground`, `--primary`, `--border`, etc. mapped to new palette |
| `frontend/components/home/LandingPage.tsx` | `bg-white text-slate-950` → `bg-[#F5F5DC] text-zinc-950` |
| `frontend/components/layout/Header.tsx` | Full restyle: beige bg, zinc topbar, new nav hover, icon btn hover |
| `frontend/components/layout/Footer.tsx` | zinc-900 bg, beige text, underline-reveal footer links |
| `frontend/components/home/HeroSection.tsx` | Service tiles + hero CTAs restyled; keep dark hero image overlay |
| `frontend/components/home/CategorySection.tsx` | White cards on beige, left-border hover, blue CTA button |
| `frontend/components/home/BestSellersSection.tsx` | White cards on beige, left-border hover, blue CTA button |
| `frontend/components/home/FeaturedBuildsSection.tsx` | Same card pattern |
| `frontend/components/home/ServicesSection.tsx` | Same card pattern |
| `frontend/components/marketplace/ComponentCard.tsx` | Left-border hover |
| `frontend/components/projects/ProjectCard.tsx` | Left-border hover |
| `frontend/components/ui/button.tsx` | Default variant: zinc-950 bg, beige text; blue variant: `#1CA2D1` |

---

## Implementation Constraints

- **No content changes** — text, links, icons, data all stay identical
- **No logic changes** — auth, cart, state, API calls untouched
- **Tailwind only** — use Tailwind classes where possible; use arbitrary values `[]` for `#F5F5DC`, `#1CA2D1`, `#d4d4b8`
- **CSS variables in globals.css** updated so shadcn/ui components inherit the palette automatically
- Hover animations implemented via Tailwind `group-hover:` + CSS `::after` in `globals.css` utility classes, or inline `style` where needed
