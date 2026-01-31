use crate::commands::utils::resolve_adb_path;
use serde::{Deserialize, Serialize};
use std::process::Command;
use tauri::AppHandle;

// ============================================================================
// Data Structures
// ============================================================================

#[derive(Debug, Serialize, Deserialize)]
pub struct SensorInfo {
    pub name: String,
    pub vendor: Option<String>,
    pub sensor_type: Option<String>,
    pub status: String, // "active", "inactive", "error"
}

#[derive(Debug, Serialize, Deserialize)]
pub struct BatteryDiagnostics {
    pub level: Option<i32>,
    pub status: String,
    pub health: String,
    pub temperature: Option<f64>,
    pub voltage: Option<i32>,
    pub current: Option<i32>,
    pub technology: Option<String>,
    pub plugged: String,
    pub capacity: Option<i32>,
    pub charge_counter: Option<i64>,
    pub full_charge: Option<bool>,
    pub max_charging_current: Option<i32>,
    pub max_charging_voltage: Option<i32>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct DisplayDiagnostics {
    pub resolution: Option<String>,
    pub density: Option<String>,
    pub refresh_rate: Option<String>,
    pub hdr_capabilities: Option<String>,
    pub supported_modes: Vec<String>,
    pub brightness: Option<i32>,
    pub adaptive_brightness: Option<bool>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ConnectivityDiagnostics {
    // WiFi
    pub wifi_enabled: bool,
    pub wifi_connected: bool,
    pub wifi_ssid: Option<String>,
    pub wifi_signal_strength: Option<i32>,
    pub wifi_frequency: Option<String>,
    pub wifi_link_speed: Option<String>,
    pub wifi_ip: Option<String>,

    // Bluetooth
    pub bluetooth_enabled: bool,
    pub bluetooth_name: Option<String>,
    pub bluetooth_address: Option<String>,
    pub paired_devices_count: i32,

    // Cellular
    pub mobile_data_enabled: bool,
    pub carrier: Option<String>,
    pub signal_strength: Option<String>,
    pub network_type: Option<String>,

    // General
    pub airplane_mode: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TouchTestResult {
    pub points_detected: i32,
    pub max_touch_points: Option<i32>,
    pub touch_major: Option<String>,
    pub tool_type: Option<String>,
    pub raw_events: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FullDiagnostics {
    pub battery: BatteryDiagnostics,
    pub display: DisplayDiagnostics,
    pub sensors: Vec<SensorInfo>,
    pub connectivity: ConnectivityDiagnostics,
}

// ============================================================================
// Helper Functions
// ============================================================================

fn run_shell_command(adb_path: &str, serial: &str, cmd: &str) -> Option<String> {
    let output = Command::new(adb_path)
        .args(&["-s", serial, "shell", cmd])
        .output()
        .ok()?;

    if output.status.success() {
        let result = String::from_utf8_lossy(&output.stdout).trim().to_string();
        if result.is_empty() || result == "unknown" || result == "null" {
            None
        } else {
            Some(result)
        }
    } else {
        None
    }
}

/// Run a shell command that may not return output (for actions)
/// Returns Ok(()) if command executed successfully (even with no output)
fn run_shell_action(adb_path: &str, serial: &str, cmd: &str) -> Result<(), String> {
    let output = Command::new(adb_path)
        .args(&["-s", serial, "shell", cmd])
        .output()
        .map_err(|e| format!("Failed to execute command: {}", e))?;

    if output.status.success() {
        Ok(())
    } else {
        let stderr = String::from_utf8_lossy(&output.stderr).trim().to_string();
        Err(if stderr.is_empty() {
            "Command failed".to_string()
        } else {
            stderr
        })
    }
}

fn parse_dumpsys_value(content: &str, key: &str) -> Option<String> {
    for line in content.lines() {
        let line = line.trim();
        // Check if line starts with the key (after trimming whitespace)
        if line.starts_with(key) {
            // Handle "key: value" format
            if let Some(pos) = line.find(':') {
                let value = line[pos + 1..].trim();
                if !value.is_empty() && value != "null" && value != "unknown" {
                    return Some(value.to_string());
                }
            }
            // Handle "key=value" format
            else if let Some(pos) = line.find('=') {
                let value = line[pos + 1..].trim();
                if !value.is_empty() && value != "null" && value != "unknown" {
                    return Some(value.to_string());
                }
            }
        }
    }
    None
}

/// Parse boolean value from dumpsys (handles "true", "false", "1", "0")
fn parse_dumpsys_bool(content: &str, key: &str) -> Option<bool> {
    parse_dumpsys_value(content, key).map(|v| v.to_lowercase() == "true" || v == "1")
}

fn get_settings_value(adb_path: &str, serial: &str, namespace: &str, key: &str) -> Option<String> {
    run_shell_command(
        adb_path,
        serial,
        &format!("settings get {} {}", namespace, key),
    )
}

// ============================================================================
// Battery Diagnostics
// ============================================================================

fn get_battery_diagnostics(adb_path: &str, serial: &str) -> BatteryDiagnostics {
    let battery_dump = run_shell_command(adb_path, serial, "dumpsys battery").unwrap_or_default();

    let level = parse_dumpsys_value(&battery_dump, "level").and_then(|v| v.parse::<i32>().ok());

    let status_code = parse_dumpsys_value(&battery_dump, "status")
        .and_then(|v| v.parse::<i32>().ok())
        .unwrap_or(1);
    let status = match status_code {
        1 => "Unknown",
        2 => "Charging",
        3 => "Discharging",
        4 => "Not Charging",
        5 => "Full",
        _ => "Unknown",
    }
    .to_string();

    let health_code = parse_dumpsys_value(&battery_dump, "health")
        .and_then(|v| v.parse::<i32>().ok())
        .unwrap_or(1);
    let health = match health_code {
        1 => "Unknown",
        2 => "Good",
        3 => "Overheat",
        4 => "Dead",
        5 => "Over Voltage",
        6 => "Failure",
        7 => "Cold",
        _ => "Unknown",
    }
    .to_string();

    let temperature = parse_dumpsys_value(&battery_dump, "temperature")
        .and_then(|v| v.parse::<f64>().ok())
        .map(|t| t / 10.0);

    let voltage = parse_dumpsys_value(&battery_dump, "voltage").and_then(|v| v.parse::<i32>().ok());

    let current = run_shell_command(
        adb_path,
        serial,
        "cat /sys/class/power_supply/battery/current_now",
    )
    .and_then(|v| v.parse::<i32>().ok())
    .map(|c| c / 1000); // Convert µA to mA

    let technology = parse_dumpsys_value(&battery_dump, "technology");

    // Determine plugged status from "AC powered", "USB powered", "Wireless powered" fields
    let ac_powered = parse_dumpsys_bool(&battery_dump, "AC powered").unwrap_or(false);
    let usb_powered = parse_dumpsys_bool(&battery_dump, "USB powered").unwrap_or(false);
    let wireless_powered = parse_dumpsys_bool(&battery_dump, "Wireless powered").unwrap_or(false);

    let plugged = if ac_powered && usb_powered {
        "AC + USB".to_string()
    } else if ac_powered {
        "AC".to_string()
    } else if usb_powered {
        "USB".to_string()
    } else if wireless_powered {
        "Wireless".to_string()
    } else {
        "Not Plugged".to_string()
    };

    // Get charging current and voltage from dumpsys
    let max_charging_current = parse_dumpsys_value(&battery_dump, "Max charging current")
        .and_then(|v| v.parse::<i32>().ok())
        .map(|c| c / 1000); // Convert µA to mA

    let max_charging_voltage = parse_dumpsys_value(&battery_dump, "Max charging voltage")
        .and_then(|v| v.parse::<i32>().ok())
        .map(|v| v / 1000); // Convert µV to mV

    let capacity = run_shell_command(
        adb_path,
        serial,
        "cat /sys/class/power_supply/battery/charge_full_design",
    )
    .and_then(|v| v.parse::<i32>().ok())
    .map(|c| c / 1000); // Convert µAh to mAh

    let charge_counter = run_shell_command(
        adb_path,
        serial,
        "cat /sys/class/power_supply/battery/charge_counter",
    )
    .and_then(|v| v.parse::<i64>().ok());

    let full_charge = level.map(|l| l >= 100);

    BatteryDiagnostics {
        level,
        status,
        health,
        temperature,
        voltage,
        current,
        technology,
        plugged,
        capacity,
        charge_counter,
        full_charge,
        max_charging_current,
        max_charging_voltage,
    }
}

// ============================================================================
// Display Diagnostics
// ============================================================================

fn get_display_diagnostics(adb_path: &str, serial: &str) -> DisplayDiagnostics {
    let wm_size = run_shell_command(adb_path, serial, "wm size")
        .map(|s| s.replace("Physical size: ", "").trim().to_string());

    let wm_density = run_shell_command(adb_path, serial, "wm density")
        .map(|s| s.replace("Physical density: ", "").trim().to_string() + " dpi");

    // Get display dump for more details
    let display_dump = run_shell_command(
        adb_path,
        serial,
        "dumpsys display | grep -E 'refresh|mDefaultModeId|supported modes' | head -10",
    )
    .unwrap_or_default();

    let refresh_rate = run_shell_command(
        adb_path,
        serial,
        "dumpsys display | grep 'renderFrameRate' | head -1",
    )
    .and_then(|s| s.split('=').nth(1).map(|v| format!("{} Hz", v.trim())))
    .or_else(|| {
        // Try alternative method
        parse_dumpsys_value(&display_dump, "refreshRate").map(|r| format!("{} Hz", r))
    });

    // Get HDR capabilities
    let hdr_dump = run_shell_command(adb_path, serial, "dumpsys display | grep -i hdr | head -5")
        .unwrap_or_default();
    let hdr_capabilities =
        if hdr_dump.contains("HDR10") || hdr_dump.contains("HLG") || hdr_dump.contains("DOLBY") {
            Some(
                hdr_dump
                    .lines()
                    .next()
                    .unwrap_or("HDR Supported")
                    .to_string(),
            )
        } else {
            None
        };

    // Get supported modes
    let modes_output = run_shell_command(
        adb_path,
        serial,
        "dumpsys display | grep -A 20 'mSupportedModes' | head -15",
    )
    .unwrap_or_default();
    let supported_modes: Vec<String> = modes_output
        .lines()
        .filter(|l| l.contains("x") && l.contains("@"))
        .map(|l| l.trim().to_string())
        .take(5)
        .collect();

    // Get brightness
    let brightness = get_settings_value(adb_path, serial, "system", "screen_brightness")
        .and_then(|v| v.parse::<i32>().ok());

    let adaptive_brightness =
        get_settings_value(adb_path, serial, "system", "screen_brightness_mode").map(|v| v == "1");

    DisplayDiagnostics {
        resolution: wm_size,
        density: wm_density,
        refresh_rate,
        hdr_capabilities,
        supported_modes,
        brightness,
        adaptive_brightness,
    }
}

// ============================================================================
// Sensor Diagnostics
// ============================================================================

fn get_sensor_list(adb_path: &str, serial: &str) -> Vec<SensorInfo> {
    let sensor_dump = run_shell_command(
        adb_path,
        serial,
        "dumpsys sensorservice | grep -A 2 'Sensor List'",
    )
    .unwrap_or_default();

    // Get active sensors
    let active_sensors = run_shell_command(
        adb_path,
        serial,
        "dumpsys sensorservice | grep 'active connections'",
    )
    .unwrap_or_default();

    // Get detailed sensor list
    let detailed_list = run_shell_command(
        adb_path,
        serial,
        "dumpsys sensorservice | grep -E '^0x' | head -30",
    )
    .unwrap_or_default();

    let mut sensors = Vec::new();

    // Parse sensors from the detailed list
    for line in detailed_list.lines() {
        let parts: Vec<&str> = line.split('|').collect();
        if parts.len() >= 2 {
            let name = parts[1].trim().to_string();
            if !name.is_empty() {
                let vendor = parts.get(2).map(|v| v.trim().to_string());
                sensors.push(SensorInfo {
                    name,
                    vendor,
                    sensor_type: None,
                    status: "active".to_string(),
                });
            }
        }
    }

    // If no sensors found from detailed list, try alternative parsing
    if sensors.is_empty() {
        let alt_dump =
            run_shell_command(adb_path, serial, "dumpsys sensorservice").unwrap_or_default();

        // Common sensor types to look for
        let sensor_types = [
            ("accelerometer", "Accelerometer"),
            ("gyroscope", "Gyroscope"),
            ("magnetometer", "Magnetometer"),
            ("barometer", "Barometer"),
            ("proximity", "Proximity"),
            ("light", "Light"),
            ("gravity", "Gravity"),
            ("rotation", "Rotation Vector"),
            ("step", "Step Counter"),
        ];

        for (keyword, name) in sensor_types.iter() {
            if alt_dump.to_lowercase().contains(keyword) {
                sensors.push(SensorInfo {
                    name: name.to_string(),
                    vendor: None,
                    sensor_type: Some(keyword.to_string()),
                    status: "detected".to_string(),
                });
            }
        }
    }

    sensors
}

// ============================================================================
// Connectivity Diagnostics
// ============================================================================

fn get_connectivity_diagnostics(adb_path: &str, serial: &str) -> ConnectivityDiagnostics {
    // WiFi info
    let wifi_dump = run_shell_command(
        adb_path,
        serial,
        "dumpsys wifi | grep -E 'Wi-Fi is|mWifiInfo|SSID|BSSID|RSSI|Frequency|Link speed|IP'",
    )
    .unwrap_or_default();

    let wifi_enabled = wifi_dump.contains("Wi-Fi is enabled");
    let wifi_connected =
        wifi_dump.contains("mWifiInfo") && !wifi_dump.contains("SSID: <unknown ssid>");

    let wifi_ssid =
        parse_dumpsys_value(&wifi_dump, "SSID").map(|s| s.trim_matches('"').to_string());

    let wifi_signal_strength = parse_dumpsys_value(&wifi_dump, "RSSI")
        .and_then(|v| v.split_whitespace().next()?.parse::<i32>().ok());

    let wifi_frequency = parse_dumpsys_value(&wifi_dump, "Frequency")
        .map(|f| format!("{} MHz", f.replace(" MHz", "")));

    let wifi_link_speed = parse_dumpsys_value(&wifi_dump, "Link speed")
        .map(|s| format!("{} Mbps", s.replace(" Mbps", "")));

    let wifi_ip = run_shell_command(
        adb_path,
        serial,
        "ip addr show wlan0 | grep 'inet ' | awk '{print $2}' | cut -d/ -f1",
    );

    // Bluetooth info
    let bt_dump = run_shell_command(
        adb_path,
        serial,
        "dumpsys bluetooth_manager | grep -E 'enabled|name|address|Bonded'",
    )
    .unwrap_or_default();

    let bluetooth_enabled = bt_dump.to_lowercase().contains("enabled: true")
        || run_shell_command(adb_path, serial, "settings get global bluetooth_on")
            .map(|v| v == "1")
            .unwrap_or(false);

    let bluetooth_name = run_shell_command(adb_path, serial, "settings get secure bluetooth_name");
    let bluetooth_address = parse_dumpsys_value(&bt_dump, "address");

    let paired_devices_count = bt_dump.lines().filter(|l| l.contains("Bonded")).count() as i32;

    // Cellular info
    let telephony_dump =
        run_shell_command(adb_path, serial, "dumpsys telephony.registry | head -50")
            .unwrap_or_default();

    let mobile_data_enabled = get_settings_value(adb_path, serial, "global", "mobile_data")
        .map(|v| v == "1")
        .unwrap_or(false);

    let carrier = run_shell_command(adb_path, serial, "getprop gsm.sim.operator.alpha");

    let signal_strength = parse_dumpsys_value(&telephony_dump, "mSignalStrength")
        .or_else(|| parse_dumpsys_value(&telephony_dump, "signalStrength"));

    let network_type = parse_dumpsys_value(&telephony_dump, "mDataNetworkType")
        .or_else(|| parse_dumpsys_value(&telephony_dump, "networkType"))
        .map(|n| match n.as_str() {
            "0" => "Unknown".to_string(),
            "1" => "GPRS".to_string(),
            "2" => "EDGE".to_string(),
            "3" => "UMTS".to_string(),
            "4" => "CDMA".to_string(),
            "5" => "EVDO_0".to_string(),
            "6" => "EVDO_A".to_string(),
            "7" => "1xRTT".to_string(),
            "8" => "HSDPA".to_string(),
            "9" => "HSUPA".to_string(),
            "10" => "HSPA".to_string(),
            "11" => "IDEN".to_string(),
            "12" => "EVDO_B".to_string(),
            "13" => "LTE".to_string(),
            "14" => "EHRPD".to_string(),
            "15" => "HSPAP".to_string(),
            "18" => "GSM".to_string(),
            "19" => "TD-SCDMA".to_string(),
            "20" => "5G NR".to_string(),
            _ => n,
        });

    let airplane_mode = get_settings_value(adb_path, serial, "global", "airplane_mode_on")
        .map(|v| v == "1")
        .unwrap_or(false);

    ConnectivityDiagnostics {
        wifi_enabled,
        wifi_connected,
        wifi_ssid,
        wifi_signal_strength,
        wifi_frequency,
        wifi_link_speed,
        wifi_ip,
        bluetooth_enabled,
        bluetooth_name,
        bluetooth_address,
        paired_devices_count,
        mobile_data_enabled,
        carrier,
        signal_strength,
        network_type,
        airplane_mode,
    }
}

// ============================================================================
// Touch Test
// ============================================================================

fn run_touch_test_internal(adb_path: &str, serial: &str) -> TouchTestResult {
    // Get touch device info
    let input_dump = run_shell_command(
        adb_path,
        serial,
        "getevent -lp | grep -A 10 'touchscreen\\|touch'",
    )
    .unwrap_or_default();

    // Get max touch points
    let max_touch_points = run_shell_command(
        adb_path,
        serial,
        "getevent -lp | grep ABS_MT_SLOT | head -1",
    )
    .and_then(|s| {
        s.split("max")
            .nth(1)
            .and_then(|v| v.trim().split_whitespace().next())
            .and_then(|n| n.parse::<i32>().ok())
            .map(|n| n + 1) // Slots are 0-indexed
    });

    // Sample raw events (very brief)
    let raw_events: Vec<String> = run_shell_command(
        adb_path,
        serial,
        "timeout 0.1 getevent -lt 2>/dev/null | head -5",
    )
    .unwrap_or_default()
    .lines()
    .take(5)
    .map(|l| l.to_string())
    .collect();

    let points_detected = if raw_events.is_empty() { 0 } else { 1 };

    let touch_major = parse_dumpsys_value(&input_dump, "ABS_MT_TOUCH_MAJOR");
    let tool_type = parse_dumpsys_value(&input_dump, "ABS_MT_TOOL_TYPE");

    TouchTestResult {
        points_detected,
        max_touch_points,
        touch_major,
        tool_type,
        raw_events,
    }
}

// ============================================================================
// Commands
// ============================================================================

#[tauri::command]
pub async fn get_device_diagnostics(
    app: AppHandle,
    serial: String,
) -> Result<FullDiagnostics, String> {
    let adb_path = resolve_adb_path(&app);

    let battery = get_battery_diagnostics(&adb_path, &serial);
    let display = get_display_diagnostics(&adb_path, &serial);
    let sensors = get_sensor_list(&adb_path, &serial);
    let connectivity = get_connectivity_diagnostics(&adb_path, &serial);

    Ok(FullDiagnostics {
        battery,
        display,
        sensors,
        connectivity,
    })
}

#[tauri::command]
pub async fn run_touch_test(app: AppHandle, serial: String) -> Result<TouchTestResult, String> {
    let adb_path = resolve_adb_path(&app);
    Ok(run_touch_test_internal(&adb_path, &serial))
}

#[tauri::command]
pub async fn inject_touch(app: AppHandle, serial: String, x: i32, y: i32) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    run_shell_action(&adb_path, &serial, &format!("input tap {} {}", x, y))
}

#[tauri::command]
pub async fn set_brightness(app: AppHandle, serial: String, level: i32) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    // First disable adaptive brightness if enabled
    let _ = run_shell_action(
        &adb_path,
        &serial,
        "settings put system screen_brightness_mode 0",
    );
    // Then set the brightness level
    run_shell_action(
        &adb_path,
        &serial,
        &format!(
            "settings put system screen_brightness {}",
            level.clamp(0, 255)
        ),
    )
}

#[tauri::command]
pub async fn toggle_wifi(app: AppHandle, serial: String, enable: bool) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let action = if enable { "enable" } else { "disable" };
    // Try svc command first (works on most devices)
    if run_shell_action(&adb_path, &serial, &format!("svc wifi {}", action)).is_ok() {
        return Ok(());
    }
    // Fallback: try cmd wifi command (Android 12+)
    if run_shell_action(
        &adb_path,
        &serial,
        &format!("cmd wifi set-wifi-enabled {}", enable),
    )
    .is_ok()
    {
        return Ok(());
    }
    Err("Failed to toggle WiFi - may require root or device policy restrictions".to_string())
}

#[tauri::command]
pub async fn toggle_bluetooth(app: AppHandle, serial: String, enable: bool) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let action = if enable { "enable" } else { "disable" };
    // Try svc command first
    if run_shell_action(&adb_path, &serial, &format!("svc bluetooth {}", action)).is_ok() {
        return Ok(());
    }
    // Fallback: try cmd bluetooth command
    if run_shell_action(
        &adb_path,
        &serial,
        &format!("cmd bluetooth_manager {} 2>/dev/null", action),
    )
    .is_ok()
    {
        return Ok(());
    }
    Err("Failed to toggle Bluetooth - may require root or device policy restrictions".to_string())
}

#[tauri::command]
pub async fn simulate_battery_level(
    app: AppHandle,
    serial: String,
    level: i32,
) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    // Unplug first to enable simulation
    run_shell_action(&adb_path, &serial, "dumpsys battery unplug")?;
    // Set the simulated level
    run_shell_action(
        &adb_path,
        &serial,
        &format!("dumpsys battery set level {}", level.clamp(0, 100)),
    )
}

#[tauri::command]
pub async fn reset_battery_simulation(app: AppHandle, serial: String) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    run_shell_action(&adb_path, &serial, "dumpsys battery reset")
}

#[tauri::command]
pub async fn trigger_vibration(
    app: AppHandle,
    serial: String,
    duration_ms: i32,
) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    // Try multiple methods for vibration
    // Method 1: cmd vibrator (Android 11+)
    if run_shell_action(
        &adb_path,
        &serial,
        &format!("cmd vibrator vibrate -f {} default", duration_ms),
    )
    .is_ok()
    {
        return Ok(());
    }
    // Method 2: Older cmd vibrator syntax
    if run_shell_action(
        &adb_path,
        &serial,
        &format!("cmd vibrator vibrate {}", duration_ms),
    )
    .is_ok()
    {
        return Ok(());
    }
    // Method 3: input keyevent (trigger a haptic feedback)
    if run_shell_action(&adb_path, &serial, "input keyevent 24 && input keyevent 25").is_ok() {
        return Ok(());
    }
    Err("Failed to trigger vibration".to_string())
}
