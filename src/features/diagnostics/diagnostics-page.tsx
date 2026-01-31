import { useState, useEffect, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { useDeviceStore } from "@/store/device-store";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import {
    SettingsHeader,
    SettingsCard,
    SettingsValueItem,
} from "@/components/ui/settings";
import {
    Battery,
    Monitor,
    Wifi,
    Bluetooth,
    Signal,
    RefreshCw,
    Activity,
    Thermometer,
    Zap,
    Sun,
    Radio,
    Vibrate,
    AlertTriangle,
    CheckCircle2,
    XCircle,
    Play,
    RotateCcw,
    Hand,
    Info,
} from "lucide-react";
import { toast } from "sonner";
import type {
    FullDiagnostics,
    BatteryDiagnostics,
    DisplayDiagnostics,
    ConnectivityDiagnostics,
    SensorInfo,
} from "./types";

type TabId = "battery" | "display" | "sensors" | "connectivity" | "actions";

const tabs: { id: TabId; label: string; description: string; icon: typeof Battery }[] = [
    { id: "battery", label: "Battery", description: "Power diagnostics", icon: Battery },
    { id: "display", label: "Display", description: "Screen info", icon: Monitor },
    { id: "sensors", label: "Sensors", description: "Hardware sensors", icon: Activity },
    { id: "connectivity", label: "Connectivity", description: "Network status", icon: Wifi },
    { id: "actions", label: "Actions", description: "Test controls", icon: Play },
];

function StatusBadge({ status, type }: { status: string; type?: "success" | "warning" | "error" | "info" }) {
    const colorMap = {
        success: "bg-green-500/10 text-green-600 border-green-500/20",
        warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
        error: "bg-red-500/10 text-red-600 border-red-500/20",
        info: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    };

    return (
        <Badge variant="outline" className={cn("font-normal", type && colorMap[type])}>
            {status}
        </Badge>
    );
}

function LimitedNote({ text }: { text: string }) {
    return (
        <div className="flex items-start gap-2 p-3 bg-amber-500/5 border border-amber-500/20 rounded-lg text-xs text-amber-600">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
            <span>{text}</span>
        </div>
    );
}

function LoadingState() {
    return (
        <div className="space-y-6">
            <div className="space-y-2">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
            </div>
            {[1, 2].map((i) => (
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
                <Activity className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div className="space-y-1">
                <h3 className="font-semibold text-lg">No device selected</h3>
                <p className="text-muted-foreground max-w-sm">
                    Select a connected device to run diagnostics.
                </p>
            </div>
        </div>
    );
}

// ============================================================================
// Battery Tab
// ============================================================================

function BatteryTab({ battery }: { battery: BatteryDiagnostics }) {
    const getHealthType = (health: string): "success" | "warning" | "error" => {
        if (health === "Good") return "success";
        if (health === "Unknown") return "warning";
        return "error";
    };

    const getStatusType = (status: string): "success" | "warning" | "info" => {
        if (status === "Full") return "success";
        if (status === "Charging") return "info";
        return "warning";
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Battery Diagnostics"
                description="Power status and battery health information."
            />

            <SettingsCard icon={Battery} title="Status" description="Current battery state and charge level.">
                <SettingsValueItem
                    label="Level"
                    value={
                        battery.level !== null ? (
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className={cn(
                                            "h-full rounded-full transition-all",
                                            battery.level > 50 ? "bg-green-500" :
                                                battery.level > 20 ? "bg-amber-500" : "bg-red-500"
                                        )}
                                        style={{ width: `${battery.level}%` }}
                                    />
                                </div>
                                <span className="text-sm font-medium">{battery.level}%</span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
                <SettingsValueItem
                    label="Status"
                    value={<StatusBadge status={battery.status} type={getStatusType(battery.status)} />}
                />
                <SettingsValueItem
                    label="Health"
                    value={<StatusBadge status={battery.health} type={getHealthType(battery.health)} />}
                />
                <SettingsValueItem
                    label="Plugged"
                    value={<span className="text-sm text-muted-foreground">{battery.plugged}</span>}
                />
            </SettingsCard>

            <SettingsCard icon={Thermometer} title="Details" description="Temperature, voltage, and capacity.">
                <SettingsValueItem
                    label="Temperature"
                    value={
                        battery.temperature !== null ? (
                            <span className={cn(
                                "text-sm font-mono",
                                battery.temperature > 40 ? "text-red-500" :
                                    battery.temperature > 35 ? "text-amber-500" : "text-muted-foreground"
                            )}>
                                {battery.temperature.toFixed(1)}°C
                            </span>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
                <SettingsValueItem
                    label="Voltage"
                    value={
                        battery.voltage !== null ? (
                            <span className="text-sm font-mono text-muted-foreground">
                                {(battery.voltage / 1000).toFixed(2)}V
                            </span>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
                <SettingsValueItem
                    label="Current"
                    value={
                        battery.current !== null ? (
                            <span className={cn(
                                "text-sm font-mono",
                                battery.current > 0 ? "text-green-500" : "text-muted-foreground"
                            )}>
                                {battery.current > 0 ? "+" : ""}{battery.current}mA
                            </span>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
                <SettingsValueItem
                    label="Technology"
                    value={<span className="text-sm text-muted-foreground">{battery.technology ?? "Unknown"}</span>}
                />
                <SettingsValueItem
                    label="Capacity"
                    value={
                        battery.capacity !== null ? (
                            <span className="text-sm font-mono text-muted-foreground">{battery.capacity}mAh</span>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
            </SettingsCard>

            {(battery.max_charging_current !== null || battery.max_charging_voltage !== null) && (
                <SettingsCard icon={Zap} title="Charging" description="Current charging parameters.">
                    {battery.max_charging_current !== null && (
                        <SettingsValueItem
                            label="Max Current"
                            value={
                                <span className="text-sm font-mono text-muted-foreground">
                                    {battery.max_charging_current}mA
                                </span>
                            }
                        />
                    )}
                    {battery.max_charging_voltage !== null && (
                        <SettingsValueItem
                            label="Max Voltage"
                            value={
                                <span className="text-sm font-mono text-muted-foreground">
                                    {(battery.max_charging_voltage / 1000).toFixed(1)}V
                                </span>
                            }
                        />
                    )}
                </SettingsCard>
            )}
        </div>
    );
}

// ============================================================================
// Display Tab
// ============================================================================

function DisplayTab({ display }: { display: DisplayDiagnostics }) {
    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Display Diagnostics"
                description="Screen specifications and capabilities."
            />

            <SettingsCard icon={Monitor} title="Screen" description="Resolution and density information.">
                <SettingsValueItem
                    label="Resolution"
                    value={<span className="text-sm font-mono text-muted-foreground">{display.resolution ?? "Unknown"}</span>}
                />
                <SettingsValueItem
                    label="Density"
                    value={<span className="text-sm font-mono text-muted-foreground">{display.density ?? "Unknown"}</span>}
                />
                <SettingsValueItem
                    label="Refresh Rate"
                    value={<span className="text-sm font-mono text-muted-foreground">{display.refresh_rate ?? "Unknown"}</span>}
                />
            </SettingsCard>

            <SettingsCard icon={Sun} title="Brightness" description="Current brightness settings.">
                <SettingsValueItem
                    label="Level"
                    value={
                        display.brightness !== null ? (
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-2.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                        className="h-full rounded-full bg-amber-400 transition-all"
                                        style={{ width: `${(display.brightness / 255) * 100}%` }}
                                    />
                                </div>
                                <span className="text-sm font-mono text-muted-foreground">
                                    {Math.round((display.brightness / 255) * 100)}%
                                </span>
                            </div>
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
                <SettingsValueItem
                    label="Adaptive Brightness"
                    value={
                        display.adaptive_brightness !== null ? (
                            <StatusBadge
                                status={display.adaptive_brightness ? "Enabled" : "Disabled"}
                                type={display.adaptive_brightness ? "success" : "info"}
                            />
                        ) : (
                            <span className="text-muted-foreground italic">Not available</span>
                        )
                    }
                />
            </SettingsCard>

            {display.hdr_capabilities && (
                <SettingsCard icon={Zap} title="HDR" description="High dynamic range capabilities.">
                    <SettingsValueItem
                        label="Capabilities"
                        value={<StatusBadge status={display.hdr_capabilities} type="success" />}
                    />
                </SettingsCard>
            )}

            {display.supported_modes.length > 0 && (
                <SettingsCard icon={Monitor} title="Supported Modes" description="Available display modes.">
                    <div className="space-y-1">
                        {display.supported_modes.map((mode, i) => (
                            <div key={i} className="text-xs font-mono text-muted-foreground py-1">
                                {mode}
                            </div>
                        ))}
                    </div>
                </SettingsCard>
            )}

            <LimitedNote text="Dead pixel testing requires visual inspection and is not automatable via ADB." />
        </div>
    );
}

// ============================================================================
// Sensors Tab
// ============================================================================

function SensorsTab({ sensors }: { sensors: SensorInfo[] }) {
    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Sensor Diagnostics"
                description="Hardware sensors detected on the device."
            />

            <SettingsCard icon={Activity} title="Detected Sensors" description={`${sensors.length} sensors found.`}>
                {sensors.length > 0 ? (
                    <div className="space-y-2">
                        {sensors.map((sensor, i) => (
                            <div key={i} className="flex items-center justify-between py-1">
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                                    <span className="text-sm">{sensor.name}</span>
                                </div>
                                {sensor.vendor && (
                                    <span className="text-xs text-muted-foreground">{sensor.vendor}</span>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-sm text-muted-foreground italic py-2">
                        No sensors detected or sensor service not accessible.
                    </div>
                )}
            </SettingsCard>

            <LimitedNote text="Sensor calibration and real-time readings require a companion app on the device. ADB can only detect sensor presence." />
        </div>
    );
}

// ============================================================================
// Connectivity Tab
// ============================================================================

function ConnectivityTab({ connectivity }: { connectivity: ConnectivityDiagnostics }) {
    const getSignalStrengthLabel = (rssi: number | null): string => {
        if (rssi === null) return "Unknown";
        if (rssi >= -50) return "Excellent";
        if (rssi >= -60) return "Good";
        if (rssi >= -70) return "Fair";
        if (rssi >= -80) return "Weak";
        return "Very Weak";
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Connectivity Diagnostics"
                description="Network and wireless status."
            />

            {connectivity.airplane_mode && (
                <div className="flex items-center gap-2 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-sm text-amber-600">
                    <Radio className="h-4 w-4" />
                    <span>Airplane Mode is enabled</span>
                </div>
            )}

            <SettingsCard icon={Wifi} title="WiFi" description="Wireless network status.">
                <SettingsValueItem
                    label="Status"
                    value={
                        <StatusBadge
                            status={connectivity.wifi_enabled ? "Enabled" : "Disabled"}
                            type={connectivity.wifi_enabled ? "success" : "info"}
                        />
                    }
                />
                {connectivity.wifi_enabled && (
                    <>
                        <SettingsValueItem
                            label="Connected"
                            value={
                                connectivity.wifi_connected ? (
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                                        <span className="text-sm text-muted-foreground">{connectivity.wifi_ssid ?? "Unknown Network"}</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <XCircle className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm text-muted-foreground">Not connected</span>
                                    </div>
                                )
                            }
                        />
                        {connectivity.wifi_connected && (
                            <>
                                <SettingsValueItem
                                    label="Signal"
                                    value={
                                        <div className="flex items-center gap-2">
                                            <Signal className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm text-muted-foreground">
                                                {connectivity.wifi_signal_strength ?? "?"} dBm ({getSignalStrengthLabel(connectivity.wifi_signal_strength)})
                                            </span>
                                        </div>
                                    }
                                />
                                <SettingsValueItem
                                    label="Frequency"
                                    value={<span className="text-sm text-muted-foreground">{connectivity.wifi_frequency ?? "Unknown"}</span>}
                                />
                                <SettingsValueItem
                                    label="Link Speed"
                                    value={<span className="text-sm text-muted-foreground">{connectivity.wifi_link_speed ?? "Unknown"}</span>}
                                />
                                <SettingsValueItem
                                    label="IP Address"
                                    value={<span className="text-sm font-mono text-muted-foreground">{connectivity.wifi_ip ?? "Unknown"}</span>}
                                />
                            </>
                        )}
                    </>
                )}
            </SettingsCard>

            <SettingsCard icon={Bluetooth} title="Bluetooth" description="Bluetooth status and paired devices.">
                <SettingsValueItem
                    label="Status"
                    value={
                        <StatusBadge
                            status={connectivity.bluetooth_enabled ? "Enabled" : "Disabled"}
                            type={connectivity.bluetooth_enabled ? "success" : "info"}
                        />
                    }
                />
                {connectivity.bluetooth_enabled && (
                    <>
                        <SettingsValueItem
                            label="Device Name"
                            value={<span className="text-sm text-muted-foreground">{connectivity.bluetooth_name ?? "Unknown"}</span>}
                        />
                        <SettingsValueItem
                            label="Paired Devices"
                            value={<span className="text-sm text-muted-foreground">{connectivity.paired_devices_count}</span>}
                        />
                    </>
                )}
            </SettingsCard>

            <SettingsCard icon={Signal} title="Cellular" description="Mobile network status.">
                <SettingsValueItem
                    label="Mobile Data"
                    value={
                        <StatusBadge
                            status={connectivity.mobile_data_enabled ? "Enabled" : "Disabled"}
                            type={connectivity.mobile_data_enabled ? "success" : "info"}
                        />
                    }
                />
                <SettingsValueItem
                    label="Carrier"
                    value={<span className="text-sm text-muted-foreground">{connectivity.carrier ?? "Unknown"}</span>}
                />
                <SettingsValueItem
                    label="Network Type"
                    value={<span className="text-sm text-muted-foreground">{connectivity.network_type ?? "Unknown"}</span>}
                />
            </SettingsCard>
        </div>
    );
}

// ============================================================================
// Actions Tab
// ============================================================================

function ActionsTab({ selectedSerial, onRefresh }: { selectedSerial: string; onRefresh: () => void }) {
    const [brightness, setBrightness] = useState(128);
    const [batteryLevel, setBatteryLevel] = useState(50);
    const [isSimulating, setIsSimulating] = useState(false);
    const [isVibrating, setIsVibrating] = useState(false);

    const handleSetBrightness = async () => {
        try {
            await invoke("set_brightness", { serial: selectedSerial, level: brightness });
            toast.success(`Brightness set to ${Math.round((brightness / 255) * 100)}%`);
            onRefresh();
        } catch (err) {
            toast.error("Failed to set brightness");
        }
    };

    const handleToggleWifi = async (enable: boolean) => {
        try {
            await invoke("toggle_wifi", { serial: selectedSerial, enable });
            toast.success(`WiFi ${enable ? "enabled" : "disabled"}`);
            setTimeout(onRefresh, 1000);
        } catch (err) {
            toast.error("Failed to toggle WiFi");
        }
    };

    const handleToggleBluetooth = async (enable: boolean) => {
        try {
            await invoke("toggle_bluetooth", { serial: selectedSerial, enable });
            toast.success(`Bluetooth ${enable ? "enabled" : "disabled"}`);
            setTimeout(onRefresh, 1000);
        } catch (err) {
            toast.error("Failed to toggle Bluetooth");
        }
    };

    const handleSimulateBattery = async () => {
        setIsSimulating(true);
        try {
            await invoke("simulate_battery_level", { serial: selectedSerial, level: batteryLevel });
            toast.success(`Battery level simulated at ${batteryLevel}%`);
            setTimeout(onRefresh, 500);
        } catch (err) {
            toast.error("Failed to simulate battery");
        } finally {
            setIsSimulating(false);
        }
    };

    const handleResetBattery = async () => {
        try {
            await invoke("reset_battery_simulation", { serial: selectedSerial });
            toast.success("Battery simulation reset");
            setTimeout(onRefresh, 500);
        } catch (err) {
            toast.error("Failed to reset battery");
        }
    };

    const handleVibrate = async () => {
        setIsVibrating(true);
        try {
            await invoke("trigger_vibration", { serial: selectedSerial, durationMs: 500 });
            toast.success("Vibration triggered");
        } catch (err) {
            toast.error("Failed to trigger vibration");
        } finally {
            setTimeout(() => setIsVibrating(false), 500);
        }
    };

    return (
        <div className="space-y-6">
            <SettingsHeader
                title="Test Actions"
                description="Trigger device functions and simulate conditions."
            />

            <SettingsCard icon={Sun} title="Brightness Control" description="Adjust screen brightness.">
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[brightness]}
                            onValueChange={(v) => setBrightness(Array.isArray(v) ? v[0] : v)}
                            min={0}
                            max={255}
                            step={1}
                            className="flex-1"
                        />
                        <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                            {Math.round((brightness / 255) * 100)}%
                        </span>
                    </div>
                    <Button variant="outline" size="sm" onClick={handleSetBrightness}>
                        Apply Brightness
                    </Button>
                </div>
            </SettingsCard>

            <SettingsCard icon={Wifi} title="Connectivity Controls" description="Toggle wireless features.">
                <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                        <span className="text-sm">WiFi</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleToggleWifi(true)}>
                                Enable
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleToggleWifi(false)}>
                                Disable
                            </Button>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-sm">Bluetooth</span>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => handleToggleBluetooth(true)}>
                                Enable
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => handleToggleBluetooth(false)}>
                                Disable
                            </Button>
                        </div>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard icon={Battery} title="Battery Simulation" description="Test app behavior at different battery levels.">
                <div className="space-y-4 pt-2">
                    <div className="flex items-center gap-4">
                        <Slider
                            value={[batteryLevel]}
                            onValueChange={(v) => setBatteryLevel(Array.isArray(v) ? v[0] : v)}
                            min={0}
                            max={100}
                            step={5}
                            className="flex-1"
                        />
                        <span className="text-sm font-mono text-muted-foreground w-12 text-right">
                            {batteryLevel}%
                        </span>
                    </div>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={handleSimulateBattery} disabled={isSimulating}>
                            <Play className="h-4 w-4" />
                            Simulate
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleResetBattery}>
                            <RotateCcw className="h-4 w-4" />
                            Reset
                        </Button>
                    </div>
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                        <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span>This simulates battery level for testing. Reset to restore actual readings.</span>
                    </div>
                </div>
            </SettingsCard>

            <SettingsCard icon={Vibrate} title="Haptics Test" description="Test device vibration motor.">
                <div className="pt-2">
                    <Button variant="outline" size="sm" onClick={handleVibrate} disabled={isVibrating}>
                        <Vibrate className={cn("h-4 w-4", isVibrating && "animate-pulse")} />
                        Vibrate (500ms)
                    </Button>
                </div>
                <LimitedNote text="Vibration cannot be verified remotely. Check the physical device." />
            </SettingsCard>

            <SettingsCard icon={Hand} title="Touch Test" description="Verify touch input functionality.">
                <LimitedNote text="Interactive touch testing requires physical device interaction. Use 'getevent' in terminal for raw touch data." />
            </SettingsCard>
        </div>
    );
}

// ============================================================================
// Main Component
// ============================================================================

export function DiagnosticsPage() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const devices = useDeviceStore((state) => state.devices);
    const deviceMetadata = useDeviceStore((state) => state.deviceMetadata);

    const [activeTab, setActiveTab] = useState<TabId>("battery");
    const [diagnostics, setDiagnostics] = useState<FullDiagnostics | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const selectedDevice = devices.find((d) => d.serial === selectedSerial);
    const metadata = selectedSerial ? deviceMetadata[selectedSerial] : null;
    const displayName = metadata?.label || selectedDevice?.model || "Device";

    const fetchDiagnostics = useCallback(async () => {
        if (!selectedSerial) return;

        setLoading(true);
        setError(null);

        try {
            const result = await invoke<FullDiagnostics>("get_device_diagnostics", {
                serial: selectedSerial,
            });
            setDiagnostics(result);
        } catch (err) {
            setError(String(err));
            toast.error("Failed to fetch diagnostics");
        } finally {
            setLoading(false);
        }
    }, [selectedSerial]);

    useEffect(() => {
        if (selectedSerial) {
            fetchDiagnostics();
        } else {
            setDiagnostics(null);
        }
    }, [selectedSerial, fetchDiagnostics]);

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
                        <Activity className="h-8 w-8 text-destructive" />
                    </div>
                    <div className="space-y-1">
                        <h3 className="font-semibold">Failed to load diagnostics</h3>
                        <p className="text-sm text-muted-foreground max-w-sm">{error}</p>
                    </div>
                    <Button variant="outline" onClick={fetchDiagnostics}>
                        <RefreshCw className="h-4 w-4" />
                        Retry
                    </Button>
                </div>
            );
        }

        if (!diagnostics && activeTab !== "actions") return null;

        switch (activeTab) {
            case "battery":
                return diagnostics && <BatteryTab battery={diagnostics.battery} />;
            case "display":
                return diagnostics && <DisplayTab display={diagnostics.display} />;
            case "sensors":
                return diagnostics && <SensorsTab sensors={diagnostics.sensors} />;
            case "connectivity":
                return diagnostics && <ConnectivityTab connectivity={diagnostics.connectivity} />;
            case "actions":
                return <ActionsTab selectedSerial={selectedSerial} onRefresh={fetchDiagnostics} />;
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full w-full">
            {/* Sidebar */}
            <div className="w-64 border-r bg-muted/30 flex flex-col shrink-0">
                <div className="p-4 border-b">
                    <div className="flex items-center justify-between">
                        <div className="min-w-0">
                            <h2 className="font-semibold truncate">{displayName}</h2>
                            <p className="text-xs text-muted-foreground truncate">{selectedSerial}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={fetchDiagnostics}
                            disabled={loading}
                        >
                            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                        </Button>
                    </div>
                </div>
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
                                <Icon className={cn(
                                    "h-5 w-5 mt-0.5 shrink-0",
                                    isActive && "text-primary"
                                )} />
                                <div className="min-w-0">
                                    <div className={cn(
                                        "text-sm truncate",
                                        isActive && "font-medium"
                                    )}>
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
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0">
                <ScrollArea className="flex-1">
                    <div className="p-6 max-w-2xl">
                        {renderTabContent()}
                    </div>
                </ScrollArea>
            </div>
        </div>
    );
}
