mod manifest_parser;
use manifest_parser::parse_manifest_from_path_command;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![parse_manifest_from_path_command])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
