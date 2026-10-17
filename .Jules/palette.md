# Palette's UX Journal

## 2025-05-20 - Dynamic ARIA Labels & Focus Rings on Icon-Only Actions
**Learning:** Icon-only action buttons in UI components (such as Navbar sound controls and table row Edit/Delete triggers) often rely on static or missing `aria-label`s and lack explicit `focus-visible:ring-2` focus indicators, making them hard to navigate for keyboard and screen reader users.
**Action:** Always provide dynamic `aria-label` attributes reflecting current toggle state and add visible `focus-visible:ring-2` ring styles on icon-only buttons.
