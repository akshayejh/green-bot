import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useDeviceStore } from "@/store/device-store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
    SettingsHeader,
    SettingsCard,
    SettingsValueItem,
} from "@/components/ui/settings";
import {
    Smartphone,
    Cpu,
    Battery,
    HardDrive,
    Monitor,
    Wifi,
    Wrench,
    RefreshCw,
    Copy,
    Check,
    MemoryStick,
    CircuitBoard,
    Shield,
} from "lucide-react";
import { toast } from "sonner";

interface DeviceInfo {
    // System
    android_version: string | null;
    sdk_version: string | null;
    security_patch: string | null;
    build_id: string | null;
    build_fingerprint: string | null;

    // Hardware
    manufacturer: string | null;
    brand: string | null;
    model: string | null;
    device: string | null;
    hardware: string | null;
    board: string | null;
    platform: string | null;
    cpu_abi: string | null;

    // Display
    screen_resolution: string | null;
    screen_density: string | null;

    // Network
    wifi_mac: string | null;
    bluetooth_mac: string | null;
    serial_number: string | null;

    // Build
    bootloader: string | null;
    baseband: string | null;
    kernel_version: string | null;
    build_type: string | null;
    build_tags: string | null;

    // Battery
    battery_level: string | null;
    battery_status: string | null;
    battery_health: string | null;
    battery_temperature: string | null;

    // Storage
    internal_storage: string | null;
    available_storage: string | null;

    // Memory
    total_ram: string | null;
    available_ram: string | null;
}

type TabId = "system" | "hardware" | "battery" | "storage" | "network" | "build";

const tabs: { id: TabId; label: string; description: string; icon: typeof Smartphone }[] = [
    { id: "system", label: "System", description: "OS and software info", icon: Smartphone },
    { id: "hardware", label: "Hardware", description: "Device specifications", icon: Cpu },
    { id: "battery", label: "Battery", description: "Power and charging", icon: Battery },
    { id: "storage", label: "Storage", description: "Disk and memory", icon: HardDrive },
    { id: "network", label: "Network", description: "Connectivity info", icon: Wifi },
    { id: "build", label: "Build", description: "Firmware details", icon: Wrench },
];

function InfoValue({ value, copyable = false }: { value: string | null; copyable?: boolean }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        if (value) {
            navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [value]);

    if (!value) {
        return <span className="text-muted-foreground/50 italic">Not available</span>;
    }

    if (copyable) {
        return (
            <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 text-sm text-muted-foreground font-mono hover:text-foreground transition-colors group"
            >
                <span className="truncate max-w-[200px]" title={value}>{value}</span>
                {copied ? (
                    <Check className="h-3 w-3 text-green-500 shrink-0" />
                ) : (
                    <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                )}
            </button>
        );
    }

    return <span className="text-sm text-muted-foreground font-mono truncate" title={value}>{value}</span>;
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-xl border p-5 space-y-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-1.5">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="space-y-3 pt-2">
                        {[1, 2, 3].map((j) => (
                            <div key={j} className="flex justify-between">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-32" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}

function NoDeviceState() {
    return (
        <div className="flex flex-col items-center justify-center h-full text-center space-y-4 p-8">
            <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Smartphone className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">No device selected</h3>
                <p className="text-muted-foreground max-w-sm">
                    Select a connected device to view its detailed information.
                </p>
            </div>
        </div>
    );
}

export function DeviceInfoPage() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const devices = useDeviceStore((state) => state.devices);
    const deviceMetadata = useDeviceStore((state) => state.deviceMetadata);

    const [activeTab, setActiveTab] = useState<TabId>("system");
    const [info, setInfo] = useState<DeviceInfo | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedDevice = devices.find((d) => d.serial === selectedSerial);
    const metadata = selectedSerial ? deviceMetadata[selectedSerial] : null;
    const displayName = metadata?.label || selectedDevice?.model || "Device";

    const fetchDeviceInfo = useCallback(async () => {
        if (!selectedSerial) return;

        setLoading(true);
        setError(null);

        try {
            const result = await invoke<DeviceInfo>("get_device_info", {
                serial: selectedSerial,
            });
            setInfo(result);
        } catch (err) {
            setError(String(err));
            toast.error("Failed to fetch device info");
        } finally {
            setLoading(false);
        }
    }, [selectedSerial]);

    useEffect(() => {
        if (selectedSerial) {
            fetchDeviceInfo();
        } else {
            setInfo(null);
        }
    }, [selectedSerial, fetchDeviceInfo]);

    if (!selectedSerial) {
        return <NoDeviceState />;
    }

    const renderTabContent = () => {
        if (loading) {
            return <LoadingState />;
        }

        if (error) {
            return (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
                    <div className="p-4 rounded-full bg-destructive/10">
                        <Smartphone className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Failed to load device info</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
                    </div>
                    <Button variant="outline" onClick={fetchDeviceInfo}>
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </Button>
                </div>
            );
        }

        if (!info) return null;

        switch (activeTab) {
            case "system":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="System Information"
                            description="Operating system and software details."
                        />
                        <SettingsCard icon={Smartphone} title="Android" description="Operating system version and security info.">
                            <SettingsValueItem label="Android Version" value={<InfoValue value={info.android_version} />} />
                            <SettingsValueItem label="SDK / API Level" value={<InfoValue value={info.sdk_version} />} />
                            <SettingsValueItem label="Security Patch" value={<InfoValue value={info.security_patch} />} />
                            <SettingsValueItem label="Build ID" value={<InfoValue value={info.build_id} copyable />} />
                        </SettingsCard>
                        <SettingsCard icon={Shield} title="Identity" description="Device identifiers.">
                            <SettingsValueItem label="Serial Number" value={<InfoValue value={info.serial_number} copyable />} />
                            <SettingsValueItem label="Build Fingerprint" value={<InfoValue value={info.build_fingerprint} copyable />} />
                        </SettingsCard>
                    </div>
                );

            case "hardware":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="Hardware Information"
                            description="Physical device specifications."
                        />
                        <SettingsCard icon={Smartphone} title="Device" description="Manufacturer and model information.">
                            <SettingsValueItem label="Manufacturer" value={<InfoValue value={info.manufacturer} />} />
                            <SettingsValueItem label="Brand" value={<InfoValue value={info.brand} />} />
                            <SettingsValueItem label="Model" value={<InfoValue value={info.model} />} />
                            <SettingsValueItem label="Device" value={<InfoValue value={info.device} />} />
                        </SettingsCard>
                        <SettingsCard icon={CircuitBoard} title="Chipset" description="Processor and architecture.">
                            <SettingsValueItem label="Hardware" value={<InfoValue value={info.hardware} />} />
                            <SettingsValueItem label="Board" value={<InfoValue value={info.board} />} />
                            <SettingsValueItem label="Platform" value={<InfoValue value={info.platform} />} />
                            <SettingsValueItem label="CPU ABI" value={<InfoValue value={info.cpu_abi} />} />
                        </SettingsCard>
                        <SettingsCard icon={Monitor} title="Display" description="Screen specifications.">
                            <SettingsValueItem label="Resolution" value={<InfoValue value={info.screen_resolution} />} />
                            <SettingsValueItem label="Density" value={<InfoValue value={info.screen_density} />} />
                        </SettingsCard>
                    </div>
                );

            case "battery":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="Battery Information"
                            description="Power and charging status."
                        />
                        <SettingsCard icon={Battery} title="Status" description="Current battery state.">
                            <SettingsValueItem
                                label="Level"
                                value={
                                    info.battery_level ? (
                                        <div className="flex items-center gap-2">
                                            <div className="w-16 h-2 rounded-full bg-muted overflow-hidden">
                                                <div
                                                    className={cn(
                                                        "h-full rounded-full transition-all",
                                                        parseInt(info.battery_level) > 20
                                                            ? "bg-green-500"
                                                            : "bg-amber-500"
                                                    )}
                                                    style={{ width: `${info.battery_level}%` }}
                                                />
                                            </div>
                                            <span className="text-sm font-mono text-muted-foreground">
                                                {info.battery_level}%
                                            </span>
                                        </div>
                                    ) : (
                                        <InfoValue value={null} />
                                    )
                                }
                            />
                            <SettingsValueItem label="Status" value={<InfoValue value={info.battery_status} />} />
                            <SettingsValueItem label="Health" value={<InfoValue value={info.battery_health} />} />
                            <SettingsValueItem label="Temperature" value={<InfoValue value={info.battery_temperature} />} />
                        </SettingsCard>
                    </div>
                );

            case "storage":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="Storage & Memory"
                            description="Disk space and RAM information."
                        />
                        <SettingsCard icon={HardDrive} title="Internal Storage" description="Device storage capacity.">
                            <SettingsValueItem label="Total" value={<InfoValue value={info.internal_storage} />} />
                            <SettingsValueItem label="Available" value={<InfoValue value={info.available_storage} />} />
                        </SettingsCard>
                        <SettingsCard icon={MemoryStick} title="Memory (RAM)" description="System memory.">
                            <SettingsValueItem label="Total RAM" value={<InfoValue value={info.total_ram} />} />
                            <SettingsValueItem label="Available RAM" value={<InfoValue value={info.available_ram} />} />
                        </SettingsCard>
                    </div>
                );

            case "network":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="Network Information"
                            description="Connectivity and hardware addresses."
                        />
                        <SettingsCard icon={Wifi} title="Addresses" description="Network hardware identifiers.">
                            <SettingsValueItem label="WiFi MAC" value={<InfoValue value={info.wifi_mac} copyable />} />
                            <SettingsValueItem label="Bluetooth MAC" value={<InfoValue value={info.bluetooth_mac} copyable />} />
                        </SettingsCard>
                    </div>
                );

            case "build":
                return (
                    <div className="space-y-6">
                        <SettingsHeader
                            title="Build Information"
                            description="Firmware and bootloader details."
                        />
                        <SettingsCard icon={Wrench} title="Firmware" description="Low-level system components.">
                            <SettingsValueItem label="Bootloader" value={<InfoValue value={info.bootloader} />} />
                            <SettingsValueItem label="Baseband" value={<InfoValue value={info.baseband} />} />
                            <SettingsValueItem label="Kernel" value={<InfoValue value={info.kernel_version} />} />
                        </SettingsCard>
                        <SettingsCard icon={Shield} title="Build Details" description="Build configuration.">
                            <SettingsValueItem label="Build Type" value={<InfoValue value={info.build_type} />} />
                            <SettingsValueItem label="Build Tags" value={<InfoValue value={info.build_tags} />} />
                        </SettingsCard>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
                {/* Device header */}
                <div className="p-4 border-b">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Smartphone className="h-5 w-5 text-primary" />
                        </div>
                        <div className="min-w-0 flex-1">
                            <h2 className="font-semibold truncate" title={displayName}>
                                {displayName}
                            </h2>
                            <p className="text-xs text-muted-foreground font-mono truncate" title={selectedSerial}>
                                {selectedSerial}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex-1 p-3 space-y-1">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                className={cn(
                                    "w-full flex items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                                    isActive
                                        ? "bg-secondary text-foreground"
                                        : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                                )}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <Icon
                                    className={cn(
                                        "h-5 w-5 mt-0.5 shrink-0",
                                        isActive && "text-primary"
                                    )}
                                />
                                <div className="min-w-0">
                                    <div className={cn("text-sm truncate", isActive && "font-medium")}>
                                        {tab.label}
                                    </div>
                                    <div className="text-xs text-muted-foreground truncate">
                                        {tab.description}
                                    </div>
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Refresh button */}
                <div className="p-3 border-t">
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={fetchDeviceInfo}
                        disabled={loading}
                    >
                        <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        Refresh
                    </Button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <ScrollArea className="flex-1">
                    <div className="p-6 max-w-2xl">{renderTabContent()}</div>
                </ScrollArea>
            </div>
        </div>
    );
}
