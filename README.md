# roboclockai.github.io

RoboClock project website. This repository contains a static HTML/CSS/JavaScript site, ready for GitHub Pages from the root of the `main` branch.

## Preview locally

Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8000/`.

## Directory layout

```text
.
├── index.html                  # Website entry, page layout and copy
├── README.md                   # Preview and editing guide
├── .nojekyll                   # Plain static GitHub Pages site
├── data/
│   └── content.js              # Task catalog, media references and results
└── assets/
    ├── css/
    │   └── styles.css          # Layout, typography and colors
    ├── js/
    │   ├── app.js              # Gallery, filters, dialogs and interactions
    │   └── site-config.js      # Authors, affiliations and resource links
    ├── branding/               # Official logo and favicon
    ├── images/
    │   ├── featured/           # Large featured-scene images
    │   ├── thumbnails/         # Gallery thumbnails grouped by domain
    │   ├── sequences/          # Chronological frames grouped by task
    │   └── domain-galleries/   # Existing paper domain-summary images
    └── videos/
        └── industry/          # Playable Industry demo
```

## Edit

| Change | File or folder |
| --- | --- |
| Page text and section layout | `index.html` |
| Colors, spacing and responsive layout | `assets/css/styles.css` |
| Authors and future paper/code links | `assets/js/site-config.js` |
| Task descriptions, result rows and media references | `data/content.js` |
| Gallery, search, task dialogs and controls | `assets/js/app.js` |
| Official branding | `assets/branding/` |
| Task thumbnails, frame sequences and videos | The matching media subfolder under `assets/` |

No build tools, package installation, external fonts or backend are required. Media paths in HTML and JavaScript are relative to `index.html`, including paths declared inside `data/content.js`. When adding or moving media, update its references as well. Keep all folders together for local preview.

## Current media

The draft includes a 60-task catalog, a three-row gallery of 22 distinct tasks across five domains, six five-frame sequences, and one playable task clip. Preview media will be replaced with the team's final release selection. Repeated gallery groups support seamless scrolling; they do not represent additional tasks.

The unpublished paper, private benchmark-code repository, project-introduction video and citation remain hidden until confirmed public resources are available. Selected result rows reproduce the supplied manuscript and are not a new evaluation run.

## GitHub Pages

The site is ready for **Settings → Pages → Deploy from a branch → main → / (root)**. Adding the source files does not itself enable Pages; the repository owner can select this source when ready. `.nojekyll` keeps the site as plain static files.
