# roboclockai.github.io

RoboClock project website. This repository contains a static HTML/CSS/JavaScript site, ready for GitHub Pages from the root of the `main` branch.

## Preview locally

Open `index.html` in a browser, or run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then visit `http://127.0.0.1:8000/`.

## Edit

- `index.html`: page structure and copy.
- `styles.css`: responsive layout, paper-aligned colors and gallery presentation.
- `app.js`: gallery, task filters/dialogs, video controls and interactive illustrations.
- `site-config.js`: authors, affiliations and resource links.
- `content.js`: task catalog, thumbnail/sequence references and selected reported results.
- `assets/`: supplied RoboClock logo and existing task imagery/video.

No build tools, package installation, external fonts or backend are required. Keep the relative paths intact when moving files.

## Current media

The draft includes a 60-task catalog, a three-row gallery of 22 distinct tasks across five domains, six five-frame sequences, and one playable task clip. Preview media will be replaced with the team's final release selection. Repeated gallery groups support seamless scrolling; they do not represent additional tasks.

The unpublished paper, private benchmark-code repository, project-introduction video and citation remain hidden until confirmed public resources are available. Selected result rows reproduce the supplied manuscript and are not a new evaluation run.

## GitHub Pages

The site is ready for **Settings → Pages → Deploy from a branch → main → / (root)**. Adding the source files does not itself enable Pages; the repository owner can select this source when ready. `.nojekyll` keeps the site as plain static files.
