# Analyst Link Hub

A fast, no-build link organizer for data analysts. Put every dashboard, dataset, doc and tutorial in one place, set reminder dates, and let the page tell you what to open first.

Built with plain HTML, CSS and vanilla JavaScript. No framework, no build step, no server.

## Features

- **Free Google Sheets database:** sync your links, decisions and settings to your own Google Sheet through a small Apps Script (`google-apps-script/Code.gs`). Works across devices. See `docs/SETUP.md`.
- **Your mentor:** a coach panel reads your links and tells you the next step in plain words. It shows six readiness gates (Ask to Act), warns if you skipped ahead, and says when you have evidence at every stage.
- **Decision log:** record what you decided and why, so you can check it later.
- **Today’s focus:** pick the time you have (15 minutes to half a day) and get a short queue that fits it, ranked by importance, due date and pins. Tick links off as you finish them.
- **Clear hierarchy:** every link is Must do, Should do, Later, or in the Inbox waiting to be sorted. New and bulk-imported links land in the Inbox, so nothing competes for focus until you decide.
- **Link icons:** every link shows an icon so you can recognise it before clicking. Use the site’s own icon (automatic), an emoji, or upload your own image. Upload is cropped square and stays in your browser. Turn site icons off any time with **Site icons**.
- **Mobile-first navigation:** on phones the sidebar becomes a slide-in menu from the bottom bar, dialogs open as bottom sheets, and each link’s actions sit in their own row with large tap targets.
- **Start next action:** one tap in the sidebar opens the top link of today’s focus.
- **Weekly review:** record when you last reviewed, and get a reminder after 7 days.
- **Stage-aware insights:** gaps such as skipping Ask, data with no cleaning step, or dashboards nobody opens.
- **Analyst-style navigation:** the sidebar is grouped by task (Today, Analyst workflow, Google hub, Review). Each workflow step shows a ✓ when you have used evidence there, a count, and a dot when something is due.
- **Compact sidebar:** Analyst path and Google hub collapse like accordions, and each Google hub stage opens on its own. Your choices are remembered.
- **Customizable launcher:** rename, re-point, add or remove the apps in the ⋮⋮⋮ menu.
- **Decision brief:** a 0 to 100 workload score, and a Do now / Needs a date / Drop triage.
- **Reminders:** due-today and overdue flags on every link.
- **Smart insights:** category balance, stale links, most-used link, workload warnings.
- **Analyst path:** links are grouped in the order of a successful project: Ask, Prepare, Process, Analyze, Share, Act, Learn. Sort by priority or by path, and see which stages have no links yet.
- **Google hub:** official Workspace and Google Cloud apps (Sheets, BigQuery, Looker Studio, Colab and more) in analyst order. Save your Workspace domain to open them signed in to it.
- **Bulk import:** paste many links at once (`Title | URL` or just the URL). Categories are guessed from the site.
- **Workspace-style interface:** search bar, sidebar views, apps launcher, undo on delete, light and dark themes.
- **Private by design:** data stays in your browser (`localStorage`). Nothing is sent anywhere.

## Google hub: official apps in analyst order

The stages follow the six-phase process taught in the Google Data Analytics Certificate (Ask, Prepare, Process, Analyze, Share, Act), plus Learn. With a Workspace domain saved, apps marked * open signed in to it.

| Stage | App | URL |
| --- | --- | --- |
| 1. Ask | Calendar* | https://calendar.google.com |
| 1. Ask | Docs* | https://docs.google.com/document/ |
| 1. Ask | Chat | https://chat.google.com/ |
| 1. Ask | Meet* | https://meet.google.com/ |
| 2. Prepare | Forms* | https://docs.google.com/forms/ |
| 2. Prepare | Drive* | https://drive.google.com |
| 2. Prepare | Analytics | https://analytics.google.com/ |
| 2. Prepare | Search Console | https://search.google.com/search-console |
| 2. Prepare | Trends | https://trends.google.com/ |
| 2. Prepare | Dataset Search | https://datasetsearch.research.google.com/ |
| 2. Prepare | Cloud Storage | https://console.cloud.google.com/storage |
| 3. Process | Sheets* | https://docs.google.com/spreadsheets/ |
| 3. Process | BigQuery | https://console.cloud.google.com/bigquery |
| 3. Process | Apps Script | https://script.google.com/ |
| 3. Process | Dataform | https://cloud.google.com/dataform |
| 4. Analyze | Colab | https://colab.research.google.com/ |
| 4. Analyze | Vertex AI | https://console.cloud.google.com/vertex-ai |
| 5. Share | Looker Studio | https://lookerstudio.google.com/ |
| 5. Share | Looker | https://cloud.google.com/looker |
| 6. Act | Slides* | https://docs.google.com/presentation/ |
| 6. Act | Gmail* | https://mail.google.com |
| 6. Act | Groups* | https://groups.google.com |
| 7. Learn | Skills Boost | https://www.cloudskillsboost.google/ |
| 7. Learn | Analytics Certificate | https://grow.google/certificates/data-analytics/ |
| 7. Learn | BigQuery docs | https://cloud.google.com/bigquery/docs |
| 7. Learn | Looker Studio help | https://support.google.com/looker-studio |
| Admin & setup | Admin console | https://admin.google.com/ |
| Admin & setup | Cloud Console | https://console.cloud.google.com/ |

## The thinking behind it

- **Importance before urgency** (Eisenhower matrix): rate what matters first, and keep each group small. Keep Must do to about 3 a day.
- **Vital few** (Pareto, the 80/20 idea): a small share of links drives most of your results. The Insights panel shows how concentrated your opens are.
- **Inbox, then decide** (Getting Things Done): capture everything, then sort it on a regular schedule, and run a short weekly review.
- **Follow the analysis process** (Google Data Analytics: Ask, Prepare, Process, Analyze, Share, Act): start with the question, check data integrity before analysis, and finish with a decision.
- **Retire what nobody uses** (dashboard audits): review usage, keep the dashboards people rely on, merge duplicates, and retire the rest.
- **Most important first** (dashboard design): the top of the page shows today’s focus, then health, then detail.

Sources: [Eisenhower matrix](https://www.techtarget.com/whatis/definition/Eisenhower-Matrix), [Pareto principle](https://asana.com/resources/pareto-principle-80-20-rule), [dashboard hierarchy](https://carbondesignsystem.com/data-visualization/dashboards), [GTD](https://asana.com/resources/getting-things-done-gtd), [dashboard audits](https://www.techtarget.com/searchbusinessanalytics/tip/Why-a-dashboard-audit-matters-before-BI-cleanup), [data analysis phases](https://grow.google/grow-your-career/articles/what-is-data-analytics).

## About link icons

Automatic icons come from Google’s favicon service (`google.com/s2/favicons?domain=...&sz=64`), with DuckDuckGo’s icon service as a backup and a colored letter tile as the last fallback. Only the website’s domain is sent, never the full link. These services are not formally documented, so the tile fallback keeps the page working if one changes. Icons load on your deployed GitHub Pages site. Some preview sandboxes block outside images, and then you see the letter tiles.

## Navigation principles used

- Group by the task the user is doing, with clear short labels and group headings.
- Keep the main list to roughly 5 to 9 items, with less-used items lower down and collapsible.
- Mark the current item clearly, and mirror the top sections in a phone bottom bar.
- Keep to two levels at most.

Sources: [sidebar guidelines](https://design.actabl.com/components/sidebar), [Cloudscape side navigation](https://cloudscape.design/patterns/general/service-navigation/side-navigation/), [sidebar design guide](https://www.inspoai.io/blogs/sidebar-navigation-design).

## Keyboard shortcuts

| Key | Action |
| --- | --- |
| `/` | Focus search |
| `c` | Add a link |
| `Esc` | Close the apps menu |

## Set up the Google Sheets database

Follow `docs/SETUP.md` (about 15 minutes, free). It covers the Sheet, the Apps Script web app, GitHub Pages, and connecting them with the ☁ button.

## Deploy to GitHub Pages

1. Create a new repository on GitHub, for example `analyst-link-hub`.
2. Upload every file in this folder (or run the commands below).
3. In the repository, open **Settings → Pages** and set **Source** to **GitHub Actions**.
4. Push to `main`. The workflow in `.github/workflows/pages.yml` publishes the site.
5. Your site appears at `https://YOUR-USERNAME.github.io/analyst-link-hub/`.

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/analyst-link-hub.git
git push -u origin main
```

No Actions? Choose **Deploy from a branch**, then `main` and `/ (root)` under **Settings → Pages**.

## Run locally

Open `index.html` in a browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`.

## Project structure

```
index.html            Page structure
assets/css/style.css  Styles and light/dark theme tokens
assets/js/app.js      State, decision logic, Workspace links, rendering
assets/js/sync.js     Google Sheets sync client
google-apps-script/   Code.gs: the Sheets database (paste into Apps Script)
docs/SETUP.md         Step-by-step setup guide
.github/workflows/    GitHub Pages deployment
```

## How the score works

Start at 100, then subtract 12 per overdue link, 4 per stale link (never opened, or not opened for 14+ days), 5 per high-priority link with no date, and 4 for each link beyond 5 due in the next 3 days. It reads only your link data, so treat it as a guide.

## Notes

- Workspace links use the `/a/yourdomain.com` pattern. If you use several Google accounts, Google may ask which one to use.
- Data is per browser. Use **Export** to back it up.

## License

MIT. See `LICENSE`, and replace "Your Name" with yours.
