# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-15 - Student Portal Quick-Select Cards & Code Input Accessibility
**Learning:** Classroom student portals often offer interactive cards for quick access to active games alongside manual PIN input. When implementing quick-select cards with `<div>`, omitting `role="button"`, `tabIndex={0}`, keyboard event handlers (`Enter`/`Space`), and `focus-visible` styling completely excludes keyboard and assistive technology users from one-click classroom entry. Furthermore, game PIN inputs benefit significantly from explicit `<label htmlFor="...">`, `autoComplete="off"`, and `spellCheck={false}` to prevent intrusive autocorrect on uppercase codes.
**Action:** Always provide explicit form control association (`htmlFor` + `id`), disable autocorrect/autocomplete on game PIN inputs, and pair interactive clickable cards with `role="button"`, `tabIndex={0}`, `onKeyDown` listeners, and visible focus rings.
