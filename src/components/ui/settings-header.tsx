import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsHeaderProps {
    title: string;
    description?: string;
    children?: ReactNode;
    className?: string;
}

/**
 * A header component for settings pages.
 * Displays a title and optional description.
 * 
 * @example
 * ```tsx
 * <SettingsHeader
 *   title="General"
 *   description="Configure general app settings."
 * />
 * ```
 */
export function SettingsHeader({
    title,
    description,
    children,
    className,
}: SettingsHeaderProps) {
    return (
        <div className={cn("mb-4", className)}>
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
                    {description && (
                        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
                    )}
                </div>
                {children && (
                    <div className="shrink-0">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
