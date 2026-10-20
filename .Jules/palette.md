## 2025-05-18 - Interactive Game Selection Cards Need Semantic Buttons
**Learning:** In educational game portals, quick-select game cards rendered as `div` elements with `onClick` prevent keyboard-only students from selecting games using Tab and Enter. Using semantic `<button type="button">` with descriptive `aria-label`s ensures full keyboard and screen reader accessibility.
**Action:** Always render interactive card containers as semantic `<button>` elements with `focus-visible:ring-2` styles and explicit `aria-label`s.
