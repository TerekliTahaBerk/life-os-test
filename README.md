# Life OS

Life OS is a personal, static dashboard deployed on GitHub Pages. ChatGPT is the conversation and data-entry interface. The site reads the private Google Sheet directly after you authorize it with Google; it has no backend, no LLM integration, and no OpenAI API costs.

## Files created in Google Drive

- [Life OS folder](https://drive.google.com/drive/folders/1LHCuJELH61ChfPhWMvJ9QdBptj4F4ra3)
- [Life OS Data spreadsheet](https://docs.google.com/spreadsheets/d/1qWuOsOCNY-HiYr8OJ4UGjW2uOqucJRWLerfH-2V7A1E/edit)

The workbook has `Expenses`, `Meals`, `Tasks`, `Health`, `Settings`, and `Inbox` tabs. It is private in your Drive. The site requests the read-only Google Sheets scope and keeps the access token in memory until the page is closed. Tasks and email summaries are updated through ChatGPT, not from the site.

## GitHub Pages and Google Sheets

The Pages workflow uploads only the static files in `site/`. It does not publish the repository's documentation or any server code.

1. In Google Cloud Console, select the existing Life OS project and enable the Google Sheets API.
2. The OAuth consent screen is configured as **External** in testing mode; add each Google account that will use the dashboard as a test user.
3. Create an OAuth Client ID of type **Web application**. Add the authorized JavaScript origins `https://www.tahaberk.com` and `https://tereklitahaberk.github.io`. Origins contain no path. No redirect URI is needed for the Google Identity Services token flow used here.
4. Copy the client ID into `site/config.js` as `googleClientId`. It is public configuration, not a secret. After deployment, users click **Google ile bağlan** and grant read-only Sheet access. The site holds the short-lived token in memory and sends it only to the Google Sheets API.
5. Use the refresh button after ChatGPT updates the sheet. The site reads the `Expenses`, `Meals`, `Tasks`, `Health`, `Settings`, and `Inbox` tabs.

GitHub Actions deploys the site when files in `site/` change. The Pages workflow uses `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. The repository is public, so the deployed interface is public; your personal Sheet remains private and requires Google authorization.

## Sheet schema

The first row of each table is the header row. Keep headers unchanged.

- `Expenses`: `id, date, amount, currency, category, description, payment_method, source, created_at`
- `Meals`: `id, datetime, meal_type, foods, portion, notes, calories_estimate, protein_estimate, source, created_at`
- `Tasks`: `id, title, status, due_date, priority, project, source, created_at, completed_at`
- `Health`: `id, date, timestamp, provider, metric, device, source_id, num_value, text_value, unit, source, created_at`
- `Settings`: `setting, value, notes`
- `Inbox`: `id, received_at, sender, subject, summary, action_required, due_date, priority, status, source, created_at`

See [CHATGPT_WORKFLOW.md](CHATGPT_WORKFLOW.md) for copy-ready instructions to review Gmail, record expenses and meals, manage tasks, and add Freddy measurements through ChatGPT.

## Privacy and boundaries

- No Google service account, Freddy API key, or other secret is committed to GitHub.
- The site never calls Freddy or Gmail directly. ChatGPT reads requested messages and health measurements, then stores concise email summaries and selected health measurements in the private sheet.
- The dashboard OAuth scope is read-only. ChatGPT is used to add and update rows; the dashboard does not modify the sheet.
- GitHub Pages serves the dashboard publicly. It contains no personal records. The underlying Google Sheet remains private.
- If Google OAuth is left in testing mode, only accounts listed as test users can connect.
- Email summaries contain sender, subject, a short summary, action status, and date. Do not copy full message bodies or attachments into the sheet.
