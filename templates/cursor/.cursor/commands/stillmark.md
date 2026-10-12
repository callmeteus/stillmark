# Stillmark

Follow the **stillmark** skill. Text after `/stillmark` is the full instruction.

## Planning

Parse as CLI when it starts with `roadmap`, `plan`, `coverage`, `move`, `add`, `init`, `install`, `classify`, or `long-running`. Run from project root:

`stillmark <args> --json`

## Design (embedded)

Also design mode when:

- The user says `design …`, or
- A **browser element** is attached (Cursor preview selection), or
- The message is casual UI feedback (e.g. "ta uma bosta arruma", "melhora isso", "fix this layout").

Map the selection to the **project's** source files, apply fixes, run the app, inspect once. If the preview is not this project (external site), explain and ask to select an element on the local dev app.

## Report

Planning: CLI JSON summary. Design: what you changed, files touched, what you verified in the browser.
