# Release & Distribution Guide

> **Note:** This guide is for project maintainers only.

This document outlines the steps to publish new versions of Green Bot.

---

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

---

## 2. How Auto-Updates Work

When a signed build is released:

1. The workflow generates a `latest.json` file with version info and signature
2. This file is uploaded alongside the release assets
3. When users click "Check for Updates", the app fetches `latest.json`
4. If a newer version exists, users can install it directly from the app

The updater endpoint is configured in `src-tauri/tauri.conf.json`:

```json
"endpoints": [
  "https://github.com/akshayejh/green-bot/releases/latest/download/latest.json"
]
```

---

## 3. Signing Keys (For New Maintainers)

For auto-updates to work, builds must be signed. The signing keys are configured as GitHub Secrets.

**Current setup:** Secrets are already configured in the repository. You only need this section if:
- Setting up a fresh fork/repository
- Regenerating keys after a security incident

### Adding Secrets to GitHub

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. Add these repository secrets:
   - `TAURI_SIGNING_PRIVATE_KEY` — The base64-encoded private key
   - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD` — The password for the key

### Generating New Keys

```bash
bun tauri signer generate -w ~/.tauri/green-bot.key
```

This outputs:
- A **public key** — Add to `src-tauri/tauri.conf.json` under `plugins.updater.pubkey`
- A **private key** — Add to GitHub Secrets as `TAURI_SIGNING_PRIVATE_KEY`
