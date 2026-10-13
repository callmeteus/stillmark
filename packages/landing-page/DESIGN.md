---
name: Stillmark Landing
description: A clean light documentation site where the only notebook touch is the red ballpoint that marks the changed line inside each demo
colors:
  pen: "#b50b0e"
  paper: "#fbfbfa"
  surface: "#ffffff"
  sunk: "#f3f3f1"
  ink: "#111111"
  ink-soft: "#3b3b3b"
  ink-muted: "#6a6a6a"
  rule: "#e3e3e0"
  rule-strong: "#c8c8c3"
  terminal: "#17181a"
  terminal-text: "#f2f2ee"
typography:
  display:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(38px, 6vw, 68px)"
    fontWeight: 700
    lineHeight: 1.04
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(28px, 3.6vw, 40px)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.02em"
  doc-title:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "clamp(34px, 4.6vw, 48px)"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.02em"
  title:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title-small:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1.25
  lead:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.55
  body:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.55
  nav:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "15.5px"
    fontWeight: 500
  label:
    fontFamily: "\"Yaldevi\", \"Helvetica Neue\", Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 700
    letterSpacing: "0.02em"
  mono:
    fontFamily: "\"JetBrains Mono\", ui-monospace, \"Cascadia Mono\", Consolas, monospace"
    fontSize: "13.5px"
    fontWeight: 400
    lineHeight: 1.55
  hand:
    fontFamily: "\"Edu SA Beginner\", \"Segoe Print\", \"Bradley Hand\", cursive"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.15
  hand-pt:
    fontFamily: "\"Kalam\", \"Segoe Print\", \"Bradley Hand\", cursive"
    fontSize: "17px"
    fontWeight: 300
    lineHeight: 1.15
rounded:
  small: "7px"
  inset: "8px"
  control: "10px"
  panel: "12px"
  card: "14px"
  pill: "999px"
spacing:
  page-width: "1120px"
  page-pad: "32px"
  page-pad-mobile: "18px"
  header-height: "64px"
  section-gap: "112px"
  section-gap-mobile: "80px"
  card-pad: "28px"
  grid-gap: "16px"
  docs-sidebar: "228px"
  docs-gap: "56px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "46px"
  button-primary-hover:
    backgroundColor: "#2b2b2b"
    textColor: "{colors.paper}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "46px"
  button-ghost:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "46px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    typography: "{typography.nav}"
    rounded: "{rounded.inset}"
    padding: "8px 12px"
  nav-link-active:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    typography: "{typography.nav}"
    rounded: "{rounded.inset}"
    padding: "8px 12px"
  picker-tab:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  picker-tab-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.pill}"
    padding: "0 14px"
    height: "40px"
  install-row:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.control}"
    padding: "8px 8px 8px 18px"
  install-copy:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "0 12px"
    height: "36px"
  example-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "28px"
  request-bubble:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "14px 16px"
  command-well:
    backgroundColor: "{colors.terminal}"
    textColor: "{colors.terminal-text}"
    typography: "{typography.mono}"
    rounded: "{rounded.inset}"
    padding: "12px 14px"
  file-excerpt:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.mono}"
    rounded: "{rounded.inset}"
    padding: "12px 16px 12px 22px"
  margin-note:
    backgroundColor: "transparent"
    textColor: "{colors.pen}"
    typography: "{typography.hand}"
  feature-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.card}"
    padding: "26px 28px 28px"
  docs-nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-soft}"
    rounded: "{rounded.small}"
    padding: "6px 10px"
  docs-nav-link-active:
    backgroundColor: "{colors.sunk}"
    textColor: "{colors.ink}"
    rounded: "{rounded.small}"
    padding: "6px 10px"
---

# Design System: Stillmark Landing

## Overview

**Creative North Star: "The Clean Manual With One Red Pen"**

The site is a quiet product manual: near-white paper, white surfaces, black ink, and grey hairlines, organized like a modern developer documentation site. A sticky top bar carries Docs, Commands, and Install with the GitHub mark and an EN / PT switch. The home page reads top to bottom in one column: a centered hero with two buttons and the supported editors, a topic picker of pill tabs that shows a real request, the command it runs, and the changed file, a grid of feature cards, an activity log table, and numbered install steps with editor tabs. The docs area pairs a sticky grouped sidebar with an overview and short topic pages.

The chrome is deliberately plain so the demos carry the personality. Inside every demo a red ballpoint marks exactly what changed: a hand-drawn circle around the changed line with a handwritten red note beside it, a red strike-through on refused lines and refused log rows, and a small red label naming the line as marked. That pen never leaves the demo. Navigation, buttons, headings, selection states, and focus are black and grey.

Surfaces are flat. Hierarchy comes from white cards on paper, 1px hairlines, a sunk grey for quiet fills, and solid black for the primary action and the selected choice. Nothing animates in on scroll; motion is limited to short hover transitions and a 3px arrow nudge.

**Key Characteristics:**

- Near-white paper, white surfaces, black ink, grey hairlines.
- Solid black for the primary button, the selected picker pill, the active locale, and install step numbers.
- One red ballpoint, used only inside demos to mark the changed or refused line.
- Print for everything people read, mono for files and commands, handwriting only for the red margin note.
- Linear single-column home; docs with a sticky grouped sidebar.
- Flat cards with hairline borders that turn black on hover.

## Colors

A neutral light palette with black as the only strong value in the chrome and one red ballpoint reserved for demo marks.

### Primary

- **Ballpoint Red** (pen): The pen inside demos only. The hand-drawn circle plate around the changed line, the handwritten margin note, the 2px strike-through on refused excerpt lines and refused log rows, the result cell of a refused log row, and the small "Changed line marked" label above an excerpt.

### Neutral

- **Paper** (paper): Page background, the translucent sticky header (at 92% with a 10px blur), the excerpt body, text on black fills.
- **Surface White** (surface): Cards, the install row, tables, the "On this page" box, the reference list, pager links, unselected pills, the ghost button, the locale switch frame.
- **Sunk Grey** (sunk): Quiet fills: active and hovered navigation links, the chat request bubble, the copy action, table heads, the selected editor tab, file chips on feature cards, icon tiles, count badges.
- **Ink** (ink): Headings, body text, the primary button fill, the selected picker pill, the active locale option, install step number discs, hover borders, the focus outline.
- **Soft Ink** (ink-soft): Leads, secondary copy, navigation links at rest, excerpt lines, table head text.
- **Muted Ink** (ink-muted): The second hero line, form and example labels, sidebar group headings, breadcrumbs, metadata, pager hints, resting arrows, the shell sign.
- **Hairline** (rule): Card and table borders, row dividers, the header and footer rules.
- **Strong Hairline** (rule-strong): Borders on controls (ghost button, install row, unselected pills, the docs menu toggle) and link underlines.
- **Terminal Black** (terminal) and **Terminal Text** (terminal-text): The command well under "Stillmark runs", the only dark surface on the site; its shell sign sits in a mid grey.

### Named Rules

**The Pen Stays In The Demo Rule.** Red appears only inside a demo, marking the line that changed or was refused. Navigation, buttons, headings, tabs, links, and focus are never red.

**The Black Choice Rule.** The primary action and the currently selected option are solid ink with paper text. Everything else rests on white or transparent and earns an ink border on hover.

## Typography

**Display Font:** Yaldevi (with "Helvetica Neue", Arial, sans-serif), weights 400, 500, 700
**Body Font:** Yaldevi
**Label/Mono Font:** JetBrains Mono (with ui-monospace, "Cascadia Mono", Consolas), weights 400 and 700
**Handwriting Font:** Edu SA Beginner in English; Kalam Light (300) in Portuguese, switched by a pt-BR override of the handwriting family and weight tokens, because Edu SA Beginner has no accented letters

**Character:** A clear bold sans for everything a person reads, a mono for anything that is literally a file, a command, or a log line, and a schoolroom hand reserved for the pen's margin note.

### Hierarchy

- **Display** (700, clamp 38px to 68px, 1.04, -0.025em): The two-line centered hero; the second line is Muted Ink.
- **Headline** (700, clamp 28px to 40px, 1.12, -0.02em): Home section titles, capped at 44rem.
- **Doc Title** (700, clamp 34px to 48px, 1.08, -0.02em): Docs overview and topic page titles.
- **Title** (700, 26px, 1.2): Docs section headings.
- **Title Small** (700, 20px to 21px, 1.25 to 1.3): Feature card titles, example titles, install step titles. Card titles in the docs run 17px to 18px.
- **Lead** (400, 18px, 1.55, Soft Ink): Section leads (hero lead 19px, topic summary 20px at 500 in Ink). 17px on phones.
- **Body** (400, 1rem, 1.55): Running text; docs text 16.5px at 1.6.
- **Nav** (500, 15.5px): Top navigation and picker pills (15px).
- **Label** (700, 13px, Muted Ink, sentence case): "You say", "Stillmark runs", "What changes", table heads. Sidebar group headings are the one uppercase label (12.5px, 0.04em).
- **Mono** (JetBrains Mono, 13px to 15px): Excerpt lines (13px on 20px), command wells (13.5px), file names (13.5px 700), the log table (14px), the locale switch (12.5px 700).
- **Hand** (17px, 1.15, Ballpoint Red): The margin note beside a marked line, and nothing else.

### Named Rules

**The Hand Only Annotates Rule.** The handwriting face appears only as the red margin note inside a demo. Requests, headings, and labels are always print.

**The Accent Fallback Rule.** Portuguese handwriting is Kalam Light through the pt-BR override of the handwriting token. Never ship Edu SA Beginner on accented text.

## Layout

A centered 1120px page with 32px side padding (18px at 640px and below) under a 64px sticky header. The home is one linear column: hero (104px top padding, 64px on narrow screens), then sections each opened by 112px of space (80px at 760px and below), each with a headline, a lead, and its content 32px below. Feature cards sit in a two-column grid with 16px gaps; install steps stack with 16px gaps.

Example cards use a container query: at 840px of card width and up the request column and the changed-file column sit side by side (5 to 6 ratio, 32px gap); narrower, they stack. Docs pages therefore stack request over file while the home picker shows them side by side.

The docs shell is a 228px sticky sidebar beside a main column capped at 52rem, 56px apart. Topic pages run breadcrumb, title, summary, lead, an "On this page" box, sections 56px apart (Try it, Examples, Commands), and a two-column prev/next pager 64px below.

Responsive steps:

- **900px and below:** The docs sidebar becomes a full-width toggle button above the content; the grouped links open in a bordered white panel below it.
- **760px and below:** Feature grid goes to one column; install step numbers move above the step text.
- **720px and below:** Header gaps tighten and the Commands link hides.
- **640px and below:** Install rows stack with the copy action right-aligned, "What are you working on?" cards go to one column, reference rows wrap their summary under the name.
- **420px and below:** The wordmark hides and only the logo mark remains.

## Elevation & Depth

Flat. There are no shadows. Depth comes from white surfaces on near-white paper, 1px hairline borders, the Sunk Grey fill for quiet insets, and solid ink for the selected or primary element. The single layering effect is the sticky header: paper at 92% opacity with a 10px backdrop blur over the scrolling page.

### Named Rules

**The Flat Surface Rule.** Nothing casts a shadow or lifts. Hover is shown by an ink border, an ink text color, a Sunk Grey fill, or a 3px arrow nudge.

## Shapes

Softly rounded rectangles in a small, consistent ladder: 7px for small controls (copy action, sidebar links, editor tabs), 8px for insets (top nav links, excerpts, command wells, icon tiles), 10px for controls and lists (buttons, install row, tables, pager, reference list, menu toggle), 12px for docs cards and the request bubble, 14px for large cards (example, feature, install step), and full pills for picker tabs, editor chips in the hero, and count badges. The request bubble has a 4px bottom-left corner so it reads as a chat message. Install step numbers are 34px ink discs. All borders are 1px solid; there are no dashed borders.

### Named Rules

**The Plate Rule.** The red circle around a changed line is the hand-drawn raster plate in assets/plates, never a CSS ellipse. The excerpt splits it: the loop stretches as a background behind the marked line and the arrow end keeps its fixed size in front of the margin note.

## Components

### Buttons

Solid and plain.

- **Shape:** 10px corners, 46px tall, 22px side padding, 16px 700 label.
- **Primary:** Ink fill with paper text; darkens to #2b2b2b on hover over 0.15s.
- **Ghost:** White fill, Strong Hairline border, ink text; the border turns ink on hover.
- **Text link:** Bold ink text over a 1.5px Strong Hairline underline that turns ink on hover; a trailing arrow nudges 3px right.
- **Focus:** Global 2px ink outline offset 3px.

### Chips (picker tabs)

- **Style:** 40px pill, white fill, Strong Hairline border, topic icon and 15px 500 label in Soft Ink.
- **State:** Hover gives an ink border and ink text. Selected is solid ink with paper text. Editor tabs in install steps are borderless 34px tabs with 7px corners; selected takes Sunk Grey and bold ink.

### Cards / Containers

- **Corner Style:** 14px on example, feature, and install step cards; 12px on docs cards; 10px on lists, tables, and pager links.
- **Background:** Surface White on Paper.
- **Shadow Strategy:** None (see Elevation & Depth).
- **Border:** 1px Hairline; linked cards turn the border ink on hover.
- **Internal Padding:** 28px on large cards (18px on phones), 22px on docs cards, 16px to 18px on list rows and pager links.

### Inputs / Fields (install field)

- **Style:** White row with a 1px Strong Hairline border and 10px corners, 54px minimum height, the command in mono 15px after a muted shell sign; the prompt variant sets its text in print. A bold Soft Ink label sits above.
- **Copy action:** 36px Sunk Grey button with a 1px Hairline border and 7px corners; the border turns ink on hover and after copying.

### Navigation

- **Top bar:** Logo mark and 21px bold wordmark, then Docs, Commands, and Install as 15.5px 500 links in Soft Ink with 8px corners; hover and current page take Sunk Grey and ink. GitHub mark and the EN / PT switch sit at the right; the switch is a white framed segmented control whose active option is solid ink.
- **Docs sidebar:** Uppercase muted group headings over 15px links; hover and current page take Sunk Grey, the current page in bold. Under 900px it collapses behind a toggle button with a rotating chevron.
- **Breadcrumb and pager:** 14px muted breadcrumb; pager links are white bordered cards with a muted hint and a 17px bold name, the next link right-aligned.

### Demo Example (signature)

The chat request in a Sunk Grey bubble led by a bold mono "/stillmark", the command in the dark terminal well with a grey "$" prefix, then the changed file: a mono file name with a file icon, the small red "Changed line marked" label on the right, and the excerpt in a 1px Hairline box on Paper. The marked line turns ink and is circled by the red plate (or struck through in red), with the handwritten red note beside it. A muted "What changes" label introduces the plain-language result.

### Before / After Slider

Two layers share one grid cell; the after layer is clipped from the left by a `--pos` custom property driven by a transparent full-size range input. A 1px ink divider carries a white round knob with the chevrons-left-right icon, and small ink "Before" / "After" tags sit in the top corners. It is only used for images and screens; clipping text makes both sides unreadable. The home design showcase compares a deliberately sloppy pricing mock (purple gradient, glow, pill buttons) against the clean version; that gradient is the only place the palette is broken, and only to show what Stillmark removes.

### Without / With Stillmark Split

Every topic (home picker and docs pages) shows what working looks like without Stillmark and with it. The same knob and range input resize two panes instead of clipping a layer: the left pane is Sunk Grey, the right is Surface White, and each holds a small window (three grey dots and a mono title naming the chat, phone, or file) over a centered caption. Each scene is sized to fit half the box and is pinned against the handle, so the shrinking side slides out under it while staying readable. Lines are neutral in Soft Ink, gone wrong in red with an x, or handled in bold ink with a check; the "without" window has a dashed border. Under 640px of width the panes stack and the handle disappears.

### Activity Log

A white bordered table with a Sunk Grey head of 13px bold labels and 1px Hairline row rules. Time, entry, and file cells are mono 14px; the request cell is print 15.5px. Refused rows strike the request and entry in 2px red and set the result in red.

## Do's and Don'ts

### Do:

- **Do** keep red inside demos: the circle plate, the margin note, refused strike-throughs, refused log results, and the "Changed line marked" label.
- **Do** use solid ink for the primary button and the selected option, and an ink border or Sunk Grey fill for hover.
- **Do** put cards on Surface White with a 1px Hairline border and no shadow.
- **Do** set files, commands, and log lines in JetBrains Mono and everything else people read in Yaldevi.
- **Do** let Portuguese handwriting fall to Kalam Light through the pt-BR override.
- **Do** draw the changed-line circle from the hand-drawn plate.

### Don't:

- **Don't** use red for navigation, buttons, headings, tabs, links, or focus.
- **Don't** add shadows, lifted cards, or scroll reveal animations.
- **Don't** bring back the paper grid texture, a left notebook margin, or numbered contents.
- **Don't** set requests, headings, or labels in the handwriting face.
- **Don't** show Edu SA Beginner on accented text.
- **Don't** replace the circle plate with a CSS ellipse or border.
