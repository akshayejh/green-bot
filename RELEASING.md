# Release & Distribution Guide

This document outlines the steps to publish new versions of Green Bot and maintain package manager repositories.

## 1. Creating a Release

This project is configured with GitHub Actions to build automatically.

1. **Update Version:**
   - Update version in `package.json`.
   - Update version in `src-tauri/tauri.conf.json`.

2. **Tag & Push:**

   ```bash
   git commit -am "release: v1.0.3"
   git tag v1.0.3
   git push origin v1.0.3
   ```

3. **Wait:**
   - Go to the "Actions" tab in GitHub.
   - Watch the "Release" workflow run.
   - Once finished, a new Release will appear on the right side of your repo with `.dmg`, `.AppImage`, and `.msi` files.
