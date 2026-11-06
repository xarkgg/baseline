# Baseline — team website

The Baseline organization site. Static, dependency-free, no build step.

Design language: bold black organic shapes on warm off-white, with
handwritten-leaning type (Shantell Sans, self-hosted, OFL) for display text
and friendly microcopy. Lots of negative space.

Brand DNA: playful abstract human figure silhouettes, drawn with bold organic
shapes — exaggerated proportions, irregular contours, expressive movement.
The rule applies to icons and text too: bullets, chevrons and arrows follow
the hand-made language, and display type stays calligraphic, never geometric.

Logo: `assets/mark.png` — hand-drawn "person with raised arms inside ink
rings" mark (supplied by the team, processed from source art onto
transparency). The spherical blob works as compositional accent elsewhere
(the `.trio` bullets).

## Pages

| Page | File | What |
| --- | --- | --- |
| Home | `index.html` | "Groundwork first." hero, one morphing blob, three statements, closing identity section ("The Engineering Standard.") |
| Team | `team.html` | The card-stack flow: one member expanded at a time, chips around it, auto-cycles 3.8s, pauses on interaction, prev/next + dots. Colleagues' card stack modeled on a **@glow dsgn** showcase video |
| Work | `work.html` | Real shipped/selected projects with links |
| Contact | `contact.html` | Direct links + email — no forms |
| Case template | `case.html` | `noindex` template for project deep-dives (see "Case studies") |
| 404 | `404.html` | "Oops." |

## Run

```
python -m http.server 8000
# http://localhost:8000 — or open index.html directly (no modules, so file:// works)
```

## Case studies

`case.html` is the template for the project deep-dives (problem → constraints →
what we built → what was hard → where it landed). To publish one: duplicate it
to `<project>.html`, replace every `[bracketed]` line, add two screenshots to
`assets/`, delete its `noindex` tag, then point the matching row in `work.html`
at the new page. Email lives in row 1 of `contact.html` — swap the address there
when the team domain mailbox exists.

## Editing

- **Team content:** `data.js` (`TEAM` array) — name, role, bio, tags, links,
  `hue`, and `photo` (drop images into `assets/`, landscape ~900×600). The
  `team.html` `<noscript>` fallback lists the same three members — update it
  together with `data.js`.
- **Work/Contact content:** inline in `work.html` / `contact.html` — copy rows
  to add entries.
- **Type:** `ShantellSans-latin.woff2` (variable 300–800, latin subset, OFL) in
  `assets/fonts/`. Display text uses it; body text stays on the system sans.

## Deploys

Vercel/Netlify/pages, zero config — plain static files, nothing to build.
Vercel: import the repo, framework preset "Other", deploy.
