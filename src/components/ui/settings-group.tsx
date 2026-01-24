import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SettingsGroupProps {
    title?: string;
    children: ReactNode;
    className?: string;
}

/**
 * A simple grouping component for settings items without a card wrapper.
 * Useful for inline grouping within a card or standalone sections.
 * 
 * @example
 * ```tsx
 * <SettingsGroup title="Privacy">
 *   <SettingsSwitchItem ... />
 *   <SettingsSwitchItem ... />
 * </SettingsGroup>
 * ```
 */
export function SettingsGroup({
    title,
    children,
    className,
}: SettingsGroupProps) {
    return (
        <div className={cn("space-y-4", className)}>
            {title && (
                <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
            )}
            <div className="space-y-3">
                {children}
            </div>
        </div>
    );
}
