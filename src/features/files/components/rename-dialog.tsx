import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFileStore } from "@/store/file-store";
import { useDeviceStore } from "@/store/device-store";
import { FileEntry } from "@/types";

interface RenameDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    file: FileEntry | null;
}

export function RenameDialog({ open, onOpenChange, file }: RenameDialogProps) {
    const [newName, setNewName] = useState("");
    const [isRenaming, setIsRenaming] = useState(false);

    const { path, loadFiles } = useFileStore();
    const { selectedSerial } = useDeviceStore();

    // Set initial name when file changes
    useEffect(() => {
        if (file) {
            setNewName(file.name);
        }
    }, [file]);

    const handleRename = async () => {
        if (!newName.trim() || !selectedSerial || !file) return;

        // Validate name
        if (newName.includes("/") || newName.includes("\\")) {
            toast.error("Name cannot contain slashes");
            return;
        }

        if (newName === file.name) {
            onOpenChange(false);
            return;
        }

        setIsRenaming(true);

        const basePath = path.endsWith("/") ? path : path + "/";
        const oldPath = `${basePath}${file.name}`;
        const newPath = `${basePath}${newName.trim()}`;

        try {
            await invoke("rename_file", {
                device: selectedSerial,
                oldPath,
                newPath,
            });

            toast.success(`Renamed to "${newName}"`);
            onOpenChange(false);
            loadFiles(selectedSerial);
        } catch (error) {
            toast.error(`Failed to rename: ${error}`);
        } finally {
            setIsRenaming(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && newName.trim()) {
            handleRename();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Pencil className="h-5 w-5 text-primary" />
                        Rename {file?.is_dir ? "Folder" : "File"}
                    </DialogTitle>
                    <DialogDescription>
                        Enter a new name for <span className="font-semibold">{file?.name}</span>
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="new-name">New Name</Label>
                        <Input
                            id="new-name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter new name"
                            autoFocus
                            onFocus={(e) => {
                                // Select filename without extension for files
                                if (file && !file.is_dir) {
                                    const dotIndex = file.name.lastIndexOf(".");
                                    if (dotIndex > 0) {
                                        e.target.setSelectionRange(0, dotIndex);
                                    } else {
                                        e.target.select();
                                    }
                                } else {
                                    e.target.select();
                                }
                            }}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleRename}
                        disabled={!newName.trim() || isRenaming || newName === file?.name}
                    >
                        {isRenaming ? "Renaming..." : "Rename"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
