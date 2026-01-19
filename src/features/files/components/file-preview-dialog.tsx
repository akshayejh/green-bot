import { FileEntry } from "@/types";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { File, FileImage, FileText, FileVideo, Music, Download, Loader2, AlertCircle, Trash2 } from "lucide-react";
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
}

export function FilePreviewDialog({ file, onClose }: FilePreviewDialogProps) {
    const { path, loadFiles } = useFileStore();
    const { selectedSerial } = useDeviceStore();
    const { addTask, updateTask } = useProcessStore();

    const [previewContent, setPreviewContent] = useState<string | null>(null);
    const [previewType, setPreviewType] = useState<'image' | 'text' | 'none'>('none');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    useEffect(() => {
        if (!file || !selectedSerial) return;

        setPreviewContent(null);
        setPreviewType('none');
        setError(null);

        const ext = file.name.split('.').pop()?.toLowerCase() || '';
        const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext);
        const isText = ['txt', 'log', 'xml', 'json', 'md', 'js', 'ts', 'tsx', 'css', 'html', 'sh', 'conf', 'ini', 'properties', 'gradle', 'java', 'kt', 'py', 'rs', 'c', 'cpp', 'h'].includes(ext);

        // Skip preview for large files (> 2MB for images, > 100KB for text)
        const size = file.size || 0;
        if (isImage && size > 2 * 1024 * 1024) return;
        if (isText && size > 100 * 1024) return;

        if (isImage || isText) {
            setIsLoading(true);
            const remotePath = path.endsWith('/') ? path + file.name : path + '/' + file.name;

            invoke<number[]>('read_file_content', {
                device: selectedSerial,
                path: remotePath,
            })
                .then((bytes) => {
                    if (isImage) {
                        const blob = new Blob([new Uint8Array(bytes)]);
                        const url = URL.createObjectURL(blob);
                        setPreviewContent(url);
                        setPreviewType('image');
                    } else {
                        const text = new TextDecoder().decode(new Uint8Array(bytes));
                        setPreviewContent(text);
                        setPreviewType('text');
                    }
                })
                .catch((err) => {
                    console.error("Failed to load preview", err);
                    setError("Failed to load preview");
                })
                .finally(() => {
                    setIsLoading(false);
                });
        }

        return () => {
            // Cleanup object URL if it was created
            if (previewType === 'image' && previewContent) {
                URL.revokeObjectURL(previewContent);
            }
        }

    }, [file, selectedSerial, path]);

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
            <DialogPopup className="max-w-[600px] w-full">
                <DialogHeader>
                    <DialogTitle>File Details</DialogTitle>
                    <DialogDescription>
                        Review file information.
                    </DialogDescription>
                </DialogHeader>


                {file && (
                    <div className="flex flex-col gap-4 py-4 px-4 min-h-[300px] w-full max-w-full">
                        <div className="flex flex-col items-center justify-center bg-muted/30 rounded-lg border border-dashed overflow-hidden min-h-[200px] relative w-full">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    <span className="text-sm text-muted-foreground">Loading preview...</span>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center gap-2">
                                    <AlertCircle className="h-8 w-8 text-destructive/50" />
                                    <span className="text-xs text-destructive">{error}</span>
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
                        <Button
                            variant="destructive"
                            onClick={() => setIsConfirmOpen(true)}
                            size="icon"
                            title="Delete File"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={handleDownload} className="gap-2">
                                <Download className="w-4 h-4" />
                                Download
                            </Button>
                            <DialogClose>
                                <Button variant="outline">Close</Button>
                            </DialogClose>
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
