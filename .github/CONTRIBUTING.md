# Contributing to Green Bot

Thank you for your interest in contributing to Green Bot! This guide will help you get set up for development.

## 🛠️ Tech Stack

- **Core**: [Tauri v2](https://v2.tauri.app/) (Rust)
- **Frontend**: React, TypeScript, Vite
- **Styling**: TailwindCSS, Shadcn UI
- **State Management**: Zustand
- **Icons**: Lucide React

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18+) or [Bun](https://bun.sh/) / [PNPM](https://pnpm.io/)
- **Rust** (latest stable) - [Install Rust](https://rustup.rs/)

### Platform-Specific Requirements

#### Linux

Install the required system dependencies:

```bash
sudo apt-get install libwebkit2gtk-4.1-dev build-essential curl wget file libssl-dev libgtk-3-dev libayatana-appindicator3-dev librsvg2-dev
```

#### macOS

Xcode Command Line Tools are required:

```bash
xcode-select --install
```

#### Windows

- [Microsoft Visual Studio C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/)
- [WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (usually pre-installed on Windows 10/11)

## 🚀 Development Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/akshayejh/green-bot.git
   cd green-bot
   ```

2. **Install dependencies:**

   ```bash
   bun install
   # or
   npm install
   ```

3. **Run in development mode:**

   ```bash
   # Standard development
   bun run tauri dev

   # Linux (with scale fix)
   bun run dev:linux
   ```

## 🏗️ Building for Production

To create a standalone executable for your platform:

```bash
bun run tauri build
```

The output will be in `src-tauri/target/release/bundle/`.

## 📦 Binary Dependencies

Green Bot bundles `adb` and `scrcpy` binaries so users don't need Android SDK installed.

- **Development**: Ensure `src-tauri/binaries/` contains the correct `scrcpy` folder for your target platform.
- **Runtime**: The app resolves `adb` from bundled resources automatically.

### Supported Platforms

| Platform | Binary Location |
|----------|----------------|
| Linux    | `src-tauri/binaries/scrcpy-linux/` |
| macOS    | `src-tauri/binaries/scrcpy-macos/` |
| Windows  | `src-tauri/binaries/scrcpy-win32/` |

## 📁 Project Structure

```
green-bot/
├── src/                    # React frontend
│   ├── components/         # UI components
│   ├── features/           # Feature modules
│   ├── hooks/              # Custom React hooks
│   ├── store/              # Zustand state stores
│   └── styles/             # Global styles
├── src-tauri/              # Rust backend
│   ├── src/                # Rust source code
│   ├── binaries/           # Bundled binaries (adb, scrcpy)
│   └── tauri.conf.json     # Tauri configuration
└── public/                 # Static assets
```

## 🧪 Code Style

- **TypeScript**: Follow existing patterns, use strict types
- **Rust**: Run `cargo fmt` before committing
- **Components**: Use Shadcn UI components where possible

## 📝 Commit Guidelines

- Use clear, descriptive commit messages
- Reference issues when applicable: `Fix #123: Description`

## 🐛 Reporting Issues

Found a bug? Please [open an issue](https://github.com/akshayejh/green-bot/issues/new) with:

- Your operating system and version
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💡 Feature Requests

Have an idea? Check the [Roadmap](../docs/ROADMAP.md) first, then [open a discussion](https://github.com/akshayejh/green-bot/discussions) to propose your feature.

## 🤝 Code of Conduct

Please note that this project is released with a [Contributor Code of Conduct](CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

---

Thank you for contributing! 🎉
