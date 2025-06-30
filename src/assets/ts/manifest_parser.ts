import {invoke} from "@tauri-apps/api/core";
import {addToast} from "@heroui/react";
import {save} from "@tauri-apps/plugin-dialog";

export type Manifest = {
    description: string;
    item_number: string;
    upc_number: string;
    category: number;
    category_description: string;
    quantity: number;
    retail_per_item: number;
    liquidation_rate: number;
    liquidation_price: number;
}

export async function getManifestFromFiles(file_paths: string[]): Promise<Manifest[]>
{
    try
    {
        const json = await invoke("parse_manifest_from_path_command", {paths: file_paths}) as string;
        const manifest: Manifest[] = JSON.parse(json);
        if (!Array.isArray(manifest))
        {
            throw new Error("Manifest is not an array");
        }
        if (manifest.length === 0)
        {
            addToast({
                title: "Empty Manifest",
                description: "The manifest file is empty or does not contain valid data.",
                color: "warning",
                timeout: 5000
            });
            return [];
        }
        return manifest;
    } catch (e)
    {
        console.error("Error parsing manifest:", e);
        addToast({
            title: "Error",
            description: "Failed to parse manifest file. Please ensure the file is in the correct format.",
            color: "danger",
            timeout: 5000
        });
        return [];
    }
}

export async function saveNewManifest(selectedCategories: number[], files: string[])
{
    if (selectedCategories.length === 0)
    {
        addToast({
            title: "No categories selected",
            description: "Please select at least one category to export.",
            color: "danger"
        });
        return;
    }
    const output = await save({
        title: "Save Manifest",
        filters: [{
            name: "CSV File",
            extensions: ["csv"]
        }],
        canCreateDirectories: true
    });
    if (!output)
    {
        addToast({
            title: "Save cancelled",
            description: "No file was selected.",
            color: "warning"
        });
        return;
    }
    const error_message: string | null = await invoke("build_new_manifest_from_paths_with_categories", {
        paths: files,
        categories: selectedCategories,
        output: output
    });

    if (typeof error_message === "string" && error_message.length > 0)
    {
        // an error occurred
        addToast({
            title: "Error",
            description: error_message,
            color: "danger"
        });
    }
}