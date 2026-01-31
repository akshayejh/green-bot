import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { FolderPlus } from "lucide-react";
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

interface NewFolderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function NewFolderDialog({ open, onOpenChange }: NewFolderDialogProps) {
    const [folderName, setFolderName] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const { path, loadFiles } = useFileStore();
    const { selectedSerial } = useDeviceStore();

    const handleCreate = async () => {
        if (!folderName.trim() || !selectedSerial) return;

        // Validate folder name
        if (folderName.includes("/") || folderName.includes("\\")) {
            toast.error("Folder name cannot contain slashes");
            return;
        }

        setIsCreating(true);

        const newPath = path.endsWith("/")
            ? `${path}${folderName.trim()}`
            : `${path}/${folderName.trim()}`;

        try {
            await invoke("create_folder", {
                device: selectedSerial,
                path: newPath,
            });

            toast.success(`Created folder "${folderName}"`);
            onOpenChange(false);
            setFolderName("");
            loadFiles(selectedSerial);
        } catch (error) {
            toast.error(`Failed to create folder: ${error}`);
        } finally {
            setIsCreating(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && folderName.trim()) {
            handleCreate();
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <FolderPlus className="h-5 w-5 text-primary" />
                        New Folder
                    </DialogTitle>
                    <DialogDescription>
                        Create a new folder in the current directory.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 p-4">
                    <div className="space-y-2">
                        <Label htmlFor="folder-name">Folder Name</Label>
                        <Input
                            id="folder-name"
                            value={folderName}
                            onChange={(e) => setFolderName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Enter folder name"
                            autoFocus
                        />
                    </div>

                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 p-2 rounded-md truncate">
                        {path}{folderName || "..."}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!folderName.trim() || isCreating}
                    >
                        {isCreating ? "Creating..." : "Create"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
