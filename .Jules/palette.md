# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-11-09 - Student Portal Interactive Cards & Form Label Association
**Learning:** In classroom game portals, quick-select game cards were implemented as non-semantic `div` elements with `onClick` handlers. This broke keyboard navigation (inaccessible via Tab key) and lacked ARIA state (`aria-pressed`, descriptive `aria-label`). Form fields also lacked `htmlFor`/`id` association, hindering assistive technologies and label clicks.
**Action:** Always render interactive grid selection items as semantic `<button type="button">` with visible focus indicators (`focus-visible:ring-2`), and ensure form `<label>` tags explicitly associate with inputs using `htmlFor` and `id`.
