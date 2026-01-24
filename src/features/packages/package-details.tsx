import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Copy, X, Database, Calendar, Shield, Trash2, Play, StopCircle, Eraser, Power, Loader2 } from "lucide-react";
import { AppPackage, PackageDetails } from "./types";
import { formatAppName } from "./utils";
import { PackageIcon } from "./package-icon";
import { InfoRow, InfoGrid } from "./info-row";
import { toast } from "sonner";

interface PackageDetailsPanelProps {
    pkg: AppPackage;
    details: PackageDetails | null;
    loading: boolean;
    onClose: () => void;
    onUninstall: () => void;
    onAction: (action: 'launch' | 'force-stop' | 'clear-data' | 'toggle-enable') => void;
    actionLoading: string | null;
    uninstallError?: string | null;
}

export function PackageDetailsPanel({ pkg, details, loading, onClose, onUninstall, onAction, actionLoading, uninstallError }: PackageDetailsPanelProps) {
    const [activeTab, setActiveTab] = useState<'overview' | 'permissions'>('overview');

    return (
        <div className="w-[400px] bg-background flex flex-col h-full shadow-2xl relative z-10">
            {/* Header */}
            <div className="flex flex-col border-b bg-muted/5">
                <div className="flex items-center justify-between p-4 pb-2">
                    <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border-zinc-200 dark:border-zinc-800 px-2 py-1 rounded-md bg-zinc-100/50 dark:bg-zinc-900">
                        {pkg.is_system ? 'System Package' : 'User Package'}
                    </div>
                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-muted" onClick={onClose}>
                        <X className="w-4 h-4" />
                    </Button>
                </div>

                <div className="px-6 pb-6 pt-2 flex items-start gap-4">
                    <PackageIcon isSystem={pkg.is_system} className="w-14 h-14 text-xl rounded-xl" />
                    <div className="min-w-0 flex-1 space-y-1 pt-0.5">
                        <h2 className="font-bold text-lg leading-tight text-foreground">{formatAppName(pkg.package_id)}</h2>
                        <div className="flex items-center gap-2 group">
                            <p className="text-xs font-mono text-muted-foreground truncate select-all">{pkg.package_id}</p>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => {
                                    navigator.clipboard.writeText(pkg.package_id);
                                    toast.success("Package name copied to clipboard");
                                }}
                            >
                                <Copy className="w-2.5 h-2.5 text-muted-foreground" />
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {loading ? (
                    <div className="p-8 space-y-8" >
                        {/* <div className="space-y-4">
                            <Skeleton className="h-3 w-20 opacity-50" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-10 w-full rounded opacity-30" />
                                <Skeleton className="h-10 w-full rounded opacity-30" />
                                <Skeleton className="h-10 w-full rounded opacity-30" />
                                <Skeleton className="h-10 w-full rounded opacity-30" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-3 w-24 opacity-50" />
                            <div className="grid grid-cols-2 gap-4">
                                <Skeleton className="h-12 w-full rounded opacity-30" />
                                <Skeleton className="h-12 w-full rounded opacity-30" />
                            </div>
                        </div> */}
                    </div>
                ) : details ? (
                    <div className="w-full h-full flex flex-col">
                        <div className="bg-background sticky top-0 z-10 border-b p-2">
                            <div className="grid grid-cols-2 relative bg-zinc-100/80 dark:bg-zinc-900/50 rounded-lg p-2 isolate">
                                <div
                                    className={`absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-background rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/5 ${activeTab === 'overview' ? 'left-1' : 'left-1 translate-x-full'
                                        }`}
                                />
                                <button
                                    onClick={() => setActiveTab('overview')}
                                    className={`h-8 text-xs font-medium relative z-10 rounded-md ${activeTab === 'overview'
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Overview
                                </button>
                                <button
                                    onClick={() => setActiveTab('permissions')}
                                    className={`h-8 text-xs font-medium relative z-10 flex items-center justify-center gap-2 rounded-md ${activeTab === 'permissions'
                                        ? 'text-foreground'
                                        : 'text-muted-foreground hover:text-foreground'
                                        }`}
                                >
                                    Permissions
                                    <Badge variant="secondary" className="h-4 px-1.5 text-[9px] min-w-4 text-center bg-muted/50 border-0">
                                        {details.permissions?.length || 0}
                                    </Badge>
                                </button>
                            </div>
                        </div>

                        {activeTab === 'overview' && (
                            <div className="flex-1">
                                <div className="p-6 px-4 space-y-8">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Metadata</h3>
                                        <InfoGrid>
                                            <InfoRow label="Version" value={details.version_name || "Unknown"} />
                                            <InfoRow label="Build Code" value={details.version_code || "0"} />
                                            <InfoRow label="Target SDK" value={details.target_sdk || "-"} />
                                            <InfoRow label="Min SDK" value={details.min_sdk || "-"} />
                                            <InfoRow label="Disk Size" value={details.size} />
                                            <InfoRow label="UID" value={details.uid} />
                                        </InfoGrid>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Timeline</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <InfoRow
                                                label="Installer"
                                                value={details.installer || "System / Manual"}
                                                icon={Database}
                                                mono={false}
                                            />
                                            <InfoRow
                                                label="Installed"
                                                value={details.first_install_time?.split(' ')[0] || "-"}
                                                icon={Calendar}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <Label className="text-[10px] text-muted-foreground uppercase mb-1.5 block">Package Path</Label>
                                            <div className="text-[10px] font-mono bg-zinc-950 text-zinc-400 p-2.5 rounded border border-zinc-900 shadow-inner break-all relative group pr-8">
                                                {details.path}
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-5 w-5 absolute right-1.5 top-1.5 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-zinc-800"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(details.path);
                                                        toast.success("Package path copied to clipboard");
                                                    }}
                                                >
                                                    <Copy className="w-3 h-3 text-zinc-500" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'permissions' && (
                            <div className="flex-1 overflow-y-auto">
                                {details.permissions.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-48 text-muted-foreground p-8">
                                        <Shield className="w-8 h-8 mb-3 opacity-20" />
                                        <p className="text-sm">No permissions requested</p>
                                        <p className="text-xs opacity-60 mt-1">This app does not require any special access.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 divide-y">
                                        {details.permissions.map((p, i) => (
                                            <div key={i} className="px-3 py-3 flex items-start gap-3 hover:bg-muted/30 transition-colors group relative">
                                                <div className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors shrink-0" />
                                                <div className="text-xs font-mono text-foreground/90 break-all leading-relaxed flex-1 pr-6">
                                                    {p.replace(/^android\.permission\./, '')}
                                                    <div className="text-[10px] text-muted-foreground opacity-40 group-hover:opacity-100 transition-opacity">
                                                        {p}
                                                    </div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-6 w-6 absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    onClick={() => {
                                                        navigator.clipboard.writeText(p);
                                                        toast.success("Permission name copied");
                                                    }}
                                                >
                                                    <Copy className="w-3 h-3 text-muted-foreground" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                ) : null}
            </div>

            {/* Footer */}
            <div className="p-4 border-t bg-muted/5 space-y-3">
                {uninstallError && (
                    <div className="flex items-start gap-2 p-3 text-xs bg-destructive/10 text-destructive rounded-md border border-destructive/20">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <div className="flex-1 font-medium break-all">{uninstallError}</div>
                    </div>
                )}

                <div className="grid grid-cols-4 gap-2">
                    <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 text-[10px]" onClick={() => onAction('launch')} disabled={!!actionLoading}>
                        {actionLoading === 'launch' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-green-600" />}
                        Launch
                    </Button>
                    <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 text-[10px]" onClick={() => onAction('force-stop')} disabled={!!actionLoading}>
                        {actionLoading === 'force-stop' ? <Loader2 className="w-4 h-4 animate-spin" /> : <StopCircle className="w-4 h-4 text-orange-600" />}
                        Force Stop
                    </Button>
                    <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 text-[10px]" onClick={() => onAction('clear-data')} disabled={!!actionLoading}>
                        {actionLoading === 'clear-data' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Eraser className="w-4 h-4 text-rose-600" />}
                        Clear Data
                    </Button>
                    <Button variant="outline" size="sm" className="h-14 flex flex-col gap-1 text-[10px]" onClick={() => onAction('toggle-enable')} disabled={!!actionLoading}>
                        {actionLoading === 'toggle-enable' ? <Loader2 className="w-4 h-4 animate-spin" /> :
                            (details?.is_enabled ? <Power className="w-4 h-4 text-red-500" /> : <Power className="w-4 h-4 text-green-500" />)
                        }
                        {details?.is_enabled ? 'Disable' : 'Enable'}
                    </Button>
                </div>

                <Button
                    variant="destructive"
                    className="w-full h-9 text-xs font-semibold shadow-sm hover:shadow-md transition-all"
                    onClick={onUninstall}
                    disabled={pkg.is_system}
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    Uninstall Package
                </Button>
            </div>
        </div>
    );
}

