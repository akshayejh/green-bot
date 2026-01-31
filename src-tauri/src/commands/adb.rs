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

#[derive(Debug, Serialize, Deserialize)]
pub struct DeviceInfo {
    // System
    pub android_version: Option<String>,
    pub sdk_version: Option<String>,
    pub security_patch: Option<String>,
    pub build_id: Option<String>,
    pub build_fingerprint: Option<String>,

    // Hardware
    pub manufacturer: Option<String>,
    pub brand: Option<String>,
    pub model: Option<String>,
    pub device: Option<String>,
    pub hardware: Option<String>,
    pub board: Option<String>,
    pub platform: Option<String>,
    pub cpu_abi: Option<String>,

    // Display
    pub screen_resolution: Option<String>,
    pub screen_density: Option<String>,

    // Network
    pub wifi_mac: Option<String>,
    pub bluetooth_mac: Option<String>,
    pub serial_number: Option<String>,

    // Build
    pub bootloader: Option<String>,
    pub baseband: Option<String>,
    pub kernel_version: Option<String>,
    pub build_type: Option<String>,
    pub build_tags: Option<String>,

    // Battery
    pub battery_level: Option<String>,
    pub battery_status: Option<String>,
    pub battery_health: Option<String>,
    pub battery_temperature: Option<String>,

    // Storage
    pub internal_storage: Option<String>,
    pub available_storage: Option<String>,

    // Memory
    pub total_ram: Option<String>,
    pub available_ram: Option<String>,
}

fn run_shell_command(adb_path: &str, serial: &str, cmd: &str) -> Option<String> {
    let output = Command::new(adb_path)
        .args(&["-s", serial, "shell", cmd])
        .output()
        .ok()?;

    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if result.is_empty() || result == "unknown" {
            None
        } else {
            Some(result)
        }
    } else {
        None
    }
}

fn get_prop(adb_path: &str, serial: &str, prop: &str) -> Option<String> {
    run_shell_command(adb_path, serial, &format!("getprop {}", prop))
}

fn parse_battery_info(dumpsys: &str, key: &str) -> Option<String> {
    for line in dumpsys.lines() {
        let line = line.trim();
        if line.starts_with(key) {
            if let Some(value) = line.split(':').nth(1) {
                return Some(value.trim().to_string());
            }
        }
    }
    None
}

fn parse_meminfo(meminfo: &str, key: &str) -> Option<String> {
    for line in meminfo.lines() {
        if line.contains(key) {
            // Parse "MemTotal:        7893152 kB" format
            let parts: Vec<&str> = line.split_whitespace().collect();
            if parts.len() >= 2 {
                if let Ok(kb) = parts[1].parse::<u64>() {
                    let mb = kb / 1024;
                    if mb > 1024 {
                        return Some(format!("{:.1} GB", mb as f64 / 1024.0));
                    } else {
                        return Some(format!("{} MB", mb));
                    }
                }
            }
        }
    }
    None
}

#[tauri::command]
pub async fn get_device_info(app: AppHandle, serial: String) -> Result<DeviceInfo, String> {
    let adb_path = resolve_adb_path(&app);

    // Get battery info
    let battery_dump = run_shell_command(&adb_path, &serial, "dumpsys battery").unwrap_or_default();

    // Get memory info
    let meminfo = run_shell_command(&adb_path, &serial, "cat /proc/meminfo").unwrap_or_default();

    // Get display info
    let wm_size = run_shell_command(&adb_path, &serial, "wm size");
    let wm_density = run_shell_command(&adb_path, &serial, "wm density");

    // Get storage info
    let df_output = run_shell_command(&adb_path, &serial, "df -h /data").unwrap_or_default();
    let storage_parts: Vec<&str> = df_output
        .lines()
        .last()
        .unwrap_or("")
        .split_whitespace()
        .collect();

    // Get kernel version
    let kernel = run_shell_command(&adb_path, &serial, "uname -r");

    let info = DeviceInfo {
        // System
        android_version: get_prop(&adb_path, &serial, "ro.build.version.release"),
        sdk_version: get_prop(&adb_path, &serial, "ro.build.version.sdk"),
        security_patch: get_prop(&adb_path, &serial, "ro.build.version.security_patch"),
        build_id: get_prop(&adb_path, &serial, "ro.build.id"),
        build_fingerprint: get_prop(&adb_path, &serial, "ro.build.fingerprint"),

        // Hardware
        manufacturer: get_prop(&adb_path, &serial, "ro.product.manufacturer"),
        brand: get_prop(&adb_path, &serial, "ro.product.brand"),
        model: get_prop(&adb_path, &serial, "ro.product.model"),
        device: get_prop(&adb_path, &serial, "ro.product.device"),
        hardware: get_prop(&adb_path, &serial, "ro.hardware"),
        board: get_prop(&adb_path, &serial, "ro.product.board"),
        platform: get_prop(&adb_path, &serial, "ro.board.platform"),
        cpu_abi: get_prop(&adb_path, &serial, "ro.product.cpu.abi"),

        // Display
        screen_resolution: wm_size.map(|s| s.replace("Physical size: ", "")),
        screen_density: wm_density.map(|s| s.replace("Physical density: ", "") + " dpi"),

        // Network
        wifi_mac: run_shell_command(&adb_path, &serial, "cat /sys/class/net/wlan0/address"),
        bluetooth_mac: get_prop(&adb_path, &serial, "ro.bt.bdaddr_path")
            .and_then(|path| run_shell_command(&adb_path, &serial, &format!("cat {}", path)))
            .or_else(|| get_prop(&adb_path, &serial, "persist.service.bdroid.bdaddr")),
        serial_number: get_prop(&adb_path, &serial, "ro.serialno"),

        // Build
        bootloader: get_prop(&adb_path, &serial, "ro.bootloader"),
        baseband: get_prop(&adb_path, &serial, "gsm.version.baseband"),
        kernel_version: kernel,
        build_type: get_prop(&adb_path, &serial, "ro.build.type"),
        build_tags: get_prop(&adb_path, &serial, "ro.build.tags"),

        // Battery
        battery_level: parse_battery_info(&battery_dump, "level"),
        battery_status: parse_battery_info(&battery_dump, "status").map(|s| match s.as_str() {
            "1" => "Unknown".to_string(),
            "2" => "Charging".to_string(),
            "3" => "Discharging".to_string(),
            "4" => "Not Charging".to_string(),
            "5" => "Full".to_string(),
            _ => s,
        }),
        battery_health: parse_battery_info(&battery_dump, "health").map(|s| match s.as_str() {
            "1" => "Unknown".to_string(),
            "2" => "Good".to_string(),
            "3" => "Overheat".to_string(),
            "4" => "Dead".to_string(),
            "5" => "Over Voltage".to_string(),
            "6" => "Failure".to_string(),
            "7" => "Cold".to_string(),
            _ => s,
        }),
        battery_temperature: parse_battery_info(&battery_dump, "temperature").map(|t| {
            if let Ok(temp) = t.parse::<f64>() {
                format!("{:.1}°C", temp / 10.0)
            } else {
                t
            }
        }),

        // Storage
        internal_storage: storage_parts.get(1).map(|s| s.to_string()),
        available_storage: storage_parts.get(3).map(|s| s.to_string()),

        // Memory
        total_ram: parse_meminfo(&meminfo, "MemTotal"),
        available_ram: parse_meminfo(&meminfo, "MemAvailable"),
    };

    Ok(info)
}
