import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Cable, Wifi, Loader2, Check, QrCode, Smartphone, Settings, Code2, ToggleRight, ShieldCheck, HelpCircle, ChevronRight, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import {
    NestedDialog,
    NestedDialogSteps,
    NestedDialogStep,
    NestedDialogNote,
} from "@/components/ui/nested-dialog";

interface AddDeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

interface StepCardProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onHelp?: () => void;
    highlight?: boolean;
}

function StepCard({ icon, title, description, onHelp, highlight }: StepCardProps) {
    return (
        <div className={cn(
            "flex items-start gap-3 p-3 rounded-xl transition-colors",
            highlight && "bg-primary/5 border border-primary/20"
        )}>
            <div className={cn(
                "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                highlight ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
            )}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                    <p className="font-medium text-sm">{title}</p>
                    {onHelp && (
                        <button
                            onClick={onHelp}
                            className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1 shrink-0"
                        >
                            How? <ChevronRight className="h-3 w-3" />
                        </button>
                    )}
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed mt-0.5">{description}</p>
            </div>
        </div>
    );
}

export function AddDeviceDialog({ open, onOpenChange, onSuccess }: AddDeviceDialogProps) {
    const [ip, setIp] = useState("");
    const [pairCode, setPairCode] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [activeTab, setActiveTab] = useState<'usb' | 'wifi'>('usb');
    const [wifiMode, setWifiMode] = useState<'connect' | 'pair'>('connect');

    // Help dialogs state
    const [helpDialog, setHelpDialog] = useState<'developer' | 'usb-debug' | 'allow' | 'wireless' | 'find-ip' | null>(null);

    const handleConnect = async () => {
        if (!ip) return;
        setConnecting(true);
        try {
            if (activeTab === 'wifi' && wifiMode === 'pair') {
                if (!pairCode) {
                    toast.error("Pairing code required");
                    setConnecting(false);
                    return;
                }
                const res = await invoke<string>("adb_pair", { addr: ip, code: pairCode });
                toast.success(res || "Pairing successful");
                setWifiMode('connect');
                setPairCode("");
                setIp("");
                toast.info("Now enter the device IP & Port to connect");
            } else {
                const res = await invoke<string>("adb_connect", { ip });
                toast.success(res || "Connection command sent");
                onSuccess();
                setIp("");
            }
        } catch (err: any) {
            toast.error(`Failed: ${err}`);
        } finally {
            setConnecting(false);
        }
    };

    return (
        <>
            <Dialog
                open={open}
                onOpenChange={(newOpen) => {
                    // Only allow closing if no nested dialog is open
                    if (!newOpen && helpDialog !== null) return;
                    onOpenChange(newOpen);
                }}
            >
                <DialogContent className="sm:max-w-[580px] p-0 overflow-hidden gap-0 transition-all duration-300">
                    <DialogHeader className="p-6 pb-4">
                        <DialogTitle className="flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-primary" />
                            Connect Your Device
                        </DialogTitle>
                        <DialogDescription>
                            Let's get your Android phone connected. Pick the method that works best for you.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="w-full">
                        {/* Custom Tabs */}
                        <div className="px-6 py-2 bg-muted border">
                            <div className="grid grid-cols-2 relative bg-muted/40 p-1.5 rounded-lg">
                                <div
                                    className={cn(
                                        "absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-background rounded-md shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                                        activeTab === 'usb' ? 'left-1' : 'left-1 translate-x-full'
                                    )}
                                />
                                <button
                                    onClick={() => setActiveTab('usb')}
                                    className={cn(
                                        "h-9 text-sm font-medium relative z-10 flex items-center justify-center gap-2 transition-colors duration-200 rounded-md select-none",
                                        activeTab === 'usb' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Cable className="h-4 w-4" />
                                    USB Cable
                                </button>
                                <button
                                    onClick={() => setActiveTab('wifi')}
                                    className={cn(
                                        "h-9 text-sm font-medium relative z-10 flex items-center justify-center gap-2 transition-colors duration-200 rounded-md select-none",
                                        activeTab === 'wifi' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                    )}
                                >
                                    <Wifi className="h-4 w-4" />
                                    Wireless
                                </button>
                            </div>
                        </div>

                        <Separator />

                        {/* Content Area */}
                        <div className="p-6 min-h-[280px] flex flex-col">
                            {activeTab === 'usb' ? (
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground mb-4">
                                        USB is the easiest way to start. Just follow these quick steps:
                                    </p>

                                    <StepCard
                                        icon={<Cable className="h-4 w-4" />}
                                        title="Plug in your phone"
                                        description="Use a USB cable that can transfer data (not just charging)."
                                    />

                                    <StepCard
                                        icon={<Code2 className="h-4 w-4" />}
                                        title="Enable Developer Mode"
                                        description="Unlocks hidden settings needed for this connection."
                                        onHelp={() => setHelpDialog('developer')}
                                        highlight
                                    />

                                    <StepCard
                                        icon={<ToggleRight className="h-4 w-4" />}
                                        title="Turn on USB Debugging"
                                        description="Allows your computer to communicate with your phone."
                                        onHelp={() => setHelpDialog('usb-debug')}
                                    />

                                    <StepCard
                                        icon={<ShieldCheck className="h-4 w-4" />}
                                        title="Tap 'Allow' on your phone"
                                        description="A popup will appear asking for permission. Tap Allow."
                                        onHelp={() => setHelpDialog('allow')}
                                    />
                                </div>
                            ) : (
                                <div className="space-y-4 flex-1">
                                    <div className="flex gap-2 p-1 bg-muted/50 w-fit rounded-lg">
                                        <button
                                            onClick={() => setWifiMode('connect')}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                wifiMode === 'connect' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            Quick Connect
                                        </button>
                                        <button
                                            onClick={() => setWifiMode('pair')}
                                            className={cn(
                                                "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                                                wifiMode === 'pair' ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            First Time Setup
                                        </button>
                                    </div>

                                    {wifiMode === 'pair' ? (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground mb-3">
                                                First time connecting wirelessly? Let's pair your device:
                                            </p>

                                            <StepCard
                                                icon={<Wifi className="h-4 w-4" />}
                                                title="Enable Wireless Debugging"
                                                description="Found in Developer Options on your phone."
                                                onHelp={() => setHelpDialog('wireless')}
                                                highlight
                                            />

                                            <StepCard
                                                icon={<QrCode className="h-4 w-4" />}
                                                title="Tap 'Pair with pairing code'"
                                                description="You'll see an IP address, port, and a 6-digit code."
                                            />

                                            <StepCard
                                                icon={<Smartphone className="h-4 w-4" />}
                                                title="Enter the details below"
                                                description="Type the IP:Port and pairing code shown on your phone."
                                            />
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <p className="text-sm text-muted-foreground mb-3">
                                                Already paired before? Just enter your device's IP address:
                                            </p>

                                            <StepCard
                                                icon={<Settings className="h-4 w-4" />}
                                                title="Open Wireless Debugging settings"
                                                description="Go to Developer Options → Wireless Debugging."
                                            />

                                            <StepCard
                                                icon={<Smartphone className="h-4 w-4" />}
                                                title="Find your IP address & port"
                                                description="Shown at the top of the Wireless Debugging screen."
                                                onHelp={() => setHelpDialog('find-ip')}
                                                highlight
                                            />
                                        </div>
                                    )}

                                    <div className="pt-2 text-xs text-muted-foreground flex items-center gap-1.5">
                                        <span className="inline-block h-1.5 w-1.5 rounded-full bg-amber-500" />
                                        Both devices must be on the same Wi-Fi network
                                    </div>
                                </div>
                            )}
                        </div>

                        <Separator />

                        {/* Footer Actions */}
                        <div className="p-6 bg-muted/5 flex items-center gap-4 min-h-[85px] box-border">
                            {activeTab === 'usb' ? (
                                <div className="flex w-full justify-between items-center">
                                    <p className="text-xs text-muted-foreground">
                                        Done with the steps above?
                                    </p>
                                    <Button onClick={onSuccess} className="gap-2">
                                        <Check className="h-4 w-4" />
                                        I'm Ready
                                    </Button>
                                </div>
                            ) : (
                                <div className="flex w-full gap-3 items-end">
                                    <div className="space-y-1.5 flex-1">
                                        <label className="text-xs font-medium text-muted-foreground">IP Address & Port</label>
                                        <Input
                                            placeholder="192.168.1.x:5555"
                                            value={ip}
                                            onChange={(e) => setIp(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                            className="font-mono"
                                        />
                                    </div>

                                    {wifiMode === 'pair' && (
                                        <div className="space-y-1.5 w-28">
                                            <label className="text-xs font-medium text-muted-foreground">Code</label>
                                            <Input
                                                placeholder="123456"
                                                value={pairCode}
                                                onChange={(e) => setPairCode(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                                maxLength={6}
                                                className="font-mono"
                                            />
                                        </div>
                                    )}

                                    <Button onClick={handleConnect} disabled={connecting || !ip} className="shrink-0 gap-2">
                                        {connecting ? (
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                        ) : wifiMode === 'pair' ? (
                                            <QrCode className="h-4 w-4" />
                                        ) : (
                                            <Wifi className="h-4 w-4" />
                                        )}
                                        {wifiMode === 'pair' ? "Pair" : "Connect"}
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Help Dialogs */}
            <NestedDialog
                open={helpDialog === 'developer'}
                onOpenChange={(open) => !open && setHelpDialog(null)}
                title="Enable Developer Mode"
                titleIcon={HelpCircle}
            >
                {/* Phone illustration */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <div className="w-28 h-48 bg-gradient-to-b from-muted/80 to-muted rounded-2xl border-2 border-border shadow-sm flex flex-col overflow-hidden">
                            <div className="h-3 bg-muted-foreground/10 flex items-center justify-center">
                                <div className="w-6 h-1 bg-muted-foreground/20 rounded-full" />
                            </div>
                            <div className="flex-1 p-2 space-y-1">
                                <div className="h-2.5 bg-muted-foreground/10 rounded w-full" />
                                <div className="h-2.5 bg-muted-foreground/10 rounded w-3/4" />
                                <div className="h-5 bg-primary/20 rounded flex items-center px-1.5 mt-1.5">
                                    <span className="text-[5px] font-medium text-primary">Build Number</span>
                                </div>
                                <div className="text-[7px] text-center text-muted-foreground pt-1">Tap 7×</div>
                            </div>
                        </div>
                        <div className="absolute -right-1 top-1/2 -translate-y-1/2 animate-bounce">
                            <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                                <span className="text-[10px] font-bold">×7</span>
                            </div>
                        </div>
                    </div>
                </div>

                <NestedDialogSteps>
                    <NestedDialogStep step={1}>
                        Go to <strong>Settings</strong> → <strong>About Phone</strong>
                    </NestedDialogStep>
                    <NestedDialogStep step={2}>
                        Find <strong>Build Number</strong> and tap it <strong>7 times</strong>
                    </NestedDialogStep>
                    <NestedDialogStep step={3}>
                        You'll see "You are now a developer!"
                    </NestedDialogStep>
                </NestedDialogSteps>

                <NestedDialogNote
                    title="Finding Build Number on different phones"
                    items={[
                        { label: "Stock Android / Pixel", path: "Settings → About Phone → Build Number" },
                        { label: "Samsung", path: "Settings → About Phone → Software Info → Build Number" },
                        { label: "Xiaomi / MIUI", path: "Settings → About Phone → MIUI Version (tap 7×)" },
                        { label: "OnePlus", path: "Settings → About Device → Build Number" },
                        { label: "LineageOS", path: "Settings → About Phone → Build Number" },
                    ]}
                />
            </NestedDialog>

            <NestedDialog
                open={helpDialog === 'usb-debug'}
                onOpenChange={(open) => !open && setHelpDialog(null)}
                title="Enable USB Debugging"
                titleIcon={HelpCircle}
            >
                {/* Toggle illustration */}
                <div className="flex justify-center py-4">
                    <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-4">
                        <div className="flex items-center gap-3">
                            <ToggleRight className="h-7 w-7 text-primary" />
                            <div>
                                <p className="font-medium text-sm">USB Debugging</p>
                                <p className="text-[10px] text-muted-foreground">Allow via USB</p>
                            </div>
                        </div>
                        <div className="w-11 h-6 bg-primary rounded-full p-0.5 flex items-center justify-end">
                            <div className="w-5 h-5 bg-white rounded-full shadow" />
                        </div>
                    </div>
                </div>

                <NestedDialogSteps>
                    <NestedDialogStep step={1}>
                        Open <strong>Settings</strong> → <strong>Developer Options</strong>
                    </NestedDialogStep>
                    <NestedDialogStep step={2}>
                        Find and enable <strong>USB Debugging</strong>
                    </NestedDialogStep>
                </NestedDialogSteps>

                <NestedDialogNote
                    title="Finding Developer Options"
                    items={[
                        { label: "Stock Android / Pixel", path: "Settings → System → Developer Options" },
                        { label: "Samsung", path: "Settings → Developer Options (scroll to bottom)" },
                        { label: "Xiaomi / MIUI", path: "Settings → Additional Settings → Developer Options" },
                        { label: "LineageOS", path: "Settings → System → Advanced → Developer Options" },
                        { label: "OnePlus", path: "Settings → System → Developer Options" },
                    ]}
                />
            </NestedDialog>

            <NestedDialog
                open={helpDialog === 'allow'}
                onOpenChange={(open) => !open && setHelpDialog(null)}
                title="Allow Connection"
                titleIcon={HelpCircle}
            >
                {/* Permission dialog illustration */}
                <div className="flex justify-center py-4">
                    <div className="bg-muted/50 rounded-xl p-4 w-full max-w-[200px] space-y-3 border border-border">
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 text-primary" />
                            <span className="font-medium text-xs">Allow USB debugging?</span>
                        </div>
                        <p className="text-[9px] text-muted-foreground">
                            Computer fingerprint: AB:CD:12...
                        </p>
                        <div className="flex gap-2">
                            <div className="flex-1 h-6 bg-muted-foreground/20 rounded flex items-center justify-center text-[10px]">Cancel</div>
                            <div className="flex-1 h-6 bg-primary rounded flex items-center justify-center text-[10px] text-primary-foreground font-medium">Allow</div>
                        </div>
                    </div>
                </div>

                <p className="text-center text-sm text-muted-foreground">
                    When you plug in via USB, your phone will show this popup. Tap <strong>Allow</strong>.
                </p>

                <NestedDialogNote
                    title="Not seeing the popup?"
                    items={[
                        { label: "Unlock your phone", path: "The popup only appears when screen is on" },
                        { label: "Reconnect the cable", path: "Unplug and plug back in" },
                        { label: "Check USB Debugging", path: "Make sure it's enabled in Developer Options" },
                        { label: "Try a different cable", path: "Some cables are charge-only and won't work" },
                    ]}
                />
            </NestedDialog>

            <NestedDialog
                open={helpDialog === 'wireless'}
                onOpenChange={(open) => !open && setHelpDialog(null)}
                title="Enable Wireless Debugging"
                titleIcon={HelpCircle}
            >
                {/* Wireless illustration */}
                <div className="flex justify-center py-4">
                    <div className="relative">
                        <div className="bg-muted/50 border border-border rounded-xl p-4 flex items-center gap-3">
                            <Wifi className="h-8 w-8 text-primary" />
                            <div>
                                <p className="font-medium text-sm">Wireless Debugging</p>
                                <p className="text-[10px] text-muted-foreground">Debug over Wi-Fi</p>
                            </div>
                        </div>
                        <div className="absolute -top-1.5 -right-1.5 bg-green-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                        </div>
                    </div>
                </div>

                <NestedDialogSteps>
                    <NestedDialogStep step={1}>
                        Open <strong>Developer Options</strong> → <strong>Wireless Debugging</strong>
                    </NestedDialogStep>
                    <NestedDialogStep step={2}>
                        Enable it, then tap on "Wireless Debugging" to open settings
                    </NestedDialogStep>
                    <NestedDialogStep step={3}>
                        Tap <strong>Pair device with pairing code</strong>
                    </NestedDialogStep>
                </NestedDialogSteps>

                <NestedDialogNote
                    title="Requirements"
                    items={[
                        { label: "Android version", path: "Android 11 or newer is required" },
                        { label: "Network", path: "Phone and computer must be on the same Wi-Fi" },
                    ]}
                />
            </NestedDialog>

            <NestedDialog
                open={helpDialog === 'find-ip'}
                onOpenChange={(open) => !open && setHelpDialog(null)}
                title="Find IP Address"
                titleIcon={HelpCircle}
            >
                {/* IP display illustration */}
                <div className="flex justify-center py-4">
                    <div className="bg-muted/50 border border-border rounded-xl p-3 space-y-2 w-full max-w-[200px]">
                        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <Wifi className="h-3 w-3" />
                            <span>Wireless Debugging</span>
                        </div>
                        <div className="bg-background rounded-lg p-2.5 border">
                            <p className="text-[9px] text-muted-foreground mb-0.5">IP address & Port</p>
                            <p className="font-mono text-xs font-medium text-primary">192.168.1.105:37423</p>
                        </div>
                        <p className="text-[9px] text-muted-foreground text-center">↑ Enter this below</p>
                    </div>
                </div>

                <NestedDialogSteps>
                    <NestedDialogStep step={1}>
                        Go to <strong>Developer Options</strong> → <strong>Wireless Debugging</strong>
                    </NestedDialogStep>
                    <NestedDialogStep step={2}>
                        Tap on "Wireless Debugging" text to open details
                    </NestedDialogStep>
                    <NestedDialogStep step={3}>
                        Copy the <strong>IP address & Port</strong> shown at the top
                    </NestedDialogStep>
                </NestedDialogSteps>

                <NestedDialogNote
                    title="Good to know"
                    items={[
                        { label: "Port changes", path: "The port number changes each time you toggle Wireless Debugging" },
                        { label: "Same network", path: "Your computer and phone must be on the same Wi-Fi" },
                    ]}
                />
            </NestedDialog>
        </>
    );
}
