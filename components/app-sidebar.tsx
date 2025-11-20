"use client"

import type * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Factory,
  Truck,
  CreditCard,
  BarChart3,
  Settings,
  Box,
  FileText,
  Briefcase,
} from "lucide-react"
import { usePathname } from "next/navigation"
import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"

const navItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Inventario",
    url: "/inventory",
    icon: Box,
  },
  {
    title: "Compras",
    url: "/purchases",
    icon: ShoppingCart,
  },
  {
    title: "Ventas",
    url: "/sales",
    icon: FileText,
  },
  {
    title: "Producción",
    url: "/production",
    icon: Factory,
  },
  {
    title: "Logística",
    url: "/logistics",
    icon: Truck,
  },
  {
    title: "Finanzas",
    url: "/finance",
    icon: CreditCard,
  },
  {
    title: "Recursos Humanos",
    url: "/hr",
    icon: Users,
  },
  {
    title: "Reportes y Analítica",
    url: "/reports",
    icon: BarChart3,
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Briefcase className="h-4 w-4" />
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">Aura ERP</span>
            <span className="truncate text-xs text-muted-foreground">ERP - MaderexTK</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarSeparator />
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={pathname === item.url}
                tooltip={item.title}
                className={
                  pathname === item.url
                    ? "border-l-4 border-primary bg-sidebar-accent text-sidebar-accent-foreground font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }
              >
                <Link href={item.url}>
                  <item.icon className={pathname === item.url ? "text-primary" : ""} />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton>
              {/* <Settings />
              <span>Configuración</span> */}
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <div className="flex items-center gap-2 px-2 py-1.5">
              <ModeToggle />
              <span className="text-sm text-muted-foreground">Tema</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
