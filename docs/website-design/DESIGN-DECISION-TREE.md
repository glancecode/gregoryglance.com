# GregoryGlance.com design decision tree

Updated: 2026-05-01

This records the reasoning behind the current website choices so future sessions do not have to reconstruct it from chat history.

## Top-level decision

**Decision:** GregoryGlance.com should be a portfolio/front door for shipped tools.

**Why:** Greg's strongest story is not “personal brand” in the abstract. It is mechanical engineering credibility plus practical software/AI tools that solve real workflows. The site should make that legible quickly, then route visitors to live artifacts.

## Decision tree

### 1. What is the primary job of the site?

Options considered:

- Generic personal homepage
- Traditional resume / career portfolio
- Product landing page for Print Diagnostics
- Builder/toolmaker front door

Chosen: **builder/toolmaker front door**.

Reasoning:

- Generic personal pages are low-signal.
- Resume pages are useful, but they underplay the shipped-tool proof.
- A Print Diagnostics-only landing page would make the root domain too narrow and increase redesign churn whenever the active product changes.
- A toolmaker front door supports career credibility, product experiments, and future revenue paths at the same time.

### 2. Should Print Diagnostics take over the homepage?

Chosen: **No. Keep it featured, not dominant.**

Reasoning:

- Print Diagnostics is the active first-revenue experiment, so it deserves prominent CTAs.
- The root domain still needs to represent Greg broadly.
- Product surfaces belong on `tools.gregoryglance.com`, with GregoryGlance.com linking into them.
- This lowers launch risk and avoids turning every product iteration into a homepage redesign.

### 3. What stack should the homepage use?

Options considered:

- Plain static HTML/CSS/JS
- Eleventy/Astro/Hugo
- Next.js/static export

Chosen: **plain static HTML/CSS/JS**.

Reasoning:

- The current site has only a few hand-authored sections.
- A framework would add setup, dependencies, and maintenance before there is enough content volume to justify it.
- Greg values visible shipping over tooling overhead.
- GitHub Pages can host it directly, cheaply, and reliably.

Revisit only if the site grows into repeated project pages, Markdown-driven case studies, or a real content pipeline.

### 4. Where should website design context live?

Chosen: **GitHub only.**

Reasoning:

- Rebuild context must travel with the code.
- Obsidian is useful for thinking, but it creates split-brain state when website decisions live outside the repo.
- A brand-new session should be able to rebuild from the repo without vault access.

### 5. What visual language fits Greg?

Chosen: **technical, precise, restrained, premium-but-not-flashy.**

Reasoning:

- Greg's credibility comes from engineering, systems thinking, clean energy, automation, and practical tools.
- The ring/grid motif signals technical decision systems without feeling like a SaaS template.
- Dark/light mode keeps it polished while staying simple.
- The homepage should feel like a capable builder's workshop, not a marketing agency page.

### 6. What should the primary CTAs be?

Chosen:

- Primary: the currently featured live tool
- Secondary: tools/prototypes section

Reasoning:

- The best proof is a live tool.
- The root site should route visitors quickly to real shipped artifacts.
- Keeping the CTA generic enough to swap featured tools avoids making the homepage dependent on one product's internal docs.

### 7. What belongs in future revisions?

Add only when it earns its place:

- Real project case studies with screenshots/results.
- A concise resume/career page if Greg wants career leverage.
- More shipped tools as they become real.
- Public failure notes if they strengthen the builder narrative.

Do not add:

- Placeholder project pages.
- Long AI-generated essays.
- Heavy animations that slow mobile.
- A CMS or Obsidian sync path before repeated publishing pain exists.
