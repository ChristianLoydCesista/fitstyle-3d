# FitStyle 3D

A modular web prototype for a future virtual fitting and styling platform.

The project is currently focused on the foundation:

> **Component 1 — reliable 3D human figure + garment/accessory preparation**

The main human is `Michelle.glb`. The application also has a procedural
development fallback so the viewer remains testable when the GLB has not yet
been downloaded.

---

## Current features

- Vite + vanilla JavaScript
- Three.js installed through npm
- local `Michelle.glb` support
- automatic model normalization to ~1.75 m
- OrbitControls
- front / side / back / 3/4 camera views
- responsive desktop/mobile UI
- mesh and skeleton diagnostics
- `TOP`, `DRESS`, and `BOTTOM` garment layers
- bone-based accessory anchors
- attachment debug markers
- procedural fallback if the GLB is missing
- GitHub Pages workflow

---

## 1. Requirements

Install:

- Node.js LTS
- Visual Studio Code
- Chrome or Edge
- Git

Check:

```bash
node -v
npm -v
git --version
```

---

## 2. Install dependencies

Open this project in VS Code, then:

```bash
npm install
```

---

## 3. Download Michelle

Run:

```bash
npm run model:michelle
```

This creates:

```text
public/models/Michelle.glb
```

The model is downloaded from the official Three.js GitHub repository.

If you already have `Michelle.glb`, simply copy it to that location.

---

## 4. Start the application

```bash
npm run dev
```

Open the URL printed by Vite, usually:

```text
http://localhost:5173/
```

Do not open `index.html` directly with `file://`.

---

## 5. Production build

```bash
npm run build
```

The deployable site is generated in:

```text
dist/
```

Preview the production build with:

```bash
npm run preview
```

---

## File structure

```text
fitstyle-3d/
│
├── .github/
│   └── workflows/
│       └── pages.yml
│
├── public/
│   └── models/
│       ├── Michelle.glb        # after npm run model:michelle
│       └── README.md
│
├── scripts/
│   └── download-michelle.mjs
│
├── src/
│   ├── config/
│   │   └── modelConfig.js
│   │
│   ├── three/
│   │   ├── createFallbackHuman.js
│   │   ├── FitStyleRig.js
│   │   ├── HumanViewer.js
│   │   └── loadMichelle.js
│   │
│   ├── main.js
│   └── styles.css
│
├── .gitattributes
├── .gitignore
├── CREDITS.md
├── index.html
├── package.json
├── README.md
└── vite.config.js
```

---

# Architecture

```text
Michelle.glb
    │
    ▼
loadMichelle.js
    │
    ├── normalize scale
    ├── center model
    ├── feet → ground
    ├── mesh diagnostics
    └── bone discovery
    │
    ▼
HumanViewer
    │
    ├── Three.js scene
    ├── lighting
    ├── camera
    ├── OrbitControls
    └── animation support
    │
    ▼
FitStyleRig
    │
    ├── GARMENT_TOP
    ├── GARMENT_DRESS
    ├── GARMENT_BOTTOM
    │
    └── accessory anchors
        ├── HEAD
        ├── FACE
        ├── NECK
        ├── LEFT_WRIST
        ├── RIGHT_WRIST
        ├── LEFT_FOOT
        ├── RIGHT_FOOT
        └── BACK
```

---

# Why garment layers are not attached directly to the chest

Rigid accessories can be attached to bones.

For example:

```text
head bone → hat
hand bone → watch
foot bone → shoe
```

A real shirt or dress is different. It must deform with many bones at the same
time.

The future garment architecture is therefore:

```text
same avatar skeleton
       │
       ├── body SkinnedMesh
       └── garment SkinnedMesh
```

The `TOP`, `DRESS`, and `BOTTOM` groups already exist as clean scene layers for
that next implementation.

---

# Next development milestone

## Component 2A — one fitted top

Do only one garment first:

1. create/acquire a shirt aligned to Michelle
2. use the same skeleton / bone names
3. verify skin weights
4. load the garment as GLB
5. place it in the `TOP` garment layer
6. test front / side / back
7. solve body clipping
8. only then add a dress or trousers

Do not add body scanning yet. Fit and clothing deformation should be stable
first.

---

# GitHub

Create an empty repository on GitHub, then from this project folder:

```bash
git init
git add .
git commit -m "Initial FitStyle 3D human viewer"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPOSITORY.git
git push -u origin main
```

If you want Michelle on the deployed site, run:

```bash
npm run model:michelle
```

and commit `public/models/Michelle.glb`.

---

# GitHub Pages

A Pages workflow is included in:

```text
.github/workflows/pages.yml
```

In GitHub:

1. Open the repository.
2. Go to **Settings → Pages**.
3. Under **Build and deployment**, choose **GitHub Actions**.
4. Push to `main`.

The workflow automatically installs dependencies, downloads `Michelle.glb`, builds the Vite app, and deploys `dist/` to GitHub Pages. You do not need to commit the model file just to make the deployed site show Michelle.

---

# Important

This is a development prototype. Accurate virtual fitting will eventually
require both:

- an accurate personalized body model
- garments with correct dimensions, topology, rigging, skin weights, and
  material/cloth data

Body scanning alone does not make clothing fit simulation accurate.
