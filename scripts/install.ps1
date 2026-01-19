# Windows Install Script
$ErrorActionPreference = "Stop"

$Owner = "akshayejh"
$Repo = "green-bot"
$AppDir = "$env:LOCALAPPDATA\GreenBot"
$BinName = "green-bot.exe"

Write-Host "Fetching latest release info..."
$ReleaseUrl = "https://api.github.com/repos/$Owner/$Repo/releases/latest"
$Release = Invoke-RestMethod -Uri $ReleaseUrl

$Asset = $Release.assets | Where-Object { $_.name -like "*.msi" -or $_.name -like "*.exe" } | Select-Object -First 1

if (-not $Asset) {
    Write-Error "No Windows installer found in the latest release."
}

$InstallerPath = "$env:TEMP\green-bot-setup.exe"
Write-Host "Downloading $($Asset.name)..."
Invoke-WebRequest -Uri $Asset.browser_download_url -OutFile $InstallerPath

Write-Host "Installing..."
# Run the installer silently
Start-Process -FilePath $InstallerPath -ArgumentList "/silent" -Wait

Write-Host "Installation complete!"
