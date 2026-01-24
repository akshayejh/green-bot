import { Folder, Terminal, FileText, Rocket, Palette } from "lucide-react";
import { useTheme } from "@/components/theme-provider";
import { useSettingsStore } from "@/store/settings-store";
import {
    SettingsHeader,
    SettingsCard,
    SettingsSwitchItem,
    SettingsSelectItem,
    SettingsThemePicker
} from "@/components/ui/settings";

export function GeneralSettings() {
    const { setTheme, theme } = useTheme();
    const {
        checkUpdatesOnLaunch,
        showHiddenFiles,
        confirmBeforeDelete,
        defaultLogLevel,
        maxCommandHistory,
        setSetting,
    } = useSettingsStore();

    const logLevelOptions = [
        { value: "V", label: "Verbose" },
        { value: "D", label: "Debug" },
        { value: "I", label: "Info" },
        { value: "W", label: "Warning" },
        { value: "E", label: "Error" },
    ];

    const historyLimitOptions = [
        { value: "50", label: "50" },
        { value: "100", label: "100" },
        { value: "200", label: "200" },
        { value: "500", label: "500" },
    ];

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="General"
                description="Customize appearance, startup behavior, and app preferences."
            />

            {/* Appearance Section */}
            <SettingsCard
                icon={Palette}
                title="Appearance"
                description="Customize how Green Bot looks on your device."
            >
                <SettingsThemePicker
                    value={theme}
                    onChange={setTheme}
                />
            </SettingsCard>

            {/* Startup Section */}
            <SettingsCard
                icon={Rocket}
                title="Startup"
                description="Control app launch behavior."
            >
                <SettingsSwitchItem
                    label="Check for updates on launch"
                    description="Automatically check for new versions when the app starts."
                    checked={checkUpdatesOnLaunch}
                    onCheckedChange={(checked) => setSetting('checkUpdatesOnLaunch', checked)}
                />
            </SettingsCard>

            {/* File Manager Section */}
            <SettingsCard
                icon={Folder}
                title="File Manager"
                description="File browsing preferences."
            >
                <SettingsSwitchItem
                    label="Show hidden files"
                    description="Display files and folders starting with a dot."
                    checked={showHiddenFiles}
                    onCheckedChange={(checked) => setSetting('showHiddenFiles', checked)}
                />
                <SettingsSwitchItem
                    label="Confirm before delete"
                    description="Show a confirmation dialog before deleting files."
                    checked={confirmBeforeDelete}
                    onCheckedChange={(checked) => setSetting('confirmBeforeDelete', checked)}
                />
            </SettingsCard>

            {/* Logs Section */}
            <SettingsCard
                icon={FileText}
                title="Logs"
                description="Logcat viewer preferences."
            >
                <SettingsSelectItem
                    label="Default log level"
                    description="Minimum log level to display by default."
                    value={defaultLogLevel}
                    onValueChange={(value) => setSetting('defaultLogLevel', value as 'V' | 'D' | 'I' | 'W' | 'E')}
                    options={logLevelOptions}
                />
            </SettingsCard>

            {/* Terminal Section */}
            <SettingsCard
                icon={Terminal}
                title="Terminal"
                description="Command line preferences."
            >
                <SettingsSelectItem
                    label="Command history limit"
                    description="Maximum number of commands to remember."
                    value={String(maxCommandHistory)}
                    onValueChange={(value) => setSetting('maxCommandHistory', Number(value))}
                    options={historyLimitOptions}
                />
            </SettingsCard>
        </div>
    );
}
