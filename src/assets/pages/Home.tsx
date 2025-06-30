import DragDropArea from "../components/DragDropArea.tsx";
import {useEffect, useState} from "react";
import {getManifestFromFiles, Manifest} from "../ts/manifest_parser.ts";
import SelectCategoriesToExport from "../components/SelectCategoriesToExport.tsx";

export default function Home()
{
    const [files, setFiles] = useState<string[]>([]);
    const [manifest, setManifest] = useState<Manifest[]>([]);
    useEffect(() =>
    {
        if (files.length == 0) return;
        getManifestFromFiles(files).then(setManifest);
    }, [files]);

    if (files.length === 0)
    {
        return <DragDropArea onFileSelected={setFiles}/>;
    } else if (manifest.length > 0)
    {
        return <SelectCategoriesToExport manifest={manifest} onSubmit={(categories) =>
        {
            // Handle the selected categories for export
            console.log("Selected categories for export:", categories);
        }}/>;

    }

    return null;
}