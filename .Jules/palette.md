# Palette's Journal - Critical Learnings

## 2025-05-20 - Contextual ARIA Labels for Table & Navbar Action Icons
**Learning:** Icon-only buttons in table rows (e.g. edit/delete question or inspect student score) and navbar toggles (e.g. sound toggle) lack accessible names for screen reader users when `aria-label` is omitted or static/generic. Adding dynamic or contextual `aria-label`s (including student name or active state) drastically improves screen reader usability.
**Action:** Always verify that every icon-only `<button>` has a dynamic, localized `aria-label` attribute matching its visual function and state.
