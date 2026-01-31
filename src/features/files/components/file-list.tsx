import { useFileStore } from "@/store/file-store";
import { useSettingsStore } from "@/store/settings-store";
import { FileEntry } from "@/types";
import { useState, useEffect, useMemo } from "react";
import { FileContextMenu } from "./file-context-menu";
import { FileIcon } from "./file-icon";
import { RenameDialog } from "./rename-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

interface FileListProps {
    onPreview: (file: FileEntry) => void;
}

function getPermissionLabel(permissions: string): string {
    if (!permissions || permissions.length < 4) return permissions;

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
    const {
        files,
        isLoading,
        path,
        navigateTo,
        selectedFiles,
        toggleSelection,
        clearSelection,
        selectAll,
        searchQuery,
        clipboard,
    } = useFileStore();
    const showHiddenFiles = useSettingsStore((state) => state.showHiddenFiles);
    const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileEntry } | null>(null);
    const [renameFile, setRenameFile] = useState<FileEntry | null>(null);

    // Filter files based on settings and search
    const visibleFiles = useMemo(() => {
        return files.filter(f => {
            if (f.name === '..') return false;
            if (!showHiddenFiles && f.name.startsWith('.')) return false;
            if (searchQuery) {
                return f.name.toLowerCase().includes(searchQuery.toLowerCase());
            }
            return true;
        });
    }, [files, showHiddenFiles, searchQuery]);

    const allSelected = visibleFiles.length > 0 && visibleFiles.every(f => selectedFiles.has(f.name));
    const someSelected = visibleFiles.some(f => selectedFiles.has(f.name)) && !allSelected;

    // Close menu on click elsewhere
    useEffect(() => {
        const handleClick = () => setContextMenu(null);
        window.addEventListener("click", handleClick);
        return () => window.removeEventListener("click", handleClick);
    }, []);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            // Skip if focus is in an input or textarea (let native behavior work)
            const activeElement = document.activeElement;
            const isInputFocused = activeElement instanceof HTMLInputElement ||
                activeElement instanceof HTMLTextAreaElement;

            // Ctrl/Cmd + A to select all
            if ((e.ctrlKey || e.metaKey) && e.key === "a") {
                if (isInputFocused) return; // Let native select-all work
                e.preventDefault();
                selectAll();
            }
            // Escape to clear selection
            if (e.key === "Escape") {
                clearSelection();
                setContextMenu(null);
            }
            // F2 to rename
            if (e.key === "F2" && selectedFiles.size === 1) {
                const fileName = Array.from(selectedFiles)[0];
                const file = files.find(f => f.name === fileName);
                if (file) {
                    setRenameFile(file);
                }
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectAll, clearSelection, selectedFiles, files]);

    const handleEntryClick = (entry: FileEntry) => {
        // Single click: navigate or preview
        if (entry.is_dir) {
            const safePath = path.endsWith('/') ? path : path + '/';
            navigateTo(`${safePath}${entry.name}/`);
        } else {
            onPreview(entry);
        }
    };

    const handleCheckboxChange = (fileName: string) => {
        toggleSelection(fileName);
    };

    const handleSelectAll = () => {
        if (allSelected) {
            clearSelection();
        } else {
            selectAll();
        }
    };

    const handleContextMenu = (e: React.MouseEvent, file: FileEntry) => {
        e.preventDefault();

        // If right-clicking on a non-selected file, select only that file
        if (selectedFiles.size === 0) {
            toggleSelection(file.name);
        }

        setContextMenu({ x: e.clientX, y: e.clientY, file });
    };

    const handleRename = (file: FileEntry) => {
        setRenameFile(file);
        setContextMenu(null);
    };

    const isCutFile = (fileName: string) => {
        if (!clipboard || clipboard.operation !== "cut") return false;
        return clipboard.files.some(f => f.name === fileName) && clipboard.sourcePath === path;
    };

    return (
        <div className="flex-1 bg-card overflow-hidden flex flex-col min-h-0 relative">
            {/* Header */}
            <div className="grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 p-3 border-b bg-muted/30 text-xs font-medium text-muted-foreground shrink-0">
                <div
                    className="flex items-center justify-center w-5"
                    onClick={(e) => e.stopPropagation()}
                >
                    <Checkbox
                        checked={allSelected}
                        indeterminate={someSelected}
                        onCheckedChange={handleSelectAll}
                        className="h-4 w-4"
                    />
                </div>
                <div className="w-5"></div>
                <div className="flex items-center gap-2">
                    Name
                    {searchQuery && (
                        <span className="text-primary text-[10px] bg-primary/10 px-1.5 py-0.5 rounded">
                            "{searchQuery}"
                        </span>
                    )}
                </div>
                <div>Permissions</div>
                <div>Size</div>
            </div>

            {/* Selection info bar - always visible for consistent layout */}
            <div className="flex items-center justify-between px-3 py-1.5 bg-muted/30 border-b text-xs h-8">
                {selectedFiles.size > 0 ? (
                    <>
                        <span className="text-primary font-medium">
                            {selectedFiles.size} item{selectedFiles.size !== 1 ? "s" : ""} selected
                        </span>
                        <button
                            onClick={clearSelection}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            Clear
                        </button>
                    </>
                ) : (
                    <span className="text-muted-foreground">No items selected</span>
                )}
            </div>

            {/* List */}
            <div className="overflow-y-auto flex-1 p-1">
                {isLoading && files.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">Loading...</div>
                ) : visibleFiles.map((file) => {
                    const isSelected = selectedFiles.has(file.name);
                    const isCut = isCutFile(file.name);

                    return (
                        <div
                            key={file.name}
                            onClick={() => handleEntryClick(file)}
                            onContextMenu={(e) => handleContextMenu(e, file)}
                            className={cn(
                                "grid grid-cols-[auto_auto_1fr_auto_auto] gap-4 p-2 rounded-sm cursor-pointer text-sm items-center group select-none transition-colors",
                                isSelected
                                    ? "bg-primary/10 text-foreground"
                                    : "hover:bg-accent hover:text-accent-foreground",
                                isCut && "opacity-50"
                            )}
                        >
                            <div
                                className="flex items-center justify-center w-5"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={() => handleCheckboxChange(file.name)}
                                    className="h-4 w-4"
                                />
                            </div>
                            <FileIcon name={file.name} isDirectory={file.is_dir} className="w-4 h-4" />
                            <div className={cn(
                                "truncate font-medium",
                                !isSelected && "group-hover:underline underline-offset-4 decoration-muted-foreground/30"
                            )}>
                                {file.name}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono" title={file.permissions}>
                                {getPermissionLabel(file.permissions)}
                            </div>
                            <div className="text-xs text-muted-foreground font-mono text-right min-w-[60px]">
                                {file.is_dir ? "-" : formatSize(file.size || 0)}
                            </div>
                        </div>
                    );
                })}
                {!isLoading && visibleFiles.length === 0 && (
                    <div className="p-8 text-center text-sm text-muted-foreground">
                        {searchQuery ? `No files matching "${searchQuery}"` : "Empty directory"}
                    </div>
                )}
            </div>

            {contextMenu && (
                <FileContextMenu
                    x={contextMenu.x}
                    y={contextMenu.y}
                    file={contextMenu.file}
                    onClose={() => setContextMenu(null)}
                    onRename={handleRename}
                />
            )}

            <RenameDialog
                open={!!renameFile}
                onOpenChange={(open) => !open && setRenameFile(null)}
                file={renameFile}
            />
        </div>
    );
}
