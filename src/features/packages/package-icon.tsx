import { HardDrive, Package } from "lucide-react";

interface PackageIconProps {
    isSystem: boolean;
    disabled?: boolean;
    className?: string; // allow overriding size/container styles
}

export function PackageIcon({ isSystem, disabled, className }: PackageIconProps) {
    return (
        <div className={`shrink-0 flex items-center justify-center rounded-full transition-colors ${disabled ? 'bg-muted text-muted-foreground' :
            isSystem
                ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-800'
                : 'bg-green-100 text-green-600 dark:bg-green-900/30'
            } ${className}`}>
            {isSystem ? (
                <HardDrive className="w-[50%] h-[50%]" />
            ) : (
                <Package className="w-[50%] h-[50%]" />
            )}
        </div>
    );
}
