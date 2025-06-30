use anyhow::Result;
use csv::ReaderBuilder;
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Manifest {
    #[serde(rename(deserialize = "Description"))]
    pub description: String,
    #[serde(rename(deserialize = "ItemNumber"))]
    pub item_number: String,
    #[serde(rename(deserialize = "UPC Number"))]
    pub upc_number: String,
    #[serde(rename(deserialize = "Category"))]
    pub category: u8,
    #[serde(rename(deserialize = "Category description"))]
    pub category_description: String,
    #[serde(rename(deserialize = "Qty"))]
    pub quantity: f32,
    #[serde(rename(deserialize = "Retail per item (USD$)"))]
    pub retail_per_item: f32,
    #[serde(rename(deserialize = "Liquidation rate %"))]
    pub liquidation_rate: f32,
    #[serde(rename(deserialize = "Liquidation price (USD$)"))]
    pub liquidation_price: f32,
}

pub(crate) fn parse_file_from_path(path: &str) -> Result<Vec<Manifest>> {
    use std::fs;

    let contents = fs::read_to_string(path)?;
    let lines: Vec<&str> = contents.lines().collect();
    let mut all_items = Vec::new();
    let mut i = 0;

    while i < lines.len() {
        let line = lines[i].trim();

        // Look for "Item list" to start a new table
        if line.contains("Item list") {
            // Skip to the header row (next non-empty line)
            i += 1;
            while i < lines.len() && lines[i].trim().is_empty() {
                i += 1;
            }

            // Skip the header row if it exists
            if i < lines.len() && lines[i].contains("Description") {
                i += 1;
            }

            // Collect CSV data until we hit "Total"
            let mut csv_data = String::new();
            let mut header_added = false;

            while i < lines.len() {
                let current_line = lines[i].trim();

                if current_line.starts_with("Total") {
                    break;
                }

                if !current_line.is_empty() && !current_line.starts_with("-") {
                    // Add header if this is the first data row
                    if !header_added {
                        csv_data.push_str("row,Description,ItemNumber,UPC Number,Category,Category description,Qty,Retail per item (USD$),Liquidation rate %,Liquidation price (USD$)\n");
                        header_added = true;
                    }

                    // Clean and add the data row
                    let cleaned_line = clean_csv_line(current_line);
                    csv_data.push_str(&cleaned_line);
                    csv_data.push('\n');
                }

                i += 1;
            }

            // Parse the collected CSV data using the csv crate
            if !csv_data.is_empty() {
                let items = parse_csv_data(&csv_data)?;
                all_items.extend(items);
            }
        }

        i += 1;
    }

    Ok(all_items)
}

fn clean_csv_line(line: &str) -> String {
    // Replace the special CSV format ="" with just quotes
    line.replace("=\"\"", "\"")
        .replace("\"\"\"", "\"")
        .replace("\"\"", "\"")
}

fn parse_csv_data(csv_data: &str) -> Result<Vec<Manifest>> {
    let mut reader = ReaderBuilder::new()
        .has_headers(true)
        .from_reader(Cursor::new(csv_data));

    let mut items = Vec::new();

    for result in reader.records() {
        let record = result?;

        if record.len() >= 10 {
            // Skip row number (index 0) and parse the rest
            let description = record.get(1).unwrap_or("").to_string();
            let item_number = record.get(2).unwrap_or("").to_string();
            let upc_number = record.get(3).unwrap_or("").to_string();

            let category = record.get(4).unwrap_or("0").parse::<u8>().unwrap_or(0);

            let category_description = record.get(5).unwrap_or("").to_string();

            let quantity = record.get(6).unwrap_or("0").parse::<f32>().unwrap_or(0.0);

            let retail_per_item = parse_currency_field(record.get(7).unwrap_or("0"));
            let liquidation_rate = parse_percentage_field(record.get(8).unwrap_or("0"));
            let liquidation_price = parse_currency_field(record.get(9).unwrap_or("0"));

            let manifest = Manifest {
                description,
                item_number,
                upc_number,
                category,
                category_description,
                quantity,
                retail_per_item,
                liquidation_rate,
                liquidation_price,
            };

            items.push(manifest);
        }
    }

    Ok(items)
}

fn parse_currency_field(field: &str) -> f32 {
    // Remove $ and , from currency strings
    let cleaned = field.replace("$", "").replace(",", "");
    cleaned.parse().unwrap_or(0.0)
}

fn parse_percentage_field(field: &str) -> f32 {
    // Remove % from percentage strings
    let cleaned = field.replace("%", "");
    cleaned.parse().unwrap_or(0.0)
}
