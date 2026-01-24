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
        
        # We will attempt to download and mount the DMG or extract the App if available.
        ASSET_EXT=".dmg"  # Prioritize DMG for macOS
        ;;
    *)
        echo "Unsupported OS: $OS"
        exit 1
        ;;
esac

echo "Fetching latest release..."
# Note: This requires the repository to be Public and the release to be 'Published' (not Draft).
RELEASE_DATA=$(curl -s "https://api.github.com/repos/$OWNER/$REPO/releases/latest")
LATEST_URL=$(echo "$RELEASE_DATA" | grep "browser_download_url" | grep "$ASSET_EXT" | grep "$ASSET_PATTERN" | cut -d '"' -f 4 | head -n 1)

if [ -z "$LATEST_URL" ]; then
    echo "Could not find a release asset for your platform ($OS $ARCH)."
    echo "This might happen if:"
    echo "1. There are no published releases (Drafts are hidden from this script)."
    echo "2. The release doesn't have an '$ASSET_EXT' asset for '$ASSET_PATTERN'."
    exit 1
fi

echo "Downloading $LATEST_URL..."
curl -L -o "green-bot-installer$ASSET_EXT" "$LATEST_URL"

if [ "$OS" == "Linux" ]; then
    chmod +x "green-bot-installer$ASSET_EXT"
    echo "Moving to $INSTALL_DIR..."
    sudo mv "green-bot-installer$ASSET_EXT" "$INSTALL_DIR/$BINARY"
    echo "Installation complete! You can now run '$BINARY' from your terminal."
elif [ "$OS" == "Darwin" ]; then
    echo "Mounting DMG..."
    hdiutil attach "green-bot-installer$ASSET_EXT" -nobrowse -quiet
    echo "Installing to /Applications..."
    # Copy the .app from the mounted volume to /Applications
    # The volume name is usually the release name or product name. We assume 'green-bot'.
    # Because we don't know the exact Volume name for sure, we find it.
    
    VOL_NAME=$(ls /Volumes | grep -i "green-bot" | head -n 1)
    if [ -z "$VOL_NAME" ]; then
        # Fallback search
        VOL_NAME=$(ls /Volumes | grep -i "green" | head -n 1)
    fi

    if [ -n "$VOL_NAME" ]; then
        # Find the .app file in the volume (handles different naming)
        APP_NAME=$(ls "/Volumes/$VOL_NAME" | grep -i ".app$" | head -n 1)
        if [ -n "$APP_NAME" ]; then
            sudo cp -R "/Volumes/$VOL_NAME/$APP_NAME" /Applications/
            echo "Unmounting DMG..."
            hdiutil detach "/Volumes/$VOL_NAME" -quiet
            rm "green-bot-installer$ASSET_EXT"
            echo "Installation complete! Green Bot is now in your Applications folder."
            echo ""
            echo "⚠️  First launch: If you see 'App is damaged', run:"
            echo "   xattr -cr /Applications/$APP_NAME"
        else
            echo "Could not find .app in volume. Please install manually."
            hdiutil detach "/Volumes/$VOL_NAME" -quiet
        fi
    else
        echo "Could not detect mounted volume. Please open 'green-bot-installer$ASSET_EXT' manually to install."
    fi
fi
