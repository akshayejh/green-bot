import { useState } from "react";
import { useFileStore } from "@/store/file-store";
import { useSettingsStore } from "@/store/settings-store";
import { FileEntry } from "@/types";
import { Copy, File, Download, Trash2 } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useProcessStore } from "@/store/process-store";
import { useDeviceStore } from "@/store/device-store";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

interface FileContextMenuProps {
    x: number;
    y: number;
    file: FileEntry;
    onClose: () => void;
}

export function FileContextMenu({ x, y, file, onClose }: FileContextMenuProps) {
    const { path, loadFiles } = useFileStore();
    const { selectedSerial } = useDeviceStore();
    const { addTask, updateTask } = useProcessStore();
    const confirmBeforeDelete = useSettingsStore((state) => state.confirmBeforeDelete);

    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDownload = async () => {
        onClose();
        if (!selectedSerial) return;

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

        } catch (error) {
            console.error('Save dialog failed:', error);
        }
    };

    const performDelete = async () => {
        if (!selectedSerial) return;

        setIsDeleting(true);
        const remotePath = path.endsWith('/') ? path + file.name : path + '/' + file.name;

        try {
            await invoke('delete_file', {
                device: selectedSerial,
                path: remotePath
            });

            toast.success(`Deleted ${file.name}`);
            setShowDeleteDialog(false);
            onClose();
            // Refresh the file list
            loadFiles(selectedSerial);
        } catch (error) {
            console.error('Delete failed:', error);
            toast.error(`Failed to delete ${file.name}: ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleDelete = () => {
        if (confirmBeforeDelete) {
            setShowDeleteDialog(true);
        } else {
            performDelete();
        }
    };

    return (
        <>
            <div
                className="fixed z-50 min-w-[160px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md animate-in fade-in-80 zoom-in-95"
                style={{
                    top: Math.min(y, window.innerHeight - 200),
                    left: Math.min(x, window.innerWidth - 200)
                }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b mb-1 truncate max-w-[200px]">
                    {file.name}
                </div>
                <ContextMenuItem icon={Download} label="Download" onClick={handleDownload} />
                <ContextMenuItem icon={Copy} label="Copy Name" onClick={() => {
                    navigator.clipboard.writeText(file.name);
                    onClose();
                }} />
                <ContextMenuItem icon={File} label="Copy Path" onClick={() => {
                    navigator.clipboard.writeText(path + file.name);
                    onClose();
                }} />
                <div className="my-1 h-px bg-muted" />
                <ContextMenuItem
                    icon={Trash2}
                    label="Delete"
                    className="text-red-500 hover:text-red-500 hover:bg-red-500/10"
                    onClick={handleDelete}
                />
            </div>

            <ConfirmDialog
                open={showDeleteDialog}
                onOpenChange={(open) => {
                    setShowDeleteDialog(open);
                    if (!open) onClose();
                }}
                title={`Delete ${file.is_dir ? 'Folder' : 'File'}`}
                description={
                    <>
                        Are you sure you want to delete <span className="font-semibold">{file.name}</span>?
                        {file.is_dir && <span className="block mt-1 text-destructive">This will delete all contents inside the folder.</span>}
                        <span className="block mt-1 text-muted-foreground">This action cannot be undone.</span>
                    </>
                }
                confirmText="Delete"
                variant="destructive"
                onConfirm={performDelete}
                isLoading={isDeleting}
            />
        </>
    );
}

function ContextMenuItem({ icon: Icon, label, onClick, disabled, className }: { icon: any, label: string, onClick?: () => void, disabled?: boolean, className?: string }) {
    return (
        <div
            className={`relative flex select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 cursor-default ${className}`}
            onClick={!disabled ? onClick : undefined}
            data-disabled={disabled}
        >
            <Icon className="mr-2 h-4 w-4" />
            {label}
        </div>
    )
}
