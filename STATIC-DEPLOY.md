# Static deploy — Third Eye Worldwide

This branch (`static/deployable`) is a self-contained, database-free build
of the site. `npm run build` produces an `out/` directory of plain HTML,
CSS, JS, and assets that any static host can serve. No Node server, no
Prisma, no admin, no API routes.

## What's different from `main`

| | main | static/deployable |
|---|---|---|
| Content source | SQLite / Postgres via Prisma | `data/seed.json` read at build time |
| Admin dashboard | `/admin` editable CMS | removed |
| API routes | `/api/cms/**`, `/api/auth/**` | removed |
| Form submits | POST to `/api/cms/submissions/*` | forms still render, submit will fail (static host has no endpoint) — see *Forms* below |
| Dynamic OG image | `app/opengraph-image.js` via `ImageResponse` | removed (edge runtime isn't supported by `output: 'export'`) |
| Deploy target | Node container / Vercel / Netlify | any static host |

The page components (`app/*/page.js`) and the component tree under
`components/` are identical to `main`.

## Build

```bash
npm install
npm run build
```

Outputs **`./out/`** — that's the whole site.

```
out/
├── index.html                (/)
├── about/index.html          (/about)
├── projects/index.html
│   ├── te/index.html         (/projects/te)
│   └── third-eye-world/index.html
├── documents/index.html
├── media/index.html
├── donate/index.html
├── volunteers/index.html
├── coming-soon/index.html
├── blog-detail/index.html
├── story-detail/index.html
├── sitemap.xml
├── robots.txt
├── 404.html
├── _next/                    (all compiled JS + CSS)
├── assets/                   (logos)
├── audio/                    (TE audio tour tracks)
└── fonts/
```

## Preview locally

```bash
npm run preview
```

This runs `npx serve out -l 3000`. Open http://localhost:3000 — you
should get the full site including voice tour, TE voice assistant,
audio tours. No database required.

## Deploy

Anywhere that serves files. Some recipes:

### Netlify (drag-and-drop)
1. `npm run build`
2. Drag the `out/` folder onto https://app.netlify.com/drop.
Done.

### Netlify (git)
Push this branch to your repo and connect it in Netlify with:
- **Build command:** `npm run build`
- **Publish directory:** `out`

### Cloudflare Pages
Same settings as Netlify git:
- Build command: `npm run build`
- Build output directory: `out`

### GitHub Pages
1. `npm run build`
2. Create a `gh-pages` branch, copy `out/*` into its root, push.
3. Repo → Settings → Pages → Source: `gh-pages` branch, `/` folder.

If serving from a non-root path (e.g. `user.github.io/my-site`), set
`basePath` and `assetPrefix` in `next.config.mjs` before building:

```js
const nextConfig = {
  // ... existing config
  basePath: '/my-site',
  assetPrefix: '/my-site/',
};
```

### Any VPS / Nginx
```
server {
  listen 80;
  server_name thirdeyeworldwide.org;
  root /var/www/teww/out;
  index index.html;
  # trailingSlash: true → every route is <route>/index.html, so
  # the default try_files is enough.
  try_files $uri $uri/ =404;
  error_page 404 /404.html;
}
```

### S3 + CloudFront
1. `aws s3 sync ./out s3://your-bucket --delete`
2. Configure CloudFront with `index.html` as the default root object
   and the S3 bucket as origin.

## Updating content

1. Edit `data/seed.json`.
2. `npm run build`.
3. Redeploy `out/`.

That's the whole loop. No DB migration, no admin login, no publish
button — content == source code.

## Forms

The static build keeps the volunteer / donation / podcast-guest /
newsletter forms in the UI so users can still see what we're asking
for, but their submit buttons will fail against a static host (there
is no `/api/*` endpoint to POST to).

Three options if you want the forms to work on the static build:

1. **Use a form service.** Netlify Forms (free tier), Formspree,
   Getform — swap the `fetch('/api/...')` call in each form for the
   service's endpoint. Netlify Forms in particular needs just a
   `data-netlify="true"` attribute on each `<form>` tag.
2. **Replace with `mailto:`.** Each form already has a fallback email
   (`hello@`, `guest@teww.org`). You can delete the `fetch()` call and
   turn the submit button into an `<a href="mailto:...">`.
3. **Keep the dynamic build.** The `main` branch still has the full
   Prisma-backed CMS + API. You can run it on a Node host for form
   submissions while serving this static branch as a faster cache for
   read-only traffic.

## What's still fully interactive in the static build

All of these work client-side without any backend:

- **TE voice assistant** — Web Speech API, in-page intent routing.
- **Audio tour** — plays WAV files from `/audio/*`.
- **Theme + text-size toggles** — persist to localStorage.
- **Subnav tabs** — `useState` + URL hash.
- **Donation amount toggle + filter pills** — pure client state.
- **Coming-soon countdown** — client timer.

## Gotchas

- **Do not add new API routes or middleware to this branch.** They'll
  break `next build`. Keep that work on `main`.
- **`generateStaticParams` is required** on every dynamic route
  (`/projects/[slug]`). If you add another dynamic route, add it too
  and set `export const dynamicParams = false` so unknown slugs 404.
- **Images** use `images.unoptimized: true`. If you want size/format
  optimization, pre-process assets and drop them into `public/`.
