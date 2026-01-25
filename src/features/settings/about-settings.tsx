import { Github, Info, ExternalLink, Scale, Bug } from "lucide-react";
import { openUrl } from '@tauri-apps/plugin-opener';
import { SettingsHeader, SettingsCard, SettingsLinkItem, SettingsValueItem } from "@/components/ui/settings";

function getPlatformName(): string {
    const ua = navigator.userAgent;

    if (ua.includes("Mac")) {
        // Check for Apple Silicon via userAgentData (modern browsers)
        // @ts-ignore - userAgentData is not in all TS definitions yet
        const uaData = navigator.userAgentData;
        if (uaData?.platform === "macOS") {
            // On Apple Silicon Macs, architecture info isn't directly exposed
            // but we can make an educated guess based on other signals
            return "macOS (Apple Silicon)";
        }
        return "macOS";
    }
    if (ua.includes("Windows")) return "Windows";
    if (ua.includes("Linux")) return "Linux";

    return navigator.platform || "Unknown";
}

export function AboutSettings() {
    return (
        <div className="space-y-6">
            <SettingsHeader
                title="About"
                description="Learn more about Green Bot."
            />

            {/* App Info Card */}
            <SettingsCard
                icon={Info}
                title="Green Bot"
                description="A powerful, modern Android device management tool."
            >
                <SettingsValueItem
                    label="Version"
                    value={`v${import.meta.env.PACKAGE_VERSION}`}
                />
                <SettingsValueItem
                    label="Platform"
                    value={getPlatformName()}
                />
            </SettingsCard>

            {/* Links Card */}
            <SettingsCard
                icon={ExternalLink}
                title="Links"
                description="Resources and community."
            >
                <SettingsLinkItem
                    label="GitHub Repository"
                    description="View source code and contribute."
                    icon={Github}
                    onClick={() => openUrl("https://github.com/akshayejh/green-bot")}
                />
                <SettingsLinkItem
                    label="Report an Issue"
                    description="Found a bug? Let us know."
                    icon={Bug}
                    onClick={() => openUrl("https://github.com/akshayejh/green-bot/issues")}
                />
            </SettingsCard>

            {/* License Card */}
            <SettingsCard
                icon={Scale}
                title="License"
                description="Open source under MIT License."
            >
                <SettingsLinkItem
                    label="View License"
                    description="Read the full MIT License text."
                    icon={Scale}
                    onClick={() => openUrl("https://github.com/akshayejh/green-bot/blob/main/LICENSE")}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground pt-2">
                    <span>Reluctantly crafted ✨</span>
                </div>
            </SettingsCard>
        </div>
    );
}
