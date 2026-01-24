import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export interface AppSettings {
    // Startup
    checkUpdatesOnLaunch: boolean;

    // File Manager
    showHiddenFiles: boolean;
    confirmBeforeDelete: boolean;

    // Logs
    defaultLogLevel: 'V' | 'D' | 'I' | 'W' | 'E';

    // Terminal
    maxCommandHistory: number;
}

interface SettingsState extends AppSettings {
    // Actions
    setSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
    resetSettings: () => void;
}

const defaultSettings: AppSettings = {
    // Startup
    checkUpdatesOnLaunch: true,

    // File Manager
    showHiddenFiles: false,
    confirmBeforeDelete: true,

    // Logs
    defaultLogLevel: 'V',

    // Terminal
    maxCommandHistory: 100,
};

export const useSettingsStore = create<SettingsState>()(
    persist(
        (set) => ({
            ...defaultSettings,

            setSetting: (key, value) => set({ [key]: value }),

            resetSettings: () => set(defaultSettings),
        }),
        {
            name: "green-bot-settings",
            storage: createJSONStorage(() => localStorage),
        }
    )
);
