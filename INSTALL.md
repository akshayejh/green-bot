# Installation Guide

<div align="center">
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

---

## 🚀 Quick Install (Recommended)

The fastest way to install Green Bot is using our install scripts.

### Linux & macOS

```bash
curl -fsSL https://raw.githubusercontent.com/akshayejh/green-bot/main/scripts/install.sh | sh
```

### Windows (PowerShell)

```powershell
iwr -useb https://raw.githubusercontent.com/akshayejh/green-bot/main/scripts/install.ps1 | iex
```

---

## 📦 Manual Installation

Download the latest release for your platform from the [Releases Page](https://github.com/akshayejh/green-bot/releases/latest).

### macOS

| File Type | Description |
|-----------|-------------|
| `.dmg` | Standard installer (recommended) |

**Steps:**
1. Download the `.dmg` file
2. Open it and drag **Green Bot** to your Applications folder
3. On first launch, right-click and select "Open" to bypass Gatekeeper

> **⚠️ "App is damaged and can't be opened"?**
>
> This is expected! Apple's Gatekeeper blocks apps that aren't signed with an Apple Developer certificate. Green Bot is safe and open source — we just don't pay Apple's $99/year fee to sign it.
>
> **Fix it in 5 seconds:**
> ```bash
> xattr -cr /Applications/Green\ Bot.app
> ```
> Run this once in Terminal, then open Green Bot normally.

### Windows

| File Type | Description |
|-----------|-------------|
| `.msi` | Standard installer (recommended) |
| `.exe` | Portable executable |

**Steps:**
1. Download the `.msi` installer
2. Run it and follow the prompts
3. Launch from Start Menu

### Linux

| File Type | Description |
|-----------|-------------|
| `.AppImage` | Universal package (recommended) |
| `.deb` | Debian/Ubuntu package |

**AppImage:**
```bash
chmod +x Green_Bot_*.AppImage
./Green_Bot_*.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i green-bot_*.deb
```

---

## 🔧 First-Time Setup

### Enable USB Debugging on Your Android Device

1. Go to **Settings → About Phone**
2. Tap **Build Number** 7 times to enable Developer Options
3. Go to **Settings → Developer Options**
4. Enable **USB Debugging**

### Connect Your Device

**Via USB:**
1. Connect your device with a USB cable
2. Accept the "Allow USB Debugging" prompt on your phone
3. Green Bot will auto-detect your device

**Via WiFi (Wireless Debugging):**
1. Enable **Wireless Debugging** in Developer Options
2. Use Green Bot's Connect feature to pair

---

## ❓ Troubleshooting

### Device Not Detected

- Ensure USB Debugging is enabled
- Try a different USB cable (some cables are charge-only)
- On Linux, you may need to add udev rules:
  ```bash
  echo 'SUBSYSTEM=="usb", ATTR{idVendor}=="*", MODE="0666", GROUP="plugdev"' | sudo tee /etc/udev/rules.d/51-android.rules
  sudo udevadm control --reload-rules
  ```

### macOS: "App is damaged and can't be opened"

See the [fix above](#macos) — just run `xattr -cr /Applications/Green\ Bot.app` in Terminal.

**Why does this happen?**

Apple's macOS includes a security feature called **Gatekeeper** that only allows apps from the Mac App Store or identified developers to run by default. When you download an app from the internet (like Green Bot), macOS adds a "quarantine" attribute to protect you from potentially malicious software.

Green Bot is safe and open source, but we don't pay Apple's $99/year Developer Program fee just to sign the app. This is common for free, open-source software.

### Linux: AppImage Won't Run

Make sure FUSE is installed:
```bash
# Ubuntu/Debian
sudo apt install fuse libfuse2

# Fedora
sudo dnf install fuse
```

### Still Having Issues?

[Open an issue](https://github.com/akshayejh/green-bot/issues/new) with details about your OS and the problem you're experiencing.
