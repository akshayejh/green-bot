# Changelog

All notable changes to Green Bot will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

No unreleased changes.

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

[Unreleased]: https://github.com/akshayejh/green-bot/compare/v1.1.0...HEAD
[1.1.0]: https://github.com/akshayejh/green-bot/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/akshayejh/green-bot/releases/tag/v1.0.0
