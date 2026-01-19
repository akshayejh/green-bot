# Green Bot 🤖

<div align="center">
  <img src="public/greenbot-icon.png" alt="Green Bot Logo" width="128" height="128" />
  
  <h3>A modern, standalone Android device management tool.</h3>

  <p>
    Built with <a href="https://tauri.app/">Tauri</a>, <a href="https://react.dev/">React</a>, and <a href="https://ui.shadcn.com/">Shadcn UI</a>.
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
    <img src="https://img.shields.io/github/v/release/akshayejh/green-bot?label=version" alt="Version" />
    <img src="https://img.shields.io/badge/platform-Linux%20%7C%20Windows%20%7C%20macOS-lightgrey.svg" alt="Platform" />
  </p>
</div>

---

## 📥 Download

<div align="center">
  <p>Get the latest version for your operating system.</p>
  
  <a href="https://github.com/akshayejh/green-bot/releases/latest">
    <img src="https://img.shields.io/badge/macOS-000000?style=for-the-badge&logo=apple&logoColor=white" alt="Download for macOS" />
  </a>
  <a href="https://github.com/akshayejh/green-bot/releases/latest">
    <img src="https://img.shields.io/badge/Windows-0078D6?style=for-the-badge&logo=windows&logoColor=white" alt="Download for Windows" />
  </a>
  <a href="https://github.com/akshayejh/green-bot/releases/latest">
    <img src="https://img.shields.io/badge/Linux-FCC624?style=for-the-badge&logo=linux&logoColor=black" alt="Download for Linux" />
  </a>
</div>

<br />

### Automated Install Scripts

For a quick installation via terminal:

#### Linux & macOS

```bash
curl -fsSL https://raw.githubusercontent.com/akshayejh/green-bot/main/scripts/install.sh | sh
```

#### Windows

```powershell
iwr -useb https://raw.githubusercontent.com/akshayejh/green-bot/main/scripts/install.ps1 | iex
```

For manual downloads and troubleshooting, see the [Installation Guide](INSTALL.md).

---

## ✨ Features

Green Bot is designed to be a lightweight, portable alternative to heavy Android management suites. It bundles necessary binaries (`adb`, `scrcpy`) so you don't need to install anything else on your host machine.

- 📱 **Device Management**
  - Auto-detect connected devices via USB or TCP/IP.
  - Wireless Debugging support (Connect & Pair).
  - View device details (Model, Product, Serial).

- 📂 **File Explorer**
  - Browse device file system in a modern grid/list view.
  - **Drag & Drop Upload**: Drop files directly into the window to upload.
  - **Smart Preview**: Preview images and text files directly in the app.
  - Download and Delete file capabilities.

- 🖥️ **Screen Mirroring**
  - Integrated low-latency screen mirroring powered by `scrcpy`.
  - Control your device with mouse and keyboard.

- 📦 **Package Manager**
  - List all installed applications (User & System).
  - View detailed app info: Version, storage size, install dates, permissions.
  - Install APKs from your computer.
  - Uninstall, Enable, Disable, or Force Stop apps.
  - Launch apps directly from the desktop.

- ⌨️ **Developer Tools**
  - **Terminal**: Run raw ADB shell commands.
  - **Logcat**: View and filter device logs in real-time.

- 🎨 **Modern UI**
  - Beautiful, responsive interface with Dark/Light mode support.
  - Native window controls and acrylic effects.

## 🛠️ Tech Stack

- **Core**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS, Shadcn UI
- **State Management**: Zustand
- **Icons**: Lucide React

## 🚀 Getting Started

### Prerequisites

- **Node.js** (or Bun/PNPM)
- **Rust** (cargo)
- **Linux Packages** (only if building on Linux):
  ```bash
  sudo apt-get install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
  ```

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/akshayejh/green-bot.git
   cd green-bot
   ```

2. Install dependencies:

   ```bash
   bun install # or npm install
   ```

3. Run in Development Mode:
   ```bash
   bun run dev:linux # For Linux Dev (Handles scale issues)
   # OR
   bun run tauri dev
   ```

### Building for Production

To create a standalone executable for your OS:

```bash
bun run tauri build
```

The output binary will be located in `src-tauri/target/release/bundle/`.

## 📦 Binary Dependencies

Green Bot relies on `scrcpy` binaries being present in the resource folder.

- **Development**: Ensure `src-tauri/binaries/` contains the correct `scrcpy` folder for your platform.
- **Runtime**: The app expects `adb` to be resolvable within these bundled resources, allowing it to work on systems without Android Studio installed.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
