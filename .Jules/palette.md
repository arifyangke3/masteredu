# Palette's Journal - Critical UX & Accessibility Learnings

## 2026-10-10 - Student Game Card & Form Accessibility
**Learning:** In student portals where cards act as quick-select presets for PIN inputs, clickable `<div>` cards lack keyboard focus and trigger handlers, and inputs lack explicit programmatic label links. Screen reader users can get stranded without `role="button"`, `tabIndex={0}`, `aria-label`, and Enter/Space keyboard listeners, while form errors remain unannounced without `role="alert"` and `aria-describedby`.
**Action:** Always ensure quick-select preset cards have keyboard trigger handling (`Enter` and ` `), clear `aria-label` identifying the preset, visible focus rings, and explicit `<label htmlFor="...">` and `aria-describedby` error associations.
