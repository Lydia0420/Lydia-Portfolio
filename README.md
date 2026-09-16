# Lydia Portfolio

Portfolio preview with complete project pages, optimized homepage loading, and original visual design.

This release intentionally excludes video files. Video areas are labeled as pending; original videos remain in the full local working copy.

## Editing

- `index.html`: homepage layout, styles and scroll animation.
- `loading-gate.js`: loading-time scroll lock and refresh reset.
- `frame-loader.js`: bounded loading and retry of animation frames.
- `bg-webp/`: all 192 lossless animation frames.
- `details/`: project pages and their local assets, keeping the original folder structure.
- `preview-media.js`: temporary online preview notice. Remove its references after connecting videos.

Use a local static server for testing. GitHub Pages serves the repository root; `.nojekyll` preserves static assets without a Jekyll build.
