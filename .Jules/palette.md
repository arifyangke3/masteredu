## 2026-10-28 - Explicit ARIA Labels for Dynamic Sound & Action Controls
**Learning:** Icon-only buttons (such as sound FX toggles and modal action icons like edit/delete/close) lack text context for screen readers if only title attributes or static generic labels are used.
**Action:** Always provide dynamic, localized `aria-label`s and appropriate state attributes like `aria-pressed` for toggle buttons across all UI modals and navigation elements.
