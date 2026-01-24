import { useState } from "react";
import { ArrowLeft, ArrowUp, Home, RefreshCw, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toolbar, ToolbarLeft } from "@/components/toolbar";
import { useFileStore } from "@/store/file-store";
import { useDeviceStore } from "@/store/device-store";
import { ProcessIndicator } from "./process-indicator";
import { UploadDialog } from "./upload-dialog";

export function FileToolbar() {
    const {
        path, setPath, navigateTo, navigateBack, navigateUp, loadFiles,
        historyIndex, isLoading
    } = useFileStore();

    const selectedSerial = useDeviceStore((state) => state.selectedSerial);
    const [uploadOpen, setUploadOpen] = useState(false);

    const handleRefresh = () => {
        loadFiles(selectedSerial);
    };

    return (
        <Toolbar className="justify-between">
            <ToolbarLeft className="flex-1">
                <div className="flex gap-1">
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={navigateBack}
                        disabled={historyIndex <= 0}
                        title="Back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={navigateUp}
                        // Simple check for root, store has more robust check
                        disabled={path === "/" || path === ""}
                        title="Up"
                    >
                        <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={() => navigateTo("/sdcard/")}
                        disabled={!selectedSerial}
                        title="Home"
                    >
                        <Home className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="outline"
                        size="icon-sm"
                        onClick={handleRefresh}
                        disabled={!selectedSerial || isLoading}
                        title="Refresh"
                    >
                        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setUploadOpen(true)}
                        disabled={!selectedSerial}
                        title="Upload File"
                    >
                        <Upload className="h-4 w-4" />
                        <span className="text-sm">Upload</span>
                    </Button>
                </div>

                <Input
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && navigateTo(path)}
                    className="bg-muted/50 h-8 flex-1 font-mono text-xs"
                />
            </ToolbarLeft>
            <ProcessIndicator />
            <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} />
        </Toolbar>
    );
}
