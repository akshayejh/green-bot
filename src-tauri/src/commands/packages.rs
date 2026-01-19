use crate::commands::utils::resolve_adb_path;
use serde::{Deserialize, Serialize};
use std::collections::HashSet;
use std::process::Command;
use tauri::AppHandle;

#[derive(Serialize, Deserialize, Debug)]
pub struct AppPackage {
    pub package_id: String,
    pub path: String,
    pub is_system: bool,
    pub is_enabled: bool,
}

#[derive(Serialize, Deserialize, Debug)]
pub struct PackageDetails {
    pub package_id: String,
    pub version_name: String,
    pub version_code: String,
    pub first_install_time: String,
    pub last_update_time: String,
    pub uid: String,
    pub path: String,
    pub installer: String,
    pub min_sdk: String,
    pub target_sdk: String,
    pub size: String,
    pub permissions: Vec<String>,
    pub is_enabled: bool,
}

#[tauri::command]
pub async fn list_packages(
    app: AppHandle,
    device: String,
    include_system: bool,
) -> Result<Vec<AppPackage>, String> {
    // We will run two commands if include_system is true, or just one if false (optimization)
    // Actually, `pm list packages -f` lists all. We can filter.
    // simpler:
    // `pm list packages -f -3` (Third party)
    // `pm list packages -f -s` (System)

    let adb_path = resolve_adb_path(&app);
    let mut packages = Vec::new();

    // 0. Get list of disabled packages
    let mut disabled_packages = HashSet::new();
    if let Ok(output_disabled) = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "pm", "list", "packages", "-d"])
        .output()
    {
        let stdout_disabled = String::from_utf8_lossy(&output_disabled.stdout);
        for line in stdout_disabled.lines() {
            if line.trim().is_empty() {
                continue;
            }
            if let Some(clean_line) = line.trim().strip_prefix("package:") {
                disabled_packages.insert(clean_line.to_string());
            }
        }
    }

    // 1. Get Third Party Packages
    let output_3rd = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "pm", "list", "packages", "-f", "-3"])
        .output()
        .map_err(|e| e.to_string())?;

    let stdout_3rd = String::from_utf8_lossy(&output_3rd.stdout);
    for line in stdout_3rd.lines() {
        if line.trim().is_empty() {
            continue;
        }
        // line format: package:/path/to/apk=com.package.name
        if let Some(clean_line) = line.strip_prefix("package:") {
            if let Some((path, pkg)) = clean_line.rsplit_once('=') {
                packages.push(AppPackage {
                    package_id: pkg.to_string(),
                    path: path.to_string(),
                    is_system: false,
                    is_enabled: !disabled_packages.contains(pkg),
                });
            }
        }
    }

    if include_system {
        let output_sys = Command::new(&adb_path)
            .args(&["-s", &device, "shell", "pm", "list", "packages", "-f", "-s"])
            .output()
            .map_err(|e| e.to_string())?;

        let stdout_sys = String::from_utf8_lossy(&output_sys.stdout);
        for line in stdout_sys.lines() {
            if line.trim().is_empty() {
                continue;
            }
            if let Some(clean_line) = line.strip_prefix("package:") {
                if let Some((path, pkg)) = clean_line.rsplit_once('=') {
                    packages.push(AppPackage {
                        package_id: pkg.to_string(),
                        path: path.to_string(),
                        is_system: true,
                        is_enabled: !disabled_packages.contains(pkg),
                    });
                }
            }
        }
    }

    // Sort by package name
    packages.sort_by(|a, b| a.package_id.cmp(&b.package_id));

    Ok(packages)
}

#[tauri::command]
pub async fn get_package_details(
    app: AppHandle,
    device: String,
    package: String,
) -> Result<PackageDetails, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "dumpsys", "package", &package])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }

    let stdout = String::from_utf8_lossy(&output.stdout);

    let mut version_name = String::new();
    let mut version_code = String::new();
    let mut first_install_time = String::new();
    let mut last_update_time = String::new();
    let mut uid = String::new();
    let mut path = String::new(); // codePath
    let mut installer = String::new();
    let mut min_sdk = String::new();
    let mut target_sdk = String::new();
    let mut permissions = Vec::new();
    let mut in_permissions = false;
    let mut is_enabled = true;

    for line in stdout.lines() {
        let trimmed = line.trim();

        // State machine for sections
        if trimmed.starts_with("requested permissions:") {
            in_permissions = true;
            continue;
        } else if in_permissions {
            if trimmed.is_empty() || trimmed.contains(':') {
                in_permissions = false;
            } else {
                permissions.push(trimmed.to_string());
                continue;
            }
        }

        if trimmed.starts_with("User 0:") {
            if let Some(idx) = trimmed.find("enabled=") {
                // simple check for 2, 3, 4
                let val_str = &trimmed[idx + "enabled=".len()..];
                if let Some(c) = val_str.chars().next() {
                    match c {
                        '2' | '3' | '4' => is_enabled = false,
                        _ => is_enabled = true,
                    }
                }
            }
        }

        if trimmed.starts_with("versionName=") {
            version_name = trimmed.trim_start_matches("versionName=").to_string();
        } else if trimmed.starts_with("versionCode=") {
            if let Some(code) = trimmed.split_whitespace().next() {
                version_code = code.trim_start_matches("versionCode=").to_string();
            }
            // Sometimes it's on the same line: versionCode=123 minSdk=21 targetSdk=33
            if let Some(idx) = trimmed.find("minSdk=") {
                let rest = &trimmed[idx..];
                if let Some(end) = rest.find(' ') {
                    min_sdk = rest[.."minSdk=".len() + end]
                        .trim_start_matches("minSdk=")
                        .trim_end()
                        .to_string();
                } else {
                    min_sdk = rest.trim_start_matches("minSdk=").to_string();
                }
            }
            if let Some(idx) = trimmed.find("targetSdk=") {
                let rest = &trimmed[idx..];
                if let Some(end) = rest.find(' ') {
                    target_sdk = rest[.."targetSdk=".len() + end]
                        .trim_start_matches("targetSdk=")
                        .trim_end()
                        .to_string();
                } else {
                    target_sdk = rest.trim_start_matches("targetSdk=").to_string();
                }
            }
        } else if trimmed.starts_with("firstInstallTime=") {
            first_install_time = trimmed.trim_start_matches("firstInstallTime=").to_string();
        } else if trimmed.starts_with("lastUpdateTime=") {
            last_update_time = trimmed.trim_start_matches("lastUpdateTime=").to_string();
        } else if trimmed.starts_with("userId=") {
            uid = trimmed.trim_start_matches("userId=").to_string();
        } else if trimmed.starts_with("codePath=") {
            path = trimmed.trim_start_matches("codePath=").to_string();
        } else if trimmed.starts_with("installerPackageName=") {
            installer = trimmed
                .trim_start_matches("installerPackageName=")
                .to_string();
        }
    }

    // Get Size
    let mut size = "Unknown".to_string();
    if !path.is_empty() {
        if let Ok(size_output) = Command::new(&adb_path)
            .args(&["-s", &device, "shell", "du", "-h", &path])
            .output()
        {
            let s_out = String::from_utf8_lossy(&size_output.stdout);
            // output format: "25M    /data/app/..."
            if let Some(s) = s_out.split_whitespace().next() {
                size = s.to_string();
            }
        }
    }

    Ok(PackageDetails {
        package_id: package,
        version_name,
        version_code,
        first_install_time,
        last_update_time,
        uid,
        path,
        installer,
        min_sdk,
        target_sdk,
        size,
        permissions,
        is_enabled,
    })
}

#[tauri::command]
pub async fn uninstall_package(
    app: AppHandle,
    device: String,
    package: String,
) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "pm", "uninstall", &package])
        .output()
        .map_err(|e| e.to_string())?;

    let result = String::from_utf8_lossy(&output.stdout);
    if result.contains("Success") {
        Ok("Uninstalled successfully".to_string())
    } else {
        Err(result.to_string())
    }
}

#[tauri::command]
pub async fn install_package(
    app: AppHandle,
    device: String,
    path: String,
) -> Result<String, String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "install", "-r", &path])
        .output()
        .map_err(|e| e.to_string())?;

    let result = String::from_utf8_lossy(&output.stdout);
    if result.contains("Success") {
        Ok("Installed successfully".to_string())
    } else {
        Err(String::from_utf8_lossy(&output.stderr).to_string())
    }
}

#[tauri::command]
pub async fn enable_package(app: AppHandle, device: String, package: String) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "pm", "enable", &package])
        .output()
        .map_err(|e| e.to_string())?;

    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() || stderr.contains("Error") || stderr.contains("Failure") {
        return Err(stderr.to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn disable_package(
    app: AppHandle,
    device: String,
    package: String,
) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&[
            "-s",
            &device,
            "shell",
            "pm",
            "disable-user",
            "--user",
            "0",
            &package,
        ])
        .output()
        .map_err(|e| e.to_string())?;

    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() || stderr.contains("Error") || stderr.contains("Failure") {
        return Err(stderr.to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn clear_package_data(
    app: AppHandle,
    device: String,
    package: String,
) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "pm", "clear", &package])
        .output()
        .map_err(|e| e.to_string())?;

    let stderr = String::from_utf8_lossy(&output.stderr);
    if !output.status.success() || stderr.contains("Error") || stderr.contains("Failure") {
        // "Success" is usually printed to stdout.
        return Err(stderr.to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn force_stop_package(
    app: AppHandle,
    device: String,
    package: String,
) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&["-s", &device, "shell", "am", "force-stop", &package])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}

#[tauri::command]
pub async fn launch_package(app: AppHandle, device: String, package: String) -> Result<(), String> {
    let adb_path = resolve_adb_path(&app);
    let output = Command::new(&adb_path)
        .args(&[
            "-s",
            &device,
            "shell",
            "monkey",
            "-p",
            &package,
            "-c",
            "android.intent.category.LAUNCHER",
            "1",
        ])
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        return Err(String::from_utf8_lossy(&output.stderr).to_string());
    }
    Ok(())
}
