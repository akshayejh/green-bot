import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsCardProps {
    icon?: LucideIcon;
    title?: string;
    description?: string;
    children?: ReactNode;
    className?: string;
    /** Variant style for the card */
    variant?: "default" | "muted" | "accent" | "highlight";
    /** Whether to show the icon in a colored background */
    iconVariant?: "muted" | "primary";
    /** Custom action element in the header */
    action?: ReactNode;
}

const variantClasses = {
    default: "border bg-card",
    muted: "border-none bg-muted/50",
    accent: "border-primary/50 bg-primary/5",
    highlight: "border-2 border-primary bg-primary/5",
};

/**
 * A card component for settings sections.
 * Provides consistent styling for grouping related settings.
 * 
 * @example
 * ```tsx
 * <SettingsCard
 *   icon={Palette}
 *   title="Appearance"
 *   description="Customize how the app looks."
 * >
 *   <SettingsSwitchItem ... />
 * </SettingsCard>
 * ```
 */
export function SettingsCard({
    icon: Icon,
    title,
    description,
    children,
    className,
    variant = "default",
    iconVariant = "muted",
    action,
}: SettingsCardProps) {
    const hasHeader = title || description || Icon;
    const hasChildren = children !== undefined && children !== null;

    return (
        <div className={cn(
            "rounded-xl p-5",
            variantClasses[variant],
            className
        )}>
            {hasHeader && (
                <div className={cn(
                    "flex items-start gap-3",
                    hasChildren && "mb-5"
                )}>
                    {Icon && (
                        <div className={cn(
                            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                            iconVariant === "primary"
                                ? "bg-primary/10 text-primary"
                                : "bg-muted text-muted-foreground"
                        )}>
                            <Icon className="h-4.5 w-4.5" />
                        </div>
                    )}
                    <div className="flex-1 pt-0.5 min-w-0">
                        {title && (
                            <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                        )}
                        {description && (
                            <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                        )}
                    </div>
                    {action && (
                        <div className="shrink-0">
                            {action}
                        </div>
                    )}
                </div>
            )}
            {hasChildren && (
                <div className={cn(
                    "space-y-4",
                    hasHeader && Icon && "pl-12"
                )}>
                    {children}
                </div>
            )}
        </div>
    );
}
