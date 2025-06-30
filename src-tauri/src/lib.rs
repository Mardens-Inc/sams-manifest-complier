mod commands;
mod manifest_parser;
mod err;

use commands::*;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            parse_manifest_from_path_command,
            build_new_manifest_from_paths_with_categories
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
