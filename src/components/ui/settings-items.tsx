import { ReactNode } from "react";
import { LucideIcon, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SettingsItem } from "./settings-item";
import { cn } from "@/lib/utils";

interface SettingsButtonItemProps {
    label: string;
    description?: string;
    icon?: LucideIcon;
    onClick: () => void;
    buttonLabel?: string;
    buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
    disabled?: boolean;
    loading?: boolean;
    className?: string;
}

/**
 * A settings item with a button action.
 * 
 * @example
 * ```tsx
 * <SettingsButtonItem
 *   label="Check for updates"
 *   description="See if a new version is available."
 *   icon={RefreshCw}
 *   onClick={handleCheck}
 *   buttonLabel="Check Now"
 * />
 * ```
 */
export function SettingsButtonItem({
    label,
    description,
    icon: Icon,
    onClick,
    buttonLabel = "Action",
    buttonVariant = "outline",
    disabled,
    loading,
    className,
}: SettingsButtonItemProps) {
    return (
        <SettingsItem label={label} description={description} className={className}>
            <Button
                variant={buttonVariant}
                size="sm"
                onClick={onClick}
                disabled={disabled || loading}
                className="gap-2"
            >
                {Icon && <Icon className={cn("h-4 w-4", loading && "animate-spin")} />}
                {buttonLabel}
            </Button>
        </SettingsItem>
    );
}

interface SettingsLinkItemProps {
    label: string;
    description?: string;
    icon?: LucideIcon;
    onClick: () => void;
    className?: string;
}

/**
 * A settings item that looks like a clickable row with a chevron.
 * Useful for navigation or opening dialogs.
 * 
 * @example
 * ```tsx
 * <SettingsLinkItem
 *   label="Keyboard Shortcuts"
 *   description="View and customize shortcuts."
 *   icon={Keyboard}
 *   onClick={() => setShortcutsOpen(true)}
 * />
 * ```
 */
export function SettingsLinkItem({
    label,
    description,
    icon: Icon,
    onClick,
    className,
}: SettingsLinkItemProps) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-3 p-3 -mx-3 rounded-lg transition-colors hover:bg-muted/50 text-left group",
                className
            )}
        >
            {Icon && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <Icon className="h-4 w-4" />
                </div>
            )}
            <div className="flex-1 min-w-0">
                <div className="text-sm font-medium">{label}</div>
                {description && (
                    <div className="text-xs text-muted-foreground">{description}</div>
                )}
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </button>
    );
}

interface SettingsValueItemProps {
    label: string;
    description?: string;
    value: ReactNode;
    className?: string;
}

/**
 * A settings item that displays a read-only value.
 * 
 * @example
 * ```tsx
 * <SettingsValueItem
 *   label="Current Version"
 *   value="v1.2.3"
 * />
 * ```
 */
export function SettingsValueItem({
    label,
    description,
    value,
    className,
}: SettingsValueItemProps) {
    return (
        <SettingsItem label={label} description={description} className={className}>
            <div className="text-sm text-muted-foreground font-mono">
                {value}
            </div>
        </SettingsItem>
    );
}
