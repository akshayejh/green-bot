import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { RefreshCw, Smartphone, Check, Plus, Wifi, Cpu, Layers, Settings, Tablet, Tv, Watch, Monitor, Laptop, Car, Gamepad, Glasses, Box, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { useDeviceStore } from "@/store/device-store";
import { Toolbar, ToolbarLeft, ToolbarRight } from "@/components/toolbar";
import { AddDeviceDialog } from "@/components/add-device-dialog";
import { DeviceEditDialog } from "@/components/device-edit-dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const ICONS = {
    smartphone: Smartphone,
    tablet: Tablet,
    tv: Tv,
    watch: Watch,
    monitor: Monitor,
    laptop: Laptop,
    car: Car,
    gamepad: Gamepad,
    glasses: Glasses,
    box: Box,
};

const COLORS: Record<string, string> = {
    blue: "from-blue-500 via-blue-400 to-blue-300",
    sidebar: "from-sidebar-primary via-sidebar-primary/80 to-sidebar-primary/60",
    purple: "from-purple-500 via-purple-400 to-purple-300",
    green: "from-emerald-500 via-emerald-400 to-emerald-300",
    amber: "from-amber-500 via-amber-400 to-amber-300",
    rose: "from-rose-500 via-rose-400 to-rose-300",
    slate: "from-slate-600 via-slate-500 to-slate-400",
};

export function DeviceList() {
    const devices = useDeviceStore((state) => state.devices);
    const loading = useDeviceStore((state) => state.loading);
    const error = useDeviceStore((state) => state.error);
    const refreshDevices = useDeviceStore((state) => state.refreshDevices);
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const setSelectedSerial = useDeviceStore((state) => state.setSelectedSerial);
    const deviceMetadata = useDeviceStore((state) => state.deviceMetadata);

    const [addDialogOpen, setAddDialogOpen] = useState(false);
    const [editSerial, setEditSerial] = useState<string | null>(null);

    const handleDeviceAdded = () => {
        refreshDevices();
        setAddDialogOpen(false);
    };

    return (
        <div className="flex flex-col h-full bg-background/50">
            <AddDeviceDialog
                open={addDialogOpen}
                onOpenChange={setAddDialogOpen}
                onSuccess={handleDeviceAdded}
            />

            {editSerial && (
                <DeviceEditDialog
                    serial={editSerial}
                    open={!!editSerial}
                    onOpenChange={(open) => !open && setEditSerial(null)}
                />
            )}

            <Toolbar className="bg-transparent px-3">
                <ToolbarLeft>
                    <div>
                        Connected Devices
                    </div>
                </ToolbarLeft>
                <ToolbarRight>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshDevices}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                        Refresh
                    </Button>
                    <Button
                        size="sm"
                        onClick={() => setAddDialogOpen(true)}
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Device
                    </Button>
                </ToolbarRight>
            </Toolbar>

            <div className="flex-1 p-6 overflow-y-auto">

                {error ? (
                    <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive flex items-center gap-2 mb-6">
                        <span className="font-semibold">Error:</span> {error}
                    </div>
                ) : null}

                <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                    {loading && devices.length === 0
                        ? Array(3)
                            .fill(0)
                            .map((_, i) => (
                                <div key={i} className="flex flex-col gap-4 border p-5 rounded-xl bg-card/50">
                                    <div className="flex items-center gap-4">
                                        <Skeleton className="h-12 w-12 rounded-lg" />
                                        <div className="space-y-2 flex-1">
                                            <Skeleton className="h-4 w-1/2" />
                                            <Skeleton className="h-3 w-1/3" />
                                        </div>
                                    </div>
                                    <div className="space-y-2 pt-2">
                                        <Skeleton className="h-3 w-full" />
                                        <Skeleton className="h-3 w-2/3" />
                                    </div>
                                </div>
                            ))
                        : devices.map((device) => {
                            const isSelected = device.serial === selectedSerial;
                            const isWifi = device.serial.includes(":");
                            const metadata = deviceMetadata[device.serial] || {};

                            const DeviceIcon = ICONS[metadata.icon as keyof typeof ICONS] || (isWifi ? Wifi : Smartphone);
                            const iconColorClass = COLORS[metadata.color as keyof typeof COLORS] || COLORS.sidebar;
                            const displayName = metadata.label || device.model || "Unknown Device";

                            return (
                                <div
                                    key={device.serial}
                                    onClick={() => setSelectedSerial(device.serial)}
                                    className={cn(
                                        "group relative flex flex-col rounded-xl border p-3 transition-all duration-300 cursor-pointer overflow-hidden",
                                        isSelected
                                            ? "bg-gradient-to-br from-primary/5 via-primary/5 to-transparent border-primary/50 shadow-[0_0_20px_-12px_rgba(0,0,0,0.2)] dark:shadow-[0_0_20px_-12px_rgba(255,255,255,0.1)] ring-1 ring-primary/20"
                                            : "bg-card hover:bg-accent/5 hover:border-accent-foreground/10 hover:shadow-md"
                                    )}
                                >
                                    {/* Selection Checkmark */}
                                    <div className={cn(
                                        "absolute top-3 right-3 h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 z-10",
                                        isSelected
                                            ? "bg-primary text-primary-foreground scale-100 opacity-100"
                                            : "bg-muted text-transparent scale-90 opacity-0"
                                    )}>
                                        <Check className="h-3 w-3" />
                                    </div>

                                    {/* Edit Button */}
                                    <div className="absolute top-3 right-10 z-20 group-hover:opacity-100 transition-opacity">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 rounded-full bg-background/50 backdrop-blur-sm hover:bg-background shadow-sm border border-transparent hover:border-border/50">
                                                    <MoreVertical className="h-3.5 w-3.5" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setEditSerial(device.serial); }}>
                                                    <Settings className="mr-2 h-3.5 w-3.5" />
                                                    Customize Device
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="flex items-start gap-4 mb-4">
                                        {/* Glossy Icon */}
                                        <div className={cn(
                                            "relative flex items-center justify-center h-12 w-12 shrink-0 overflow-hidden rounded-md",
                                            "bg-gradient-to-br",
                                            iconColorClass,
                                            "transition-all duration-500 group-hover:scale-105 group-hover:rotate-1",
                                            "border border-white/20 shadow-sm"
                                        )}>
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-black/10 pointer-events-none" />
                                            <div className="absolute inset-0 shadow-[inset_0_0_2px_1px_rgba(255,255,255,0.2)] pointer-events-none rounded-md" />

                                            <DeviceIcon className="h-6 w-6 relative z-10 text-black drop-shadow-sm" />

                                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-60 pointer-events-none" />
                                        </div>

                                        <div className="flex-1 min-w-0 pt-0.5">
                                            <h3 className="font-semibold text-base truncate pr-6" title={displayName}>
                                                {displayName}
                                            </h3>
                                            <p className="text-xs text-muted-foreground font-mono flex items-center gap-1.5 mt-1">
                                                <span className="truncate">{device.serial}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 mt-auto pt-3 border-t border-border/50">
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-medium text-muted-foreground flex items-center gap-1">
                                                <Layers className="h-3 w-3" />
                                                Product
                                            </span>
                                            <p className="text-xs font-medium truncate" title={device.product}>
                                                {device.product || "N/A"}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <span className="text-[10px] uppercase font-medium text-muted-foreground flex items-center gap-1">
                                                <Cpu className="h-3 w-3" />
                                                Statue
                                            </span>
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "h-1.5 w-1.5 rounded-full",
                                                    device.state === 'device' ? "bg-green-500 shadow-[0_0_8px_1px_rgba(34,197,94,0.4)]" : "bg-yellow-500"
                                                )} />
                                                <span className={cn(
                                                    "text-xs font-medium",
                                                    device.state === 'device' ? "text-green-600 dark:text-green-400" : "text-yellow-600 dark:text-yellow-400"
                                                )}>
                                                    {device.state === 'device' ? "Online" : device.state}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    {
                        !loading && devices.length === 0 && !error && (
                            <div className="col-span-full flex flex-col items-center justify-center py-20 text-center space-y-4 border rounded-2xl bg-muted/20 border-border/50 border-dashed">
                                <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                                    <Smartphone className="h-8 w-8 text-muted-foreground/50" />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="font-semibold text-lg">No devices connected</h3>
                                    <p className="text-muted-foreground max-w-sm mx-auto">
                                        Plug in a device via USB or connect wirelessly to get started.
                                    </p>
                                </div>
                                <Button onClick={() => setAddDialogOpen(true)} variant="outline" className="mt-4">
                                    <Plus className="h-4 w-4" />
                                    Connect Device
                                </Button>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
}
