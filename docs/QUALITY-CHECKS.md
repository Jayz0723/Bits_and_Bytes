# Store Checks

Run `node tests/run-checks.cjs` to run the local checks sequentially. They use
Microsoft Edge through Playwright and do not place real orders or transfer money.
The optional supplied-account check runs only when `SAMPLE_ACCOUNT_PASSWORD` is
provided through the environment. Do not add passwords to test source files.

## Coverage

- Catalog filters, capacities, configured prices, stock limits, and photo galleries.
- Cart persistence, sign-in gates, sample payment validation, and tracking.
- Account isolation, favorites, address-book changes, and express delivery totals.
- Responsive page layouts, local images, icons, and clipped button labels.
- Correct navigation highlights, keyboard focus, pointer focus, and menu dismissal.
- Recovery from malformed cart, account, wishlist, and incomplete order records.
- Shared privacy/footer links, support forms, carousels, and component guides.

The visual audit checks five viewport widths: 1440, 1280, 768, 390, and 320 pixels.
Feature checks include additional widths. Generated screenshots are in the ignored
`images/previews/` directory. External requests are disabled by the visual audit so
local asset checks are repeatable without a third-party service.

These checks cover the local static store. They do not certify real payment
processing, production authentication, courier updates, or every browser/device.
