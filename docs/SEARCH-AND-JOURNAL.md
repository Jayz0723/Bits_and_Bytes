# Search, homepage and journal

- Navigation magnifier: opens a full-width modal, live product/article/page results, popular queries, and a full results link. Enter opens `pages/search.html?q=...`. All text is escaped; product IDs and query strings are encoded.
- Search matches every typed word, without case or accent sensitivity. Product data includes brands, specs, use, component categories and variants. Primary product/category matches rank above incidental specification matches. Results page filters All, Products, Articles and Pages.
- Original guides: edit the `storeArticles` array in `js/site-experience.js`. Each guide has a stable ID, category, local image, summary, sections and a shopping query. The homepage shows five highlights, the journal indexes six guides with category filters, and article pages include contents anchors, a related-reading grid and a relevant CTA. These are store-written buying guides, not republished ASUS articles or externally sourced news.
- Homepage: the existing five-photo promotion carousel now leads the page. A requestAnimationFrame clock fills the active bar and advances after five visible seconds. It pauses offscreen, when the tab is hidden, for keyboard focus or by its pause control. Hover alone does not pause. Manual controls reset timing. Reduced-motion preferences disable automatic advancement and backdrop motion by default; explicit Play still permits advancement.
- Background: a slow broad teal/graphite/plum linear-gradient wash with a scroll-driven offset, plus a decorative outlined Bits & Bytes wordmark. No ROG branding or copied graphics are used. Existing product, payment, account, music and robot-chat features remain intact.
- Shared styling lives in `css/site-experience.css`; shared behavior and guide content live in `js/site-experience.js`. New pages use the same header, footer and dark palette as the store.
- Checks: `node tests/check-site-experience.cjs`, plus existing navigation, carousel and file-reference checks.

Visual reference: https://rog.asus.com/ (layout inspiration only).
