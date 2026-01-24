import { getCurrentWindow } from "@tauri-apps/api/window";
import { Minus, Square, X, Copy } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.userAgent.includes('Mac'));
  }, []);

  const minimize = async () => {
    try { await getCurrentWindow().minimize(); } catch (e) { console.error(e); }
  };

  const toggleMaximize = async () => {
    try {
      const win = getCurrentWindow();
      const needsToMaximize = !isMaximized;
      setIsMaximized(needsToMaximize);

      if (needsToMaximize) {
        await win.maximize();
      } else {
        await win.unmaximize();
      }
    } catch (e) { console.error(e); }
  };

  const close = async () => {
    try { await getCurrentWindow().close(); } catch (e) { console.error(e); }
  };

  return (
    <div data-tauri-drag-region className={`flex flex-row w-full bg-sidebar border-b select-none shrink-0 overflow-hidden items-center justify-between transition-[height] ${isMac ? 'h-8' : 'h-10'}`}>
      {/* Left: App name (Windows/Linux) or Empty (Mac) */}
      <div className={`flex items-center gap-2 px-3 text-sidebar-foreground/50 justify-self-start pointer-events-none ${isMac ? 'hidden' : ''}`}>
        <span className="text-xs font-medium tracking-wide">Green Bot</span>
      </div>

      {/* Right: Window Controls (Windows/Linux) or App name (Mac) */}
      <div data-tauri-drag-region className="flex flex-1 items-center justify-end h-full pr-3">
        {isMac ? (
          <div className="flex items-center gap-1.5 text-sidebar-foreground/40 pointer-events-none">
            <span className="text-xs font-medium tracking-wide">Green Bot</span>
          </div>
        ) : (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-yellow-500/15 hover:text-yellow-600 dark:hover:text-yellow-400"
              onClick={minimize}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-green-500/15 hover:text-green-600 dark:hover:text-green-400"
              onClick={toggleMaximize}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {isMaximized ? (
                <Copy className="h-3.5 w-3.5" />
              ) : (
                <Square className="h-3.5 w-3.5" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-sm hover:bg-red-500/15 hover:text-red-600 dark:hover:text-red-400"
              onClick={close}
              onMouseDown={(e) => e.stopPropagation()}
            >
              <X className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
