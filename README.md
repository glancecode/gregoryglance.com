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
├── index.html       # Single page — hero, about tiles, tools section
├── style.css        # All styles, dark/light mode via CSS custom properties
├── greg_photo.jpg   # Profile photo
└── CNAME            # Custom domain for GitHub Pages
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

## Updating the site

Edit `index.html` or `style.css` directly on GitHub, or clone locally and push to `main`. GitHub Pages rebuilds automatically on every push. Cloudflare cache clears within a few minutes.

## Tools subdomain

Tools live at a separate subdomain (`tools.gregoryglance.com`) and are maintained in a separate repo. The "Now Building" section on this page links to individual tools.
