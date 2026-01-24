import { Moon, Sun, Laptop, Info, Github, Zap, RefreshCw } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
    Dialog,
    DialogPopup,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';
import { useState } from 'react';
import { toast } from 'sonner';

interface SettingsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function SettingsDialog({ open, onOpenChange }: SettingsDialogProps) {
    const { setTheme, theme } = useTheme();
    const [checking, setChecking] = useState(false);
    const [activeTab, setActiveTab] = useState("general");

    const checkForUpdates = async () => {
        setChecking(true);
        try {
            const update = await check();
            if (update?.available) {
                toast.success(`Update available: ${update.version}`, {
                    action: {
                        label: 'Install & Restart',
                        onClick: async () => {
                            await update.downloadAndInstall();
                            await relaunch();
                        }
                    },
                    duration: 10000,
                });
            } else {
                toast.success("You're on the latest version!");
            }
        } catch (error) {
            console.error("Update check failed:", error);
            const errorMessage = String(error).toLowerCase();

            // Check if running in dev mode
            if (import.meta.env.DEV) {
                toast.info("Update check is only available in production builds.");
            } else if (errorMessage.includes('404') || errorMessage.includes('not found')) {
                // latest.json doesn't exist yet
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

    const tabs = [
        { id: "general", label: "General", icon: Zap },
        { id: "updates", label: "Updates", icon: RefreshCw },
        { id: "about", label: "About", icon: Info },
    ];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogPopup className="sm:max-w-4xl p-0 overflow-hidden gap-0">
                <div className="flex h-[600px] w-full">
                    {/* Sidebar */}
                    <div className="w-64 border-r bg-muted/30 flex flex-col">
                        <div className="p-6 pb-4">
                            <h2 className="text-lg font-medium tracking-tight">Settings</h2>
                            <p className="text-sm text-muted-foreground">Manage preferences</p>
                        </div>
                        <div className="flex-1 px-4 space-y-0">
                            {tabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <Button
                                        key={tab.id}
                                        variant={activeTab === tab.id ? "outline" : "ghost"}
                                        className={cn(
                                            "w-full justify-start",
                                            activeTab === tab.id && "bg-secondary font-regular"
                                        )}
                                        onClick={() => setActiveTab(tab.id)}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {tab.label}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="flex-1 flex flex-col min-w-0 bg-background">
                        <DialogHeader className="px-6 py-6 border-b shrink-0 gap-0">
                            <DialogTitle className="text-xl">
                                {tabs.find(t => t.id === activeTab)?.label}
                            </DialogTitle>
                            <DialogDescription>
                                {activeTab === 'general' && "Customize the appearance and behavior of the application."}
                                {activeTab === 'updates' && "Check for the latest version and manage updates."}
                                {activeTab === 'about' && "Learn more about Green Bot and its development."}
                            </DialogDescription>
                        </DialogHeader>

                        <ScrollArea className="flex-1">
                            <div className="p-6">
                                {activeTab === 'general' && (
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-base font-medium">Appearance</Label>
                                            <div className="grid grid-cols-3 gap-4">
                                                <button
                                                    onClick={() => setTheme("light")}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        theme === "light" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                                                    )}
                                                >
                                                    <div className="h-16 w-24 rounded-lg bg-zinc-100 p-1.5 flex gap-1.5 border border-zinc-200 shadow-sm pointer-events-none">
                                                        <div className="w-1/3 h-full rounded-sm bg-white border border-zinc-200/50" />
                                                        <div className="flex-1 h-full rounded-sm bg-white border border-zinc-200/50 flex flex-col gap-1.5 p-1.5">
                                                            <div className="h-1.5 w-full rounded-sm bg-zinc-100" />
                                                            <div className="h-1.5 w-2/3 rounded-sm bg-zinc-100" />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-sm flex items-center gap-2">
                                                        <Sun className="h-4 w-4" /> Light
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setTheme("dark")}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        theme === "dark" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                                                    )}
                                                >
                                                    <div className="h-16 w-24 rounded-lg bg-zinc-950 p-1.5 flex gap-1.5 border border-zinc-800 shadow-sm pointer-events-none">
                                                        <div className="w-1/3 h-full rounded-sm bg-zinc-900 border border-zinc-800" />
                                                        <div className="flex-1 h-full rounded-sm bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5 p-1.5">
                                                            <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                                                            <div className="h-1.5 w-2/3 rounded-sm bg-zinc-800" />
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-sm flex items-center gap-2">
                                                        <Moon className="h-4 w-4" /> Dark
                                                    </span>
                                                </button>
                                                <button
                                                    onClick={() => setTheme("system")}
                                                    className={cn(
                                                        "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                                                        theme === "system" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                                                    )}
                                                >
                                                    <div className="h-16 w-24 rounded-lg overflow-hidden flex border border-zinc-200 dark:border-zinc-800 shadow-sm pointer-events-none">
                                                        <div className="w-1/2 h-full bg-zinc-100 p-1.5 flex gap-1">
                                                            <div className="w-1/3 h-full rounded-sm bg-white border border-zinc-200/50" />
                                                            <div className="flex-1 h-full rounded-sm bg-white border border-zinc-200/50 flex flex-col gap-1.5 p-1.5">
                                                                <div className="h-1.5 w-full rounded-sm bg-zinc-100" />
                                                                <div className="h-1.5 w-2/3 rounded-sm bg-zinc-100" />
                                                            </div>
                                                        </div>
                                                        <div className="w-1/2 h-full bg-zinc-950 p-1.5 flex gap-1">
                                                            <div className="w-1/3 h-full rounded-sm bg-zinc-900 border border-zinc-800" />
                                                            <div className="flex-1 h-full rounded-sm bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5 p-1.5">
                                                                <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                                                                <div className="h-1.5 w-2/3 rounded-sm bg-zinc-800" />
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <span className="font-medium text-sm flex items-center gap-2">
                                                        <Laptop className="h-4 w-4" /> System
                                                    </span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'updates' && (
                                    <div className="space-y-6">
                                        <Card className="p-0">
                                            <CardContent className="px-6 py-4 flex items-center justify-between gap-4">
                                                <div className="space-y-1">
                                                    <div className="font-medium text-base">Current Version</div>
                                                    <div className="text-sm text-muted-foreground">
                                                        You are running version <span className="font-mono text-foreground">v{import.meta.env.PACKAGE_VERSION}</span>
                                                    </div>
                                                </div>
                                                <Button variant="outline" className="gap-2 shrink-0" onClick={checkForUpdates} disabled={checking}>
                                                    <RefreshCw className={cn("h-4 w-4", checking && "animate-spin")} />
                                                    {checking ? "Checking..." : "Check for Updates"}
                                                </Button>
                                            </CardContent>
                                        </Card>
                                    </div>
                                )}

                                {activeTab === 'about' && (
                                    <div className="space-y-6">
                                        <Card className="bg-muted/50 border-none shadow-sm">
                                            <CardContent className="flex flex-col items-center text-center p-8 gap-4">
                                                <div className="bg-background flex items-center justify-center text-primary">
                                                    <img src="/greenbot-icon.png" alt="Green Bot Logo" className="w-20 h-20 object-contain" />
                                                </div>
                                                <div className="space-y-2">
                                                    <h3 className="text-2xl tracking-tight">Green Bot</h3>
                                                    <p className="text-muted-foreground max-w-[400px] text-light">
                                                        A powerful, modern Android device management tool built with web technologies.
                                                    </p>
                                                </div>
                                                <div className="flex gap-3 mt-2">
                                                    <Button variant="outline" className="gap-2" asChild>
                                                        <a href="https://github.com/akshayejh/green-bot" target="_blank" rel="noreferrer">
                                                            <Github className="h-4 w-4" />
                                                            GitHub
                                                        </a>
                                                    </Button>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        <div className="text-center text-xs text-muted-foreground">
                                            <p>Copyright © 2024 Green Bot.</p>
                                            <p>Released under the MIT License.</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </div>
                </div>
            </DialogPopup >
        </Dialog >
    );
}
