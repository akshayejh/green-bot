import { useProcessStore } from "@/store/process-store";
import { Loader2, CheckCircle2, XCircle, Download, Upload, Activity } from "lucide-react";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

export function ProcessIndicator() {
    const { tasks, clearCompleted } = useProcessStore();
    const activeTasks = tasks.filter(t => t.status === 'running' || t.status === 'pending');
    const hasActive = activeTasks.length > 0;

    return (
        <Popover>
            <PopoverTrigger>
                <Button variant="outline" size="sm" className="relative h-8 w-8 px-0">
                    {hasActive ? (
                        <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    ) : (
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    )}
                    {activeTasks.length > 0 && (
                        <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                            {activeTasks.length}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h4 className="font-semibold text-sm">Background Tasks</h4>
                    {tasks.length > 0 && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={clearCompleted}
                        >
                            Clear Done
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    <div className="p-2 space-y-1">
                        {tasks.length === 0 ? (
                            <div className="py-8 text-center text-sm text-muted-foreground">
                                No active tasks
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div key={task.id} className="flex items-start gap-3 p-3 rounded-md border bg-muted/40 text-sm">
                                    <div className="mt-0.5 shrink-0">
                                        {task.status === 'running' && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                                        {task.status === 'completed' && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                                        {task.status === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                                    </div>
                                    <div className="flex-1 min-w-0 space-y-1">
                                        <div className="font-medium truncate" title={task.name}>{task.name}</div>
                                        <div className="flex items-center gap-2 mt-2 mb-2">
                                            <Badge variant="outline" className="text-[10px] px-1 py-0 h-5">
                                                {task.type === 'download' ? <Download className="h-3 w-3 mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                                                {task.type}
                                            </Badge>
                                        </div>
                                        {task.error && (
                                            <p className="text-xs text-red-500 break-words">{task.error}</p>
                                        )}
                                        {task.status === 'running' && (
                                            <p className="text-xs text-muted-foreground">Processing...</p>
                                        )}
                                        {task.status === 'completed' && (
                                            <p className="text-xs text-muted-foreground">Completed</p>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </ScrollArea>
            </PopoverContent>
        </Popover>
    );
}
