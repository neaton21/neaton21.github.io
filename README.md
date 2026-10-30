# Nate Eaton — personal portfolio

A lightweight, responsive portfolio for **neaton21.github.io**. Plain semantic HTML and CSS; no build step, runtime JavaScript, external fonts, analytics, backend, forms, or secrets.

## Local preview

Requires Python 3. From this folder:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Open **http://127.0.0.1:8000/**. Stop with Ctrl+C. You can also open `index.html` directly; all content and navigation work without JavaScript.

The preview started during development serves the parent Downloads folder, so its address is **http://127.0.0.1:8000/neaton21.github.io/**. Stop that server before reusing port 8000, or choose port 8001.

## Files

- `index.html` — all visible text, navigation, links, and search/social metadata. Search for `EDIT:` comments.
- `assets/styles.css` — design tokens, layout, responsive rules, keyboard focus, print, and reduced-motion styles.
- `assets/favicon.svg` — small initial favicon.
- `assets/social-card.png` — 1200 × 630 sharing image. This is a social preview, not a webpage background.
- `.nojekyll` — tells GitHub Pages to serve static files without Jekyll processing.
- `tests/test_site.py` — dependency-free structural checks.
- `tests/browser.cjs` — optional Chromium responsive/accessibility checks.
- `artifacts/` — local QA output; intentionally ignored by Git.

## Editing content

### Bio and headline

Edit the introduction and About sections in `index.html`. Update the `<title>`, description, Open Graph, and Twitter metadata if your headline changes. The degree in Cybersecurity is explicitly described as **planned**, not an earned credential or current enrollment.

### Projects

The Projects section features **Feardetector**, a browser-based scream challenge with optional on-device MediaPipe facial landmark tracking. It links to the [source repository](https://github.com/neaton21/feardetector) and [live demo](https://feardetector.neaton2.workers.dev/). Keep the description grounded in the repository: scores are entertainment estimates, not fear detection or calibrated sound measurements.

To add another project, use an article like the following, filling every bracketed item with verified information:

```html
<article class="project" aria-labelledby="project-example-title">
  <span class="status-label">[Actual project type or date]</span>
  <h3 id="project-example-title">[Real project name]</h3>
  <p>[What you built, your role, and what it does. Include results only if substantiated.]</p>
  <p>[Technologies you actually used]</p>
  <a class="text-link" href="https://github.com/neaton21/REPLACE-WITH-REAL-REPO">View source <span aria-hidden="true">↗</span></a>
</article>
```

Use a unique heading ID for each project. Add a live-demo link only if one exists. Do not publish the bracketed template as real content.

### Links

Search for `nateceaton@gmail.com` and `https://github.com/neaton21` in `index.html`. Email is a standard `mailto:` link that opens the visitor's email application; the website does not send messages. External links open in the same tab. No résumé, LinkedIn profile, graduation date, skills list, or photo was invented.

### Appearance

Change the `:root` variables in `assets/styles.css`. Typography deliberately uses a locally installed serif/sans pairing, so there are no font downloads. Font appearance varies slightly by operating system. Maintain text contrast and visible focus outlines when changing colors.

## GitHub Pages deployment

Repository: **https://github.com/neaton21/neaton21.github.io**. Website: **https://neaton21.github.io/**. GitHub Pages deploys from **main / (root)**. The initial publication was approved by Nate. Local development uses **site-draft**.

**Pushing to main publishes changes immediately, including the contact email address. Review updates before pushing.**

1. Review the local preview and verify the project descriptions and links.
2. From this project folder, review and commit the files. If Git asks for your identity, configure your own name and GitHub-verified email; no identity has been silently configured for you.

   ```sh
   git status
   git diff
   git add index.html assets .nojekyll .gitignore README.md tests
   git commit -m "Build personal portfolio website"
   ```

3. Fetch the remote to ensure that any newer work is preserved, then integrate it before publishing:

   ```sh
   git fetch origin
   git merge origin/main
   ```

   If there are conflicts, resolve and test them before proceeding. Do not force-push.

4. **After approving publication**, push the draft commit to main:

   ```sh
   git push origin site-draft:main
   ```

5. In GitHub, open the repository → **Settings → Pages**. Under **Build and deployment**, use **Deploy from a branch**, branch **main**, folder **/ (root)**, and Save if needed. These were the existing settings; no workflow file or custom domain is required.
6. Check the repository's **Actions** tab for the Pages build/deployment result. Once complete, visit **https://neaton21.github.io/**. Confirm the title, navigation, stylesheet, and contact links on the live site. If GitHub exposes the option, enable **Enforce HTTPS** in Pages settings.

Optional CLI checks after deployment:

```sh
gh api repos/neaton21/neaton21.github.io/pages
gh api repos/neaton21/neaton21.github.io/pages/builds/latest
curl -I https://neaton21.github.io/
```

### Hosting under a repository path

All local asset links use `./assets/...`, and navigation uses fragment IDs. The same files therefore work at `https://USERNAME.github.io/REPOSITORY/` without a build or base-path setting.

For a different destination, change the canonical URL, `og:url`, `og:image`, and `twitter:image` in `index.html` to that destination, including `/REPOSITORY/`. Social image URLs must be absolute HTTPS URLs. Runtime assets require no changes. Enable Pages from that repository's main branch and root folder. The preview metadata will only be fetchable by sharing services after publication; services may cache older previews.

## Verification

Structural checks (no install needed):

```sh
python3 -m unittest discover -s tests -v
```

Optional browser checks (Node.js and npm required, development only):

```sh
npm install --no-save --package-lock=false playwright@1.64.1 @axe-core/playwright@4.14.0
npx playwright install chromium
SITE_URL=http://127.0.0.1:8000/ node tests/browser.cjs
```

Start the preview server first. Tests cover 320px and 390px phones, 768px tablet, 1440px desktop, horizontal overflow, anchors, email/GitHub URLs, keyboard skip link/focus, reduced motion, no-JavaScript navigation, browser errors, and automated WCAG A/AA checks with axe. Screenshots and a JSON report go in `artifacts/` and are not published. Automated accessibility checks supplement, not replace, assistive-technology testing.

To check repository-based asset paths, serve the parent directory and set `SITE_URL` to `http://127.0.0.1:8000/neaton21.github.io/`. All site content is static, so there are no runtime packages to maintain.
