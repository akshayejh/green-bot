use crate::commands::utils::resolve_adb_path;
use std::process::Command;
use tauri::AppHandle;

#[tauri::command]
pub async fn get_adb_logs(app: AppHandle, device: String) -> Result<String, String> {
    // -d dumps the log to the screen and exits
    // performing this async ensures the main thread isn't blocked by the process wait
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "logcat", "-d", "-t", "500"]) // get last 500 lines
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
