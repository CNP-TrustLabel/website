# CNP secure Google Drive uploader — setup

## What this version does

- Creates one new subfolder for every product submission.
- Stores the metadata file, uploaded documents and a submission receipt inside that subfolder.
- Removes public and link-based access from the new folder and uploaded files.
- Prevents editors from changing sharing settings where Google Drive permits it.
- Rejects uploads if the destination root folder has broad general access.

## 1. Restrict the destination folder

Open the destination Google Drive folder and set **General access** to **Restricted**.
You may explicitly share the folder with authorised CNP reviewers. Do not use “Anyone with the link” or domain-wide link access.

Destination folder ID already configured:
`1r2FPf_pm34vjTzBjuZQpJu59oDS3C6Cf`

## 2. Create the Apps Script project

1. Open `script.google.com` and create a new project.
2. Replace the default code with `Code.gs`.
3. Add an HTML file named `Index` and paste `Index.html` into it.
4. Copy `appsscript.json` if you manage the manifest manually.
5. Save the project and run any server function once from the editor to authorise Drive access.

## 3. Deploy the web app

1. Select **Deploy → New deployment**.
2. Choose **Web app**.
3. Set **Execute as** to **Me**.
4. Set access to the audience appropriate for your pilot.
5. Deploy and copy the production URL ending in `/exec`.

Do not use the `/dev` test URL on the public website.

## 4. Connect the website

Open `assets/upload-config.js` and paste the production URL:

```js
window.CNP_UPLOAD_PORTAL_URL = "https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec";
```

Upload the updated `submit-product.html`, `assets/site.js`, `assets/upload-config.js` and other site files to GitHub Pages.

## 5. Test before launch

1. Open the website submission page.
2. Submit one small test file.
3. Confirm that a new folder beginning with `CNP-` appears inside the destination folder.
4. Confirm that the test folder’s General access remains **Restricted**.
5. Confirm that the receipt code shown on screen matches the new folder name.

## Privacy limitation

A child folder can inherit access from its parent. The destination root must therefore remain restricted and should be shared only with authorised reviewers. The script verifies the root’s general-access setting before creating a submission.
