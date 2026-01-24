import { useState, useEffect, useCallback } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { open } from "@tauri-apps/plugin-dialog";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { Upload, File, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFileUpload } from "../hooks/use-file-upload";
import { useFileStore } from "@/store/file-store";

interface UploadDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    targetFolder?: string; // Optional subfolder to upload into
}

export function UploadDialog({ open: isOpen, onOpenChange, targetFolder }: UploadDialogProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
    const { uploadFiles } = useFileUpload();
    const { path } = useFileStore();

    // Build the target path
    const getTargetPath = useCallback(() => {
        const basePath = path.endsWith('/') ? path : path + '/';
        return targetFolder ? `${basePath}${targetFolder}/` : basePath;
    }, [path, targetFolder]);

    // Listen for Tauri file drop events when dialog is open
    useEffect(() => {
        if (!isOpen) return;

        let unlistenDrop: UnlistenFn | null = null;
        let unlistenHover: UnlistenFn | null = null;
        let unlistenCancel: UnlistenFn | null = null;

        const setup = async () => {
            unlistenDrop = await listen('tauri://drag-drop', (event) => {
                const payload = event.payload as { paths: string[] };
                if (payload?.paths && payload.paths.length > 0) {
                    setSelectedFiles(prev => [...prev, ...payload.paths]);
                }
                setIsDragging(false);
            });

            unlistenHover = await listen('tauri://drag-enter', () => {
                setIsDragging(true);
            });

            unlistenCancel = await listen('tauri://drag-leave', () => {
                setIsDragging(false);
            });
        };

        setup();

        return () => {
            unlistenDrop?.();
            unlistenHover?.();
            unlistenCancel?.();
        };
    }, [isOpen]);

    // Reset state when dialog closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedFiles([]);
            setIsDragging(false);
        }
    }, [isOpen]);

    const handleBrowse = async () => {
        const files = await open({
            multiple: true,
            directory: false,
            title: "Select files to upload",
        });

        if (files) {
            const paths = Array.isArray(files) ? files : [files];
            setSelectedFiles(prev => [...prev, ...paths]);
        }
    };

    const handleRemoveFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleUpload = () => {
        if (selectedFiles.length === 0) return;
        uploadFiles(selectedFiles, getTargetPath());
        onOpenChange(false);
    };

    const getFileName = (path: string) => {
        return path.split(/[/\\]/).pop() || path;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-background z-10">
                    <DialogTitle>Upload Files</DialogTitle>
                    <DialogDescription>
                        {targetFolder
                            ? `Upload to: ${path}${targetFolder}/`
                            : `Upload to: ${path}`
                        }
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                <div className="p-6 space-y-4">
                    {/* Drop Zone */}
                    <div
                        className={cn(
                            "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                            isDragging
                                ? "border-primary bg-primary/5"
                                : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                        )}
                        onClick={handleBrowse}
                    >
                        <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                            <Upload className={cn(
                                "w-6 h-6 transition-colors",
                                isDragging ? "text-primary" : "text-muted-foreground"
                            )} />
                        </div>
                        <div className="text-center space-y-1">
                            <p className="text-sm font-medium">
                                {isDragging ? "Drop files here..." : "Click to select files"}
                            </p>
                            <p className="text-xs text-muted-foreground">or drag and drop here</p>
                        </div>
                    </div>

                    {/* Selected Files List */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-xs text-muted-foreground font-medium">
                                {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                            </p>
                            <div className="max-h-40 overflow-y-auto space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={`${file}-${index}`}
                                        className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg border"
                                    >
                                        <div className="w-8 h-8 rounded-md bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center shrink-0">
                                            <File className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                        </div>
                                        <span className="truncate flex-1 text-sm font-medium">{getFileName(file)}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
                                            onClick={() => handleRemoveFile(index)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <Separator />

                <DialogFooter className="p-6 bg-muted/10 sm:justify-between sm:space-x-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleUpload}
                        disabled={selectedFiles.length === 0}
                    >
                        Upload {selectedFiles.length > 0 && `(${selectedFiles.length})`}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
