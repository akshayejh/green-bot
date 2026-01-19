import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useDeviceStore } from "@/store/device-store";
import {
    Smartphone, Tablet, Tv, Watch, Monitor, Laptop, Car, Gamepad, Glasses, Box
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DeviceEditDialogProps {
    serial: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const ICONS = [
    { id: "smartphone", icon: Smartphone, label: "Phone" },
    { id: "tablet", icon: Tablet, label: "Tablet" },
    { id: "tv", icon: Tv, label: "TV" },
    { id: "watch", icon: Watch, label: "Watch" },
    { id: "monitor", icon: Monitor, label: "Desktop" },
    { id: "laptop", icon: Laptop, label: "Laptop" },
    { id: "car", icon: Car, label: "Auto" },
    { id: "gamepad", icon: Gamepad, label: "Console" },
    { id: "glasses", icon: Glasses, label: "XR" },
    { id: "box", icon: Box, label: "Other" },
];

const COLORS = [
    { id: "green", class: "from-primary via-primary to-primary/90" }, // Android Green (Default)
    { id: "blue", class: "from-blue-600 via-blue-500 to-cyan-500" },
    { id: "purple", class: "from-purple-600 via-purple-500 to-pink-500" },
    { id: "emerald", class: "from-emerald-600 via-teal-500 to-cyan-500" },
    { id: "amber", class: "from-amber-600 via-orange-500 to-orange-400" },
    { id: "rose", class: "from-rose-600 via-pink-600 to-fuchsia-500" },
    { id: "slate", class: "from-slate-700 via-slate-600 to-slate-500" },
];

export function DeviceEditDialog({ serial, open, onOpenChange }: DeviceEditDialogProps) {
    const devices = useDeviceStore((state) => state.devices);
    const deviceMetadata = useDeviceStore((state) => state.deviceMetadata);
    const setDeviceMetadata = useDeviceStore((state) => state.setDeviceMetadata);

    const device = devices.find(d => d.serial === serial);
    const metadata = deviceMetadata[serial] || {};

    const [label, setLabel] = useState("");
    const [selectedIcon, setSelectedIcon] = useState("smartphone");
    const [selectedColor, setSelectedColor] = useState("green");

    useEffect(() => {
        if (open) {
            setLabel(metadata.label || device?.model || "");
            setSelectedIcon(metadata.icon || "smartphone");
            setSelectedColor(metadata.color || "green");
        }
    }, [open, serial]);

    const handleSave = () => {
        setDeviceMetadata(serial, {
            label,
            icon: selectedIcon,
            color: selectedColor
        });
        onOpenChange(false);
    };

    const SelectedIconComponent = ICONS.find(i => i.id === selectedIcon)?.icon || Smartphone;
    const selectedColorClass = COLORS.find(c => c.id === selectedColor)?.class || COLORS[0].class;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[460px] p-0 overflow-hidden gap-0">
                <DialogHeader className="px-6 pt-6 pb-4">
                    <DialogTitle>Edit Device</DialogTitle>
                    <DialogDescription>
                        Customize how this device appears in Green Bot.
                    </DialogDescription>
                </DialogHeader>

                <div className="px-6 pb-6 space-y-6">
                    {/* Preview */}
                    <div className="flex justify-center py-6 bg-muted/40 rounded-xl border border-border/40 mt-6">
                        <div className={cn(
                            "relative flex items-center justify-center w-24 h-24 rounded-[1.25rem]",
                            "bg-gradient-to-br transition-all duration-300 hover:scale-105 hover:-rotate-1 cursor-default",
                            selectedColorClass,
                            "border border-white/20 shadow-xl shadow-black/5"
                        )}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-black/10 pointer-events-none rounded-[1.25rem]" />
                            <SelectedIconComponent className="w-12 h-12 text-black drop-shadow-md relative z-10" />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-60 pointer-events-none rounded-[1.25rem]" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="Label" className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Device Label</Label>
                        <Input
                            id="label"
                            value={label}
                            onChange={(e) => setLabel(e.target.value)}
                            placeholder="My Pixel 7"
                            className="bg-muted/30"
                        />
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Icon</Label>
                        <div className="grid grid-cols-5 gap-2">
                            {ICONS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedIcon(item.id)}
                                    className={cn(
                                        "flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg border transition-all duration-200 outline-none focus-visible:ring-2 focus-visible:ring-primary",
                                        selectedIcon === item.id
                                            ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/20 scale-105"
                                            : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                                    )}
                                    title={item.label}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span className="text-[10px] font-medium">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Label className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Style</Label>
                        <div className="flex flex-wrap gap-3">
                            {COLORS.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setSelectedColor(item.id)}
                                    className={cn(
                                        "w-9 h-9 rounded-full bg-gradient-to-br ring-offset-background transition-all hover:scale-110 outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                        item.class,
                                        selectedColor === item.id
                                            ? "ring-2 ring-offset-2 ring-primary scale-110 shadow-md"
                                            : "opacity-80 hover:opacity-100"
                                    )}
                                    title={item.id}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                <DialogFooter className="px-6 py-4 bg-muted/50 border-t flex items-center justify-end gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSave}>Save Changes</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
