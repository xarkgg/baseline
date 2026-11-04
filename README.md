# Baseline — team section

Static team page for the organization website: a vertical card stack where one
member is expanded at a time and the rest stay collapsed as chips. It
auto-advances every 3.8s, loops, pauses while you're pointing at it or after a
tap (resumes 6s after interaction), and has prev/next + dot navigation.
Collapsing/expanding animates height smoothly via the CSS grid
`0fr → 1fr` trick. Honors `prefers-reduced-motion` (no autoplay, no animation).

Flow modeled on the **@glow dsgn** card-stack showcase video
(`glow_dsgn_ssspin.io_1793484880.mp4`).

## Run

No build step, no dependencies:

```
python -m http.server 8000   # or any static server
# open http://localhost:8000
```

(Or just open `index.html` in a browser — no modules, so `file://` works too.)

## Edit the team

All content lives in `data.js` (`TEAM` array): name, role, bio, tags, links,
`hue` (0–360, gradient accent) and `photo`.

1. Drop a photo in `assets/` (e.g. `assets/ada.jpg`, landscape, ~900×600).
2. Set `photo: "assets/ada.jpg"` — the card then shows the image in the chip
   avatar and the banner. Without a photo you get a gradient banner with big
   initials, keyed off `hue`.

## Deploy

Plain static hosting — Vercel/Netlify with zero config, or push to GitHub and
enable Pages. No `package.json`, nothing to build.
