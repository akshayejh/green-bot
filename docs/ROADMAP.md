# Roadmap

This document outlines planned features and improvements for Green Bot. Features are organized by priority and complexity.

> **Note**: This roadmap is a living document and subject to change. Priorities may shift based on user feedback, technical constraints, and new ideas. Items listed here are not guaranteed to be implemented in any specific order or timeframe.

---

## 🎯 High Priority

### Package Manager Enhancements

- **Extract APK**: Pull/backup APK files from device to computer
- **Grant/Revoke Permissions**: Manage individual app permissions interactively
- **Running Status Indicator**: Show if an app is currently running
- **Storage Breakdown**: Display app size, user data, and cache size separately
- **Open in Settings**: Quick button to open app's settings page on device
- **Batch Operations**: Select multiple apps for bulk uninstall/disable/enable

### Screenshots & Recording

- **Take Screenshot**: Capture device screen with one click
- **Screen Recording**: Start/stop video recording of device screen
- **Screenshot History**: Gallery of recent captures with quick actions
- **Annotation Tools**: Basic markup before saving/sharing

---

## 🚀 Medium Priority

### Quick Actions & Controls

- **Reboot Options**: Normal reboot, bootloader, recovery, fastboot
- **Input Controls**: Send text, key events, simulate taps
- **Volume Control**: Adjust media/ring/notification volumes

### Developer Tools

- **Layout Bounds**: Toggle layout bounds overlay on device
- **GPU Overdraw**: Visualize overdraw regions
- **Pointer Location**: Show touch coordinates overlay
- **Animation Scales**: Adjust animator/window/transition duration
- **Don't Keep Activities**: Toggle for testing activity lifecycle
- **Show Taps**: Visual feedback for touches

### Log Viewer Improvements

- **Advanced Filters**: Filter by tag, PID, log level, keyword
- **Search & Highlight**: Find and highlight terms in logs
- **Export Logs**: Save filtered logs to file
- **Auto-scroll Lock**: Pause auto-scroll while reading
- **Color-coded Levels**: Visual distinction for V/D/I/W/E/F

---

## 💡 Future Ideas

### Backup & Restore

- **App Backup**: Backup APK + data for selected apps
- **Full Device Backup**: Complete ADB backup with encryption
- **Restore Wizard**: Guided restore process from backup files
- **Backup Profiles**: Save backup configurations for quick access
- **Cloud Integration**: Optional backup to cloud storage

### Automation & Scripting

- **Command Macros**: Save and replay command sequences
- **Custom Quick Commands**: User-defined terminal shortcuts
- **Scheduled Tasks**: Run commands on a timer or schedule
- **Event Triggers**: Execute actions on device connect/disconnect

### Multi-Device Features

- **Parallel Execution**: Run same command on multiple devices
- **Device Groups**: Organize devices into named groups
- **File Sync**: Sync folders between devices or to computer
- **Device Comparison**: Side-by-side spec comparison

### Advanced Package Features

- **Activity Launcher**: List and launch specific activities
- **Intent Sender**: Craft and send custom intents
- **Service Manager**: View and control app services
- **Content Provider Browser**: Explore app data via content providers
- **Shared Preferences Editor**: View/edit app preferences (root)

### Quality of Life

- **Global Keyboard Shortcuts**: Navigate app without mouse
- **Command Palette**: Quick action search (Cmd/Ctrl+K)
- **Operation History**: View past operations with undo support
- **Favorites System**: Star frequently used apps/files/commands
- **Drag & Drop Everywhere**: Drop files anywhere to upload
- **Notifications**: System notifications for long-running tasks
- **Themes**: Additional color themes beyond light/dark

### Security Tools

- **Permission Audit**: Security analysis of installed apps
- **Certificate Viewer**: View app signing certificates
- **SELinux Status**: Display and explain SELinux state
- **USB Debugging Status**: Show connected debugger info

---

## ✅ Recently Completed

- [x] **Device Diagnostics** - Hardware testing dashboard with battery health, display info, sensor detection, connectivity status, and test actions (brightness, WiFi/Bluetooth toggles, battery simulation, vibration)
- [x] **File Manager Enhancements** - Create folder, rename, copy/cut/paste, multi-select with checkboxes, search, and bookmarks
- [x] **Device Information Dashboard** - Full device info page with system, hardware, battery, storage, network, and build details
- [x] File delete with confirmation dialog
- [x] Curated app name database (300+ apps)
- [x] Copy buttons on package details
- [x] Terminal command history with arrow navigation
- [x] Linux window frame fix
- [x] Device customization persistence
- [x] External links working on Linux

---

## 🤝 Contributing

Have a feature idea? Open an issue on GitHub with the `enhancement` label!

Contributions are welcome for any roadmap item. Check CONTRIBUTING.md for guidelines.
