## 2025-10-12 - Modal Accessibility & Escape Dismissal
**Learning:** React modals missing `role="dialog"`, `aria-modal="true"`, `aria-label` on close buttons, and `Escape` key handlers prevent screen reader and keyboard-only users from efficiently closing dialogs.
**Action:** When building or touching modal components, always attach `Escape` key event listeners, specify `role="dialog"` / `aria-modal="true"`, and ensure all icon-only close buttons have explicit `aria-label` attributes.
