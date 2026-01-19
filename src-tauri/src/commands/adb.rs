use crate::commands::utils::resolve_adb_path;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

#[derive(Debug, Serialize, Deserialize)]
pub struct AdbDevice {
    pub serial: String,
    pub state: String,
    pub model: Option<String>,
    pub product: Option<String>,
    pub device: Option<String>,
}

#[tauri::command]
pub async fn restart_adb_server(app: AppHandle) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    // Kill server
    let _ = Command::new(&adb_path)
        .arg("kill-server")
        .output()
        .map_err(|e| format!("Failed to kill adb server: {}", e))?;

    // Start server
    let output = Command::new(&adb_path)
        .arg("start-server")
        .output()
        .map_err(|e| format!("Failed to start adb server: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(())
}

#[tauri::command]
pub async fn get_adb_devices(app: AppHandle) -> Result<Vec<AdbDevice>, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .arg("devices")
        .arg("-l")
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let mut devices = Vec::new();

    for line in stdout.lines().skip(1) {
        if line.trim().is_empty() {
            continue;
        }

        // Example line:
        // emulator-5554          device product:sdk_gphone64_x86_64 model:sdk_gphone64_x86_64 device:emulator64_x86_64 transport_id:1
        let parts: Vec<&str> = line.split_whitespace().collect();
        if parts.len() < 2 {
            continue;
        }

        let serial = parts[0].to_string();
        let state = parts[1].to_string();
        let mut model = None;
        let mut product = None;
        let mut device_field = None; // 'device' is a keyword/param string in the line

        for part in &parts[2..] {
            if let Some((key, value)) = part.split_once(':') {
                match key {
                    "model" => model = Some(value.to_string()),
                    "product" => product = Some(value.to_string()),
                    "device" => device_field = Some(value.to_string()),
                    _ => {}
                }
            }
        }

        devices.push(AdbDevice {
            serial,
            state,
            model,
            product,
            device: device_field,
        });
    }

    Ok(devices)
}

#[tauri::command]
pub async fn adb_connect(app: AppHandle, ip: String) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["connect", &ip])
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}

#[tauri::command]
pub async fn adb_pair(app: AppHandle, addr: String, code: String) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["pair", &addr, &code])
        .output()
        .map_err(|e| format!("Failed to execute adb: {}", e))?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    Ok(String::from_utf8_lossy(&output.stdout).to_string())
}
