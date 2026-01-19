import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { listen } from "@tauri-apps/api/event";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Upload, FileUp, X, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

interface InstallApkDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    deviceSerial: string | null;
    onInstallComplete: () => void;
}

export function InstallApkDialog({ open: isOpen, onOpenChange, deviceSerial, onInstallComplete }: InstallApkDialogProps) {
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [installing, setInstalling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Reset state when dialog opens/closes
    useEffect(() => {
        if (!isOpen) {
            setSelectedFile(null);
            setError(null);
            setSuccess(false);
            setInstalling(false);
        }
    }, [isOpen]);

    // Handle file drop (Tauri global event)
    useEffect(() => {
        if (!isOpen) return;

        const unlisten = listen<string[]>('tauri://file-drop', (event) => {
            const files = event.payload;
            if (files && files.length > 0) {
                const file = files[0];
                if (file.toLowerCase().endsWith('.apk')) {
                    setSelectedFile(file);
                    setError(null);
                } else {
                    setError("Please select a valid .apk file");
                }
            }
            setIsDragging(false);
        });

        const unlistenHover = listen('tauri://file-drop-hover', () => {
            setIsDragging(true);
        });

        const unlistenCancel = listen('tauri://file-drop-cancelled', () => {
            setIsDragging(false);
        });

        return () => {
            unlisten.then(u => u());
            unlistenHover.then(u => u());
            unlistenCancel.then(u => u());
        };
    }, [isOpen]);

    const handleSelectFile = async () => {
        try {
            const file = await open({
                multiple: false,
                filters: [{
                    name: 'Android Package',
                    extensions: ['apk']
                }]
            });
            if (file) {
                // The dialog returns null if cancelled, or string/string[] depending on options
                // We set multiple: false, so it should be a string or null
                setSelectedFile(file as string);
                setError(null);
                setSuccess(false);
            }
        } catch (err) {
            console.error("Failed to open file dialog:", err);
            setError("Failed to open file picker: " + String(err));
        }
    };

    const handleInstall = async () => {
        if (!selectedFile || !deviceSerial) return;

        setInstalling(true);
        setError(null);

        try {
            await invoke("install_package", {
                device: deviceSerial,
                path: selectedFile
            });
            setSuccess(true);
            onInstallComplete();
            // Close after a delay? Or let user close.
            setTimeout(() => {
                onOpenChange(false);
            }, 1500);
        } catch (err) {
            setError(err instanceof Error ? err.message : String(err));
        } finally {
            setInstalling(false);
        }
    };

    const getFileName = (path: string) => {
        // Handle both Windows and Unix paths
        return path.split(/[/\\]/).pop() || path;
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
                <DialogHeader className="p-6 bg-background z-10">
                    <DialogTitle>Install APK</DialogTitle>
                    <DialogDescription>
                        Select or drag an APK file to install on the device.
                    </DialogDescription>
                </DialogHeader>

                <Separator />

                <div className="p-6 space-y-4">
                    {!selectedFile ? (
                        <div
                            onClick={handleSelectFile}
                            className={`
                                border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-colors
                                ${isDragging
                                    ? "border-primary bg-primary/5"
                                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50"
                                }
                            `}
                        >
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center">
                                <Upload className="w-6 h-6 text-muted-foreground" />
                            </div>
                            <div className="text-center space-y-1">
                                <p className="text-sm font-medium">Click to select APK</p>
                                <p className="text-xs text-muted-foreground">or drag and drop here</p>
                            </div>
                        </div>
                    ) : (
                        <div className="border rounded-lg p-4 bg-muted/20 relative">
                            {!installing && !success && (
                                <button
                                    onClick={() => setSelectedFile(null)}
                                    className="absolute right-2 top-2 p-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted/50 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/20 flex items-center justify-center shrink-0">
                                    <FileUp className="w-5 h-5 text-green-600" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-sm font-medium truncate pr-6">{getFileName(selectedFile)}</p>
                                    <p className="text-xs text-muted-foreground break-all truncate">{selectedFile}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-start gap-2 p-3 text-sm text-destructive bg-destructive/10 rounded-md border border-destructive/20 animate-in fade-in slide-in-from-top-1">
                            <AlertCircle className="w-5 h-5 shrink-0" />
                            <div className="font-medium break-all">{error}</div>
                        </div>
                    )}

                    {success && (
                        <div className="flex items-center gap-2 p-3 text-sm text-green-600 bg-green-50 dark:text-green-400 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-900/50 animate-in fade-in slide-in-from-top-1">
                            <CheckCircle className="w-5 h-5 shrink-0" />
                            <div className="font-medium">App installed successfully!</div>
                        </div>
                    )}
                </div>

                <Separator />

                <DialogFooter className="p-6 bg-muted/10 sm:justify-between sm:space-x-2">
                    <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={installing}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleInstall}
                        disabled={!selectedFile || installing || success}
                    >
                        {installing && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        {installing ? "Installing..." : success ? "Installed" : "Install"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
