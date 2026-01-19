import { useEffect, useRef, useMemo } from "react";
import { TerminalSquare, ChevronRight, AlertCircle, CheckCircle2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export interface LogLine {
    type: 'in' | 'out' | 'err';
    text: string;
}

interface TerminalWindowProps {
    logs: LogLine[];
    executing: boolean;
}

interface LogBlock {
    id: string;
    command: string | null;
    outputs: LogLine[];
    timestamp: number;
    status: 'success' | 'error' | 'pending';
}

export function TerminalWindow({ logs, executing }: TerminalWindowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Group logs into blocks like Warp/modern terminals
    const blocks = useMemo(() => {
        const groups: LogBlock[] = [];
        let currentGroup: LogBlock | null = null;

        logs.forEach((log, index) => {
            if (log.type === 'in') {
                currentGroup = {
                    id: `block-${index}`,
                    command: log.text.replace(/^\$ adb -s \S+ shell /, ''), // Strip formatting for clean display
                    outputs: [],
                    timestamp: Date.now(),
                    status: 'success' // Optimistic default
                };
                groups.push(currentGroup);
            } else {
                if (!currentGroup) {
                    // Orphaned outputs (e.g. startup messages)
                    currentGroup = {
                        id: `startup`,
                        command: null,
                        outputs: [],
                        timestamp: Date.now(),
                        status: 'success'
                    };
                    groups.push(currentGroup);
                }
                currentGroup.outputs.push(log);
                if (log.type === 'err') {
                    currentGroup.status = 'error';
                }
            }
        });
        return groups;
    }, [logs]);

    useEffect(() => {
        if (scrollRef.current) {
            const el = scrollRef.current;
            requestAnimationFrame(() => {
                el.scrollTop = el.scrollHeight;
            });
        }
    }, [logs, executing]);

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Output copied to clipboard");
    };

    return (
        <div className="flex-1 overflow-hidden relative group bg-background">
            <div
                className="absolute inset-0 overflow-y-auto px-4 py-4 space-y-4 scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent select-text"
                ref={scrollRef}
            >
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-4 animate-in fade-in duration-500 select-none">
                        <div className="w-16 h-16 rounded-2xl bg-muted/50 flex items-center justify-center ring-1 ring-border">
                            <TerminalSquare className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-foreground font-medium font-mono mb-1">Terminal Ready</h3>
                            <p className="text-xs text-muted-foreground max-w-[200px]">
                                Select a device and execute commands to verify connection.
                            </p>
                        </div>
                    </div>
                )}

                {blocks.map((block) => (
                    <div key={block.id} className="group/block rounded-lg overflow-hidden border bg-card/50">
                        {/* Command Header */}
                        {block.command && (
                            <div className="flex items-center gap-3 px-3 py-2 bg-muted/30 border-b group/header hover:bg-muted/50 transition-colors">
                                <div className={cn(
                                    "p-1 rounded bg-background ring-1 ring-inset shadow-sm shrink-0",
                                    block.status === 'error' ? "ring-red-500/20 text-red-500" : "ring-emerald-500/20 text-emerald-500"
                                )}>
                                    <ChevronRight className="w-3.5 h-3.5 stroke-[3px]" />
                                </div>
                                <span className={cn(
                                    "font-mono text-sm font-medium tracking-tight select-text cursor-text",
                                    block.status === 'error' ? "text-red-500" : "text-primary"
                                )}>
                                    {block.command}
                                </span>

                                <div className="ml-auto flex items-center gap-2 opacity-0 group-hover/block:opacity-100 transition-all duration-200 select-none">
                                    <button
                                        onClick={() => handleCopy(block.outputs.map(o => o.text).join('\n'))}
                                        className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                                        title="Copy Output"
                                    >
                                        <Copy className="w-3.5 h-3.5" />
                                    </button>

                                    {block.status === 'error' ? (
                                        <AlertCircle className="w-4 h-4 text-red-500/50" />
                                    ) : (
                                        <CheckCircle2 className="w-4 h-4 text-emerald-500/50" />
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Output Body */}
                        {(block.outputs.length > 0 || !block.command) && (
                            <div className="p-3 font-mono text-sm overflow-x-auto relative">
                                {block.outputs.map((log, i) => (
                                    <div
                                        key={i}
                                        className={cn(
                                            "whitespace-pre-wrap break-all leading-relaxed mb-0.5 last:mb-0 selection:bg-primary/20",
                                            log.type === 'err' ? "text-red-500 bg-red-500/10 -mx-3 px-3 py-1 border-l-2 border-red-500/50" : "text-muted-foreground"
                                        )}
                                    >
                                        {log.text}
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty Output State (Executed but no output) */}
                        {block.command && block.outputs.length === 0 && block.status === 'success' && (
                            <div className="px-3 py-2 text-xs italic text-muted-foreground/60 font-mono select-none">
                                No output
                            </div>
                        )}
                    </div>
                ))}

                {executing && (
                    <div className="flex items-center gap-3 px-4 py-2 opacity-50">
                        <div className="w-2 h-4 bg-emerald-500 animate-pulse rounded-[1px]" />
                        <span className="text-sm text-emerald-500 font-mono italic">Executing command...</span>
                    </div>
                )}
            </div>
        </div>
    );
}