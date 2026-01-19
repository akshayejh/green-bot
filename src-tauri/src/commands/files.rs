use crate::commands::utils::resolve_adb_path;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub size: Option<u64>,
    pub permissions: String,
}

#[tauri::command]
pub async fn list_files(
    app: AppHandle,
    device: String,
    path: String,
) -> Result<Vec<FileEntry>, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "ls", "-l", &path])
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut entries = Vec::new();

    for line in stdout.lines() {
        if line.starts_with("total") {
            continue;
        }

        // Simple and naive parsing, might need improvement for robust ls -l parsing
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 8 {
            // Try to handle simpler cases or skip
            continue;
        }

        let permissions = parts[0].to_string();
        let is_dir = permissions.starts_with('d');
        // Determine name index (can vary depending on ls output format, usually last)
        // Date/Time fields take up some space.
        // -rwxr-xr-x 1 root root 3424 2023-01-01 12:00 filename
        let name = parts[7..].join(" ");
        let size = parts[4].parse::<u64>().ok();

        entries.push(FileEntry {
            name,
            path: format!(
                "{}/{}",
                path.trim_end_matches('/'),
                parts.last().unwrap_or(&"")
            ),
            is_dir,
            size,
            permissions,
        });
    }

    Ok(entries)
}

#[tauri::command]
pub async fn download_file(
    app: AppHandle,
    device: String,
    path: String,
    destination: String,
) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "pull", &path, &destination])
        .output()
        .map_err(|e| format!("Failed to execute adb pull: {}", e))?;

    if output.status.success() {
        Ok("Download successful".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn upload_file(
    app: AppHandle,
    device: String,
    local_path: String,
    remote_path: String,
) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "push", &local_path, &remote_path])
        .output()
        .map_err(|e| format!("Failed to execute adb push: {}", e))?;

    if output.status.success() {
        Ok("Upload successful".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn read_file_content(
    app: AppHandle,
    device: String,
    path: String,
) -> Result<Vec<u8>, String> {
    // limit max size? For now, let's rely on frontend to check file size before calling
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "exec-out", "cat", &path])
        .output()
        .map_err(|e| format!("Failed to execute adb pull: {}", e))?;

    if output.status.success() {
        Ok(output.stdout)
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn delete_file(app: AppHandle, device: String, path: String) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "rm", "-f", "-r", &path])
        .output()
        .map_err(|e| format!("Failed to execute adb rm: {}", e))?;

    if output.status.success() {
        Ok("Delete successful".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}
