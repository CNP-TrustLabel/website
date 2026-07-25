CNP SITE V9 — FUNCTIONAL FIXES

Main fixes
1. The About page now loads a dedicated assets/about.js file. Clicking any team card opens the biography dialog; close works with the X button, backdrop and Escape key.
2. submit-product.html now loads assets/upload-config.js before assets/site.js, so the Apps Script portal URL is actually available to the page.
3. The upload backend creates a unique restricted Google Drive subfolder for every submission.
4. Each submission receives a receipt code beginning with CNP-.
5. Public and link-based access are removed from new folders and files. The script rejects uploads when the destination root folder General access is not Restricted.

Website files to upload to GitHub
- index.html
- how-it-works.html
- what-cnp-evaluates.html
- validation-levels.html
- submit-product.html
- about.html
- privacy-notice.html
- complete assets/ folder

Google Apps Script files
Do not upload google-apps-script-uploader/ to GitHub as part of the public site.
Copy its Code.gs and Index.html into a Google Apps Script project, deploy it as a production web app, then paste the /exec URL into assets/upload-config.js.

Important privacy condition
The destination Google Drive root folder must have General access set to Restricted. Explicitly authorised CNP reviewers may retain access. A child folder can inherit authorised access from its parent.
