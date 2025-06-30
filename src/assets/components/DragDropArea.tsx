import {useEffect, useState} from "react";
import {event} from "@tauri-apps/api";
import {addToast, Button, cn} from "@heroui/react";
import {AnimatePresence, motion} from "framer-motion";
import {open} from "@tauri-apps/plugin-dialog";
import {PhysicalPosition} from "@tauri-apps/api/dpi";

type DragDropEvent = {
    type: "drop";
    paths: string[];
    position: PhysicalPosition;
};
type DragDropAreaProps = {
    onFileSelected: (filePath: string[]) => void;
};
export default function DragDropArea(props: DragDropAreaProps)
{
    const [isDragging, setIsDragging] = useState(false);
    const [isUnloadingComponent, setIsUnloadingComponent] = useState(false);

    useEffect(() =>
    {
        // Set up Tauri's file drop hover event
        const fileDropHoverUnlisten = event.listen(event.TauriEvent.DRAG_ENTER, () =>
        {
            setIsDragging(true);
        });

        // Set up Tauri's file drop canceled event
        const fileDropCancelledUnlisten = event.listen(event.TauriEvent.DRAG_LEAVE, () =>
        {
            setIsDragging(false);
        });

        // Set up Tauri's file drop event
        const fileDropUnlisten = event.listen(event.TauriEvent.DRAG_DROP, (event: event.Event<DragDropEvent>) =>
        {
            // Get file paths from the event payload
            const filePaths = event.payload.paths as string[];

            if (filePaths && filePaths.length > 0)
            {
                // Process all files
                processFiles(filePaths);
            }
        });

        // Clean up all event listeners when the component unmounts
        return () =>
        {
            fileDropHoverUnlisten.then(unlisten => unlisten());
            fileDropCancelledUnlisten.then(unlisten => unlisten());
            fileDropUnlisten.then(unlisten => unlisten());
        };
    }, []);

    // Function to process multiple files
    const processFiles = (filePaths: string[]) =>
    {
        const validFiles = filePaths.filter(filePath =>
        {
            const validExtensions = [".csv"];
            return validExtensions.some(ext =>
                filePath.toLowerCase().endsWith(ext)
            );
        });

        if (validFiles.length === 0)
        {
            setIsDragging(false);
            addToast({
                title: "Invalid File Type",
                description: "Please use CSV files (.csv) only.",
                color: "danger",
                timeout: 5000
            });
            return;
        }

        if (validFiles.length !== filePaths.length)
        {
            addToast({
                title: "Some Files Skipped",
                description: "Only CSV files will be processed.",
                color: "warning",
                timeout: 5000
            });
        }

        setIsUnloadingComponent(true);
        setTimeout(() => props.onFileSelected(validFiles), 200);
    };

    return (
        <motion.div
            id={"drag-drop-area"}
            className={
                cn(
                    "flex flex-col items-center justify-center w-full relative",
                    "border-dotted border-2 border-transparent rounded-lg mx-4 mt-2 mb-4 p-8 gap-8",
                    "data-[dragover=true]:bg-primary/10 data-[dragover=true]:border-primary"
                )
            }
            data-tauri-drag-region=""
            animate={{opacity: isUnloadingComponent ? 0 : 1, y: isUnloadingComponent ? 40 : 0}}
            transition={{duration: 0.5, type: "spring"}}
            initial={{opacity: 0, y: 40}}
            exit={{opacity: 0}}
            data-dragover={isDragging}
        >
            <motion.p
                className={"font-bold text-6xl"}
                animate={{
                    scale: isDragging ? 1.2 : 1,
                    y: isDragging ? 40 : 0 // Move down when dragging
                }}
                transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                }}
            >
                Drag &amp; Drop
            </motion.p>

            <AnimatePresence>
                <motion.div
                    className={"flex flex-row w-full gap-4 items-center justify-center"}
                    initial={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 20}}
                    transition={{duration: 0.2}}
                    animate={{y: isDragging ? 40 : 0, opacity: isDragging ? 0 : 1}}
                >
                    <div className={"bg-foreground/25 w-full h-[1px]"}></div>
                    <p>OR</p>
                    <div className={"bg-foreground/25 w-full h-[1px]"}></div>
                </motion.div>
            </AnimatePresence>

            <AnimatePresence>
                <motion.div
                    className="w-full"
                    initial={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: 20}}
                    transition={{duration: 0.2}}
                    animate={{y: isDragging ? 40 : 0, opacity: isDragging ? 0 : 1}}
                >
                    <Button
                        radius={"full"}
                        fullWidth
                        color={"primary"}
                        variant={"solid"}
                        onPress={async () =>
                        {
                            const filepaths = await open({
                                directory: false,
                                multiple: true,
                                title: "Select Item Files",
                                filters: [
                                    {name: "CSV", extensions: ["csv"]}
                                ]
                            });

                            if (filepaths)
                            {
                                processFiles(filepaths as string[]);
                            }
                        }}
                    >
                        Select Files
                    </Button>
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}