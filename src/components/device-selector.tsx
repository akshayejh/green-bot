import { useState } from "react";
import { useDeviceStore } from "@/store/device-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Smartphone, Check, Plus, Wifi, Tablet, Tv, Watch, Monitor, Laptop, Car, Gamepad, Glasses, Box } from "lucide-react";
import { cn } from "@/lib/utils";
import { AddDeviceDialog } from "./add-device-dialog";

interface DeviceSelectorProps {
  className?: string;
  size?: "default" | "lg";
}

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

export function DeviceSelector({ className }: DeviceSelectorProps) {
  const devices = useDeviceStore((state) => state.devices);
  const selectedSerial = useDeviceStore((state) => state.selectedSerial);
  const setSelectedSerial = useDeviceStore((state) => state.setSelectedSerial);
  const loading = useDeviceStore((state) => state.loading);
  const refreshDevices = useDeviceStore((state) => state.refreshDevices);
  const deviceMetadata = useDeviceStore((state) => state.deviceMetadata);

  const [connectOpen, setConnectOpen] = useState(false);

  const selectedDevice = devices.find((d) => d.serial === selectedSerial);

  const handleDeviceAdded = () => {
    refreshDevices();
    setConnectOpen(false);
  };

  // Helper to get custom or default icon/color/name for any device (selected or in list)
  const getDeviceDetails = (device: typeof devices[0]) => {
    const metadata = deviceMetadata[device.serial] || {};
    const isWifi = device.serial.includes(":");

    // Check if user has customized this device
    const hasCustomIcon = metadata.icon && metadata.icon !== "smartphone";
    const hasCustomColor = metadata.color && metadata.color !== "green";
    const isDefault = !hasCustomIcon && !hasCustomColor;

    const Icon = ICONS[metadata.icon as keyof typeof ICONS] || (isWifi ? Wifi : Smartphone);
    const colorClass = COLORS[metadata.color as keyof typeof COLORS] || COLORS.sidebar;
    const label = metadata.label || device.model || device.product || device.serial;

    return { Icon, colorClass, label, isDefault };
  };

  const { Icon: SelectedIcon, colorClass: selectedColorClass, label: selectedLabel, isDefault: selectedIsDefault } = selectedDevice
    ? getDeviceDetails(selectedDevice)
    : { Icon: null, colorClass: "", label: "", isDefault: true };

  return (
    <>
      <AddDeviceDialog
        open={connectOpen}
        onOpenChange={setConnectOpen}
        onSuccess={handleDeviceAdded}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div className={cn(
            "flex items-center gap-3 p-2.5 rounded-lg border border-sidebar-border bg-sidebar-accent/20 hover:bg-sidebar-accent/40 transition-all cursor-pointer group select-none",
            className
          )}>
            {selectedIsDefault || !selectedDevice ? (
              /* Default: Show app logo */
              <div className="relative flex items-center justify-center h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-sidebar-accent/50 border border-sidebar-border transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1">
                <img src="/greenbot-icon.png" alt="Green Bot" className="h-10 w-10" />
              </div>
            ) : (
              /* Custom: Show user's icon with color */
              <div className={cn(
                "relative flex items-center justify-center h-10 w-10 shrink-0 overflow-hidden rounded-lg",
                "bg-gradient-to-br",
                selectedColorClass,
                "transition-all duration-300 group-hover:scale-105 group-hover:-rotate-1",
                "border border-white/20 shadow-sm"
              )}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-white/5 to-black/10 pointer-events-none" />
                <div className="absolute inset-0 shadow-[inset_0_0_2px_1px_rgba(255,255,255,0.2)] pointer-events-none rounded-lg" />
                {SelectedIcon && <SelectedIcon className="h-5 w-5 relative z-10 text-black drop-shadow-sm" />}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent opacity-60 pointer-events-none" />
              </div>
            )}

            <div className="flex flex-col text-left overflow-hidden flex-1 min-w-0 gap-0.5">
              <span className="text-[10px] font-bold text-sidebar-foreground/50 uppercase tracking-wider leading-none">Device</span>
              <span className="font-medium text-xs text-sidebar-foreground truncate">
                {selectedDevice
                  ? selectedLabel
                  : loading && devices.length === 0
                    ? "Scanning..."
                    : "No Device"}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-sidebar-foreground/30 group-hover:text-sidebar-foreground/80 transition-colors" />
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[260px] p-1.5" side="bottom" sideOffset={8}>
          <DropdownMenuLabel className="text-[10px] font-medium text-muted-foreground px-2 py-1 uppercase tracking-wider">
            Available Devices
          </DropdownMenuLabel>

          {devices.length === 0 ? (
            <div className="p-3 text-center text-xs text-muted-foreground border border-dashed rounded-md m-1 bg-muted/30">
              No devices found
            </div>
          ) : (
            devices.map((device) => {
              const { Icon: ListIcon, colorClass: listColorClass, label: listLabel, isDefault: listIsDefault } = getDeviceDetails(device);
              return (
                <DropdownMenuItem
                  key={device.serial}
                  onClick={() => setSelectedSerial(device.serial)}
                  className={cn(
                    "flex items-center gap-3 p-2 cursor-pointer rounded-md focus:bg-accent group mb-1",
                    device.serial === selectedSerial && "bg-accent/60"
                  )}
                >
                  {listIsDefault ? (
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border border-border bg-muted/50 shrink-0 transition-colors overflow-hidden relative",
                      device.serial === selectedSerial ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    )}>
                      <img src="/greenbot-icon.png" alt="" className="h-7 w-7" />
                    </div>
                  ) : (
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md border shadow-sm shrink-0 transition-colors overflow-hidden relative",
                      "bg-gradient-to-br",
                      listColorClass,
                      device.serial === selectedSerial ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                    )}>
                      <ListIcon className="h-3.5 w-3.5 text-black" />
                    </div>
                  )}
                  <div className="flex flex-col flex-1 min-w-0">
                    <span className="font-medium text-xs truncate">
                      {listLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground truncate font-mono">
                      {device.serial}
                    </span>
                  </div>
                  {device.serial === selectedSerial && <Check className="h-3.5 w-3.5 text-primary ml-auto" />}
                </DropdownMenuItem>
              );
            })
          )}

          <DropdownMenuSeparator className="my-1" />

          <DropdownMenuItem
            className="p-2 text-primary focus:text-primary focus:bg-primary/5 cursor-pointer w-full"
            onSelect={() => setConnectOpen(true)}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary border border-primary/10">
              <Plus className="h-3.5 w-3.5" />
            </div>
            <div className="flex flex-col text-left">
              <span className="font-medium text-xs">Connect Device</span>
              <span className="text-[10px] text-muted-foreground/80">Pair via USB or Wi-Fi</span>
            </div>
          </DropdownMenuItem>

        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}
