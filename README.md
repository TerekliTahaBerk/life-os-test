# Life OS

Life OS is a personal, static dashboard deployed on GitHub Pages. ChatGPT is the conversation and data-entry interface. The site reads the private Google Sheet directly after you authorize it with Google; it has no backend, no LLM integration, and no OpenAI API costs.

## Files created in Google Drive

- [Life OS folder](https://drive.google.com/drive/folders/1LHCuJELH61ChfPhWMvJ9QdBptj4F4ra3)
- [Life OS Data spreadsheet](https://docs.google.com/spreadsheets/d/1qWuOsOCNY-HiYr8OJ4UGjW2uOqucJRWLerfH-2V7A1E/edit)

The workbook has `Expenses`, `Meals`, `Tasks`, `Health`, and `Settings` tabs. It is private in your Drive. The site requests the read-only Google Sheets scope and keeps the access token in memory until the page is closed. Tasks are updated through ChatGPT, not from the site.

## GitHub Pages and Google Sheets

The Pages workflow uploads only the static files in `site/`. It does not publish the repository's documentation or any server code.

1. In Google Cloud Console, create or select a project and enable the Google Sheets API.
2. Configure the OAuth consent screen as **External** and add your Google account as a test user while the app is in testing mode.
3. Create an OAuth Client ID of type **Web application**. Add this authorized JavaScript origin: `https://tereklitahaberk.github.io`. No redirect URI is needed for the Google Identity Services token flow used here.
4. Open the Life OS Pages site and paste the OAuth Client ID into the connection form. The client ID is public configuration, not a secret. Google issues a short-lived, read-only token directly to your browser after your consent; the site does not save or transmit that token anywhere except the Google Sheets API.
5. To refresh the dashboard after ChatGPT writes data, use the refresh button. The site reads the `Expenses`, `Meals`, `Tasks`, `Health`, and `Settings` tabs.

GitHub Actions deploys the site when files in `site/` change. The Pages workflow uses `actions/configure-pages`, `actions/upload-pages-artifact`, and `actions/deploy-pages`. The repository is public, so the deployed interface is public; your personal Sheet remains private and requires Google authorization.

## Sheet schema

The first row of each table is the header row. Keep headers unchanged.

- `Expenses`: `id, date, amount, currency, category, description, payment_method, source, created_at`
- `Meals`: `id, datetime, meal_type, foods, portion, notes, calories_estimate, protein_estimate, source, created_at`
- `Tasks`: `id, title, status, due_date, priority, project, source, created_at, completed_at`
- `Health`: `id, date, timestamp, provider, metric, device, source_id, num_value, text_value, unit, source, created_at`
- `Settings`: `setting, value, notes`

See [CHATGPT_WORKFLOW.md](CHATGPT_WORKFLOW.md) for copy-ready instructions to record expenses, meals, tasks, and Freddy measurements through ChatGPT.

## Privacy and boundaries

- No Google service account, Freddy API key, or other secret is committed to GitHub.
- The site never calls Freddy directly. Use Freddy in ChatGPT, then save only the desired measurements into the private `Health` tab. This avoids exposing a Freddy API key in a static site.
- The Google OAuth scope is read-only. ChatGPT is used to add and update rows.
- GitHub Pages serves the dashboard publicly. It contains no personal records. The underlying Google Sheet remains private.
- If Google OAuth is left in testing mode, only accounts listed as test users can connect.
