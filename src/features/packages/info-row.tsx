import { LucideIcon, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface InfoRowProps {
    label: string;
    value: string | undefined | null;
    icon?: LucideIcon;
    className?: string; // allow grid spanning or other overrides
    mono?: boolean;
    copyable?: boolean;
}

export function InfoRow({ label, value, icon: Icon, className, mono = true, copyable = true }: InfoRowProps) {
    if (!value) return null;

    const handleCopy = () => {
        navigator.clipboard.writeText(value);
        toast.success(`${label} copied to clipboard`);
    };

    return (
        <div className={`space-y-1.5 ${className} border rounded-lg p-3 bg-muted/10 group relative`}>
            <div className="flex items-center gap-2 text-muted-foreground">
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span className="text-[10px] uppercase tracking-wide font-medium text-opacity-80">{label}</span>
            </div>
            <div className={`text-xs font-medium text-foreground truncate pr-6 ${mono ? 'font-mono' : ''}`} title={value}>
                {value}
            </div>
            {copyable && (
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-5 w-5 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    <Copy className="w-3 h-3 text-muted-foreground" />
                </Button>
            )}
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
