# Life OS

A personal dashboard for health, meals, expenses, and tasks. ChatGPT remains the conversation and capture interface; the dashboard does not call an LLM and needs no OpenAI API key.

## What is implemented

- Private password-protected dashboard with signed, HTTP-only session cookies.
- Today overview plus Health, Meals, Expenses, and Tasks views.
- Server-side Google Sheets reader and Freddy Personal API reader.
- Task completion from the dashboard, written back to the Tasks sheet.
- Responsive layout; the UI shows connection/setup states instead of pretending missing data is live.
- Gmail is intentionally handled in ChatGPT; this app does not request Gmail access or store email content.
- Copy-ready ChatGPT instructions are in [CHATGPT_WORKFLOW.md](CHATGPT_WORKFLOW.md).

## Google Sheet schema

Create tabs named exactly `Expenses`, `Meals`, and `Tasks`. The first row in each tab is the header row. Header names are case-insensitive.

`Expenses`: `id, date, amount, currency, category, description, payment_method, source, created_at`

`Meals`: `id, datetime, meal_type, foods, portion, notes, calories_estimate, protein_estimate, source, created_at`

`Tasks`: `id, title, status, due_date, priority, project, source, created_at, completed_at`

Use unique IDs. Dates should be `YYYY-MM-DD`; timestamps should be ISO 8601. Task statuses `open` and `done` are recognized. The panel reads all three tabs. Completing a task from the panel changes its `status` cell, so the Google service account needs Editor access; use Viewer access only if you remove/disable that action.

## Configure integrations

1. Create a Google Cloud service account, enable the Google Sheets API, and share the private spreadsheet with the service account email. Do not publish the sheet to the web.
2. In Freddy, create a Personal API key under AI apps → API keys. The key is read-only and should remain a server-side secret.
3. Set the variables in `.env.example` in your deployment environment. For `GOOGLE_PRIVATE_KEY`, paste the service account private key; Vercel supports multiline values. If entering escaped newlines, use `\\n`.
4. Deploy this repository to Vercel with the project root as the root directory. Set `DASHBOARD_PASSWORD`, a long random `SESSION_SECRET`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, `GOOGLE_SHEET_ID`, and `FREDDY_API_KEY`. Redeploy after changing environment variables.
5. Visit the deployment over HTTPS and sign in.

The Freddy key is sent only from the server to `https://freddy.coach/api/v1/metrics`. The dashboard requests the most recent 30 days (subject to Freddy's plan history window). API credentials are never exposed in browser JavaScript.

## Local preview

Serve the repository root with any static web server to preview the interface. API-backed sign-in and data will need a Vercel-compatible functions runtime and the environment variables above.

## Current boundaries

- No AI chat or OpenAI API calls are part of the web app.
- ChatGPT is the data-entry and email-review interface. Google Sheets is the initial source of truth.
- Health data is read-only through Freddy's API.
- Gmail content is not ingested into this application.
- Google Sheets and Freddy credentials are required for live data; without them the dashboard shows setup/error states.
