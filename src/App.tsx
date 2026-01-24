import { useState, useEffect } from "react"
import { AppSidebar } from "@/components/app-sidebar"
import { DeviceList } from "@/features/devices/device-list"
import { FileManager } from "@/features/files/file-manager"
import { TerminalView } from "@/features/terminal/terminal-view"
import { LogViewer } from "@/features/adb-logs/log-viewer"
import { ScreenMirror } from "@/features/mirror/screen-mirror"
import { PackageManager } from "@/features/packages/package-manager"
import { SettingsPage } from "@/features/settings/settings-page"
import { TitleBar } from "@/components/title-bar"
import { useDeviceStore } from "@/store/device-store"
import { useSettingsStore } from "@/store/settings-store"
import { check } from "@tauri-apps/plugin-updater"
import { toast } from "sonner"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"
// Import Toaster from sonner
import { Toaster } from "sonner"

export default function App() {
  const [currentView, setCurrentView] = useState("devices")
  const refreshDevices = useDeviceStore((state) => state.refreshDevices);
  const checkUpdatesOnLaunch = useSettingsStore((state) => state.checkUpdatesOnLaunch);

  useEffect(() => {
    refreshDevices();
  }, [refreshDevices]);

  // Check for updates on launch (if enabled)
  useEffect(() => {
    if (!checkUpdatesOnLaunch || import.meta.env.DEV) return;

    const checkForUpdates = async () => {
      try {
        const update = await check();
        if (update?.available) {
          toast.info(`Update available: v${update.version}`, {
            description: "Go to Settings → Updates to install.",
            duration: 8000,
          });
        }
      } catch {
        // Silently fail on startup check
      }
    };

    // Delay check to not block startup
    const timeout = setTimeout(checkForUpdates, 3000);
    return () => clearTimeout(timeout);
  }, [checkUpdatesOnLaunch]);

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-background">
      <TitleBar />
      <SidebarProvider className="flex-1 overflow-hidden relative min-h-0">
        <AppSidebar
          currentView={currentView}
          onViewChange={setCurrentView}
          className="absolute top-0 inset-y-0 left-0 h-full border-r"
        />
        <SidebarInset className="overflow-hidden flex flex-col h-full">
          <header className="flex h-12 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b bg-background z-10">
            <div className="flex items-center gap-2 w-full pl-2">
              <SidebarTrigger />
              {/* <Separator
                orientation="vertical"
                className="h-12"
              /> */}
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="capitalize">{currentView}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
          </header>

          {/* Main Content Area - All views are mounted but hidden to preserve state */}
          <div className="flex flex-1 flex-col min-h-0 overflow-hidden relative">

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "devices" ? "z-10" : "z-0 hidden")}>
              <DeviceList />
            </div>



            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "mirror" ? "z-10" : "z-0 hidden")}>
              <ScreenMirror />
            </div>

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "files" ? "z-10" : "z-0 hidden")}>
              <FileManager />
            </div>

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "packages" ? "z-10" : "z-0 hidden")}>
              <PackageManager />
            </div>

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "terminal" ? "z-10" : "z-0 hidden")}>
              <TerminalView />
            </div>

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "logs" ? "z-10" : "z-0 hidden")}>
              <LogViewer />
            </div>

            <div className={cn("absolute inset-0 flex flex-col bg-background", currentView === "settings" ? "z-10" : "z-0 hidden")}>
              <SettingsPage />
            </div>

          </div>
        </SidebarInset>
      </SidebarProvider>
      <Toaster />
    </div>
  )
}

