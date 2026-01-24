import { RefreshCw, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { check, type Update } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useState } from 'react';
import { toast } from 'sonner';
import { SettingsHeader, SettingsCard } from "@/components/ui/settings";

export function UpdateSettings() {
    const [checking, setChecking] = useState(false);
    const [updateAvailable, setUpdateAvailable] = useState<Update | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [updateProgress, setUpdateProgress] = useState(0);
    const [updateStatus, setUpdateStatus] = useState<'idle' | 'downloading' | 'installing' | 'restarting'>('idle');
    const [downloadedBytes, setDownloadedBytes] = useState(0);
    const [totalBytes, setTotalBytes] = useState(0);

    const formatBytes = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    const checkForUpdates = async () => {
        setChecking(true);
        try {
            const update = await check();
            if (update?.available) {
                setUpdateAvailable(update);
                toast.success(`Update available: v${update.version}`);
            } else {
                toast.success("You're on the latest version!");
            }
        } catch (error) {
            console.error("Update check failed:", error);
            const errorMessage = String(error).toLowerCase();

            if (import.meta.env.DEV) {
                toast.info("Update check is only available in production builds.");
            } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                toast.info("No updates available yet. Check back after the next release!");
            } else if (errorMessage.includes('network') || errorMessage.includes('fetch')) {
                toast.error("Network error. Check your internet connection.");
            } else {
                toast.error("Couldn't check for updates. Please try again later.");
            }
        } finally {
            setChecking(false);
        }
    };

    const installUpdate = async () => {
        if (!updateAvailable) return;

        setIsUpdating(true);
        setUpdateStatus('downloading');
        setUpdateProgress(0);
        setDownloadedBytes(0);
        setTotalBytes(0);

        let contentLength = 0;
        let downloaded = 0;

        try {
            await updateAvailable.downloadAndInstall((event) => {
                switch (event.event) {
                    case 'Started':
                        contentLength = event.data.contentLength ?? 0;
                        setTotalBytes(contentLength);
                        break;
                    case 'Progress':
                        downloaded += event.data.chunkLength;
                        setDownloadedBytes(downloaded);
                        if (contentLength > 0) {
                            setUpdateProgress(Math.round((downloaded / contentLength) * 100));
                        }
                        break;
                    case 'Finished':
                        setUpdateProgress(100);
                        setUpdateStatus('installing');
                        break;
                }
            });

            setUpdateStatus('restarting');
            await new Promise(resolve => setTimeout(resolve, 1000));
            await relaunch();
        } catch (error) {
            console.error("Update failed:", error);
            toast.error("Update failed. Please try again.");
            setIsUpdating(false);
            setUpdateStatus('idle');
        }
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Updates"
                description="Check for the latest version and manage updates."
            />

            {/* Current Version Card */}
            <SettingsCard
                title="Current Version"
                description={`You are running version v${import.meta.env.PACKAGE_VERSION}`}
                action={
                    <Button
                        variant="outline"
                        className="gap-2"
                        onClick={checkForUpdates}
                        disabled={checking || isUpdating}
                    >
                        <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
                        {checking ? "Checking..." : "Check for Updates"}
                    </Button>
                }
            />

            {/* Update Available Card */}
            {updateAvailable && !isUpdating && (
                <SettingsCard
                    icon={Download}
                    iconVariant="primary"
                    title="Update Available"
                    description={`Version v${updateAvailable.version} is ready to install`}
                    variant="accent"
                    action={
                        <Button className="gap-2" onClick={installUpdate}>
                            <Download className="h-4 w-4" />
                            Install & Restart
                        </Button>
                    }
                />
            )}

            {/* Update Progress Card */}
            {isUpdating && (
                <SettingsCard>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="font-medium text-sm flex items-center gap-2">
                                {updateStatus === 'downloading' && (
                                    <>
                                        <Download className="h-4 w-4 text-primary animate-pulse" />
                                        Downloading update...
                                    </>
                                )}
                                {updateStatus === 'installing' && (
                                    <>
                                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                        Installing update...
                                    </>
                                )}
                                {updateStatus === 'restarting' && (
                                    <>
                                        <Loader2 className="h-4 w-4 text-primary animate-spin" />
                                        Restarting...
                                    </>
                                )}
                            </div>
                            {updateStatus === 'downloading' && totalBytes > 0 && (
                                <span className="text-xs text-muted-foreground font-mono">
                                    {formatBytes(downloadedBytes)} / {formatBytes(totalBytes)}
                                </span>
                            )}
                        </div>
                        <Progress value={updateProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                            {updateStatus === 'downloading' && "Please wait while the update is being downloaded..."}
                            {updateStatus === 'installing' && "Installing update, please don't close the app..."}
                            {updateStatus === 'restarting' && "The app will restart momentarily..."}
                        </p>
                    </div>
                </SettingsCard>
            )}
        </div>
    );
}
