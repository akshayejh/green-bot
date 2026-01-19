import { useRef, useEffect, forwardRef, useImperativeHandle } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowUp, Terminal } from "lucide-react";

interface TerminalInputProps {
    value: string;
    onChange: (value: string) => void;
    onRun: () => void;
    disabled?: boolean;
    loading?: boolean;
    autoFocus?: boolean;
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
    autoFocus = true
}, ref) => {
    const inputRef = useRef<HTMLInputElement>(null);

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

    return (
        <div className="relative flex items-center gap-3 bg-secondary/30 border border-border/50 rounded-xl p-2 px-3 focus-within:ring-1 focus-within:ring-primary/30 focus-within:border-primary/50 transition-all shadow-sm">
            <div className="flex items-center justify-center w-6 h-6 rounded-md bg-secondary text-muted-foreground shrink-0">
                <Terminal className="w-3.5 h-3.5" />
            </div>
            <Input
                ref={inputRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onRun()}
                placeholder={disabled ? "Connect device to start terminal" : "Execute command..."}
                disabled={disabled}
                className="flex-1 bg-transparent border-none p-0 h-10 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/60 font-mono text-sm selection:bg-primary/20"
                autoComplete="off"
            />
            <Button
                size="icon"
                className="h-8 w-8 rounded-lg bg-foreground text-background hover:bg-foreground/90 hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100 disabled:hover:bg-foreground"
                disabled={disabled || loading || !value.trim()}
                onClick={onRun}
            >
                <ArrowUp className="h-4 w-4 stroke-[2.5px]" />
            </Button>
        </div>
    );
});

TerminalInput.displayName = "TerminalInput";
