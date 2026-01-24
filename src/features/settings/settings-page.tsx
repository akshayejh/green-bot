import { Palette, RefreshCw, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from 'react';
import { GeneralSettings } from "./general-settings";
import { UpdateSettings } from "./update-settings";
import { AboutSettings } from "./about-settings";

export function SettingsPage() {
    const [activeTab, setActiveTab] = useState("general");

    const tabs = [
        {
            id: "general",
            label: "General",
            description: "Appearance and behavior",
            icon: Palette
        },
        {
            id: "updates",
            label: "Updates",
            description: "Check for new versions",
            icon: RefreshCw
        },
        {
            id: "about",
            label: "About",
            description: "App info and links",
            icon: Info
        },
    ];

    return (
        <div className="flex h-full w-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
                <div className="flex-1 p-3 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={cn(
                                    "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                    isActive
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 mt-0.5 shrink-0",
                                    isActive && "text-primary"
                                )} />
                                <div className="min-w-0">
                                    <div className={cn(
                                        "text-sm truncate",
                                        isActive && "font-medium"
                                    )}>
                                        {tab.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {tab.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <ScrollArea className="flex-1">
                    <div className="p-6 max-w-2xl">
                        {activeTab === 'general' && <GeneralSettings />}
                        {activeTab === 'updates' && <UpdateSettings />}
                        {activeTab === 'about' && <AboutSettings />}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
