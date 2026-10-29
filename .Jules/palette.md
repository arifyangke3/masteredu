## 2025-02-14 - Icon-Only Toggle Accessibility in Indonesian UI
**Learning:** Icon-only toggle buttons (e.g. sound FX toggle) using static title attributes or English labels fail to properly communicate active state and local intent to screen reader users in Indonesian localized apps.
**Action:** Always supply localized dynamic `aria-label` along with explicit `aria-pressed={state}` and `focus-visible:ring-2` styles on icon-only toggle buttons.
