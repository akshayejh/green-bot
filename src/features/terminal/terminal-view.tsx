import { useState, useRef, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useDeviceStore } from "@/store/device-store";
import { useSettingsStore } from "@/store/settings-store";
import { Toolbar, ToolbarLeft, ToolbarRight } from "@/components/toolbar";
import { TerminalStatus } from "./terminal-status";
import { TerminalWindow, LogLine } from "./terminal-window";
import { TerminalInput, TerminalInputHandle } from "./terminal-input";
import { TerminalCommands } from "./terminal-commands";

export function TerminalView() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const maxCommandHistory = useSettingsStore((state) => state.maxCommandHistory);
    const [input, setInput] = useState("");
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [executing, setExecuting] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [historyIndex, setHistoryIndex] = useState(-1);
    const [savedInput, setSavedInput] = useState(""); // Save current input when navigating history
    const inputRef = useRef<TerminalInputHandle>(null);

    const handleRun = async () => {
        if (!input.trim() || !selectedSerial) return;

        const cmd = input.trim();
        setInput("");

        // Add to history (avoid duplicates at the top)
        setHistory(prev => {
            const filtered = prev.filter(h => h !== cmd);
            return [cmd, ...filtered].slice(0, maxCommandHistory);
        });
        setHistoryIndex(-1);
        setSavedInput("");

        setLogs(prev => [...prev, { type: 'in', text: `$ adb -s ${selectedSerial} shell ${cmd}` }]);
        setExecuting(true);

        try {
            const output = await invoke<string>("run_adb_command", {
                device: selectedSerial,
                command: cmd,
            });
            setLogs(prev => [...prev, { type: 'out', text: output }]);
        } catch (err) {
            setLogs(prev => [...prev, { type: 'err', text: String(err) }]);
        } finally {
            setExecuting(false);
        }
    };

    const handleHistoryNavigate = useCallback((direction: 'up' | 'down') => {
        if (history.length === 0) return;

        if (direction === 'up') {
            if (historyIndex === -1) {
                // Save current input before navigating
                setSavedInput(input);
                setHistoryIndex(0);
                setInput(history[0]);
            } else if (historyIndex < history.length - 1) {
                const newIndex = historyIndex + 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            }
        } else {
            if (historyIndex > 0) {
                const newIndex = historyIndex - 1;
                setHistoryIndex(newIndex);
                setInput(history[newIndex]);
            } else if (historyIndex === 0) {
                // Return to saved input
                setHistoryIndex(-1);
                setInput(savedInput);
            }
        }
    }, [history, historyIndex, input, savedInput]);

    const handleInputChange = (value: string) => {
        setInput(value);
        // Reset history navigation when user types
        if (historyIndex !== -1) {
            setHistoryIndex(-1);
            setSavedInput("");
        }
    };

    const handleQuickCommand = (cmd: string) => {
        setInput(cmd);
        inputRef.current?.focus();
    };

    return (
        <div className="flex flex-col h-full bg-background">
            <Toolbar>
                <ToolbarLeft>
                    <TerminalStatus connected={!!selectedSerial} />
                </ToolbarLeft>
                <ToolbarRight>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setLogs([])}
                        className="text-muted-foreground hover:text-foreground hover:border-destructive/50 hover:bg-destructive/10 transition-colors h-8 text-xs gap-2"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        Clear Terminal
                    </Button>
                </ToolbarRight>
            </Toolbar>

            {/* Terminal Window */}
            <TerminalWindow logs={logs} executing={executing} />

            {/* Input Footer */}
            <div className="p-4 bg-background border-t border-border space-y-3 z-10">
                {/* Quick Chips */}
                <TerminalCommands onCommandSelect={handleQuickCommand} />

                {/* Input Bar */}
                <TerminalInput
                    ref={inputRef}
                    value={input}
                    onChange={handleInputChange}
                    onRun={handleRun}
                    disabled={!selectedSerial}
                    loading={executing}
                    history={history}
                    historyIndex={historyIndex}
                    onHistoryNavigate={handleHistoryNavigate}
                />
            </div>

            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .mask-fade-right {
                    mask-image: linear-gradient(to right, black 90%, transparent 100%);
                }
            `}</style>
        </div>
    );
}
