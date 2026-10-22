## 2025-05-18 - Modal Dialog Accessibility and Keyboard Navigation

**Learning:** Modal overlays in custom design systems often miss ARIA semantics (`role="dialog"`, `aria-modal="true"`, `aria-labelledby`) and keyboard escape listener, preventing screen reader announcements and standard keyboard dismissal.
**Action:** When building or updating modal dialogs, always include `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, explicit `aria-label` for icon close buttons, and a `keydown` listener for `Escape`.
