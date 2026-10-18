## 2025-05-18 - Specific ARIA Labels for Icon-Only Action Buttons
**Learning:** Icon-only action buttons in list views and modals (e.g., edit/delete question, remove option, sound toggle) are non-descriptive for screen readers when they lack contextual `aria-label` attributes or rely on static generic strings. Contextual identifiers like "Edit Soal #1" or dynamic states like "Matikan Suara FX" provide immediate clarity.
**Action:** Always pair icon-only controls with specific, contextual `aria-label`s and `focus-visible:ring-2` focus indicators for keyboard navigation.
