# Bits & Bytes navigation pages

Open `index.html` in this folder. The 14 HTML pages cover Home and the destinations in the header menus and toolbar. HTML comments explain the page structure. The stylesheet `css/static-edition.css` explains the native menu and carousel controls.

Product details, color variants, individual articles, and filtered catalog results link to the original store pages. JavaScript builds those views from the original catalog and article data. Supporting footer pages also open from the original store. Keep this folder next to the original `pages` folder so those links resolve.

Account, checkout, and other form pages in this folder are previews with links to their interactive counterparts. Run `npm start` from the repository root to use the original store’s server features.

The optional Recently viewed section on Home and Products uses `js/recently-viewed.js` and `css/recently-viewed.css` in this folder. It shares browser history with the original storefront, remembers selected variants for 30 days, and supports removing items or clearing history. It does not require an account.
