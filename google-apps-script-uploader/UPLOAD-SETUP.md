# Connect the CNP submission page to Google Drive

The destination folder is already configured in `Code.gs`:

`1r2FPf_pm34vjTzBjuZQpJu59oDS3C6Cf`

## One-time deployment

1. Open https://script.google.com and create a **New project**.
2. Replace the default `Code.gs` with the supplied `Code.gs`.
3. Add an HTML file named **Index** and paste the supplied `Index.html`.
4. Optionally enable the manifest in **Project Settings** and use the supplied `appsscript.json`.
5. Click **Deploy → New deployment → Web app**.
6. Set **Execute as: Me**.
7. Set access to **Anyone** if external brands must upload without a Google Workspace account.
8. Authorise Drive access and deploy.
9. Copy the web-app URL ending in `/exec`.
10. Paste it into `assets/upload-config.js` in the website package.

The portal creates a private subfolder for each product submission and stores:
- the uploaded files;
- brand, product, email, selected plan and notes;
- a `submission-details.json` record.

## Security recommendations

- Keep the Drive folder itself restricted. Do not give public editor access.
- Set `ACCESS_CODE` in `Code.gs` for invite-only pilots.
- The MVP portal limits uploads to 12 files and 8 MB per file.
- For production, add CAPTCHA, a privacy notice, retention rules, malware scanning and email notifications.
