# Life OS

A private, personal dashboard for health, meals, expenses, and tasks. ChatGPT remains the conversation and capture interface; this dashboard does not call an LLM or use an OpenAI API key.

## Integrations

- Google Sheets is the source of truth for expenses, meals, and tasks. Share the spreadsheet with a Google service account that has Viewer access (Editor access only if you want to complete tasks from the dashboard).
- Freddy Personal API is read-only and is queried from server-side code. Create a key in Freddy under AI apps → API keys.
- Gmail stays in ChatGPT; this app does not request Gmail access.

See `.env.example` for configuration and the expected sheet headers. Deploy as a Vercel project with the repository root as the project root. Add environment variables in Vercel, then redeploy.