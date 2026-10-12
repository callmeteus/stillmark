---
name: Stillmark Landing
description: Persuade-mode marketing surface for the Stillmark CLI
colors:
  ink: "#0f172a"
  muted: "#475569"
  accent: "#2563eb"
  accent-hover: "#1d4ed8"
  border: "#e2e8f0"
  surface-soft: "#f8fafc"
  code-surface: "#0f172a"
  code-block-bg: "#020617"
  code-text: "#f1f5f9"
  page-glow: "#eff6ff"
typography:
  display:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "clamp(2rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
  body:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-large:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "\"Segoe UI\", system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  mono:
    fontFamily: "ui-monospace, monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  card: "1rem"
  button: "0.75rem"
  code: "1rem"
spacing:
  container-x: "1.5rem"
  section-gap: "4rem"
  card-padding: "1.5rem"
  grid-gap: "1rem"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "#ffffff"
    rounded: "{rounded.button}"
    padding: "12px 16px"
  card-surface:
    backgroundColor: "rgba(255, 255, 255, 0.85)"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "{spacing.card-padding}"
---

# Design System: Stillmark Landing

## Overview

**Creative North Star: "The Clear Audit Trail"**

The landing surface reads like a trustworthy developer tool, not a generic SaaS template. Light atmosphere, a single blue accent, and monospace pockets signal "commands you can run" and "files you can diff." White cards float on a soft radial sky so sections feel scannable without heavy chrome.

Density is comfortable: one primary action (copy install command), explanatory blocks in order (hero, diagram, features, agents, commands). Expression stays restrained so CLI truth and command strings remain the hero.

**Key Characteristics:**

- Slate ink on cool white with one accent blue (`#2563eb`).
- System UI sans for prose; monospace for commands and table command column.
- Rounded cards (16px) and code blocks (16px); buttons slightly tighter (12px).
- Depth via border + translucent white fill, not drop shadows.
- Responsive grids at 640px, 768px, and 1024px.

## Colors

A cool, documentation-adjacent palette: dark slate text, muted slate secondary, blue accent for actions only.

### Primary

- **Signal Blue** (`#2563eb`): Primary buttons and link hover emphasis in navigation. The only saturated hue on most viewports.
- **Signal Blue Pressed** (`#1d4ed8`): Button hover state.

### Neutral

- **Ink Slate** (`#0f172a`): Headings and primary body text.
- **Muted Slate** (`#475569`): Supporting copy, footer, table descriptions, nav default.
- **Hairline Mist** (`#e2e8f0`): Card borders, table dividers.
- **Soft Page** (`#f8fafc`): Table header background, gradient mid-stop.
- **Sky Glow** (`#eff6ff`): Radial gradient highlight at top of page background.
- **Terminal Ink** (`#0f172a` / `#020617`): Install command chip and ASCII diagram block backgrounds.
- **Terminal Paper** (`#f1f5f9` / `#f8fafc`): Code text on dark surfaces.

### Named Rules

**The One Accent Rule.** Blue appears on primary buttons and intentional hover states only. Do not sprinkle accent on headings or decorative shapes.

## Typography

**Display Font:** Segoe UI with system-ui fallback  
**Body Font:** Same stack  
**Mono Font:** ui-monospace for commands, diagram, and command-reference table headers

**Character:** Neutral, readable, Windows-friendly dev marketing. No display serif or geometric novelty fonts in the incumbent build.

### Hierarchy

- **Display** (700, `clamp(2rem, 4vw, 3rem)`, line-height 1.1): Hero headline only.
- **Headline** (600-700, ~1.5-2rem implicit browser h2): Section titles ("How it works", "Features").
- **Body Large** (400, 1.125rem): Hero subtitle.
- **Body** (400, 1rem): Default paragraph and list text.
- **Label** (600, 0.875rem): Install card label, nav links, footer.
- **Mono** (400, 0.875rem): `install-code`, `code-block`, table `th` for CLI strings.

### Named Rules

**The Command Voice Rule.** Any string the user might paste into a terminal uses the mono style on a dark surface, never body sans on white.

## Layout

- **Container:** `max-width: 72rem` (1152px), horizontal padding `1.5rem`, centered.
- **Hero:** CSS grid, single column below 1024px; two columns (copy + install card) at `min-width: 1024px`, gap `2.5rem`, vertical padding `2.5rem`.
- **Features:** 1 column mobile; 2 columns from `768px`, gap `1rem`.
- **Install row:** Stacked below `640px`; row alignment from `640px`.
- **Section rhythm:** Major sections separated by ~`4rem` margin-top on index pages.
- **Header/footer:** Full-width within container; header flex space-between; footer centered muted text with top border.

## Elevation & Depth

Flat-by-default material system. Depth comes from **1px borders**, **semi-transparent white cards** (`rgba(255,255,255,0.85)`), and the **page radial gradient**, not box-shadows. The ASCII diagram uses a near-black panel to feel "terminal inset" compared to white cards.

### Named Rules

**The Flat Surface Rule.** Do not add drop shadows to cards or buttons unless a future redesign explicitly replaces this invariant.

## Shapes

- **Cards and diagram blocks:** `1rem` corner radius.
- **Buttons and inline code chips:** `0.75rem` corner radius.
- **Tables:** Outer card wraps square table; rows divided by top borders only.
- **Links:** No underline by default; color shift on hover to accent.

## Components

### Buttons

- **Shape:** Soft rectangle (`0.75rem` radius).
- **Primary:** Signal Blue fill, white text, semibold, padding `0.75rem 1rem`.
- **Hover:** Background shifts to `#1d4ed8` (no transform in incumbent CSS).

### Cards / Containers

- **Corner Style:** `1rem`.
- **Background:** Translucent white over gradient page.
- **Border:** `1px` Hairline Mist.
- **Internal Padding:** `1.5rem` default; command table card uses `padding: 0` with cell padding inside table.

### Code / Install block

- **Install label:** Muted label above row.
- **Command field:** Dark `#0f172a` background, mono, flex growth in row.
- **Copy button:** Primary button adjacent (stacked on narrow viewports).

### Diagram block

- **Style:** `code-block` class - `#020617` background, light text, horizontal scroll, `1rem` radius.

### Navigation

- **Style:** Horizontal link group, `0.875rem`, muted default color.
- **Hover:** Accent blue text (via inline/class hover on anchors).
- **Locale toggle:** EN / PT as plain text links.

### Data table (command reference)

- **Header cells:** Mono font, Soft Page background.
- **Body:** Muted description column; mono command column.

## Do's and Don'ts

### Do:

- **Do** keep monospace + dark background for every CLI example.
- **Do** preserve bilingual parity between `/` and `/pt-br/` layout and hierarchy.
- **Do** use the container width cap so command tables remain readable on wide screens.

### Don't:

- **Don't** add fake social proof, metrics, or customer logos (per PRODUCT.md).
- **Don't** introduce additional accent colors without updating frontmatter tokens.
- **Don't** use emojis in UI copy on this surface.
- **Don't** rely on Tailwind utility classes without equivalent rules in `global.css` (incumbent pages use custom classes + minimal inline spacing).
