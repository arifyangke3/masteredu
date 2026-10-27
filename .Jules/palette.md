# Palette's Journal - Critical UX & Accessibility Learnings

## 2025-05-18 - Accessibility in Question Bank Controls
**Learning:** Icon-only action buttons (like Edit3 and Trash2 icons) and unlabeled filter selects/search inputs in dashboard views can be invisible to screen reader users and difficult to navigate via keyboard.
**Action:** Always ensure icon-only buttons receive descriptive `aria-label` attributes and keyboard focus rings using `focus-visible:ring-2 focus-visible:ring-indigo-500`.
