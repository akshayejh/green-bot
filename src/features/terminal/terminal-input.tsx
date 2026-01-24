import { useRef, useEffect, forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Terminal, History, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TerminalInputProps {
    value: string;
    onChange: (value: string) => void;
    onRun: () => void;
    disabled?: boolean;
    loading?: boolean;
    autoFocus?: boolean;
    history?: string[];
    historyIndex?: number;
    onHistoryNavigate?: (direction: 'up' | 'down') => void;
}

export interface TerminalInputHandle {
    focus: () => void;
}

export const TerminalInput = forwardRef<TerminalInputHandle, TerminalInputProps>(({
    value,
    onChange,
    onRun,
    disabled,
    loading,
    autoFocus = true,
    history = [],
    historyIndex = -1,
    onHistoryNavigate
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const [showHistory, setShowHistory] = useState(false);

    useImperativeHandle(ref, () => ({
        focus: () => {
            inputRef.current?.focus();
        }
    }));

    useEffect(() => {
        if (!loading && autoFocus) {
            // Small timeout to ensure DOM is ready and prevent fighting
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [loading, autoFocus]);

    // Show history popup when navigating
    useEffect(() => {
        if (historyIndex >= 0 && history.length > 0) {
            setShowHistory(true);
        }
    }, [historyIndex, history.length]);

    // Hide history popup when input is empty and not navigating
    useEffect(() => {
        if (historyIndex === -1 && !value) {
            setShowHistory(false);
        }
    }, [historyIndex, value]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            setShowHistory(false);
            onRun();
        } else if (e.key === 'ArrowUp' && onHistoryNavigate) {
            e.preventDefault();
            onHistoryNavigate('up');
        } else if (e.key === 'ArrowDown' && onHistoryNavigate) {
            e.preventDefault();
            onHistoryNavigate('down');
        } else if (e.key === 'Escape') {
            setShowHistory(false);
        }
    };

    const handleHistorySelect = (cmd: string) => {
        onChange(cmd);
        setShowHistory(false);
        inputRef.current?.focus();
    };

    return (
        <div className="relative">
            {/* History Popup */}
            {showHistory && history.length > 0 && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-popover border rounded-lg shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-bottom-2 duration-150">
                    <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/30">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <History className="w-3.5 h-3.5" />
                            <span className="font-medium">Command History</span>
                            <span className="text-[10px] opacity-60">({history.length})</span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            onClick={() => setShowHistory(false)}
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                    <div className="max-h-48 overflow-y-auto">
                        {history.map((cmd, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleHistorySelect(cmd)}
                                className={cn(
                                    "w-full text-left px-3 py-2 text-sm font-mono hover:bg-accent transition-colors flex items-center gap-2",
                                    idx === historyIndex && "bg-accent text-accent-foreground"
                                )}
                            >
                                <span className="text-[10px] text-muted-foreground w-4">{history.length - idx}</span>
                                <span className="truncate">{cmd}</span>
                            </button>
                        ))}
                    </div>
                    <div className="px-3 py-1.5 border-t bg-muted/20 text-[10px] text-muted-foreground flex items-center gap-4">
                        <span><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↑</kbd> <kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">↓</kbd> Navigate</span>
                        <span><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Enter</kbd> Select</span>
                        <span><kbd className="px-1 py-0.5 bg-muted rounded text-[9px]">Esc</kbd> Close</span>
                    </div>
                </div>
            )}

            <div className="relative flex items-center gap-3 bg-secondary/30 border border-border/50 rounded-xl p-2 px-3 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-sm">
                <div className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary text-muted-foreground shrink-0">
                    <Terminal className="w-3.5 h-3.5" />
                </div>
                <Input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={disabled ? "Connect device to start terminal" : "Execute command..."}
                    disabled={disabled}
                    className="flex-1 bg-transparent border-none p-0 h-10 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 font-mono text-sm selection:bg-primary/20"
                    autoComplete="off"
                />
                {history.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-md text-muted-foreground hover:text-foreground"
                        onClick={() => setShowHistory(!showHistory)}
                        title="Command History"
                    >
                        <History className="h-3.5 w-3.5" />
                    </Button>
                )}
                <Button
                    size="icon"
                    className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-foreground"
                    disabled={disabled || loading || !value.trim()}
                    onClick={() => { setShowHistory(false); onRun(); }}
                >
                    <ArrowUp className="h-4 w-4 stroke-[2.5px]" />
                </Button>
            </div>
        </div>
    );
});

TerminalInput.displayName = "TerminalInput";
