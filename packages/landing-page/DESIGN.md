---
name: Stillmark Landing
description: Cyanotype construction drawing set where every agent change lands as a marked, numbered revision
colors:
  ground: "#0f3a68"
  ground-deep: "#0c315b"
  well: "#0a2a4e"
  sheet-tint: "rgba(8, 34, 66, 0.38)"
  ink: "#f3f8ff"
  ink-soft: "#c3d6ee"
  ink-faint: "#93b3d8"
  line: "rgba(229, 239, 255, 0.82)"
  line-soft: "rgba(229, 239, 255, 0.3)"
  line-faint: "rgba(229, 239, 255, 0.14)"
  grid-minor: "rgba(229, 239, 255, 0.045)"
  grid-major: "rgba(229, 239, 255, 0.085)"
  rev: "#ff7a45"
  rev-hover: "#ff9466"
  rev-ink: "#ffab88"
  on-rev: "#0a2240"
typography:
  display:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "clamp(2.6rem, 5.6vw, 5.4rem)"
    fontWeight: 600
    lineHeight: 0.94
    letterSpacing: "-0.005em"
  headline:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "clamp(2.1rem, 3.8vw, 3.25rem)"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "-0.005em"
  title:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "1.4rem"
    fontWeight: 600
    lineHeight: 1.15
  body:
    fontFamily: "\"Barlow\", system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "\"Barlow Condensed\", \"Arial Narrow\", sans-serif"
    fontSize: "0.85rem"
    fontWeight: 500
    letterSpacing: "0.06em"
  mono:
    fontFamily: "ui-monospace, \"Cascadia Mono\", Consolas, monospace"
    fontSize: "0.84rem"
    fontWeight: 400
    lineHeight: 1.45
rounded:
  none: "0"
  button: "2px"
spacing:
  container-max: "80rem"
  container-x: "clamp(1rem, 3vw, 2rem)"
  section-gap: "clamp(4.5rem, 9vw, 7.5rem)"
  sheet-cell: "clamp(1.25rem, 2.6vw, 2rem)"
  sheet-offset: "5px"
  column-gutter: "1.75rem"
  split-gap: "3.5rem"
components:
  button-primary:
    backgroundColor: "{colors.rev}"
    textColor: "{colors.on-rev}"
    typography: "{typography.label}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.5rem"
    height: "2.75rem"
  button-primary-hover:
    backgroundColor: "{colors.rev-hover}"
    textColor: "{colors.on-rev}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.5rem"
  button-primary-copied:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-rev}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.5rem"
  button-quiet:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.button}"
    padding: "0.6rem 1.5rem"
    height: "2.75rem"
  segmented-option:
    backgroundColor: "transparent"
    textColor: "{colors.ink-faint}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.9rem"
    height: "2.5rem"
  segmented-option-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-rev}"
    rounded: "{rounded.none}"
    padding: "0.35rem 0.9rem"
  locale-toggle:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.none}"
    padding: "0 0.65rem"
    height: "2.25rem"
  command-well:
    backgroundColor: "{colors.well}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.none}"
    padding: "1rem 1.1rem"
  sheet-frame:
    backgroundColor: "{colors.sheet-tint}"
    textColor: "{colors.ink}"
    rounded: "{rounded.none}"
    padding: "{spacing.sheet-cell}"
  sheet-number:
    backgroundColor: "transparent"
    textColor: "{colors.ink-faint}"
    rounded: "{rounded.none}"
    padding: "0.2rem 0.75rem"
---

# Design System: Stillmark Landing

## Overview

**Creative North Star: "The Cyanotype Drawing Set"**

The page is a set of construction drawings printed in Prussian blue. A fine drafting grid covers the whole ground, white line work frames every sheet, and the only warm color on the page is the vermilion revision pencil. Every agent change is a revision on a fixed drawing: the line work never moves, and revisions land as a separate layer on top of it, circled by a scalloped cloud and numbered by a delta triangle. Earlier revisions stay visible at reduced strength instead of being erased.

The sheet vocabulary carries the structure. The first viewport is one framed sheet split like a drawing: headline in the title area, revision table in the corner, drawing field of example files below, install title block at the bottom right. The hero is sheet S-01 and the detail sections that follow are numbered sheets S-02 to S-05 in the same doubled frame, separated by legends, general notes, and a dense command schedule. Line style is meaning, not decoration: a solid line is a file shared in git, a dashed line is a file that stays on the developer's machine.

Density is that of a drawing set: dense tables, hairline rules, uppercase condensed lettering for labels, and generous section gaps between sheets. Corners are square everywhere except a barely softened 2px on buttons.

**Key Characteristics:**

- Prussian blue ground with a two-scale drafting grid (24px minor, 120px major).
- White line work at three strengths; no filled cards, no rounded panels.
- Vermilion is reserved for revisions, primary actions, focus, and hover.
- Solid line means shared in git; dashed line means local only.
- Sheets framed by a 1.5px border plus a 1px outline offset 5px.
- Barlow Condensed lettering, Barlow body, system mono only for code and file content.

## Colors

A monochrome cyanotype (Prussian blue ground, white ink at graded alpha) interrupted by one vermilion revision pencil.

### Primary

- **Revision Vermilion** (rev): Revision clouds, delta triangles, primary button fill, focus outline, hover border on quiet controls, copied-state border on command wells, text selection tint. If it is vermilion, it is either a revision or the action to take.
- **Revision Vermilion Lifted** (rev-hover): Primary button hover only.
- **Revision Pencil Ink** (rev-ink): Vermilion as text on blue: delta numerals, link and nav hover, the command a request runs, "local only" badges and tree notes, copy status messages. Lighter than rev so small text stays legible on the ground.

### Neutral

- **Prussian Ground** (ground): Page background under the drafting grid.
- **Deep Prussian** (ground-deep): Header and footer bands, scrollbar track.
- **Ink Well** (well): Recessed command and prompt fields, mobile install bar. File sheets and inline code use the same hue at 60% and 75% alpha.
- **Sheet Tint** (sheet-tint): Translucent fill inside framed sheets so the grid still reads through.
- **Drawing White** (ink): Headings, primary text, selected segmented options, copied-state button fill.
- **Faded White** (ink-soft): Body copy, leads, table descriptions, nav default.
- **Ghost White** (ink-faint): Labels, table headers, sheet numbers, file tags, general-note indexes.
- **Line Work** (line): Primary strokes: sheet borders, section rules, file-sheet borders, line samples.
- **Soft Line** (line-soft): Interior divisions: sheet cell dividers, outline frames, control borders, column rules.
- **Faint Line** (line-faint): Table row rules and inline-code borders.
- **Grid Minor / Grid Major** (grid-minor, grid-major): The drafting grid on the body background only.
- **Ink on Revision** (on-rev): Dark navy text on vermilion and on white fills.

### Named Rules

**The Revision Pencil Rule.** Vermilion marks revisions and the one action to take. It never colors headings, section rules, or decorative shapes.

**The Graded Line Rule.** Every stroke uses one of the three line strengths: line for outer frames and major rules, line-soft for interior divisions, line-faint for table rows. No other white alpha is introduced for strokes.

## Typography

**Display Font:** Barlow Condensed (with "Arial Narrow", sans-serif), weights 500 and 600
**Body Font:** Barlow (with system-ui, sans-serif), weights 400, 500, 600
**Label/Mono Font:** ui-monospace, "Cascadia Mono", Consolas, monospace

**Character:** Condensed engineering lettering over a plain humanist body, the way a drawing set pairs title-block lettering with general notes. Both families load through @fontsource.

### Hierarchy

- **Display** (600, clamp(2.6rem, 5.6vw, 5.4rem), 0.94): Hero headline only, capped at 15ch.
- **Headline** (600, clamp(2.1rem, 3.8vw, 3.25rem), 1): Section h2s. The closing sheet uses clamp(2rem, 3.4vw, 3rem).
- **Title** (600, 1.35rem to clamp(1.6rem, 2.4vw, 2rem), 1.05-1.15): Note titles (1.4rem), general-note titles (1.5rem), legend sheet titles (clamp(1.6rem, 2.4vw, 2rem)), title-block label (1.35rem).
- **Body** (400, 1.0625rem, 1.6): Default text. Leads cap at 60ch, hero subtitle at 48ch, footer tagline at 44ch.
- **Label** (500, 0.85rem to 1rem, 0.04em-0.08em, uppercase): Nav links, table headers, file tags, request labels, badges, tree notes, segmented options. Button labels use 600 at 1.0625rem, 0.04em. Sheet numbers use 600, 0.85rem, 0.08em and are not uppercased by CSS.
- **Mono** (400, 0.76rem to 1.05rem, 1.45-1.6): File names, file content lines, command wells, schedule commands, inline code at 0.86em.
- **Index numerals** (Barlow Condensed 500, 3rem, 1): General-note step numbers in ghost white.

### Named Rules

**The Lettering Rule.** Headings, labels, buttons, and nav are Barlow Condensed; running text is Barlow. Mono appears only where the content is literally a file, a path, or a command.

## Layout

The page is a single centered container (max 80rem, side padding clamp(1rem, 3vw, 2rem)) holding a vertical stack of sheets separated by the section gap (clamp(4.5rem, 9vw, 7.5rem)).

- **Hero sheet:** A single-column grid on small screens in the order title, drawing field, install, revisions. From 1024px it becomes two columns (1.55fr / 1fr) with areas "title revisions" / "field install", divided by soft interior lines. Cell padding is clamp(1.25rem, 2.6vw, 2rem); the title cell gets clamp(2rem, 3.4vw, 3rem) vertical padding on desktop.
- **Drawing field:** Three file sheets stack, then sit in three equal columns from 720px. Requests share one grid cell and cross-fade.
- **Section heads:** Stacked below 900px; from 900px a two-column split (1fr / 1.15fr) aligned to the bottom, 3rem gap, closed by a 1.5px line rule.
- **Three-column notes:** Legend sheets, general notes, and plain detail notes stack with a 2rem gap, then become three columns at 900px separated by soft vertical rules with 1.75rem gutters and no outer padding.
- **Detail sheets with a figure:** Notes and figure split 1fr / 1fr with a 3.5rem gap from 900px; alternate sheets flip the figure to the left.
- **Command schedule:** Full-width table; below 720px rows collapse to stacked blocks and the header becomes screen-reader only.
- **Mobile install bar:** Fixed to the bottom below 1024px, with the page padded by 9rem to clear it.
- **Breakpoints observed:** 480px, 560px, 720px, 860px, 900px, 1024px.

## Elevation & Depth

Depth is drawn, not lit. Sheets are flat and separated from the ground by line work: a 1.5px border with a second 1px outline offset 5px, plus a translucent sheet tint that lets the drafting grid read through. Recessed fields (command wells, file sheets) sit one step darker in the well color. Two soft shadows exist, both functional: a diffuse drop under the primary button, and an upward shadow under the fixed mobile install bar to separate it from scrolling content.

### Shadow Vocabulary

- **Action lift** (`box-shadow: 0 8px 20px -10px rgba(3, 15, 35, 0.75)`): Primary button only. Quiet buttons remove it.
- **Docked bar** (`box-shadow: 0 -10px 24px -12px rgba(3, 15, 35, 0.8)`): Mobile install bar only.

### Named Rules

**The Double Frame Rule.** Every top-level sheet (hero, detail sheets, closing) carries the 1.5px line border plus the 1px soft outline offset 5px. Inner figures use a single border.

## Shapes

Square drafting geometry. Every frame, field, table, segmented control, and toggle has 0 radius; only buttons soften to 2px. The two recurring silhouettes are the delta triangle (an outlined equilateral triangle, stroke 1.7, with a revision numeral seated inside) and the revision cloud (scalloped arcs about 16px apart drawn around a changed line with 10px horizontal and 6px vertical padding, stroke 1.5). Line style encodes state: solid 1px or 1.5px for shared files, dashed 1.5px for local-only files and their header and tree rules, with a 7 / 5 dash in line samples.

## Components

### Buttons

Blunt and lettered, like a stamp on the title block.

- **Shape:** Nearly square (2px).
- **Primary:** Revision vermilion fill, navy text, Barlow Condensed 600 uppercase at 0.04em, min height 2.75rem, padding 0.6rem 1.5rem, action-lift shadow.
- **Hover / Focus:** Fill lifts to rev-hover over 0.15s ease-out; pressing nudges down 1px. Focus is the global 2px vermilion outline offset 3px.
- **Copied state:** Fill turns drawing white with a masked check glyph before the label; the matching command well border turns vermilion.
- **Quiet:** Transparent with a 1px line border and white text, no shadow; hover shifts border to vermilion and text to rev-ink.

### Segmented Control

- **Style:** Inline group in a 1px soft-line border, options divided by soft lines, Barlow Condensed 500 uppercase at 0.95rem, min height 2.5rem.
- **State:** Unselected options are ghost white and brighten to white on hover; the selected option fills drawing white with navy text. Used for Agent / CLI install modes, per-agent tabs, and the command schedule mode.

### Command Wells

- **Style:** Recessed well-color field with a 1px soft-line border, mono text. The install prompt runs 0.86rem at 1.6 line height; the CLI command runs 1.05rem; inline install rows run 0.84rem.
- **Copied:** Border turns vermilion over 0.25s.

### Sheets / Containers

- **Corner Style:** Square (0).
- **Background:** Sheet tint over the gridded ground.
- **Shadow Strategy:** None; see the Double Frame Rule.
- **Border:** 1.5px line plus 1px soft outline offset 5px.
- **Internal Padding:** clamp(1.25rem, 2.6vw, 2rem); the closing sheet uses clamp(1.5rem, 3vw, 2.5rem).
- **Sheet number:** A small ruled box pinned to the bottom-right corner of the frame (1px soft top and left rules, 0.2rem 0.75rem padding) holding only the sheet code, such as S-02. Never place it above a heading. Detail sheets reserve extra bottom padding (clamp(3rem, 4.5vw, 3.75rem)) so the box does not cover content.

### File Sheets

- **Style:** Single 1px line border over well at 60% alpha, header row with mono file name and an uppercase file tag ("Shared" / "Local only"), mono content lines at 0.76rem (0.86rem in detail figures).
- **Local variant:** Border becomes 1.5px dashed and the header rule dashes too.
- **Revised line:** Wrapped by a vermilion revision cloud and a numbered delta triangle at its top-right corner.

### Revision Table

- **Style:** Collapsed table with a condensed caption, a white top rule over uppercase ghost-white headers, and faint row rules. The first column holds the delta mark.
- **State:** During the demo, rows not yet revised sit at 0.22 opacity and the current row brightens to white.

### Command Schedule

- **Style:** Dense table bounded by 1.5px line rules top and bottom, uppercase condensed headers at 0.07em, 0.55rem 0.75rem cells with faint row rules, mono command column at 46% width, row hover tint of white at 4% alpha.

### Navigation

- **Style:** Deep Prussian header band closed by a soft line, 4rem tall. Logo pairs the vermilion delta mark with the wordmark in Barlow Condensed 600 at 1.5rem.
- **Links:** Barlow Condensed 500 uppercase at 1rem and 0.05em, faded white, min height 2.75rem; hover to rev-ink.
- **Locale toggle:** Square 1px soft-line button showing the other locale code (PT or EN); hover turns the border vermilion. It swaps text on the same page.
- **Mobile:** Below 860px the in-page anchors hide, leaving GitHub and the locale toggle.

### Revision Demo (signature)

The hero cycles through three plain-language requests. Each request cross-fades in (0.45s), then after 700ms its revision lands: the cloud stroke-draws around the changed line over 1.1s with cubic-bezier(0.16, 1, 0.3, 1), the line text fades in with a 0.2s delay, the delta mark follows at 0.6s, and the revision table gains its row. Steps advance every 3.4s and hold 4.6s at the end before resetting; previous clouds stay at 0.5 opacity. The demo pauses when off screen or in a hidden tab, and with reduced motion it shows the final state with all revisions applied. Detail sheets reuse static clouds to show revisions that already landed.

## Do's and Don'ts

### Do:

- **Do** frame every top-level sheet with the 1.5px line border and the 1px soft outline offset 5px.
- **Do** use a solid line for files shared in git and a dashed line for files that stay local, everywhere the distinction appears.
- **Do** mark a revision with both a vermilion cloud and a numbered delta triangle, and keep earlier revisions visible at reduced strength.
- **Do** keep the drafting grid on the body background and let it show through the sheet tint.
- **Do** set labels, headers, and controls in uppercase Barlow Condensed with 0.04em to 0.08em tracking.
- **Do** use rev-ink, not rev, for vermilion text on the blue ground.

### Don't:

- **Don't** use vermilion for headings, rules, or ornament; it belongs to revisions and the primary action.
- **Don't** round corners beyond the 2px on buttons, or replace sheets with filled rounded cards.
- **Don't** introduce stroke alphas outside line, line-soft, and line-faint.
- **Don't** use dashed lines decoratively; a dash always means local only.
- **Don't** put descriptive text inside sheet-number tags; they hold only the sheet code.
- **Don't** set prose in mono; mono is for files, paths, and commands.
