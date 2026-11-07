# Palette's UX Journal

## 2026-10-10 - Accessible Selection Cards and Form Controls Pattern
**Learning:** In classroom game portals, students frequently use keyboards or assistive devices on laptops or tablets. Interactive quick-select cards rendered as `<div>` elements without semantic button markup or focus indicators break keyboard navigability and screen reader discovery. Moreover, unassociated `<label>` elements prevent screen readers and touch target focus behavior from connecting labels with inputs.
**Action:** When creating selectable card grids or input forms, always assign explicit `htmlFor` and `id` pairings to inputs, and use semantic `<button type="button">` elements with descriptive `aria-label`, `aria-pressed`, and `focus-visible:ring-2` styling.
