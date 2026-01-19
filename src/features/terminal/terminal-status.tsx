import { cn } from "@/lib/utils";

interface TerminalStatusProps {
    connected: boolean;
    className?: string;
}

export function TerminalStatus({ connected, className }: TerminalStatusProps) {
    if (!connected) return null;

    return (
        <div className={cn(
            "flex items-center gap-2 px-3 h-8 rounded-md bg-green-500/10 border border-green-500/20",
            className
        )}>
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shrink-0"></div>
            <span className="text-[10px] text-green-500 font-medium tracking-wide uppercase whitespace-nowrap">
                Shell Active
            </span>
        </div>
    );
}
