import { memo } from "react";
import { formatAppName } from "./utils";
import { PackageIcon } from "./package-icon";
import { AppPackage } from "./types";

interface PackageListItemProps {
    pkg: AppPackage;
    isSelected: boolean;
    onClick: (pkg: AppPackage) => void;
}

export const PackageListItem = memo(function PackageListItem({ pkg, isSelected, onClick }: PackageListItemProps) {
    return (
        <button
            onClick={() => onClick(pkg)}
            className={`flex items-center text-left p-3 rounded-md transition-colors w-full ${isSelected
                ? "bg-muted text-accent-foreground shadow-sm"
                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                } ${!pkg.is_enabled ? 'opacity-70 grayscale-[0.3]' : ''}`}
        >
            <div className="relative mr-3">
                <PackageIcon isSystem={pkg.is_system} disabled={!pkg.is_enabled} className={`w-10 h-10 text-base transition-opacity ${isSelected ? 'opacity-100' : 'opacity-70 group-hover:opacity-100'}`} />
            </div>
            <div className="min-w-0 flex-1">
                <div className="font-semibold text-sm tracking-tight text-foreground/90 truncate">
                    {formatAppName(pkg.package_id)}
                </div>
                <div className="text-[10px] opacity-70 truncate font-mono flex items-center gap-2">
                    {pkg.package_id}
                    {!pkg.is_enabled && <span className="bg-muted text-[9px] text font-medium uppercase tracking-wider border px-2 py-1 rounded-lg">Disabled</span>}
                </div>
            </div>
        </button>
    );
});
