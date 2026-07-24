---
name: IG Ratio
description: Local Instagram follow analysis with react-cursor tool chrome in navy blue
colors:
  bg: "#0b1224"
  bg-soft: "#121a33"
  bg-inset: "#070d1c"
  line: "#2a3a5c"
  line-strong: "#3a4f78"
  text: "#eef3ff"
  text-muted: "#9aafd0"
  text-soft: "#c5d4ec"
  brand: "#38bdf8"
  brand-2: "#3b82f6"
  brand-contrast: "#041018"
  success: "#4ade80"
  warning: "#fbbf24"
  destructive: "#f87171"
typography:
  body:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  body-sm:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 700
    letterSpacing: "-0.01em"
  display:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    letterSpacing: "-0.02em"
  label:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "0.8rem"
    fontWeight: 600
    letterSpacing: "0.05em"
  micro:
    fontFamily: "Geist, ui-sans-serif, system-ui, sans-serif"
    fontSize: "10px"
    fontWeight: 600
    letterSpacing: "0.04em"
  mono:
    fontFamily: "Geist Mono, ui-monospace, Cascadia Code, Consolas, monospace"
    fontSize: "0.875em"
rounded:
  sm: "8px"
  md: "10px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
components:
  navbar:
    backgroundColor: "color-mix(in srgb, {colors.bg} 82%, transparent)"
    textColor: "{colors.text}"
    rounded: "0"
    padding: "12px 24px"
    height: "auto"
  card:
    backgroundColor: "{colors.bg-soft}"
    textColor: "{colors.text}"
    rounded: "{rounded.xl}"
    padding: "24px"
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.brand-contrast}"
    rounded: "{rounded.sm}"
    padding: "10px 20px"
  icon-button:
    backgroundColor: "transparent"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.sm}"
    size: "36px"
    height: "36px"
    width: "36px"
---

# DESIGN.md

## Overview

IG Ratio uses the visual grammar of the [react-cursor playground](https://react-cursor-xi.vercel.app/) — radial page atmosphere, frosted sticky chrome, and gradient-tinted cards — remapped into a navy/sky blue Operate palette. Dark-only. Privacy-first tool UI: scanable, calm, sibling to the cursor playground rather than a marketing landing page.

North star: **Blue playground chrome** — a local analysis console that feels like a polished library demo site, not a dashboard.

## Colors

- Base field: deep navy (`bg`), slightly lifted panels (`bg-soft`), recessed wells (`bg-inset`).
- Accents: sky (`accent`) + cobalt (`accent-2`) carry the dual radial washes and primary actions.
- Text: near-white primary; muted/soft blues for secondary (never neutral gray on navy).
- Borders: cool blue-stone at two strengths.

Page wash (normative):

```css
--grad-page:
  radial-gradient(900px 480px at 8% -10%, color-mix(in srgb, var(--accent) 22%, transparent), transparent 60%),
  radial-gradient(700px 420px at 92% 0%, color-mix(in srgb, var(--accent-2) 16%, transparent), transparent 55%),
  var(--bg);
```

Surface wash on cards:

```css
--grad-surface:
  linear-gradient(165deg, color-mix(in srgb, var(--bg-soft) 92%, var(--accent)) 0%, var(--bg-soft) 42%, var(--bg-soft) 100%);
```

## Typography

Geist Sans for UI; Geist Mono only for paths, code, and tabular timestamps. Sticky nav brand is weight-driven (not gradient-clipped text). Card titles ~1.15rem / 700; panel labels may use small tracked uppercase sparingly (one system, not everywhere).

## Layout

- Max content width ~960–1024px, centered.
- Sticky frosted navbar; page intro (description + privacy) sits in the first scroll region above or inside the primary card — not a tall gradient hero band.
- Vertical stack with ~24px gaps; card internal sections divide with hairlines.
- Mobile: same stack, nav icons remain reachable, padding 16–24px.

## Elevation & Depth

- Cards: 1px hairline border + soft offset shadow (`0 4px 16px -6px` dark).
- Navbar: translucent `color-mix` of `bg` + `backdrop-filter: blur(10px)` as functional chrome over the radial field (not decorative glass scattered on the page).
- Inset wells darker than card faces; dashed borders for upload drop zones; no nested card-in-card chrome.

## Shapes

- Cards: 16px radius.
- Controls / icon buttons: 8–10px.
- Soft chips/pills only for true selection chips if needed; default rows stay rectangular.

## Components

- **Navbar:** sticky, frosted, bottom border; brand mark + wordmark left; icon buttons right (tour, LinkedIn, GitHub).
- **Card:** `--grad-surface`, border, light shadow; optional soft accent header wash for the primary editor card.
- **Icon button:** 36×36, transparent → soft hover fill + border.
- **Primary action:** accent-forward (sky/cobalt system); keep existing analyze CTA energy inside the blue family.
- **Lists / user rows:** inset or soft border rows on the card face — not a second elevation tier of nested cards.

## Do's and Don'ts

**Do**

- Keep the dual radial page wash fixed (`background-attachment: fixed`).
- Remap all react-cursor coral/amber accents to sky/cobalt.
- Prefer tonal layering (inset vs soft) over stacked shadows.

**Don't**

- Reintroduce a tall solid gradient hero header.
- Use coral/orange accents from the reference site.
- Nest cards inside cards or sprinkle glass on every panel.
- Invent light mode; this product is dark navy only.
