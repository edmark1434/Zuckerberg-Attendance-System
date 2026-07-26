import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  UsersIcon,
  UserPlusIcon,
  SchoolIcon,
  KeyRoundIcon,
  CalendarDaysIcon,
  FileBarChartIcon,
  ShieldIcon,
} from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"

const admin = {
  name: "Admin User",
  role: "Registrar / IT Staff",
  email: "admin@school.edu",
}

const navigation = [
  { 
    title: "Dashboard", 
    path: "/admin/dashboard", 
    icon: LayoutDashboardIcon 
  },
  { 
    title: "Student Accounts", 
    path: "/admin/students", 
    icon: UsersIcon,
    description: "Create and manage student accounts"
  },
  { 
    title: "Teacher Accounts", 
    path: "/admin/teachers", 
    icon: UserPlusIcon,
    description: "Create and manage teacher accounts"
  },
  { 
    title: "Classes", 
    path: "/admin/classes", 
    icon: SchoolIcon,
    description: "Create and manage classes"
  },
  { 
    title: "Reset Password", 
    path: "/admin/reset-passwords", 
    icon: KeyRoundIcon,
    description: "Reset teacher account passwords"
  },
  { 
    title: "Academic Years", 
    path: "/admin/academic-years", 
    icon: CalendarDaysIcon,
    description: "Manage academic years and semesters"
  },
  { 
    title: "Attendance Reports", 
    path: "/admin/attendance-reports", 
    icon: FileBarChartIcon,
    description: "View all attendance reports"
  },
]

export function AdminAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) => {
    if (path === "/admin/dashboard") {
      return pathname === path
    }
    return pathname === path || pathname?.startsWith(path + "/")
  }

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Admin Portal"
              className="h-14 data-[state=open]:bg-sidebar-accent"
              onClick={() => navigate("/admin/dashboard")}
            >
              <Avatar className="size-9 rounded-lg bg-primary/10">
                <AvatarFallback className="rounded-lg bg-primary font-semibold text-primary-foreground">
                  AD
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{admin.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {admin.role}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Admin Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon className="shrink-0" />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 group-data-[collapsible=icon]:p-2">
        <div className="rounded-lg border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden">
          <div className="flex items-center gap-2">
            <ShieldIcon className="size-4 text-muted-foreground" />
            <p className="text-xs font-medium text-muted-foreground">Administrator</p>
          </div>
          <p className="mt-1 text-sm font-medium">{admin.email}</p>
          <div className="my-3 border-t" />
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Access Level</p>
            <p className="text-xs font-medium">Full System Access</p>
          </div>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:justify-center"
          onClick={() => navigate("/login")}
        >
          <LogOutIcon className="shrink-0" />
          <span className="group-data-[collapsible=icon]:hidden">Log out</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
