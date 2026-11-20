# RoboClock project website

A static HTML/CSS/JavaScript website. No build tools, package installation, external fonts or backend are needed.

## Preview

Open `index.html` in Chrome or run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder, then visit `http://127.0.0.1:8000/`.

In VS Code, install **HTML Preview** by **George Oliveira** (`george-alisson.html-preview-vscode`). Open `index.html`, press Cmd+K, release, then V to preview beside the source. Cmd+K followed by W opens it in a browser. See the [extension guide](https://github.com/george-alisson/html-preview-vscode). Saving a file does not upload it to GitHub.

## Directory layout

```text
.
├── index.html                     # Homepage and section layout
├── README.md                      # This collaboration guide
├── .nojekyll                      # Plain static GitHub Pages site
├── data/
│   └── content.js                 # Tasks, final instructions, media and reported scores
└── assets/
    ├── css/styles.css             # Responsive layout and paper-aligned colors
    ├── js/
    │   ├── app.js                 # Gallery, dialogs, search and leaderboard interactions
    │   └── site-config.js         # Authors, affiliations and future resource links
    ├── branding/                  # Official wordmark and favicon
    ├── images/
    │   ├── featured/              # Featured scenes
    │   ├── thumbnails/<domain>/   # Task gallery images
    │   └── sequences/<task>/      # Five chronological head-camera frames per task
    └── videos/<domain>/<code>/
        └── demo.mp4               # Final head/wrist-camera composite recording
```

All HTML/JavaScript media paths are relative to `index.html`, including paths declared in `data/content.js`. Keep this structure when moving files.

## Edit

| Change | Location |
| --- | --- |
| Page copy and section layout | `index.html` |
| Visual presentation | `assets/css/styles.css` |
| Authors and future resource links | `assets/js/site-config.js` |
| Final instructions, media paths and reported score rows | `data/content.js` |
| Gallery, dialogs, task filters and scoreboard controls | `assets/js/app.js` |

## Content and sources

- **Insights & Observations** presents source-linked findings. GPT-6 Astra's reported TSR is **19.2%** and LTSR is **0.8%**, following the current manuscript. Policy-agent comparisons explicitly note differences in training and interfaces.
- **Leaderboard** includes 33 reported configurations from manuscript Tables 2, 4 and 5. It supports group filters, Overall/A/B/C task groups, model search and metric sorting. The expandable transfer comparison includes all eight rows from Table 3. Missing PS is displayed as unavailable, never zero. These are reported results, not a new evaluation run or an open submission leaderboard.
- **Final task demos** come from [robogym release 20633da](https://github.com/NorahYujieZhao/robogym/tree/20633da0e8e2b3d3e9b98ccca5971a1012008c56/data): one exact `demo.mp4` and complete instruction from its `demo.json` for each of 60 tasks. Metadata and videos are matched by the final release's domain/task code. Updated healthcare definitions and sports A2/B5 assignments supersede stale catalog mappings.
- Videos are copied byte-for-byte, retaining the head view above the two wrist views. Thumbnails and chronological stills extract the original head-camera portion. Every task has a video and five frames; the homepage gallery selects 22 distinct tasks across all five domains.
- The old primary pancake example is replaced by ice dispensing; the pancake task remains in the complete benchmark catalog.
- Difficulty and seed displayed beside a demo describe that recording; they are separate from the model evaluation protocol. The imported release is oracle demonstration media, not a baseline-model rollout.
- The supplied official logo and confirmed author list are retained. Paper/code/project-introduction/citation links remain hidden until public resources are confirmed. No private collection paths, HDF5 files or internal development logs are included here.

## GitHub Pages

This source is ready for **Settings → Pages → Deploy from a branch → main → / (root)**. Source upload does not itself enable Pages. Repository visibility and hosting settings are managed separately by the team.

## Verification

The revision passes 87 isolated Chrome checks: desktop/mobile layout, search and dialogs, every leaderboard group/category/metric, source-linked insight values, final task IDs, all 60 videos decoding at their released dimensions, direct-file opening and reduced motion. Media hashes and verbatim instruction identity were checked independently. QA artifacts and manuscript sources are maintained outside this website repository.
