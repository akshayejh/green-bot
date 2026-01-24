import { ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface SettingsItemProps {
    label: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function SettingsItem({
    label,
    description,
    children,
    className
}: SettingsItemProps) {
    return (
        <div className={cn("flex items-center justify-between gap-4", className)}>
            <div className="space-y-0.5 min-w-0 flex-1">
                <Label className="text-sm font-medium">{label}</Label>
                {description && (
                    <p className="text-xs text-muted-foreground">{description}</p>
                )}
            </div>
            <div className="shrink-0">
                {children}
            </div>
        </div>
    );
}
