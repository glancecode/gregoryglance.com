# gregoryglance.com

Personal landing page for [gregoryglance.com](https://gregoryglance.com).

Built with vanilla HTML and CSS. No frameworks, no build step, no dependencies — just static files served via GitHub Pages and proxied through Cloudflare.

## Stack

- **Hosting:** GitHub Pages (this repo, `main` branch)
- **CDN / Security:** Cloudflare (proxied, security headers via Transform Rules)
- **Domain:** Namecheap, nameservers pointed to Cloudflare
- **Fonts:** Google Fonts — Instrument Serif + DM Sans

## Structure

```
gregoryglance.com/
├── index.html                    # Single page — hero, about tiles, tools section
├── style.css                     # All styles, dark/light mode via CSS custom properties
├── greg_photo.jpg                # Profile photo
├── CNAME                         # Custom domain for GitHub Pages
├── _headers                      # Cache/header intent for static hosting/CDN parity
├── docs/website-design/          # Website rebuild and design decision context
└── _archive/progressive-quality-care/  # Archived static website demo
```

## Features

- Dark / light mode toggle (respects system preference by default)
- Animated engineering-style ring graphic
- Responsive down to mobile
- Links out to [tools.gregoryglance.com](https://tools.gregoryglance.com) for live tools

## Security

Cloudflare handles:
- HTTPS enforcement + automatic rewrites
- SSL mode: Full
- Response headers: `X-Frame-Options`, `X-Content-Type-Options`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`

## Cache policy

Long-term cache strategy for the root site:
- HTML stays revalidating: `Cache-Control: public, max-age=0, must-revalidate`
- version-stable static assets can be cached long-term: `Cache-Control: public, max-age=31536000, immutable`
- repo-local cache intent lives in `_headers` so the policy is explicit even if final enforcement happens at the CDN layer

If a frequently changing asset ever needs the long cache policy safely, rename or fingerprint it when the content changes.

## Updating the site

Edit `index.html` or `style.css` directly on GitHub, or clone locally and push to `main`. GitHub Pages rebuilds automatically on every push. Cloudflare cache clears within a few minutes.

## Deploy note

Cache-safe deploy rule for all three sites:
- HTML should stay revalidating so new deploys show up quickly.
- JS, CSS, fonts, images, and other static assets can stay long-lived and immutable.
- If you change a long-cached asset and its URL does not change, some users may keep the old file. Rename or fingerprint the asset whenever the content changes.

For `gregoryglance.com`, if Cloudflare is enforcing cache headers, keep HTML revalidating and static assets long-lived there too. The `_headers` file in this repo is the intended policy, but GitHub Pages may not enforce it by itself.

Quick post-deploy check:
1. hard refresh the page
2. confirm HTML responses show revalidation headers
3. confirm JS/CSS responses show `max-age=31536000, immutable`
4. if a stale asset appears, verify the asset URL changed



## Rebuild and design context

Website design decisions live in this repo, not Obsidian. Start here for rebuilds or redesigns:

- `docs/website-design/WEBSITE-REBUILD-CONTEXT.md` — fresh-session rebuild packet
- `docs/website-design/DESIGN-DECISION-TREE.md` — reasoning behind the current homepage choices

## Project documentation

This repo intentionally keeps only website/site-architecture documentation:

- `docs/website-design/WEBSITE-REBUILD-CONTEXT.md` — fresh-session rebuild packet
- `docs/website-design/DESIGN-DECISION-TREE.md` — reasoning behind the current homepage choices
- `docs/website-design/PORTFOLIO-ORIGIN-NOTE-2026-03-02.md` — archived origin note for the portfolio direction

Product specs, internal task state, raw logs, secrets, node_modules, unrelated OpenClaw workspace state, and raw/unreviewed tool artifacts do not belong in this public website repo.

## Tools subdomain

Tools live at a separate subdomain (`tools.gregoryglance.com`) and are maintained in a separate repo. The "Now Building" section on this page links to individual tools.
