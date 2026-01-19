import { useFileStore } from "@/store/file-store";
import { FileEntry } from "@/types";
import { useState, useEffect } from "react";
import { FileContextMenu } from "./file-context-menu";
import { FileIcon } from "./file-icon";

interface FileListProps {
    onPreview: (file: FileEntry) => void;
}

function getPermissionLabel(permissions: string): string {
    if (!permissions || permissions.length < 4) return permissions;

    // Unix permissions usually start with d/- followed by 3 chars for owner
    // e.g., -rw-r--r-- or drwxr-xr-x

    const ownerPerms = permissions.slice(1, 4);

    if (ownerPerms === "rwx") return "Full Access";
    if (ownerPerms === "rw-") return "Read & Write";
    if (ownerPerms === "r--") return "Read Only";
    if (ownerPerms === "--x") return "Execute Only";
    if (ownerPerms.includes('r') && ownerPerms.includes('w')) return "Read & Write";

    return permissions;
}

function formatSize(size: number): string {
    if (size === undefined || size === null) return "-";
    if (size < 1024) return size + " B";
    if (size < 1024 * 1024) return (size / 1024).toFixed(1) + " KB";
    if (size < 1024 * 1024 * 1024) return (size / (1024 * 1024)).toFixed(1) + " MB";
    return (size / (1024 * 1024 * 1024)).toFixed(2) + " GB";
}

export function FileList({ onPreview }: FileListProps) {
    const { files, isLoading, path, navigateTo } = useFileStore();
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileEntry } | null>(null);

    // Close menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    const handleEntryClick = (entry: FileEntry) => {
        if (entry.is_dir) {
            const safePath = path.endsWith('/') ? path : path + '/';
            navigateTo(`${safePath}${entry.name}/`);
        } else {
            onPreview(entry);
        }
    };

    const handleContextMenu = (e: React.MouseEvent, file: FileEntry) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    return (
        <div className="flex-1 bg-card overflow-hidden flex flex-col min-h-0 relative">
            {/* Header */}
            <div className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground shrink-0">
                <div className="w-5"></div>
                <div>Name</div>
                <div>Permissions</div>
                <div>Size</div>
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-1">
                {isLoading && files.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : files.filter(f => f.name !== '..').map((file) => (
                    <div
                        key={file.name}
                        onClick={() => handleEntryClick(file)}
                        onContextMenu={(e) => {
                            handleContextMenu(e, file)
                        }}
                        className="grid grid-cols-[auto_1fr_auto_auto] gap-4 p-2 rounded-sm hover:bg-accent hover:text-accent-foreground cursor-pointer text-sm items-center group select-none transition-colors"
                    >
                        <FileIcon name={file.name} isDirectory={file.is_dir} className="w-4 h-4" />
                        <div className="truncate font-medium group-hover:underline underline-offset-4 decoration-muted-foreground/30">{file.name}</div>
                        <div className="text-xs text-muted-foreground font-mono" title={file.permissions}>
                            {getPermissionLabel(file.permissions)}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono text-right min-w-[60px]">
                            {file.is_dir ? "-" : formatSize(file.size || 0)}
                        </div>
                    </div>
                ))}
                {!isLoading && files.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">Empty directory</div>
                )}
            </div>

            {contextMenu && (
                <FileContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    file={contextMenu.file}
                    onClose={() => setContextMenu(null)}
                />
            )}
        </div>
    )
}
