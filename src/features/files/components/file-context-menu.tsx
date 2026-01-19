import { useFileStore } from "@/store/file-store";
import { FileEntry } from "@/types";
import { Copy, File, Download } from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { save } from "@tauri-apps/plugin-dialog";
import { useProcessStore } from "@/store/process-store";
import { useDeviceStore } from "@/store/device-store";
import { toast } from "sonner";

interface FileContextMenuProps {
    x: number;
    y: number;
    file: FileEntry;
    onClose: () => void;
}

export function FileContextMenu({ x, y, file, onClose }: FileContextMenuProps) {
    const { path } = useFileStore();
    const { selectedSerial } = useDeviceStore();
    const { addTask, updateTask } = useProcessStore();

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

    return (
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
            {/* <div className="my-1 h-px bg-muted" />
            <ContextMenuItem icon={Scissors} label="Cut" disabled />
            <ContextMenuItem icon={ClipboardPaste} label="Paste" disabled />
            <div className="my-1 h-px bg-muted" />
            <ContextMenuItem icon={Trash2} label="Delete" className="text-red-500 focus:text-red-500" disabled /> */}
        </div>
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
