use std::path::PathBuf;
use tauri::{AppHandle, Manager};

pub fn resolve_adb_path(app: &AppHandle) -> String {
    // Try to find bundled adb first
    // It is located inside the scrcpy folder which is in resources
    let resource_dir = app.path().resource_dir().unwrap_or(PathBuf::from("."));

    #[cfg(target_os = "windows")]
    let binary_path = resource_dir.join("binaries/scrcpy-win64/adb.exe");
    #[cfg(target_os = "linux")]
    let binary_path = resource_dir.join("binaries/scrcpy-linux/adb");
    #[cfg(target_os = "macos")]
    let binary_path = resource_dir.join("binaries/scrcpy-macos/adb");

    // Make executable on macOS/Linux if it exists
    #[cfg(unix)]
    if binary_path.exists() {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = std::fs::metadata(&binary_path) {
            let mut perms = metadata.permissions();
            if perms.mode() & 0o111 == 0 {
                perms.set_mode(0o755);
                let _ = std::fs::set_permissions(&binary_path, perms);
            }
        }
    }

    if binary_path.exists() {
        return binary_path.to_string_lossy().to_string();
    }

    // Fallback to system env
    "adb".to_string()
}

pub fn resolve_scrcpy_path(app: &AppHandle) -> PathBuf {
    // Try to find bundled scrcpy first
    let resource_dir = app.path().resource_dir().unwrap_or(PathBuf::from("."));

    #[cfg(target_os = "windows")]
    let binary_path = resource_dir.join("binaries/scrcpy-win64/scrcpy.exe");
    #[cfg(target_os = "linux")]
    let binary_path = resource_dir.join("binaries/scrcpy-linux/scrcpy");
    #[cfg(target_os = "macos")]
    let binary_path = resource_dir.join("binaries/scrcpy-macos/scrcpy");

    // Make executable on macOS/Linux if it exists
    #[cfg(unix)]
    if binary_path.exists() {
        use std::os::unix::fs::PermissionsExt;
        if let Ok(metadata) = std::fs::metadata(&binary_path) {
            let mut perms = metadata.permissions();
            if perms.mode() & 0o111 == 0 {
                perms.set_mode(0o755);
                let _ = std::fs::set_permissions(&binary_path, perms);
            }
        }
    }

    if binary_path.exists() {
        return binary_path;
    }

    // Fallback to system PATH
    PathBuf::from("scrcpy")
}
