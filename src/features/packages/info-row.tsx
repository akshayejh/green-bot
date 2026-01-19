import { LucideIcon } from "lucide-react";

interface InfoRowProps {
    label: string;
    value: string | undefined | null;
    icon?: LucideIcon;
    className?: string; // allow grid spanning or other overrides
    mono?: boolean;
}

export function InfoRow({ label, value, icon: Icon, className, mono = true }: InfoRowProps) {
    if (!value) return null;

    return (
        <div className={`space-y-1.5 ${className} border rounded-lg p-3 bg-muted/10`}>
            <div className="flex items-center gap-2 text-muted-foreground">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="text-[10px] uppercase tracking-wide font-medium text-opacity-80">{label}</span>
            </div>
            <div className={`text-xs font-medium text-foreground truncate ${mono ? 'font-mono' : ''}`} title={value}>
                {value}
            </div>
        </div>
    );
}

interface InfoGridProps {
    children: React.ReactNode;
}

export function InfoGrid({ children }: InfoGridProps) {
    return (
        <div className="grid grid-cols-2 gap-y-6 gap-x-6">
            {children}
        </div>
    );
}
