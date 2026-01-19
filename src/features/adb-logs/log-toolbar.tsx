import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Toolbar, ToolbarLeft, ToolbarRight } from "@/components/toolbar";
import { cn } from "@/lib/utils";
import {
    RefreshCw, Play, Pause, Trash2, Search,
    Filter, ChevronDown, Check, X
} from "lucide-react";
import { LogLevel } from "./types";

interface LogToolbarProps {
    isLive: boolean;
    onToggleLive: () => void;
    onRefresh: () => void;
    onClear: () => void;
    loading: boolean;
    hasDevice: boolean;

    // Filters
    filterText: string;
    onFilterChange: (text: string) => void;
    minLevel: LogLevel;
    onLevelChange: (level: LogLevel) => void;
}

export function LogToolbar({
    isLive,
    onToggleLive,
    onRefresh,
    onClear,
    loading,
    hasDevice,
    filterText,
    onFilterChange,
    minLevel,
    onLevelChange
}: LogToolbarProps) {

    const levelLabel = {
        'V': 'Verbose',
        'D': 'Debug',
        'I': 'Info',
        'W': 'Warning',
        'E': 'Error'
    }[minLevel];

    return (
        <Toolbar className="bg-background p-2 gap-2 h-auto flex-wrap shrink-0 border-b border-border/50">
            <ToolbarLeft className="gap-2">
                <Button
                    variant={isLive ? "default" : "outline"}
                    size="sm"
                    onClick={onToggleLive}
                    disabled={!hasDevice}
                >
                    {isLive ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                    {isLive ? "Live" : "Start Live"}
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onRefresh}
                    disabled={!hasDevice || loading || isLive}
                >
                    <RefreshCw className={cn("h-3.5 w-3.5", loading && "animate-spin")} />
                    Refresh
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                    onClick={onClear}
                    disabled={!hasDevice}
                >
                    <Trash2 className="h-3.5 w-3.5" />
                    Clear
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                            <Filter className="w-3 h-3" />
                            {levelLabel}
                            <ChevronDown />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[150px]">
                        {(['V', 'D', 'I', 'W', 'E'] as LogLevel[]).map((l) => (
                            <DropdownMenuItem key={l} onClick={() => onLevelChange(l)}>
                                <span className="flex-1">
                                    {{ 'V': 'Verbose', 'D': 'Debug', 'I': 'Info', 'W': 'Warning', 'E': 'Error' }[l]}
                                </span>
                                {minLevel === l && <Check className="h-4 w-4" />}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

            </ToolbarLeft>
            <ToolbarRight className="flex-1 justify-end min-w-[200px]">
                <div className="relative w-full max-w-[300px] flex items-center">
                    <Search className="absolute left-3 h-3.5 w-3.5 text-muted-foreground" />
                    <Input
                        placeholder="Filter logs (regex supported)..."
                        value={filterText}
                        onChange={(e) => onFilterChange(e.target.value)}
                        className="h-8 pl-9 pr-8 bg-secondary/30 border-border text-xs focus-visible:ring-1 focus-visible:ring-primary"
                    />
                    {filterText && (
                        <button
                            onClick={() => onFilterChange("")}
                            className="absolute right-2 hover:bg-muted rounded p-0.5 text-muted-foreground hover:text-foreground"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>
            </ToolbarRight>
        </Toolbar>
    );
}
