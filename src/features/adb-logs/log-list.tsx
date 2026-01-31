import { useRef, memo } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Square } from "lucide-react";
import { Virtuoso, VirtuosoHandle } from "react-virtuoso";

interface LogListProps {
    logs: string[];
    loading: boolean;
    emptySource: boolean;
    autoScroll: boolean;
    onResumeAutoScroll: () => void;
    onScrollChange: (isAtBottom: boolean) => void;
}

// Regex for standard `adb logcat -v threadtime`
// Format: date time pid tid level tag: message
const LOG_REGEX = /^(\d{2}-\d{2}\s+[\d:.]+)\s+(\d+)\s+(\d+)\s+([VDIWEF])\s+(.*?):\s+(.*)$/;

function parseLine(line: string) {
    const match = line.match(LOG_REGEX);
    if (!match) return null;
    return {
        time: match[1],
        pid: match[2],
        tid: match[3],
        level: match[4],
        tag: match[5],
        message: match[6]
    };
}

const LogLine = memo(({ line }: { line: string }) => {
    if (!line.trim()) return null;

    const parsed = parseLine(line);

    // Fallback if regex fails - use the old simple heuristic
    if (!parsed) {
        let colorClass = "text-muted-foreground";
        let bgClass = "transparent";

        if (line.includes(" E ") || line.startsWith("E/")) {
            colorClass = "text-destructive";
            bgClass = "bg-destructive/10 border-l-2 border-destructive/50 pl-3";
        } else if (line.includes(" W ") || line.startsWith("W/")) {
            colorClass = "text-yellow-500 dark:text-yellow-400";
        } else if (line.includes(" I ") || line.startsWith("I/")) {
            colorClass = "text-blue-500 dark:text-blue-400";
        } else if (line.includes(" D ") || line.startsWith("D/")) {
            colorClass = "text-cyan-500 dark:text-cyan-400";
        } else if (line.includes(" V ") || line.startsWith("V/")) {
            colorClass = "text-muted-foreground";
        }

        return (
            <div className={cn(
                "whitespace-pre-wrap break-all py-[1px] px-4 text-[12px] leading-[1.6] hover:bg-muted/50 transition-colors border-l-2 border-transparent font-mono",
                colorClass,
                bgClass === "transparent" ? "" : bgClass
            )}>
                {line}
            </div>
        );
    }

    // Parsed rendering
    const { time, level, tag, message } = parsed;

    let levelColor = "text-muted-foreground";
    let bgClass = "transparent";
    let messageColor = "text-foreground/80";

    switch (level) {
        case 'E':
        case 'F':
            levelColor = "text-destructive font-bold";
            messageColor = "text-destructive/80";
            bgClass = "bg-destructive/10 border-l-2 border-destructive/50 pl-3";
            break;
        case 'W':
            levelColor = "text-yellow-500 dark:text-yellow-400 font-bold";
            messageColor = "text-yellow-600 dark:text-yellow-200";
            break;
        case 'I':
            levelColor = "text-blue-500 dark:text-blue-400 font-bold";
            messageColor = "text-blue-600 dark:text-blue-100";
            break;
        case 'D':
            levelColor = "text-cyan-500 dark:text-cyan-400 font-bold";
            messageColor = "text-cyan-600 dark:text-cyan-100";
            break;
        case 'V':
        default:
            levelColor = "text-muted-foreground";
            messageColor = "text-muted-foreground";
            break;
    }

    return (
        <div className={cn(
            "whitespace-pre-wrap break-all py-[1px] px-4 text-[12px] leading-[1.6] hover:bg-muted/50 transition-colors border-l-2 border-transparent font-mono flex gap-2",
            bgClass === "transparent" ? "" : bgClass
        )}>
            <span className="text-muted-foreground/60 shrink-0 w-[110px] select-none">{time}</span>
            <span className={cn("shrink-0 w-[10px] text-center", levelColor)}>{level}</span>
            <span className="text-muted-foreground shrink-0 max-w-[150px] truncate" title={tag}>{tag}:</span>
            <span className={cn("flex-1", messageColor)}>{message}</span>
        </div>
    );
});
LogLine.displayName = "LogLine";

export function LogList({
    logs,
    loading,
    emptySource,
    autoScroll,
    onResumeAutoScroll,
    onScrollChange
}: LogListProps) {
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    return (
        <div className="flex-1 overflow-hidden relative group h-full">
            {/* Loading State Overlay */}
            {loading && emptySource && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/50 backdrop-blur-[1px] z-10 space-y-4">
                    <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-primary" />
                    <p className="text-sm text-muted-foreground font-medium animate-pulse">Fetching logs...</p>
                </div>
            )}

            {!emptySource ? (
                logs.length > 0 ? (
                    <Virtuoso
                        ref={virtuosoRef}
                        style={{ height: "100%" }}
                        totalCount={logs.length}
                        itemContent={(index) => <LogLine line={logs[index]} />}
                        followOutput={autoScroll ? "auto" : false}
                        atBottomStateChange={(isAtBottom) => {
                            // Only update if the state actually changes to avoid loops
                            // virtuoso handles isAtBottom logic quite well
                            onScrollChange(isAtBottom);
                        }}
                        className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent select-text bg-background text-xs"
                    />
                ) : (
                    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent select-text bg-background">
                        <div className="p-8 text-center text-muted-foreground italic">
                            No logs match current filters.
                        </div>
                    </div>
                )
            ) : (
                !loading && (
                    <div className="flex flex-col items-center justify-center h-full text-muted-foreground space-y-2 opacity-60">
                        <Square className="w-10 h-10 mb-2 opacity-50 border-2 border-dashed border-muted rounded-lg p-2" />
                        <p className="text-sm">No logs loaded</p>
                    </div>
                )
            )}
            {/* Resume Auto-scroll Button */}
            {!autoScroll && (
                <Button
                    size="sm"
                    className="absolute bottom-4 right-4 shadow-lg bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
                    onClick={() => {
                        onResumeAutoScroll();
                        // Scroll to bottom immediately
                        virtuosoRef.current?.scrollToIndex({
                            index: logs.length - 1,
                            align: "end",
                            behavior: "smooth"
                        });
                    }}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /><path d="m6 15 6 6 6-6" /></svg>
                    Resume Auto-scroll
                </Button>
            )}
        </div>
    );
}
