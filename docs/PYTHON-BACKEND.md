# Python backend search

Python now handles the matching and ranking for the navigation search and search
results page. Node.js remains the HTTP server and handles SQLite accounts,
sessions, address books, profile photos and the AI chat connection.

## Start the store

Install Python 3.10 or newer and Node.js 24 or newer. Check `python --version`,
then run `npm start` from the project directory. Open http://localhost:4173/.
There are no Python packages to install and no second server to launch.

If Python is not on PATH, set `PYTHON_EXECUTABLE` in the local `.env` to its full
executable path, then restart the server. Keep `.env` private. Direct-file and
static hosting previews continue using the existing JavaScript search fallback.

## Request process

1. A shopper types a query. The browser waits 180 milliseconds after typing to
   avoid sending a request for every keystroke.
2. The browser calls `GET /api/search?q=Samsung&kind=Products` on the store server.
3. Node validates the query length and category. Its public search index comes
   from the checked-in product, article and support-page data at startup.
4. Node starts `backend/search.py` with a hidden process window. It sends JSON
   through standard input; the query is never inserted into a shell command.
5. Python normalizes case and accents, requires each query word to match, then
   ranks title/brand matches above incidental description matches.
6. Python returns JSON containing result titles, summaries, images and links.
   Node sends it to the browser, which renders the results using escaped text.
7. A request counter prevents an older response from replacing a newer query.
   If Python is missing or unavailable, the browser uses local search.

For example, `Samsung monitor` finds the Samsung monitors; `delivery` can find
the delivery article and tracking/support pages. Category buttons restrict the
results to products, articles or pages.

## Files and responsibilities

| File | Responsibility |
| --- | --- |
| `backend/search.py` | Python normalization, matching, ranking and JSON output |
| `search-service.cjs` | Public index, validated Python process bridge, timeout/concurrency limits |
| `server.cjs` | Same-origin `/api/search` route and existing account/database APIs |
| `js/site-experience.js` | Debounced requests, search UI, stale-response protection and fallback |
| `tests/check-python-search.cjs` | Real Python/API/browser tests and missing-Python recovery |

## Data and operating limits

The worker receives only public catalog/page data and the search query. Accounts,
addresses, sessions, database files and API keys are not passed to it. It does
not write customer data or replace the existing SQLite database.

Queries are limited to 150 characters. The bridge allows at most three simultaneous
workers, kills a worker after five seconds, bounds output size and reports
sanitized errors. It uses Python's standard library only. One short-lived process
per search is straightforward for this small store; sustained high traffic would
benefit from a persistent worker or a dedicated search service. Restart the store
after editing the catalog so the server index reflects the changes.

Run `node tests/check-python-search.cjs` to verify the Python integration.
