# Setup guide: GitHub Pages + a free Google Sheets database

You will do three things: put the site on GitHub Pages, create a Google Sheet that works as your database, and connect them. It takes about 15 minutes and costs nothing.

```
Your browser  ->  GitHub Pages site (HTML, CSS, JS)
      |
      v  (text/plain POST with your secret key)
Google Apps Script web app  ->  Google Sheet (Links, Decisions, Settings)
```

## Part A. Create the Google Sheet database

1. Sign in to your Google Workspace (or Gmail) account and open https://sheets.google.com.
2. Create a blank spreadsheet and name it **Analyst Link Hub DB**.
3. Open **Extensions → Apps Script**.
4. Delete everything in `Code.gs`, then paste the full contents of `google-apps-script/Code.gs` from this project. Click **Save** (the disk icon).
5. Go back to the Sheet tab and reload the page. A new menu **Link Hub** appears.
6. Click **Link Hub → 1. Set up sheets and secret key**. Google asks you to authorize the script: choose your account, then **Advanced → Go to (project name) (unsafe) → Allow**. This is normal for your own scripts.
7. A box shows your **secret key**. Copy it somewhere safe. You can show it again from **Link Hub → Show my secret key**.

The script creates three tabs: **Links**, **Decisions** and **Settings**. Every cell is stored as plain text, so something like `=SUM(1,2)` typed as a link title is never run as a formula.

## Part B. Publish the Apps Script as a web app

1. In the Apps Script editor click **Deploy → New deployment**.
2. Click the gear icon next to "Select type" and choose **Web app**.
3. Set **Execute as: Me** and **Who has access: Anyone**.
4. Click **Deploy** and authorize if asked.
5. Copy the **Web app URL**. It ends in `/exec`.
6. Test it: paste the URL into a new browser tab. You should see `{"ok":true,"service":"Analyst Link Hub API",...}`.

Why "Anyone"? Your GitHub Pages site is on a different address, so the browser calls the script without Google sign-in. Nobody can read or change your data without the secret key.

If **Anyone** is not available, your Workspace admin has restricted it. Ask the admin to allow web apps for "Anyone", or create the Sheet with a personal Google account instead.

## Part C. Deploy the site to GitHub Pages

1. Create a free GitHub account if you do not have one, then click **New repository**. Name it `analyst-link-hub` and keep it **Public**.
2. Upload all files from this project (or use the commands below). Rename `_gitignore` to `.gitignore` and `_nojekyll` to `.nojekyll` if they came with underscores.
3. Open the repository **Settings → Pages**, set **Source** to **GitHub Actions**.
4. Push to the `main` branch. The workflow in `.github/workflows/pages.yml` publishes the site.
5. After a minute your site is at `https://YOUR-USERNAME.github.io/analyst-link-hub/`.

```bash
git init
git add .
git commit -m "Analyst Link Hub with Google Sheets sync"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/analyst-link-hub.git
git push -u origin main
```

Do not put your secret key or Web app URL in any file you push to GitHub. You will paste them into the site itself in the next part.

## Part D. Connect the site to your Sheet

1. Open your GitHub Pages site and click the **☁** button at the top right.
2. Paste the **Web app URL** and the **secret key**, then click **Connect**.
3. If your Sheet is empty, your current links are saved into it. If it already has data, the site loads it.
4. Keep **Save changes to the Sheet automatically** ticked. The ☁ turns green after each save.

On your phone or another computer, open the same site and repeat step 2. Your links, decisions, weekly review date, domain and launcher apps follow you.

### How sync behaves

- The newest save wins. Two devices editing at the same moment can overwrite each other, so let a save finish (green ☁) before switching devices.
- The site loads from the Sheet when it opens, and again when you return to the tab after 30 seconds.
- If the site would save an empty list over existing data, the script refuses. Use **Save to Sheet** and confirm if you really want to empty it.
- Recover older data with **File → Version history** in the Sheet.
- Your URL and key are kept in this browser only. **Disconnect** removes them.

## Part E. Changing the script later

Edit `Code.gs`, then **Deploy → Manage deployments → pencil icon → Version: New version → Deploy**. The URL stays the same. Saving the code alone does not update the live web app.

## Troubleshooting

| What you see | What to do |
| --- | --- |
| "Wrong or missing secret key" | Copy the key again from **Link Hub → Show my secret key**. |
| "No data came back" or a network error | Use the URL ending in `/exec` (not `/dev`). Set access to **Anyone**. Create a new version after code changes. |
| The URL is rejected | It must start with `https://script.google.com/` and end with `/exec`. |
| Nothing saves | Check that the ☁ is not red. Open the Executions page in Apps Script for errors. |
| "The Sheet is busy" | Wait a few seconds and try again. |
| You made a new secret key | Paste the new key into the Sync box on each device. |

## About Google Cloud and free limits

- Every Apps Script project runs on a Google Cloud project that Google creates for you. You do not need to enable billing or create anything in the Cloud console.
- To use your own Cloud project, open Apps Script **Project Settings → Google Cloud Platform (GCP) Project → Change project**. This is optional.
- Apps Script and Google Sheets are free to use. Daily quotas apply and differ between personal and Workspace accounts: https://developers.google.com/apps-script/guides/services/quotas
- One Sheet holds this app's data comfortably. The script keeps up to 5,000 links.

## Security notes

- Treat the secret key like a password. Anyone with both the Web app URL and the key can read and replace your data.
- Make a new key from **Link Hub → Make a new secret key** if you think it leaked.
- The script runs as you, so your Sheet itself stays private unless you share it.
- Uploaded link images are stored as small text in the Sheet.
