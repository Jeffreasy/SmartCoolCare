# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** KoelkastProjectV2
**Generated:** 2026-01-23 03:41:00 (Manual Override Applied)
**Category:** Smart Home/IoT Dashboard
**Theme:** **Dark Glassmorphism (Indigo/Purple)**

---

## Global Rules

### Color Palette

| Role | Hex | Tailwind Class | Usage |
|------|-----|----------------|-------|
| **Background** | `#020617` | `bg-slate-950` | Global app background |
| **Primary** | `#6366f1` | `text-indigo-500` / `bg-indigo-500` | Brand Actions, Active States |
| **Primary Hover** | `#4f46e5` | `hover:bg-indigo-600` | Interactive Hover |
| **Secondary** | `#a855f7` | `text-purple-500` | Accents, Gradients |
| **Success** | `#10b981` | `text-emerald-500` | Online Status, Valid |
| **Danger** | `#ef4444` | `text-red-500` | Offline Status, Errors |
| **Surface (Glass)** | `rgba(255,255,255,0.03)` | `bg-white/[0.03]` | Card Backgrounds |
| **Border (Subtle)** | `rgba(255,255,255,0.05)` | `border-white/5` | Card Borders |
| **Text Main** | `#f8fafc` | `text-slate-50` | Headings |
| **Text Muted** | `#94a3b8` | `text-slate-400` | Body, Meta |

### Typography

- **Font Family:** `Inter` (UI), `Fira Code` (Data/Snippets)
- **Hierarchy:**
  - `text-2xl font-bold`: Page Titles
  - `text-lg font-semibold`: Card Headers
  - `text-sm text-slate-400`: Metadata
  - `text-xs font-mono`: IDs, Sensor Values

### Glassmorphism Standard

To achieve the "Premium Depth" look:

```css
.glass-panel {
  @apply bg-white/[0.03] backdrop-blur-xl border border-white/10 shadow-2xl;
}
```

---

## Component Specs

### Buttons

| Type | Classes |
|------|---------|
| **Primary** | `bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 transition-all duration-200` |
| **Secondary** | `bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 transition-all duration-200` |
| **Icon** | `p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer` |

### Cards

- **Base:** `bg-slate-900/50` or `bg-white/[0.02]`
- **Border:** `border border-white/5`
- **Hover:** `hover:border-indigo-500/30 hover:shadow-glow transition-all duration-300 group`

### Modals

- **Overlay:** `bg-black/60 backdrop-blur-sm fixed inset-0 z-50`
- **Content:** `bg-slate-900 border border-white/10 shadow-2xl p-6 rounded-2xl max-w-lg w-full relative`
- **Animation:** `animate-in fade-in zoom-in-95 duration-200`

---

## Anti-Patterns (STRICT PROHIBITION)

### 1. Visual Quality
- ❌ **NO Emojis as Icons**: Use `lucide-react` ONLY. (We have standardized on Lucide).
  - *Bad:* `<button>🗑️</button>` or inline SVGs.
  - *Good:* `<button><Trash2 className="w-4 h-4" /></button>`
- ❌ **No Layout Shifting**: Avoid `hover:scale` that pushes siblings. Use `transform` or sufficient padding.
- ❌ **No "Generic" Blue**: Do not use `bg-blue-500`. Use `bg-indigo-500` or `bg-sky-500` as defined.

### 2. Interaction
- ❌ **Missing Cursors**: Any `onClick` element **MUST** have `cursor-pointer`.
- ❌ **Missing Hover**: Interactive elements need a visible hover state (brightness, bg opacity).
- ❌ **Instant Changes**: Use `transition-colors` or `transition-all` (duration-200 or 300).

### 3. Layout transparency
- ❌ **Opaque Cards**: Do not use solid `bg-slate-800`. Use `bg-slate-800/50` + `backdrop-blur`.

---

## Checklist for Reviewers

- [ ] **Icons**: SVG utilized?
- [ ] **Cursor**: `cursor-pointer` on clicks?
- [ ] **Colors**: Using `indigo` / `purple` / `slate`?
- [ ] **Glass**: `backdrop-blur` present on overlays/glass panels?
