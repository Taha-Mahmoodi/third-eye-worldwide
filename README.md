# Third Eye Worldwide — Static Site

A deployable, zero-build static site for Third Eye Worldwide (TEWW), built from the design handoff. All pages are rendered client-side from a single `index.html` shell plus per-page render scripts in `pages/`.

## Run locally

Any static file server works. From the project root:

```bash
# Python
python -m http.server 8000

# Node
npx serve .

# PHP
php -S localhost:8000
```

Then open `http://localhost:8000`.

> Note: opening `index.html` directly via `file://` will fail to load the `@font-face` files and `pages/*.js` due to browser CORS rules. Always serve via HTTP.

## Deploy

### Netlify
Drag-and-drop the folder at app.netlify.com, or connect a Git repo. `netlify.toml` is preconfigured with long-lived caching on fonts and assets.

### Vercel
```bash
npx vercel --prod
```
`vercel.json` is preconfigured.

### GitHub Pages
Push to a repo, enable Pages on the root branch. `.nojekyll` is present so the `pages/` directory is not ignored.

### Cloudflare Pages / S3 / any static host
Upload the folder contents as-is.

## Structure

```
.
├── index.html              Main shell: nav, footer, home page, all CSS + JS
├── pages/                  Per-page render functions (about, programs, donate, …)
├── assets/logo.svg         TEWW logo mark
├── fonts/                  Self-hosted Space Grotesk + DM Sans
├── netlify.toml            Netlify config
├── vercel.json             Vercel config
├── .nojekyll               Disable Jekyll on GitHub Pages
└── robots.txt
```

## Features
- 3 themes (light, dark, high-contrast) with localStorage persistence.
- 3 text-size settings.
- 9 pages with sub-nav tabs: Home, About (Mission/Team), Programs, Donate, Media, Documents (Blogs/Stories), Volunteers, Blog detail, Story detail.
- Phosphor Icons via CDN; hero photography via Unsplash.
- Skip link, focus rings, ARIA landmarks.

## Notes
- Phosphor Icons and hero imagery load from CDNs (`unpkg.com`, `images.unsplash.com`). For an air-gapped deploy, self-host these assets.
- Donate + Volunteer forms are not wired to a backend — connect Stripe / your ATS / Mailchimp before launch.
