# AI shopping assistant

Chat posts to the store server's `/api/chat` endpoint. The server calls OpenAI's Responses API; the browser never receives the API key. It supplies the checked-in catalog, not private customer records. Recent messages stay in page memory only. The assistant cannot confirm real payments, change orders, or access private tracking.

## Configuration

In the project root `.env`, set `OPENAI_API_KEY` privately. Optional `OPENAI_MODEL` defaults to `gpt-4.1-mini`. Restart `npm start` after changing configuration, then open http://localhost:4173/ and refresh. Direct-file previews and GitHub Pages alone cannot run this server endpoint. On other hosting, configure these environment variables in the server host's secret settings.

OpenAI API access requires a valid key, project model permissions and sufficient API billing/credits; a ChatGPT subscription alone is not API credit. Chat shows sanitized connection, key, quota, model and timeout errors. It does not silently replace failed AI requests with canned answers.

Each request includes at most nine recent messages, with text limited to 2,000 characters each. Server validation accepts only alternating user/assistant roles, limits total input, permits 20 attempts per IP per ten minutes and three concurrent requests. Production deployments should add a shared durable limiter, bot protection and account-level spending controls before broad public access. Requests set `store:false`; this does not remove provider abuse-monitoring retention obligations. Never paste keys into chat, browser code or Git.

Official documentation: https://developers.openai.com/api/docs/guides/migrate-to-responses
