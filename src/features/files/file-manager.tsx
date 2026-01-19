import { useEffect, useState } from "react";
import { useDeviceStore } from "@/store/device-store";
import { useFileStore } from "@/store/file-store";
import { FileEntry } from "@/types";
import { FileToolbar } from "./components/file-toolbar";
import { FileList } from "./components/file-list";
import { FilePreviewDialog } from "./components/file-preview-dialog";
import { useFileUpload } from "./hooks/use-file-upload";
import { listen } from "@tauri-apps/api/event";
import { Footer, FooterLeft } from "@/components/footer";

export function FileManager() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const { path, loadFiles, error, files } = useFileStore();
    const { uploadFiles } = useFileUpload();

    // UI State for preview - kept separate from store as it's ephemeral UI state

    const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);

    // Handle File Drop
    useEffect(() => {
        const unlistenPromise = listen('tauri://file-drop', (event) => {
            const files = event.payload as string[];
            if (files && files.length > 0) {
                uploadFiles(files);
            }
        });

        return () => {
            unlistenPromise.then((unlisten) => unlisten());
        };
    }, [uploadFiles]);

    // Sync files when device or path changes
    useEffect(() => {
        if (selectedSerial) {
            loadFiles(selectedSerial);
        }
    }, [selectedSerial, path, loadFiles]);

    return (
        <div className="flex flex-col flex-1 min-h-0 bg-background">
            <FileToolbar />

            {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm m-2 rounded-md border border-red-200 dark:border-red-900/50">
                    {error}
                </div>
            )}

            <FileList onPreview={setPreviewFile} />

            <FilePreviewDialog
                file={previewFile}
                onClose={() => setPreviewFile(null)}
            />

            <Footer>
                <FooterLeft>
                    {files.length} items
                </FooterLeft>
            </Footer>
        </div>
    );
}
