import DragDropArea from "../components/DragDropArea.tsx";
import {useEffect, useState} from "react";
import {getManifestFromFiles} from "../ts/manifest_parser.ts";

export default function Home()
{
    const [files, setFiles] = useState<string[]>([]);
    useEffect(() =>
    {
        if (files.length == 0) return;
        getManifestFromFiles(files).then(console.log);
    }, [files]);
    return (
        <>
            {files.length == 0 ?
                <DragDropArea onFileSelected={setFiles}/>
                :
                <>
                    <h1>Files Selected:</h1>
                    <ul>
                        {files.map((file, index) => (
                            <li key={index}>{file}</li>
                        ))}
                    </ul>
                    <button onClick={() => setFiles([])}>Clear Files</button>
                </>
            }
        </>
    );
}