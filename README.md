# RoboClock project website

A static HTML/CSS/JavaScript website. No build tools, package installation, external fonts or backend are needed.

## Preview

Open `index.html` in Chrome or run `python3 -m http.server 8000 --bind 127.0.0.1` from this folder, then visit `http://127.0.0.1:8000/`.

In VS Code, install **HTML Preview** by **George Oliveira** (`george-alisson.html-preview-vscode`). Open `index.html`, press Cmd+K, release, then V to preview beside the source. Cmd+K followed by W opens it in a browser. See the [extension guide](https://github.com/george-alisson/html-preview-vscode). Saving a file does not upload it to GitHub.

On a remote code-server, in-editor preview extensions that iframe `http://127.0.0.1:<port>` show a blank page, because the browser resolves 127.0.0.1 to your own computer. Run `python3 -m http.server 8765 --bind 127.0.0.1` in this folder on the server and open `<code-server URL>/proxy/8765/` (with the trailing slash) instead.

## Directory layout

```text
.
├── index.html                     # Homepage and section layout
├── tasks.html                     # Task catalog: filters, instruction and full video per task
├── README.md                      # This collaboration guide
├── .nojekyll                      # Plain static GitHub Pages site
├── data/
│   ├── content.js                 # Tasks, final instructions, media and reported scores
│   └── real-robot.js              # Real-robot pilot: tasks, operator-scored results, B1 case study
└── assets/
    ├── css/styles.css             # Responsive layout and paper-aligned colors
    ├── js/
    │   ├── app.js                 # Homepage: gallery, featured scene and leaderboard
    │   ├── tasks.js               # tasks.html: catalog filters, search and task dialog
    │   ├── real-robot.js          # Real-robot section rendering
    │   └── site-config.js         # Authors, affiliations and future resource links
    ├── branding/                  # Official wordmark and favicon
    ├── images/
    │   ├── featured/              # Featured scenes
    │   ├── thumbnails/<domain>/   # Task gallery images
    │   ├── sequences/<task>/      # Five chronological head-camera frames per task
    │   └── real-robot/            # Real-robot scene photos, head-camera views, B1 frames, real-vs-sim plot
    └── videos/
        ├── <domain>/<code>/demo.mp4   # Final head/wrist-camera composite recording
        ├── <domain>/<code>/preview.mp4 # 10 s head-camera autoplay clip (tools/make_previews.py)
        ├── demo/                      # Demo video slot (see projectVideoUrl in site-config.js)
        └── real-robot/b1/<model>.mp4  # Real-robot B1 head-camera recordings, one per model
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
| Real-robot tasks, results and B1 case study | `data/real-robot.js`, `assets/js/real-robot.js` |

## Content and sources

- **Page structure** follows the paper's contributions: key messages → task design (three types of temporal constraints, three difficulty levels) → Latency-Aligned evaluation (protocol and PS/PSR/TSR/LTSR) → findings → leaderboard → validation (human teleoperation 100% PSR / 96% TSR, real-robot pilot) → vision. The **Findings** numbers (8.3% headline, the PSR/TSR/LTSR comparison of π₀.₅, InternW0-Δ, GPT-6 Astra and Gemini 4 Argon, and the three paradigm cards) are read from the leaderboard data in `data/content.js`, so they follow the manuscript tables (`roboclock.pdf`, Tables 2, 3 and 5). Wording: temporal constraints (not time limits), Latency-Aligned evaluation (not real-time evaluation), temporal compliance, environment time advances.
- **Leaderboard** includes 33 reported configurations from manuscript Tables 2, 4 and 5. It supports group filters, Overall/A/B/C task groups, model search and metric sorting. The expandable transfer comparison includes all eight rows from Table 3. Missing PS is displayed as unavailable, never zero. These are reported results, not a new evaluation run or an open submission leaderboard.
- **Final task demos** come from [robogym release 20633da](https://github.com/NorahYujieZhao/robogym/tree/20633da0e8e2b3d3e9b98ccca5971a1012008c56/data): one exact `demo.mp4` and complete instruction from its `demo.json` for each of 60 tasks. Metadata and videos are matched by the final release's domain/task code. Updated healthcare definitions and sports A2/B5 assignments supersede stale catalog mappings.
- Videos are copied byte-for-byte, retaining the head view above the two wrist views. Thumbnails and chronological stills extract the original head-camera portion. Every task has a video and five frames; the homepage gallery selects 22 distinct tasks across all five domains.
- The old primary pancake example is replaced by ice dispensing; the pancake task remains in the complete benchmark catalog.
- Difficulty and seed displayed beside a demo describe that recording; they are separate from the model evaluation protocol. The imported release is oracle demonstration media, not a baseline-model rollout.
- The supplied official logo and confirmed author list are retained. Paper/code/project-introduction/citation links remain hidden until public resources are confirmed. No private collection paths, HDF5 files or internal development logs are included here.

- **Real Robot** follows the manuscript appendix "Real-Robot Pilot": xArm 6 hardware and interface, six tasks (A1–C2) with scene photos and first head-camera images, the operator step rubric, the 6 models × 6 tasks PS/PSR/LTSR table (10 episodes each, 360 in total), the real-vs-simulation rank comparison (Spearman ρ 1.00 / 0.93 / 0.85) and the B1 case study. The six B1 videos are the unedited 10 fps head-camera recordings of the case-study episodes, one per model.

- **Autoplay clips**: the gallery, the three category cards and the task cards play `preview.mp4` (muted, looping, loaded only while on screen; still images are used under reduced motion). Regenerate them with `python3 tools/make_previews.py --ffmpeg <path>` after replacing a `demo.mp4`.
- **Paper** links to the arXiv page https://arxiv.org/abs/2611.32233 (`paperUrl` in `assets/js/site-config.js`).

- **Two pages**: the homepage shows the gallery only. Gallery clips, the category cards and the domain buttons under the gallery link to `tasks.html` (`?domain=<id>` pre-filters the catalog, `?task=<id>` opens one task with its instruction and full demonstration video).

## GitHub Pages

This source is ready for **Settings → Pages → Deploy from a branch → main → / (root)**. Source upload does not itself enable Pages. Repository visibility and hosting settings are managed separately by the team.

## Verification

The revision passes 87 isolated Chrome checks: desktop/mobile layout, search and dialogs, every leaderboard group/category/metric, source-linked insight values, final task IDs, all 60 videos decoding at their released dimensions, direct-file opening and reduced motion. Media hashes and verbatim instruction identity were checked independently. QA artifacts and manuscript sources are maintained outside this website repository.
