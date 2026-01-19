import { type LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  title,
  items,
  currentView,
  onViewChange,
  disabled = false,
}: {
  title: string
  items: {
    title: string
    id: string
    icon: LucideIcon
  }[]
  currentView: string
  onViewChange: (view: string) => void
  disabled?: boolean
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{title}</SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              isActive={currentView === item.id}
              onClick={() => !disabled && onViewChange(item.id)}
              tooltip={disabled ? `${item.title} (No device selected)` : item.title}
              disabled={disabled}
            >
              <item.icon />
              <span>{item.title}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
