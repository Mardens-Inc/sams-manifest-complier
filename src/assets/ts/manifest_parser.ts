import {invoke} from "@tauri-apps/api/core";
import {addToast} from "@heroui/react";

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