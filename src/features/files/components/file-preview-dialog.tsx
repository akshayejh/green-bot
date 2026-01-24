import { FileEntry } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import { File, FileImage, FileText, FileVideo, Music, Download, Loader2, AlertCircle, Trash2, ChevronLeft, ChevronRight } from "lucide-react";
import { useFileStore } from "@/store/file-store";
import { useDeviceStore } from "@/store/device-store";
import { useProcessStore } from "@/store/process-store";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Table,
    TableBody,
    TableCell,
    TableRow,
} from "@/components/ui/table";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FilePreviewDialogProps {
    file: FileEntry | null;
    onClose: () => void;
    onNavigate?: (direction: 'prev' | 'next') => void;
    totalFiles?: number;
    currentIndex?: number;
}

export function FilePreviewDialog({ file, onClose, onNavigate, totalFiles = 0, currentIndex = -1 }: FilePreviewDialogProps) {
    const { path, loadFiles } = useFileStore();
    const { selectedSerial } = useDeviceStore();
    const { addTask, updateTask } = useProcessStore();

    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'text' | 'audio' | 'video' | 'none'>('none');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [skippedReason, setSkippedReason] = useState<string | null>(null);
    const [forceLoad, setForceLoad] = useState(false);

    // File type detection helpers
    const getFileType = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase() || '';
        if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico'].includes(ext)) return 'image';
        if (['txt', 'log', 'xml', 'json', 'md', 'js', 'ts', 'tsx', 'css', 'html', 'sh', 'conf', 'ini', 'properties', 'gradle', 'java', 'kt', 'py', 'rs', 'c', 'cpp', 'h', 'yaml', 'yml', 'toml', 'env', 'gitignore', 'sql', 'csv'].includes(ext)) return 'text';
        if (['mp3', 'wav', 'ogg', 'm4a', 'aac', 'flac', 'wma'].includes(ext)) return 'audio';
        if (['mp4', 'webm', 'mkv', 'avi', 'mov', 'm4v', '3gp'].includes(ext)) return 'video';
        return 'unknown';
    };

    // Size limits (can be overridden with forceLoad)
    const SIZE_LIMITS = {
        image: 10 * 1024 * 1024,  // 10MB for images
        text: 1 * 1024 * 1024,    // 1MB for text
        audio: 50 * 1024 * 1024,  // 50MB for audio
        video: 100 * 1024 * 1024, // 100MB for video
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    useEffect(() => {
        if (!file || !selectedSerial) return;

        // Reset state
        setPreviewContent(null);
        setPreviewType('none');
        setError(null);
        setSkippedReason(null);

        const fileType = getFileType(file.name);
        const size = file.size || 0;
        const limit = SIZE_LIMITS[fileType as keyof typeof SIZE_LIMITS];

        // Check size limits (unless force loading)
        if (!forceLoad && limit && size > limit) {
            setSkippedReason(`File is ${formatFileSize(size)} (limit: ${formatFileSize(limit)})`);
            return;
        }

        if (fileType === 'image' || fileType === 'text' || fileType === 'audio' || fileType === 'video') {
            setIsLoading(true);
            const remotePath = path.endsWith('/') ? path + file.name : path + '/' + file.name;

            invoke<number[]>('read_file_content', {
                device: selectedSerial,
                path: remotePath,
            })
                .then((bytes) => {
                    const uint8Array = new Uint8Array(bytes);

                    if (fileType === 'image') {
                        const blob = new Blob([uint8Array]);
                        const url = URL.createObjectURL(blob);
                        setPreviewContent(url);
                        setPreviewType('image');
                    } else if (fileType === 'text') {
                        const text = new TextDecoder().decode(uint8Array);
                        setPreviewContent(text);
                        setPreviewType('text');
                    } else if (fileType === 'audio') {
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp3';
                        const mimeTypes: Record<string, string> = {
                            mp3: 'audio/mpeg',
                            wav: 'audio/wav',
                            ogg: 'audio/ogg',
                            m4a: 'audio/mp4',
                            aac: 'audio/aac',
                            flac: 'audio/flac',
                            wma: 'audio/x-ms-wma',
                        };
                        const blob = new Blob([uint8Array], { type: mimeTypes[ext] || 'audio/mpeg' });
                        const url = URL.createObjectURL(blob);
                        setPreviewContent(url);
                        setPreviewType('audio');
                    } else if (fileType === 'video') {
                        const ext = file.name.split('.').pop()?.toLowerCase() || 'mp4';
                        const mimeTypes: Record<string, string> = {
                            mp4: 'video/mp4',
                            webm: 'video/webm',
                            mkv: 'video/x-matroska',
                            avi: 'video/x-msvideo',
                            mov: 'video/quicktime',
                            m4v: 'video/mp4',
                            '3gp': 'video/3gpp',
                        };
                        const blob = new Blob([uint8Array], { type: mimeTypes[ext] || 'video/mp4' });
                        const url = URL.createObjectURL(blob);
                        setPreviewContent(url);
                        setPreviewType('video');
                    }
                })
                .catch((err) => {
                    console.error("Failed to load preview", err);
                    setError("Failed to load preview: " + String(err));
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        return () => {
            // Cleanup object URL if it was created
            if ((previewType === 'image' || previewType === 'audio' || previewType === 'video') && previewContent) {
                URL.revokeObjectURL(previewContent);
            }
        }

    }, [file, selectedSerial, path, forceLoad]);

    // Reset forceLoad when file changes
    useEffect(() => {
        setForceLoad(false);
    }, [file]);

    // Keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!onNavigate || totalFiles <= 1) return;

        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            onNavigate('prev');
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            onNavigate('next');
        }
    };

    const handleDownload = async () => {
        if (!file || !selectedSerial) return;

        try {
            const filePath = await save({
                defaultPath: file.name,
            });

            if (!filePath) return;

            const taskId = Date.now().toString();
            addTask({
                id: taskId,
                type: 'download',
                name: file.name,
                progress: 0
            });

            const remotePath = path.endsWith('/') ? path + file.name : path + '/' + file.name;

            try {
                await invoke('download_file', {
                    device: selectedSerial,
                    path: remotePath,
                    destination: filePath
                });

                updateTask(taskId, { status: 'completed', progress: 100 });
                toast.success(`Downloaded ${file.name}`);
            } catch (error) {
                console.error('Download failed:', error);
                updateTask(taskId, {
                    status: 'error',
                    error: error instanceof Error ? error.message : String(error)
                });
                toast.error(`Failed to download ${file.name}`);
            }

            onClose();

        } catch (error) {
            console.error('Save dialog failed:', error);
        }
    };

    const handleDelete = async () => {
        if (!file || !selectedSerial) return;
        setIsDeleting(true);

        const remotePath = path.endsWith('/') ? path + file.name : path + '/' + file.name;

        try {
            await invoke('delete_file', {
                device: selectedSerial,
                path: remotePath,
            });
            toast.success(`Deleted ${file.name}`);
            loadFiles(selectedSerial);
            setIsConfirmOpen(false);
            onClose();
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(`Failed to delete ${file.name}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return FileImage;
        if (['mp4', 'mkv', 'avi', 'mov'].includes(ext || '')) return FileVideo;
        if (['mp3', 'wav', 'ogg', 'm4a'].includes(ext || '')) return Music;
        if (['txt', 'log', 'xml', 'json', 'md'].includes(ext || '')) return FileText;
        return File;
    };

    return (
        <Dialog open={!!file} onOpenChange={(open) => !open && onClose()}>
            <DialogPopup className="max-w-[600px] w-full" onKeyDown={handleKeyDown}>
                <DialogHeader>
                    <DialogTitle className="truncate pr-8">{file?.name || 'File Details'}</DialogTitle>
                    <DialogDescription>
                        {totalFiles > 1 && currentIndex >= 0
                            ? `File ${currentIndex + 1} of ${totalFiles}`
                            : 'Review file information'
                        }
                    </DialogDescription>
                </DialogHeader>


                {file && (
                    <div className="flex flex-col gap-4 py-4 px-4 min-h-[300px] w-full max-w-full">
                        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed overflow-hidden min-h-[200px] relative w-full">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Loading preview...</span>
                                    <span className="text-xs text-muted-foreground/60">
                                        {file.size ? `Transferring ${formatFileSize(file.size)}...` : ''}
                                    </span>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center gap-2 p-8">
                                    <AlertCircle className="h-8 w-8 text-destructive/50" />
                                    <span className="text-xs text-destructive text-center">{error}</span>
                                </div>
                            ) : skippedReason ? (
                                <div className="flex flex-col items-center justify-center gap-3 p-8">
                                    {(() => {
                                        const Icon = getFileIcon(file.name);
                                        return <Icon className="h-12 w-12 text-muted-foreground opacity-50" />;
                                    })()}
                                    <div className="text-center space-y-1">
                                        <span className="text-sm font-medium text-muted-foreground">Preview skipped</span>
                                        <p className="text-xs text-muted-foreground/70">{skippedReason}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setForceLoad(true)}
                                    >
                                        Load anyway
                                    </Button>
                                </div>
                            ) : previewType === 'image' && previewContent ? (
                                <div className="w-full h-full flex items-center justify-center bg-checkered p-2">
                                    <img
                                        src={previewContent}
                                        alt={file.name}
                                        className="max-w-full max-h-[300px] object-contain rounded-sm shadow-sm"
                                    />
                                </div>
                            ) : previewType === 'text' && previewContent ? (
                                <ScrollArea className="w-full h-[300px] rounded-md border p-4 bg-muted/50">
                                    <pre className="text-xs font-mono whitespace-pre-wrap break-all text-foreground/80">
                                        {previewContent}
                                    </pre>
                                </ScrollArea>
                            ) : previewType === 'audio' && previewContent ? (
                                <div className="w-full flex flex-col items-center justify-center gap-4 p-8">
                                    <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                                        <Music className="h-8 w-8 text-primary" />
                                    </div>
                                    <audio
                                        controls
                                        src={previewContent}
                                        className="w-full max-w-md"
                                        preload="metadata"
                                    >
                                        Your browser does not support audio playback.
                                    </audio>
                                </div>
                            ) : previewType === 'video' && previewContent ? (
                                <div className="w-full flex items-center justify-center p-2">
                                    <video
                                        controls
                                        src={previewContent}
                                        className="max-w-full max-h-[300px] rounded-sm shadow-sm"
                                        preload="metadata"
                                    >
                                        Your browser does not support video playback.
                                    </video>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center p-8">
                                    {(() => {
                                        const Icon = getFileIcon(file.name);
                                        return <Icon className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />;
                                    })()}
                                    <span className="text-sm font-medium text-muted-foreground">Preview not available</span>
                                </div>
                            )}
                        </div>

                        <div className="rounded-md border overflow-hidden w-full">
                            <Table className="table-fixed w-full">
                                <TableBody>
                                    <TableRow>
                                        <TableCell className="font-medium w-24 text-muted-foreground bg-muted/30">Name</TableCell>
                                        <TableCell className="font-mono break-all line-clamp-2">{file.name}</TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium text-muted-foreground bg-muted/30">Size</TableCell>
                                        <TableCell className="font-mono">
                                            {file.size ? (file.size / 1024).toFixed(2) + " KB" : "Unknown"}
                                        </TableCell>
                                    </TableRow>
                                    <TableRow>
                                        <TableCell className="font-medium text-muted-foreground bg-muted/30">Perms</TableCell>
                                        <TableCell className="font-mono">{file.permissions}</TableCell>
                                    </TableRow>
                                    <TableRow className="border-0">
                                        <TableCell className="font-medium text-muted-foreground bg-muted/30 rounded-bl-md">Path</TableCell>
                                        <TableCell className="font-mono break-all text-xs text-muted-foreground">
                                            {path.endsWith('/') ? path : path + '/'}{file.name}
                                        </TableCell>
                                    </TableRow>
                                </TableBody>
                            </Table>
                        </div>
                    </div>
                )}


                <DialogFooter>
                    <div className="flex w-full justify-between items-center gap-2">
                        {onNavigate && totalFiles > 1 ? (
                            <div className="flex items-center gap-1">
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onNavigate('prev')}
                                    title="Previous file (←)"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    onClick={() => onNavigate('next')}
                                    title="Next file (→)"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : <div />}
                        <div className="flex gap-2">
                            <Button
                                variant="destructive"
                                onClick={() => setIsConfirmOpen(true)}
                                size="icon"
                                title="Delete File"
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <Button variant="secondary" onClick={handleDownload} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogPopup>

            <ConfirmDialog
                open={isConfirmOpen}
                onOpenChange={setIsConfirmOpen}
                title="Delete File"
                description={
                    <span>
                        Are you sure you want to delete <span className="font-bold">{file?.name}</span>?
                        This action cannot be undone.
                    </span>
                }
                confirmText="Delete"
                variant="destructive"
                onConfirm={handleDelete}
                isLoading={isDeleting}
            />
        </Dialog>
    );
}
