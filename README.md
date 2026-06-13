# 🌐 Cloud Intelligence Center

A fully autonomous, dark-mode-first portfolio and 3D knowledge graph tracking my Google Cloud journey. Built for performance and zero-maintenance using **Astro**, **D3.js**, and a custom **Node.js Sync Engine**.

## ✨ Features

- **Automated Data Pipeline:** A built-in Node.js scraper that extracts badges, infers technologies, and categorizes learning data directly from a public Google Cloud Skills Boost profile.
- **3D Knowledge Observatory:** An interactive, physics-based node graph built with `react-force-graph-3d` that visualizes the connections between 60+ cloud badges, technologies, and infrastructure clusters.
- **Cloud Environment System:** A deeply integrated ambient lighting system replacing traditional light/dark mode. Supports *Night Ops*, *Deep Space*, *Aurora*, and *Mission Control* with stunning glass-morphing transitions.
- **Zero-Maintenance CI/CD:** Engineered to self-update. A daily GitHub Action runs the sync engine, downloads new assets, and pushes updates to Cloudflare Pages automatically.
- **Perfect Lighthouse Scores:** 100% Static HTML delivery with optimized images and accessible routing.

## 🚀 Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Run the Sync Engine
Before starting the server, run the sync engine to fetch the latest live data from your Google Cloud profile and generate the internal JSON collections.
```bash
npm run sync
```

### 3. Start the Development Server
```bash
npm run dev
```
Navigate to `http://localhost:4321` to see the site.

---

## 🤖 The Sync Architecture

The heart of the platform is the `npm run sync` command. It completely eliminates manual data entry.

When executed, the pipeline:
1. Fetches raw HTML from the target Google Cloud Skills Boost profile.
2. Parses DOM elements via regex to extract badge IDs, titles, dates, and image URLs.
3. Analyzes badge names to infer exact Google Cloud technologies (e.g., "Kubernetes Engine", "BigQuery").
4. Classifies badges into master categories (e.g., DevOps, Security, Data Analytics).
5. Caches missing high-resolution badge media directly into `public/media/`.
6. Generates strictly-typed JSON files into `src/content/`.

---

## 🏗️ Project Structure

```text
├── .github/workflows/
│   └── daily-sync.yml      # The CI/CD automation heartbeat
├── public/
│   └── media/              # Automatically populated badge images
├── scripts/
│   ├── sync-profile.mjs    # Master orchestrator for the pipeline
│   └── lib/                # Scraping, classification, and inference logic
├── src/
│   ├── components/         # Astro & React UI components
│   ├── content/            # Astro Content Collections (Auto-generated)
│   ├── pages/              # File-based routing
│   └── styles/             # Global Tailwind & Environment CSS variables
└── astro.config.mjs        # Configured for Cloudflare Pages adapter
```

## ☁️ Deployment (Cloudflare Pages)

This project is configured to deploy instantly on **Cloudflare Pages**. 

1. Connect your GitHub repository to Cloudflare Pages.
2. Set the build command to: `npm run sync && npm run build`
3. Set the output directory to: `dist/client`
4. The `.github/workflows/daily-sync.yml` action will keep the site updated every night at midnight by committing new badges to the repo, which automatically triggers a new Cloudflare build.

---

> *"The goal is to feel like switching between cloud command-center environments, not changing between website themes."*
