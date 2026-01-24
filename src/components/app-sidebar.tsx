"use client"

import * as React from "react"
import {
  Monitor,
  Folder,
  Terminal,
  FileText,
  Smartphone,
  Package,
  Settings,
  RefreshCw,
} from "lucide-react"
import { invoke } from "@tauri-apps/api/core"
import { toast } from "sonner"

import { NavMain } from "@/components/nav-main"
import { DeviceSelector } from "@/components/device-selector"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { useDeviceStore } from "@/store/device-store"

const data = {
  main: [
    {
      title: "Devices",
      icon: Smartphone,
      id: "devices",
    },
    {
      title: "Settings",
      icon: Settings,
      id: "settings",
    },
  ],
  tools: [
    {
      title: "Screen Mirror",
      icon: Monitor,
      id: "mirror",
    },
    {
      title: "File Manager",
      icon: Folder,
      id: "files",
    },
    {
      title: "Package Manager",
      icon: Package,
      id: "packages",
    },
    {
      title: "Terminal",
      icon: Terminal,
      id: "terminal",
    },
    {
      title: "Logs",
      icon: FileText,
      id: "logs",
    },
  ],
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  currentView: string;
  onViewChange: (view: string) => void;
}

export function AppSidebar({ currentView, onViewChange, ...props }: AppSidebarProps) {
  const devices = useDeviceStore((state) => state.devices);
  const selectedSerial = useDeviceStore((state) => state.selectedSerial);

  // Check if selected device is online
  const selectedDevice = devices.find(d => d.serial === selectedSerial);
  const isDeviceOnline = selectedDevice?.state === 'device';
  const toolsDisabled = !selectedSerial || !isDeviceOnline;

  const handleViewChange = (id: string) => {
    onViewChange(id);
  };

  const handleRestartAdb = async () => {
    const toastId = toast.loading("Restarting ADB server...");
    try {
      await invoke("restart_adb_server");
      toast.success("ADB server restarted", { id: toastId });
      // Refresh devices after restart
      useDeviceStore.getState().refreshDevices();
    } catch (error) {
      toast.error(`Failed to restart ADB: ${error}`, { id: toastId });
    }
  };

  return (
    <Sidebar variant="sidebar" {...props}>
      <SidebarHeader className="p-2">
        <DeviceSelector size="lg" />
      </SidebarHeader>
      <SidebarContent>
        <NavMain title="Tools" items={data.tools} currentView={currentView} onViewChange={handleViewChange} disabled={toolsDisabled} />
        <NavMain title="Main" items={data.main} currentView={currentView} onViewChange={handleViewChange} />
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleRestartAdb}
              className="text-muted-foreground hover:text-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
            >
              <RefreshCw />
              <span>Restart ADB Server</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
