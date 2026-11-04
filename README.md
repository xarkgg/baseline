# Baseline — team website

The Baseline organization site. Static, dependency-free, no build step.

Design language: bold black organic shapes (+ one solid mark — an ink blob
with a "baseline" slit) on warm off-white, with handwritten-leaning type
(Shantell Sans, self-hosted OFL) for display text and Duolingo-grade friendly
microcopy. Lots of negative space.

## Pages

| Page | File | What |
| --- | --- | --- |
| Home | `index.html` | "Groundwork first." hero, one morphing blob, three statements |
| Team | `team.html` | The card-stack flow: one member expanded at a time, chips around it, auto-cycles 3.8s, pauses on interaction, prev/next + dots. Colleagues' card stack modeled on a **@glow dsgn** showcase video |
| Work | `work.html` | Real shipped/selected projects with links |
| Contact | `contact.html` | Direct links — no forms |
| 404 | `404.html` | "Oops." |

## Run

```
python -m http.server 8000
# http://localhost:8000 — or open index.html directly (no modules, so file:// works)
```

## Editing

- **Team content:** `data.js` (`TEAM` array) — name, role, bio, tags, links,
  `hue`, and `photo` (drop images into `assets/`, landscape ~900×600).
- **Work/Contact content:** inline in `work.html` / `contact.html` — copy rows
  to add entries.
- **Type:** `ShantellSans-latin.woff2` (variable 300–800, latin subset, OFL) in
  `assets/fonts/`. Display text uses it; body text stays on the system sans.

## Deploys

Vercel/Netlify/pages, zero config — plain static files, nothing to build.
Vercel: import the repo, framework preset "Other", deploy.
