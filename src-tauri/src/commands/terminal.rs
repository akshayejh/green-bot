use crate::commands::utils::resolve_adb_path;
use std::process::Command;
use tauri::AppHandle;

#[tauri::command]
pub async fn run_adb_command(
    app: AppHandle,
    device: String,
    command: String,
) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", &command])
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
