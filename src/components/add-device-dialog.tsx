import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Cable, Wifi, Loader2, Info, Check, QrCode } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddDeviceDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSuccess: () => void;
}

export function AddDeviceDialog({ open, onOpenChange, onSuccess }: AddDeviceDialogProps) {
    const [ip, setIp] = useState("");
    const [pairCode, setPairCode] = useState("");
    const [connecting, setConnecting] = useState(false);
    const [activeTab, setActiveTab] = useState<'usb' | 'wifi'>('usb');
    const [wifiMode, setWifiMode] = useState<'connect' | 'pair'>('connect');

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
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden gap-0 transition-all duration-300">
                <DialogHeader className="p-6 pb-6">
                    <DialogTitle>Connect New Device</DialogTitle>
                    <DialogDescription>
                        Choose a connection method to pair your Android device.
                    </DialogDescription>
                </DialogHeader>

                <div className="w-full">
                    {/* Custom Tabs */}
                    <div className="px-6 py-2 bg-muted border">
                        <div className="grid grid-cols-2 relative bg-muted/40 p-2 rounded-lg">
                            <div
                                className={cn(
                                    "absolute top-1 bottom-1 w-[calc(50%-0.25rem)] bg-background rounded-lg shadow-sm ring-1 ring-black/5 dark:ring-white/5 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
                                    activeTab === 'usb' ? 'left-1' : 'left-1 translate-x-full'
                                )}
                            />
                            <button
                                onClick={() => setActiveTab('usb')}
                                className={cn(
                                    "h-8 text-sm font-medium relative z-10 flex items-center justify-center gap-2 transition-colors duration-200 rounded-md select-none",
                                    activeTab === 'usb' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Cable className="h-4 w-4" />
                                USB Connection
                            </button>
                            <button
                                onClick={() => setActiveTab('wifi')}
                                className={cn(
                                    "h-8 text-sm font-medium relative z-10 flex items-center justify-center gap-2 transition-colors duration-200 rounded-md select-none",
                                    activeTab === 'wifi' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                <Wifi className="h-4 w-4" />
                                Wireless / Wi-Fi
                            </button>
                        </div>
                    </div>

                    <Separator />

                    {/* Content Area */}
                    <div className="p-6 min-h-[300px] flex flex-col">
                        {activeTab === 'usb' ? (
                            <div className="space-y-4">
                                <div className="bg-blue-500/5 border border-blue-500/20 p-4 rounded-lg">
                                    <h3 className="font-medium flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
                                        <Info className="h-4 w-4" />
                                        Initial Setup
                                    </h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Connecting via USB is the most reliable method. Once connected, you can switch to wireless mode if needed.
                                    </p>
                                </div>

                                <div className="space-y-3 pt-2">
                                    <h4 className="text-sm font-medium">Steps to Connect</h4>
                                    <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground ml-1">
                                        <li>Connect your Android device to this computer via a <span className="text-foreground font-medium">Data USB Cable</span>.</li>
                                        <li>On your device, go to <span className="text-foreground font-medium">Settings &gt; About Phone</span>.</li>
                                        <li>Tap <span className="text-foreground font-medium">Build Number</span> 7 times to enable Developer Mode.</li>
                                        <li>Navigate to <span className="text-foreground font-medium">System &gt; Developer Options</span>.</li>
                                        <li>Enable <span className="text-foreground font-medium">USB Debugging</span> toggle.</li>
                                        <li>Watch your phone screen and tap <span className="text-foreground font-medium">Allow</span> when prompted.</li>
                                    </ol>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 flex-1">
                                <div className="flex gap-2 p-1 bg-muted/40 w-fit rounded-lg mb-2">
                                    <button
                                        onClick={() => setWifiMode('connect')}
                                        className={cn("px-3 py-2 text-xs font-medium rounded-lg transition-all", wifiMode === 'connect' ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        Connect (Known IP)
                                    </button>
                                    <button
                                        onClick={() => setWifiMode('pair')}
                                        className={cn("px-3 py-2 text-xs font-medium rounded-lg transition-all", wifiMode === 'pair' ? "bg-muted shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}
                                    >
                                        Pair New Device
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="bg-amber-500/5 border border-amber-500/20 p-4 rounded-lg">
                                        <h3 className="font-medium flex items-center gap-2 text-amber-600 dark:text-amber-400 mb-2">
                                            <Wifi className="h-4 w-4" />
                                            {wifiMode === 'connect' ? "Wireless Connect" : "Wireless Pairing"}
                                        </h3>
                                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                                            <li>Device and computer must be on the <strong>same network</strong>.</li>
                                            <li><strong>Android 11+</strong> is recommended.</li>
                                        </ul>
                                    </div>

                                    <div className="space-y-3">
                                        <h4 className="text-sm font-medium">Instructions {wifiMode === 'pair' && "(Pairing)"}</h4>
                                        <ol className="list-decimal list-inside space-y-2.5 text-sm text-muted-foreground ml-1">
                                            <li>Enable <span className="text-foreground font-medium">Developer Options</span>.</li>
                                            <li>Find <span className="text-foreground font-medium">Wireless Debugging</span> and enable it.</li>
                                            <li>Tap on the text "Wireless Debugging" to open details.</li>
                                            {wifiMode === 'connect' ? (
                                                <li>Look for <span className="text-foreground font-medium">IP Address & Port</span> (e.g., 192.168.1.5:44555).</li>
                                            ) : (
                                                <li>Tap <strong>Pair device with pairing code</strong>. Note the IP, Port & Code.</li>
                                            )}
                                        </ol>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Footer Actions */}
                    <div className="p-6 bg-muted/5 flex items-center gap-4 min-h-[85px] box-border">
                        {activeTab === 'usb' ? (
                            <div className="flex w-full justify-end">
                                <Button onClick={onSuccess} className="gap-2 min-w-[140px]">
                                    <Check className="h-4 w-4" />
                                    I've Connected It
                                </Button>
                            </div>
                        ) : (
                            <div className="flex w-full gap-3 items-end">
                                <div className="space-y-1.5 flex-1">
                                    <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Device IP & Port</label>
                                    <Input
                                        placeholder="192.168.1.x:5555"
                                        value={ip}
                                        onChange={(e) => setIp(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                        className="font-mono"
                                    />
                                </div>

                                {wifiMode === 'pair' && (
                                    <div className="space-y-1.5">
                                        <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">Pairing Code</label>
                                        <Input
                                            placeholder="123456"
                                            value={pairCode}
                                            onChange={(e) => setPairCode(e.target.value)}
                                            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
                                            maxLength={6}
                                        />
                                    </div>
                                )}

                                <Button onClick={handleConnect} disabled={connecting || !ip} className="shrink-0">
                                    {connecting ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                                        wifiMode === 'pair' ? <QrCode className="h-4 w-4" /> : <Wifi className="h-4 w-4" />
                                    )}
                                    {wifiMode === 'pair' ? "Pair" : "Connect"}
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
