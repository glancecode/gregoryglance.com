# GregoryGlance.com website rebuild context

Updated: 2026-05-01

This file is the canonical rebuild packet for the public GregoryGlance.com front door. It exists so a brand-new session can recover the website direction without reading Obsidian or old OpenClaw chat logs.

## Canonical source of truth

- Repo: `projects/gregoryglance.com`
- Live domain: `https://gregoryglance.com`
- Tools domain: `https://tools.gregoryglance.com`
- Homepage source: `index.html`
- Homepage styles: `style.css`
- Custom domain file: `CNAME`
- Intended cache policy: `_headers`
- Website design/architecture docs: `docs/website-design/`
- Archived static website demo: `_archive/progressive-quality-care/`

Obsidian is not a source of truth for web design. If a website design decision matters, put it in this repo.

## Current live positioning

GregoryGlance.com is a portfolio/front-door site for shipped tools, not a generic personal splash page and not a full content site yet.

The current homepage promise is:

> Engineer, builder, and toolmaker. I build tools that make technical decisions easier. Some are already live.

The homepage should make Greg look credible as an engineer-builder while sending visitors quickly to usable tools. The homepage can feature whichever live tool is most relevant without turning the root domain into a product-specific landing page.

## Current implementation shape

- Vanilla HTML/CSS/JS only.
- No framework, no dependency install, no build step.
- GitHub Pages serves `main`.
- Cloudflare proxies the domain and handles security/cache headers where GitHub Pages cannot.
- Google Fonts: Instrument Serif and DM Sans.
- Dark/light theme toggle implemented inline in `index.html`.
- Main visual language: precise, technical, restrained, engineering-grid/ring motif, high contrast, minimal ornament.

## Homepage sections

1. Header
   - Logo/wordmark: Gregory Glance
   - Nav links: Tools and selected live tools
   - Theme toggle
2. Hero
   - Profile photo: `greg_photo.jpg`
   - Identity: Engineer, builder, and toolmaker
   - Primary CTA: selected featured live tool
   - Secondary CTA: tools/prototypes section
   - Contact links: email + LinkedIn
3. About strip
   - Clean Energy
   - AI and Automation
   - Systems Thinking
4. Tools section
   - Featured live tool card
   - Supporting live/prototype tool cards
5. Footer
   - Copyright + Boston, MA

## Rebuild checklist from a fresh clone

1. Clone/open this repo.
2. Read this file first.
3. Read `README.md` for hosting/cache/deploy shape.
4. Read `docs/website-design/DESIGN-DECISION-TREE.md` for the current design rationale.
5. Inspect `index.html`, `style.css`, `_headers`, and `CNAME`.
6. Validate locally by opening `index.html` or serving the folder with a static server.
7. Before calling it shipped, verify the live page, mobile layout, core links, and cache headers.

## Deployment expectations

- Push to `main` to trigger GitHub Pages.
- HTML should stay revalidating so copy/design changes appear quickly.
- Long-cached assets must be renamed/fingerprinted when changed.
- After deployment, verify the live page, mobile layout, core links, and cache headers.

## What not to rebuild into

Do not turn the homepage into:

- A blog engine before there is a real content cadence.
- A framework app unless the static approach is a real blocker.
- A generic resume page that hides the shipped tools.
- A heavy product landing page that makes GregoryGlance.com feel like only one product.
- An Obsidian-synced website pipeline. Website design and rebuild context live in GitHub.
