import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface SettingsSectionProps {
    icon?: LucideIcon;
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export function SettingsSection({
    icon: Icon,
    title,
    description,
    children,
    className
}: SettingsSectionProps) {
    return (
        <div className={cn("rounded-xl border bg-card p-5", className)}>
            <div className="flex items-start gap-3">
                {Icon && (
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                        <Icon className="h-4.5 w-4.5 text-muted-foreground" />
                    </div>
                )}
                <div className="flex-1 pt-0.5">
                    <h3 className="text-base font-semibold tracking-tight">{title}</h3>
                    {description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                    )}
                </div>
            </div>
            <div className={cn("mt-5 space-y-4", Icon && "pl-12")}>
                {children}
            </div>
        </div>
    );
}
