import { useState } from "react";
import {
    ArrowLeft,
    ArrowUp,
    Home,
    RefreshCw,
    Upload,
    FolderPlus,
    Search,
    Scissors,
    Copy,
    Clipboard,
    X,
    Bookmark,
    BookmarkCheck,
} from "lucide-react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toolbar, ToolbarLeft, ToolbarRight } from "@/components/toolbar";
import { useFileStore } from "@/store/file-store";
import { useDeviceStore } from "@/store/device-store";
import { ProcessIndicator } from "./process-indicator";
import { UploadDialog } from "./upload-dialog";
import { NewFolderDialog } from "./new-folder-dialog";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export function FileToolbar() {
    const {
        path,
        setPath,
        navigateTo,
        navigateBack,
        navigateUp,
        loadFiles,
        historyIndex,
        isLoading,
        selectedFiles,
        clipboard,
        copyToClipboard,
        cutToClipboard,
        clearClipboard,
        clearSelection,
        searchQuery,
        setSearchQuery,
        bookmarks,
        addBookmark,
        removeBookmark,
    } = useFileStore();

    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const [uploadOpen, setUploadOpen] = useState(false);
    const [newFolderOpen, setNewFolderOpen] = useState(false);
    const [isPasting, setIsPasting] = useState(false);

    const hasSelection = selectedFiles.size > 0;
    const isBookmarked = bookmarks.includes(path);

    const handleRefresh = () => {
        loadFiles(selectedSerial);
    };

    const handleCopy = () => {
        copyToClipboard();
        toast.success(`${selectedFiles.size} item(s) copied`);
    };

    const handleCut = () => {
        cutToClipboard();
        toast.success(`${selectedFiles.size} item(s) cut`);
    };

    const handlePaste = async () => {
        if (!clipboard || !selectedSerial) return;

        setIsPasting(true);
        const { files, sourcePath, operation } = clipboard;
        const destPath = path.endsWith("/") ? path : path + "/";

        let successCount = 0;
        let failCount = 0;

        for (const file of files) {
            const srcFilePath = sourcePath.endsWith("/")
                ? `${sourcePath}${file.name}`
                : `${sourcePath}/${file.name}`;
            const destFilePath = `${destPath}${file.name}`;

            try {
                if (operation === "copy") {
                    await invoke("copy_file", {
                        device: selectedSerial,
                        sourcePath: srcFilePath,
                        destPath: destFilePath,
                    });
                } else {
                    await invoke("move_file", {
                        device: selectedSerial,
                        sourcePath: srcFilePath,
                        destPath: destFilePath,
                    });
                }
                successCount++;
            } catch (error) {
                console.error(`Failed to ${operation} ${file.name}:`, error);
                failCount++;
            }
        }

        if (operation === "cut") {
            clearClipboard();
        }

        if (failCount === 0) {
            toast.success(`${operation === "copy" ? "Copied" : "Moved"} ${successCount} item(s)`);
        } else {
            toast.warning(`${successCount} succeeded, ${failCount} failed`);
        }

        setIsPasting(false);
        loadFiles(selectedSerial);
    };

    const handleToggleBookmark = () => {
        if (isBookmarked) {
            removeBookmark(path);
            toast.success("Bookmark removed");
        } else {
            addBookmark(path);
            toast.success("Bookmark added");
        }
    };

    return (
        <>
            <Toolbar className="justify-between gap-2">
                <ToolbarLeft className="flex-1 gap-2">
                    {/* Navigation buttons */}
                    <div className="flex gap-1">
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={navigateBack}
                                    disabled={historyIndex <= 0}
                                >
                                    <ArrowLeft className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Back</TooltipContent>
                        </Tooltip>
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={navigateUp}
                                    disabled={path === "/" || path === ""}
                                >
                                    <ArrowUp className="h-4 w-4" />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Up</TooltipContent>
                        </Tooltip>

                        {/* Bookmarks dropdown */}
                        <DropdownMenu>
                            <Tooltip>
                                <TooltipTrigger>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            size="icon-sm"
                                            disabled={!selectedSerial}
                                        >
                                            <Home className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                </TooltipTrigger>
                                <TooltipContent>Bookmarks</TooltipContent>
                            </Tooltip>
                            <DropdownMenuContent align="start">
                                {bookmarks.map((bookmark) => (
                                    <DropdownMenuItem
                                        key={bookmark}
                                        onClick={() => navigateTo(bookmark)}
                                        className="font-mono text-xs"
                                    >
                                        {bookmark}
                                    </DropdownMenuItem>
                                ))}
                                {bookmarks.length > 0 && <DropdownMenuSeparator />}
                                <DropdownMenuItem onClick={handleToggleBookmark}>
                                    {isBookmarked ? (
                                        <>
                                            <BookmarkCheck className="h-4 w-4 mr-2 text-primary" />
                                            Remove Bookmark
                                        </>
                                    ) : (
                                        <>
                                            <Bookmark className="h-4 w-4 mr-2" />
                                            Bookmark This Folder
                                        </>
                                    )}
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="outline"
                                    size="icon-sm"
                                    onClick={handleRefresh}
                                    disabled={!selectedSerial || isLoading}
                                >
                                    <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>Refresh</TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Path input */}
                    <Input
                        value={path}
                        onChange={(e) => setPath(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && navigateTo(path)}
                        className="bg-muted/50 h-8 flex-1 font-mono text-xs min-w-[200px]"
                    />

                    {/* Search input */}
                    <div className="relative">
                        <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search..."
                            className="bg-muted/50 h-8 w-40 pl-7 pr-7 text-xs"
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>
                </ToolbarLeft>

                <ToolbarRight className="gap-1">
                    {/* Selection actions */}
                    {hasSelection && (
                        <>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        onClick={handleCopy}
                                    >
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy ({selectedFiles.size})</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger>
                                    <Button
                                        variant="outline"
                                        size="icon-sm"
                                        onClick={handleCut}
                                    >
                                        <Scissors className="h-4 w-4" />
                                    </Button>
                                </TooltipTrigger>
                                <TooltipContent>Cut ({selectedFiles.size})</TooltipContent>
                            </Tooltip>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearSelection}
                                className="text-xs text-muted-foreground"
                            >
                                <X className="h-3.5 w-3.5" />
                                Clear
                            </Button>
                        </>
                    )}

                    {/* Paste button */}
                    {clipboard && (
                        <Tooltip>
                            <TooltipTrigger>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handlePaste}
                                    disabled={isPasting}
                                    className={cn(
                                        clipboard.operation === "cut" && "border-amber-500/50 text-amber-600"
                                    )}
                                >
                                    <Clipboard className="h-4 w-4" />
                                    Paste ({clipboard.files.length})
                                </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                                {clipboard.operation === "copy" ? "Paste copied" : "Paste (move)"} files
                            </TooltipContent>
                        </Tooltip>
                    )}

                    {/* New folder */}
                    <Tooltip>
                        <TooltipTrigger>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                onClick={() => setNewFolderOpen(true)}
                                disabled={!selectedSerial}
                            >
                                <FolderPlus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>New Folder</TooltipContent>
                    </Tooltip>

                    {/* Upload */}
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                        disabled={!selectedSerial}
                    >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload</span>
                    </Button>
                </ToolbarRight>

                <ProcessIndicator />
            </Toolbar>

            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
            <NewFolderDialog open={newFolderOpen} onOpenChange={setNewFolderOpen} />
        </>
    );
}
