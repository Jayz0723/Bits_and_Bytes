# Languages and currencies

The shopping interface supports English, Japanese, Spanish, French and Simplified Chinese.
The language selector uses native language names. Selecting Japanese also selects JPY;
Spanish or French selects EUR; Chinese selects CNY. Currency can then be changed independently.
Both preferences are saved on the current browser and retained between pages.

## Editing translations

Edit the rows in `js/localization.js`: English, Japanese, Spanish, French, Chinese.
Shared navigation, catalog controls, shopping actions, account labels and checkout labels
use these translations, including dynamically inserted cards and dialogs. Product model
names, technical specifications, Philippine place names and unlisted long-form copy remain
in their original language. This is interface localization, not a complete translation of
every editorial or legal page. Mark custom content with `translate="no"` to exclude it.
The page's language attribute and number formatting follow the selected language.
Form values, product IDs and stored order records are never translated.

## Display currencies

Edit `displayCurrencyRates` near the top of `js/app.js`. These are fixed, illustrative
display settings, **not live or guaranteed exchange rates**:

| Currency | Units per PHP |
| --- | ---: |
| PHP | 1 |
| USD | 1 / 57 |
| JPY | 2.6 |
| EUR | 0.016 |
| CNY | 0.123 |

JPY has no decimal places. EUR and CNY use two; PHP and USD retain the original
whole-number catalog display. Price filters convert the entered display amounts back
to PHP before comparing catalog prices. Changing a display currency does not change
product prices in storage, payment QR amounts, delivery fees, refunds or order totals.
Checkout and payment verification remain in PHP, with an explicit notice when displaying
another currency. No exchange-rate service or API key is required, including offline use.

Run `node tests/check-localization.cjs` to check language selection, currency defaults,
navigation labels, filters, persisted preferences, cart behavior and responsive layouts.
