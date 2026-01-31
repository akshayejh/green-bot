# Changelog

All notable changes to Green Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

---

## [1.3.0] - 2026-01-31

### Added

- **Device Info page** - Comprehensive device information dashboard with system, hardware, battery, storage, network, and build details
- **Device Diagnostics page** - Hardware testing and diagnostics with battery health, display info, sensor detection, connectivity status, and test actions (brightness control, WiFi/Bluetooth toggles, battery simulation, vibration test)
- **File Manager: Create Folder** - New folder button in toolbar with dialog
- **File Manager: Rename** - Rename files/folders via context menu or F2 shortcut
- **File Manager: Copy/Cut/Paste** - Full clipboard support for moving and copying files
- **File Manager: Multi-Select** - Checkbox selection for batch operations (delete, copy, cut)
- **File Manager: Search** - Filter files in current directory with search input
- **File Manager: Bookmarks** - Save frequently accessed paths with quick navigation dropdown

### Changed

- ADB errors now display user-friendly messages instead of raw technical output
- Added "Restart ADB" quick action button directly in error message
- Refined dark mode color palette: reduced green tint, improved border visibility, better contrast
- File list now uses checkboxes for intuitive multi-selection

### Fixed

- "Resume Auto-scroll" button in log viewer now visible with proper styling

---

## [1.2.1] - 2026-01-25

### Added

- README badges for build status, downloads, license, and stars

### Changed

- Documentation reorganized into `docs/` folder (INSTALL.md, RELEASING.md, ROADMAP.md)
- Contributing guide moved to `.github/CONTRIBUTING.md`
- Package.json now includes description, license, author, and repository metadata
- Title bar text styling simplified

### Added

- Download and install progress indicator for updates
- Settings page (replaced dialog with full-page view)
- Settings UI Kit with reusable components for building settings interfaces
- New settings options: show hidden files, confirm before delete, default log level, command history limit
- Check for updates on app launch (configurable in settings)
- Add device dialog redesigned with illustrated help dialogs and step-by-step guidance
- Nested dialog component for stacked dialogs with proper escape key handling
- GitHub community files (issue templates, PR template, code of conduct, contributing guide, security policy)
- Dependabot configuration for automated dependency updates
- MIT License file

---

## [1.2.0] - 2026-01-25

### Added

- Delete option in file manager context menu for files and folders with confirmation dialog
- Curated package name database for accurate app names (300+ popular apps)
- Copy buttons on all package detail fields (version, SDK, UID, path, etc.)
- Terminal command history with arrow key navigation (↑/↓) and history popup

### Fixed

- Removed window frame on Linux for consistent custom title bar experience (matches Windows behavior)
- GitHub link in settings now works on Linux (using Tauri opener plugin)
- Device customizations (labels, icons, colors) now persist across app restarts

---

## [1.1.3] - 2026-01-24

### Fixed

- Enabled `createUpdaterArtifacts` in bundle config to generate signed update files
- Auto-updater now works correctly

---

## [1.1.2] - 2026-01-24

### Fixed

- Fixed updater public key configuration (was incorrectly set to private key)

---

## [1.1.1] - 2026-01-24

### Added

- Upload dialog for file manager with drag-and-drop support
- Drag-and-drop file support in APK install dialog
- Audio file preview support (mp3, wav, ogg, m4a, aac, flac, wma)
- Video file preview support (mp4, webm, mkv, avi, mov, m4v, 3gp)
- "Load anyway" button for files exceeding preview size limits
- More text file extensions supported (yaml, yml, toml, env, sql, csv, etc.)
- Previous/Next navigation buttons in file preview dialog
- Keyboard navigation (← →) for browsing files in preview

### Changed

- Improved upload dialog UI to match APK install dialog styling
- Increased file preview size limits:
  - Images: 2MB → 10MB
  - Text: 100KB → 1MB
  - Audio: up to 50MB
  - Video: up to 100MB
- Better loading state with file size indicator

### Fixed

- Fixed Tauri v2 drag-drop event names (`tauri://drag-drop`, `tauri://drag-enter`, `tauri://drag-leave`)
- Enabled `dragDropEnabled` in window config for proper file drop support
- Improved update check error messages with context-specific feedback
- Dark mode colors lightened for better visibility

---

## [1.1.0] - 2026-01-24

### Added

- Auto-update support with signed releases
- macOS Gatekeeper bypass instructions in documentation
- Developer documentation in CONTRIBUTING.md
- Release signing documentation in RELEASING.md
- One-line install scripts for macOS and Linux

### Changed

- Redesigned README to be user-focused instead of developer-focused
- Refined color palette with green-tinted neutrals for Apple-level polish
- Device selector now shows app logo as default icon
- Simplified title bar by removing redundant logo
- Enhanced GitHub release notes with download table and platform info
- Improved settings update checker with dev mode handling

### Fixed

- macOS install script now correctly finds app bundle (was looking for wrong name)
- Regenerated macOS dock icon for proper sizing (from 1024x1024 source)

---

## [1.0.0] - 2026-01-XX

### Added

- Initial release
- Device management and selection
- File manager with upload/download support
- Package manager with APK installation
- Screen mirroring via scrcpy
- ADB log viewer
- Terminal access
- Dark/light theme support
- Cross-platform support (macOS, Windows, Linux)

[Unreleased]: https://github.com/akshayejh/green-bot/compare/v1.2.1...HEAD
[1.2.1]: https://github.com/akshayejh/green-bot/compare/v1.2.0...v1.2.1
[1.2.0]: https://github.com/akshayejh/green-bot/compare/v1.1.3...v1.2.0
[1.1.3]: https://github.com/akshayejh/green-bot/compare/v1.1.2...v1.1.3
[1.1.2]: https://github.com/akshayejh/green-bot/compare/v1.1.1...v1.1.2
[1.1.1]: https://github.com/akshayejh/green-bot/compare/v1.1.0...v1.1.1
[1.1.0]: https://github.com/akshayejh/green-bot/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/akshayejh/green-bot/releases/tag/v1.0.0
