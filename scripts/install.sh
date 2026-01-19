#!/bin/bash

set -e

OWNER="akshayejh"
REPO="green-bot"
BINARY="green-bot"
INSTALL_DIR="/usr/local/bin"

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

case "$OS" in
    Linux)
        echo "Detected Linux..."
        ASSET_EXT=".AppImage"
        # Check architecture
        if [ "$ARCH" == "x86_64" ]; then
            ASSET_PATTERN="amd64" # modify based on your AppImage naming
        else
            echo "Unsupported architecture: $ARCH"
            exit 1
        fi
        ;;
    Darwin)
        echo "Detected macOS..."
        ASSET_EXT=".dmg"
        if [ "$ARCH" == "arm64" ]; then
            echo "Apple Silicon detected."
        else
            echo "Intel Mac detected."
        fi
        # macOS usually requires mounting DMG to install, which is hard in a curl script.
        # A better approach for script-install on macOS is usually downloading a .tar.gz bundle if available, 
        # or suggesting Homebrew. 
        # For this script, we will try to handle .app directly if distributed as .tar.gz, 
        # or just fail gracefully suggesting Homebrew.
        
        echo "For macOS, we recommend using Homebrew once the tap is set up."
        echo "Run: brew install ${OWNER}/tap/${BINARY}"
        echo "Alternatively, download the .dmg from GitHub releases."
        exit 0
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "Fetching latest release..."
LATEST_URL=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest" | grep "browser_download_url" | grep "$ASSET_EXT" | cut -d '"' -f 4)

if [ -z "$LATEST_URL" ]; then
    echo "Could not find a release asset for your platform."
    exit 1
fi

echo "Downloading $LATEST_URL..."
curl -L -o "$BINARY$ASSET_EXT" "$LATEST_URL"

if [ "$OS" == "Linux" ]; then
    chmod +x "$BINARY$ASSET_EXT"
    echo "Moving to $INSTALL_DIR..."
    sudo mv "$BINARY$ASSET_EXT" "$INSTALL_DIR/$BINARY"
    echo "Installation complete! You can now run '$BINARY' from your terminal."
fi
