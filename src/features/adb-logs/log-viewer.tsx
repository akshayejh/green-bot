import { useState, useEffect, useMemo } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";
import { useDeviceStore } from "@/store/device-store";
import { useSettingsStore } from "@/store/settings-store";
import { LogToolbar } from "./log-toolbar";
import { LogList } from "./log-list";
import { LogLevel } from "./types";

export function LogViewer() {
    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const defaultLogLevel = useSettingsStore((state) => state.defaultLogLevel);
    const [logs, setLogs] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isLive, setIsLive] = useState(false);
    const [autoScroll, setAutoScroll] = useState(true);

    // Filters
    const [filterText, setFilterText] = useState("");
    const [minLevel, setMinLevel] = useState<LogLevel>(defaultLogLevel);

    const fetchLogs = async (silent = false) => {
        if (!selectedSerial) return;
        if (!silent) setLoading(true);
        try {
            const res = await invoke<string>("get_adb_logs", { device: selectedSerial });
            setLogs(res);
        } catch (err) {
            console.error(err);
            if (!silent) setLogs(`Error fetching logs: ${err}`);
        } finally {
            if (!silent) setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (selectedSerial) {
            fetchLogs();
            setIsLive(false); // Reset live on device change
        } else {
            setLogs("");
        }
    }, [selectedSerial]);

    // Live polling
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isLive && selectedSerial) {
            if (autoScroll) {
                // Initial fetch when starting live
                fetchLogs(true);
            }
            interval = setInterval(() => {
                fetchLogs(true);
            }, 2000);
        }
        return () => clearInterval(interval);
    }, [isLive, selectedSerial, autoScroll]);

    const handleClear = async () => {
        if (!selectedSerial) return;
        try {
            await invoke("run_adb_command", { device: selectedSerial, command: "logcat -c" });
            setLogs("");
            toast.success("Logcat buffer cleared");
        } catch (err) {
            toast.error("Failed to clear logs");
        }
    };

    // Derived state for filtered logs
    const filteredLogs = useMemo(() => {
        if (!logs) return [];
        const lines = logs.split('\n');

        return lines.filter(line => {
            if (!line.trim()) return false;

            // Text Filter
            if (filterText && !line.toLowerCase().includes(filterText.toLowerCase())) {
                return false;
            }

            // Level Filter
            // Simple heuristic to detect level
            let levelWeight = 0; // V
            if (line.includes(" E ") || line.startsWith("E/")) levelWeight = 4;
            else if (line.includes(" F ") || line.startsWith("F/")) levelWeight = 4;
            else if (line.includes(" W ") || line.startsWith("W/")) levelWeight = 3;
            else if (line.includes(" I ") || line.startsWith("I/")) levelWeight = 2;
            else if (line.includes(" D ") || line.startsWith("D/")) levelWeight = 1;

            let minWeight = 0;
            switch (minLevel) {
                case 'E': minWeight = 4; break;
                case 'W': minWeight = 3; break;
                case 'I': minWeight = 2; break;
                case 'D': minWeight = 1; break;
                default: minWeight = 0;
            }

            return levelWeight >= minWeight;
        });
    }, [logs, filterText, minLevel]);

    return (
        <div className="flex flex-col h-full bg-background">
            <LogToolbar
                isLive={isLive}
                onToggleLive={() => setIsLive(!isLive)}
                onRefresh={() => fetchLogs(false)}
                onClear={handleClear}
                loading={loading}
                hasDevice={!!selectedSerial}
                filterText={filterText}
                onFilterChange={setFilterText}
                minLevel={minLevel}
                onLevelChange={setMinLevel}
            />

            <LogList
                logs={filteredLogs}
                loading={loading}
                emptySource={!logs}
                autoScroll={autoScroll}
                onResumeAutoScroll={() => setAutoScroll(true)}
                onScrollChange={setAutoScroll}
            />
        </div>
    );
}

