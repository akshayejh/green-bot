// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod commands;

use commands::{adb, files, logs, mirror, packages, terminal};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            #[cfg(target_os = "windows")]
            {
                use tauri::Manager;
                if let Some(window) = app.get_webview_window("main") {
                    let _ = window.set_decorations(false);
                }
            }
            Ok(())
        })
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            adb::get_adb_devices,
            adb::adb_connect,
            adb::adb_pair,
            adb::restart_adb_server,
            files::list_files,
            files::download_file,
            files::upload_file,
            files::read_file_content,
            files::delete_file,
            terminal::run_adb_command,
            logs::get_adb_logs,
            mirror::start_screen_mirror,
            mirror::check_scrcpy,
            mirror::install_scrcpy,
            packages::list_packages,
            packages::get_package_details,
            packages::uninstall_package,
            packages::install_package,
            packages::enable_package,
            packages::disable_package,
            packages::clear_package_data,
            packages::force_stop_package,
            packages::launch_package
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
