import { Terminal, Cpu, HardDrive, LayoutList, Battery, Wifi, Monitor, RefreshCw, Power, Settings, Smartphone } from "lucide-react";

export const QUICK_COMMANDS = [
    { label: "List Packages", cmd: "pm list packages -3", icon: LayoutList },
    { label: "Battery Info", cmd: "dumpsys battery", icon: Battery },
    { label: "Net Config", cmd: "ifconfig", icon: Wifi },
    { label: "Storage", cmd: "df -h", icon: HardDrive },
    { label: "Top Procs", cmd: "top -n 1 -m 5", icon: Cpu },
    { label: "OS Version", cmd: "getprop ro.build.version.release", icon: Terminal },
    { label: "Display Size", cmd: "wm size", icon: Monitor },
    { label: "Density", cmd: "wm density", icon: Smartphone },
    { label: "Reboot", cmd: "reboot", icon: RefreshCw },
    { label: "Power Button", cmd: "input keyevent 26", icon: Power },
    { label: "Services", cmd: "service list", icon: Settings },
];

interface TerminalCommandsProps {
    onCommandSelect: (cmd: string) => void;
}

export function TerminalCommands({ onCommandSelect }: TerminalCommandsProps) {
    return (
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {QUICK_COMMANDS.map((qc) => {
                const Icon = qc.icon;
                return (
                    <button
                        key={qc.label}
                        onClick={() => onCommandSelect(qc.cmd)}
                        className="group px-3 py-1.5 text-xs font-medium rounded-full bg-secondary/30 hover:bg-secondary text-muted-foreground hover:text-primary transition-all border border-border/50 hover:border-primary/30 whitespace-nowrap flex items-center gap-2"
                    >
                        <Icon className="w-3.5 h-3.5 text-muted-foreground/70 group-hover:text-primary transition-colors" />
                        {qc.label}
                    </button>
                );
            })}
        </div>
    );
}
