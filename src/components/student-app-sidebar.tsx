import * as React from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
  LayoutDashboardIcon,
  LogOutIcon,
  UserRoundIcon,
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

const student = {
  name: "Juan Dela Cruz",
  grade: "Grade 10",
  section: "Section A",
  lrn: "123456789012",
  schoolYear: "2025–2026",
}

const navigation = [
  { title: "Dashboard", path: "/student/dashboard", icon: LayoutDashboardIcon },
  { title: "My Profile", path: "/student/profile", icon: UserRoundIcon },
]

export function StudentAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const isActive = (path: string) =>
    path === "/student/dashboard" ? pathname === path : pathname === path

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
      <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              tooltip="Student Portal"
              className="h-14 data-[state=open]:bg-sidebar-accent"
              onClick={() => navigate("/student/dashboard")}
            >
              <Avatar className="size-9 rounded-lg">
                <AvatarFallback className="rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">
                  JD
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">{student.name}</span>
                <span className="truncate text-xs text-muted-foreground">
                  {student.grade} · {student.section}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigation.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={isActive(item.path)}
                    onClick={() => navigate(item.path)}
                  >
                    <item.icon />
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
          <p className="text-xs text-muted-foreground">School year</p>
          <p className="mt-1 text-sm font-medium">{student.schoolYear}</p>
          <div className="my-3 border-t" />
          <p className="text-xs text-muted-foreground">Learner Reference Number</p>
          <p className="mt-1 font-mono text-xs font-medium">{student.lrn}</p>
        </div>
        <Button
          variant="ghost"
          className="mt-2 w-full justify-start text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:justify-center"
          onClick={() => navigate("/login")}
        >
          <LogOutIcon />
          <span className="group-data-[collapsible=icon]:hidden">Log out</span>
        </Button>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
