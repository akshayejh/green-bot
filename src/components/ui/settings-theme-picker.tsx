import { cn } from "@/lib/utils";

/**
 * Light theme preview illustration.
 */
function LightPreview() {
    return (
        <div className="h-16 w-24 rounded-lg bg-zinc-100 p-1.5 flex gap-1.5 border border-zinc-200 shadow-sm pointer-events-none">
            <div className="w-1/3 h-full rounded-sm bg-white border border-zinc-200/50" />
            <div className="flex-1 h-full rounded-sm bg-white border border-zinc-200/50 flex flex-col gap-1.5 p-1.5">
                <div className="h-1.5 w-full rounded-sm bg-zinc-100" />
                <div className="h-1.5 w-2/3 rounded-sm bg-zinc-100" />
            </div>
        </div>
    );
}

/**
 * Dark theme preview illustration.
 */
function DarkPreview() {
    return (
        <div className="h-16 w-24 rounded-lg bg-zinc-950 p-1.5 flex gap-1.5 border border-zinc-800 shadow-sm pointer-events-none">
            <div className="w-1/3 h-full rounded-sm bg-zinc-900 border border-zinc-800" />
            <div className="flex-1 h-full rounded-sm bg-zinc-900 border border-zinc-800 flex flex-col gap-1.5 p-1.5">
                <div className="h-1.5 w-full rounded-sm bg-zinc-800" />
                <div className="h-1.5 w-2/3 rounded-sm bg-zinc-800" />
            </div>
        </div>
    );
}

/**
 * System theme preview illustration (split light/dark).
 */
function SystemPreview() {
    return (
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
    );
}

type Theme = "light" | "dark" | "system";

interface SettingsThemePickerProps {
    value: Theme;
    onChange: (theme: Theme) => void;
    className?: string;
}

/**
 * A theme picker component with visual previews for light, dark, and system themes.
 * 
 * @example
 * ```tsx
 * <SettingsThemePicker
 *   value={theme}
 *   onChange={setTheme}
 * />
 * ```
 */
export function SettingsThemePicker({
    value,
    onChange,
    className,
}: SettingsThemePickerProps) {
    // Import icons inline to avoid circular dependencies
    const Sun = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2" />
            <path d="M12 20v2" />
            <path d="m4.93 4.93 1.41 1.41" />
            <path d="m17.66 17.66 1.41 1.41" />
            <path d="M2 12h2" />
            <path d="M20 12h2" />
            <path d="m6.34 17.66-1.41 1.41" />
            <path d="m19.07 4.93-1.41 1.41" />
        </svg>
    );

    const Moon = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
        </svg>
    );

    const Laptop = ({ className }: { className?: string }) => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16" />
        </svg>
    );

    return (
        <div className={cn("grid grid-cols-3 gap-4", className)}>
            <button
                onClick={() => onChange("light")}
                className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    value === "light" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                )}
            >
                <LightPreview />
                <span className="font-medium text-sm flex items-center gap-2">
                    <Sun className="h-4 w-4" /> Light
                </span>
            </button>
            <button
                onClick={() => onChange("dark")}
                className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    value === "dark" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                )}
            >
                <DarkPreview />
                <span className="font-medium text-sm flex items-center gap-2">
                    <Moon className="h-4 w-4" /> Dark
                </span>
            </button>
            <button
                onClick={() => onChange("system")}
                className={cn(
                    "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all hover:bg-accent hover:border-accent-foreground/10 outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    value === "system" ? "border-primary bg-primary/5" : "border-muted bg-transparent"
                )}
            >
                <SystemPreview />
                <span className="font-medium text-sm flex items-center gap-2">
                    <Laptop className="h-4 w-4" /> System
                </span>
            </button>
        </div>
    );
}
