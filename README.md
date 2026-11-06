# Baseline — collective website

The Baseline organization site. Static, dependency-free, no build step.

Structure: an editorial scroll — full-viewport hero, then a long story column
of centred text with generous empty space, a light inversion mid-page, a
contributors list, and a closing call. The layout is a homage to the Wabi
launch page (one measured column of text, generous empty space, a hand-made
annotation layer), re-toned to a dark canvas.

Palette (set 2026-11-06): background `#171817`, primary text `#f9f9f9`,
highlight `#a9a8a8`. Everything else is derived from those three: a neutral
ramp for surfaces and secondary text, one light inversion (`#f9f9f9` ground,
white cards) that carries the contrast rhythm, and a single accent
(`--accent #7aa2ff`) for links and emphasis.

Brand DNA — applies to ICONS AND TEXT TOO: playful abstract human figure
silhouettes, drawn with bold organic shapes; exaggerated proportions,
irregular contours, expressive movement. In practice: arrows, chevrons and
underlines are hand-drawn SVG (`.gl`, `.hero-underline`), running-text
emphasis uses the serif italic in the accent colour (`.em`), highlights use a
`#a9a8a8` marker swipe with dark text on top (`.hl`), and the figure motif
itself repeats as an animated band (`.figures`, see the Motif note below).

Type: **Instrument Serif** (high-contrast display serif) over **Inter**
(neutral grotesque), both self-hosted OFL. A commercial licence for Arista Pro
or Kalice + Selecta would be a drop-in: swap the `@font-face` sources and
`--serif` in `styles.css` and nothing else changes. Do not ship the Arista Pro
trial files from dafont — those are personal-use only.

Logo: `assets/mark.png` (dark) and `assets/mark-light.png` (light) — the
hand-drawn "person with raised arms inside rings" mark, keyed from the team's
supplied artwork. Derived assets, all palette-quantized: `favicon.png` (64px,
light — a dark favicon vanishes in a dark browser tab), `apple-touch-icon.png`
(180px, light mark on the brand ground), and per-page share cards
`og-image.png` (home), `og-work.png`, `og-contact.png` — 1200×630 each.
`robots.txt` exists; `sitemap.xml` and canonical URLs wait on the production
domain. `vercel.json` sets security headers and is otherwise zero-config.

Motif: `assets/runners-light.png` / `assets/runners-ink.png` — the four-figure
running pack, keyed from the team's artwork. `.figures` tiles it with
`background` and drifts exactly one tile per cycle (`figure-drift`, 56s) so the
loop is seamless; it stops under `prefers-reduced-motion`. Three placements:
a faint watermark under the hero (`.hero-figures`), and a band (`.band`)
opening the people section and sitting under the closing CTA. On light ground
the band swaps to the ink sprite automatically (`.invert .figures`). To
re-fill or resize, override `--fig-h` / `--fig-src` / `--fig-opacity`.

## Pages

| Page | File | What |
| --- | --- | --- |
| Home | `index.html` | Hero + the collective story: who we are, what we build, what gets in the way (inverted section), where we put our weight, the people, closing call |
| Work | `work.html` | Shipped projects, each linked to its live product |
| Contact | `contact.html` | One address, the people, contributors welcome |
| Case template | `case.html` | `noindex` template for project deep-dives (see "Case studies") |
| 404 | `404.html` | "404 — this page went out for a walk" |

There is no separate team page: the collective framing lives on Home and
Contact, and `+ You, maybe` stands in the people list for contributors who
haven't arrived yet.

## Run

```
python -m http.server 8000
# http://localhost:8000 — or open index.html directly (file:// works, main.js is a plain script)
```

## Case studies

`case.html` is the template for project deep-dives (problem → constraints →
what we built → what was hard → where it landed). To publish one: duplicate it
to `<project>.html`, replace every `[bracketed]` line, add two screenshots to
`assets/`, delete its `noindex` tag, then point the matching row in `work.html`
at the new page.

## Editing

- **Work content:** rows inline in `work.html`.
- **People:** the `.people` list in `index.html` and `contact.html` (name, role,
  links, photo from `assets/`).
- **The story copy:** inline in `index.html` — each `<section class="story">`
  is one beat. Keep the supplied collective copy verbatim where it appears.
- **Email:** `contact.html` and the closing form action in `index.html`
  (currently `kuskomanass@gmail.com`; swap when the team mailbox exists).
- **Motion:** `main.js` only does scroll-reveal for `.reveal`; it is progressive
  (the `.js` class is set inline in `<head>`, so nothing hides without JS).
- **Motif bands:** drop `<div class="figures" aria-hidden="true"></div>` where
  you want one; use `<div class="band">…</div>` when it needs its own strip of
  surface and rules. Sizing and tint are CSS variables on `.figures`.
- **Palette:** every colour lives in `:root` in `styles.css`. To re-tone the
  site, change `--bg` / `--ink` / `--highlight` and the derived ramp follows.

## Deploys

Vercel/Netlify/pages, zero config — plain static files, nothing to build.
Vercel: import the repo, framework preset "Other", deploy.
