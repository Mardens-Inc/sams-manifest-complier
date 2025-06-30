use crate::err;
use crate::manifest_parser::Manifest;
use tauri::command;

#[command]
pub async fn parse_manifest_from_path_command(
    paths: Vec<String>,
) -> Result<String, err::CommandError> {
    if paths.is_empty() {
        return Err(err::CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "test errror",
        )));
    }
    let mut table: Vec<Manifest> = vec![];
    for path in paths {
        match crate::manifest_parser::parse_file_from_path(&path) {
            Ok(items) => {
                table.extend(items);
            }
            Err(e) => {
                return Err(err::CommandError::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error parsing file {}: {}", path, e),
                )));
            }
        }
    }

    Ok(serde_json::to_string(&table)?)
}

#[command]
pub async fn build_new_manifest_from_paths_with_categories(
    paths: Vec<String>,
    categories: Vec<u8>,
    output: String,
) -> Result<String, err::CommandError> {
    if paths.is_empty() {
        return Err(err::CommandError::Io(std::io::Error::new(
            std::io::ErrorKind::InvalidInput,
            "No file path provided",
        )));
    }
    let file = std::fs::File::create(output)?;
    let mut writer = csv::Writer::from_writer(file);

    for path in paths {
        match crate::manifest_parser::parse_file_from_path(&path) {
            Ok(items) => {
                for item in items {
                    if categories.contains(&item.category) {
                        writer.serialize(&item)?;
                    }
                }
            }
            Err(e) => {
                return Err(err::CommandError::Io(std::io::Error::new(
                    std::io::ErrorKind::Other,
                    format!("Error parsing file {}: {}", path, e),
                )));
            }
        }
    }

    writer.flush()?;

    Ok(String::new())
}
