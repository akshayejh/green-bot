use crate::commands::utils::resolve_scrcpy_path;
use std::path::PathBuf;
use std::process::Command;
use std::thread;
use tauri::{AppHandle, Emitter, Manager};

#[tauri::command]
pub fn check_scrcpy(app: AppHandle) -> bool {
    let scrcpy_bin = resolve_scrcpy_path(&app);
    Command::new(scrcpy_bin)
        .arg("--version")
        .output()
        .map(|o| o.status.success())
        .unwrap_or(false)
}

#[tauri::command]
pub async fn install_scrcpy() -> Result<String, String> {
    // Installation is less relevant if we bundle, but keep it as fallback
    #[cfg(target_os = "macos")]
    {
        // Check if brew exists
        let brew_check = Command::new("which").arg("brew").output();

        if brew_check.is_err() || !brew_check.unwrap().status.success() {
            return Err(
                "Homebrew not found. Please install Homebrew or install scrcpy manually."
                    .to_string(),
            );
        }

        let output = Command::new("brew")
            .args(&["install", "scrcpy"])
            .output()
            .map_err(|e| format!("Failed to execute installation command: {}", e))?;

        if output.status.success() {
            Ok("scrcpy installed successfully".to_string())
        } else {
            let err = String::from_utf8_lossy(&output.stderr);
            Err(format!("Installation failed: {}", err))
        }
    }

    #[cfg(target_os = "windows")]
    {
        // Simple winget attempt
        let output = Command::new("winget")
            .args(&["install", "Genymobile.Scrcpy"])
            .output()
            .map_err(|e| format!("Failed to execute winget: {}", e))?;

        if output.status.success() {
            Ok("scrcpy installed successfully".to_string())
        } else {
            Err("Installation failed. Please install 'Genymobile.Scrcpy' manually via Winget or download from GitHub.".to_string())
        }
    }

    #[cfg(target_os = "linux")]
    {
        Err("Automatic installation not supported on Linux. Please install 'scrcpy' via your package manager (apt, dnf, pacman).".to_string())
    }
}

#[tauri::command]
pub fn start_screen_mirror(app: AppHandle, device: String) -> Result<String, String> {
    let scrcpy_bin = resolve_scrcpy_path(&app);

    // We must ensure the binary directory is in the path or working dir
    // because scrcpy depends on adjacent libraries/jars.
    // For specific OS/builds, we might need to set Current Description (cwd)
    let cwd = if scrcpy_bin.is_absolute() {
        scrcpy_bin.parent().map(|p| p.to_path_buf())
    } else {
        None
    };

    let mut command = Command::new(&scrcpy_bin);
    command.args(&["-s", &device]);

    if let Some(dir) = cwd {
        command.current_dir(dir);
    }

    let mut child = command
        .spawn()
        .map_err(|e| format!("Failed to start scrcpy at {:?}: {}", scrcpy_bin, e))?;

    let pid = child.id();
    let app_handle = app.clone();

    // Spawn a thread to wait for the process to exit
    thread::spawn(move || {
        let _ = child.wait();
        // Notify frontend that session ended
        let _ = app_handle.emit("scrcpy-response", format!("Session ended (PID: {})", pid));
    });

    Ok(format!("Mirroring Active (PID: {})", pid))
}
