import DragDropArea from "../components/DragDropArea.tsx";
import {useCallback, useEffect, useState} from "react";
import {getManifestFromFiles, Manifest, saveNewManifest} from "../ts/manifest_parser.ts";
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

    const trySaveNewManifest = useCallback(async (selectedCategories: number[]) =>
    {
        await saveNewManifest(selectedCategories, files);
    }, [files]);

    const reset = useCallback(() =>
    {
        setFiles([]);
        setManifest([]);
    }, [setFiles, setManifest]);

    if (files.length === 0)
    {
        return <DragDropArea onFileSelected={setFiles}/>;
    } else if (manifest.length > 0)
    {
        return <SelectCategoriesToExport
            manifest={manifest}
            onSubmit={trySaveNewManifest}
            onCancel={reset}
        />;

    }

    return null;
}