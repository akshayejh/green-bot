import { useEffect, useState, useCallback, useMemo } from "react";
import { useDeviceStore } from "@/store/device-store";
import { useFileStore } from "@/store/file-store";
import { FileEntry } from "@/types";
import { FileToolbar } from "./components/file-toolbar";
import { FileList } from "./components/file-list";
import { FilePreviewDialog } from "./components/file-preview-dialog";
import { Footer, FooterLeft } from "@/components/footer";

export function FileManager() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const { path, loadFiles, error, files } = useFileStore();

    // UI State for preview - kept separate from store as it's ephemeral UI state
    const [previewFile, setPreviewFile] = useState<FileEntry | null>(null);

    // Get only previewable files (non-directories)
    const previewableFiles = useMemo(() =>
        files.filter(f => !f.is_dir && f.name !== '..'),
        [files]
    );

    // Navigation handlers
    const handleNavigate = useCallback((direction: 'prev' | 'next') => {
        if (!previewFile) return;
        const currentIndex = previewableFiles.findIndex(f => f.name === previewFile.name);
        if (currentIndex === -1) return;

        const newIndex = direction === 'next'
            ? (currentIndex + 1) % previewableFiles.length
            : (currentIndex - 1 + previewableFiles.length) % previewableFiles.length;

        setPreviewFile(previewableFiles[newIndex]);
    }, [previewFile, previewableFiles]);

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
                onNavigate={handleNavigate}
                totalFiles={previewableFiles.length}
                currentIndex={previewFile ? previewableFiles.findIndex(f => f.name === previewFile.name) : -1}
            />

            <Footer>
                <FooterLeft>
                    {files.length} items
                </FooterLeft>
            </Footer>
        </div>
    );
}
