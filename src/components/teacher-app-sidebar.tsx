import { useLocation, useNavigate } from "react-router-dom"
import { ClipboardCheckIcon, LayoutDashboardIcon, LogOutIcon, ScanLineIcon, UsersRoundIcon } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail } from "@/components/ui/sidebar"

const groups = [
  { label: "Overview", items: [{ title: "Dashboard", path: "/teacher/dashboard", icon: LayoutDashboardIcon }] },
  { label: "Attendance", items: [
    { title: "Attendance Management", path: "/teacher/attendance", icon: ClipboardCheckIcon },
    { title: "QR Scanner", path: "/teacher/attendance/scanner", icon: ScanLineIcon },
  ] },
  { label: "Class Management", items: [{ title: "Students", path: "/teacher/students", icon: UsersRoundIcon }] },
]

export function TeacherAppSidebar(props: React.ComponentProps<typeof Sidebar>) {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  return <Sidebar collapsible="icon" className="border-r border-sidebar-border" {...props}>
    <SidebarHeader className="p-3 group-data-[collapsible=icon]:p-2"><SidebarMenu><SidebarMenuItem><SidebarMenuButton size="lg" tooltip="Teacher Portal" className="h-14" onClick={() => navigate("/teacher/dashboard")}><Avatar className="size-9 rounded-lg"><AvatarFallback className="rounded-lg bg-sidebar-primary font-semibold text-sidebar-primary-foreground">MS</AvatarFallback></Avatar><div className="grid flex-1 text-left text-sm leading-tight"><span className="truncate font-semibold">Maria Santos</span><span className="truncate text-xs text-muted-foreground">Teacher · Grade 10</span></div></SidebarMenuButton></SidebarMenuItem></SidebarMenu></SidebarHeader>
    <SidebarContent className="px-2">{groups.map((group) => <SidebarGroup key={group.label}><SidebarGroupLabel>{group.label}</SidebarGroupLabel><SidebarGroupContent><SidebarMenu>{group.items.map((item) => <SidebarMenuItem key={item.path}><SidebarMenuButton tooltip={item.title} isActive={pathname === item.path} onClick={() => navigate(item.path)}><item.icon /><span>{item.title}</span></SidebarMenuButton></SidebarMenuItem>)}</SidebarMenu></SidebarGroupContent></SidebarGroup>)}</SidebarContent>
    <SidebarFooter className="space-y-2 p-3 group-data-[collapsible=icon]:p-2"><div className="rounded-lg border bg-sidebar-accent/40 p-3 group-data-[collapsible=icon]:hidden"><label className="text-xs text-muted-foreground" htmlFor="school-year">School year</label><select id="school-year" defaultValue="2025-2026" className="mt-1 w-full bg-transparent text-sm font-medium outline-none"><option value="2025-2026">2025–2026</option><option value="2024-2025">2024–2025</option></select><p className="mt-3 text-xs text-muted-foreground">Advisory class</p><p className="mt-1 text-sm font-medium">10 – Section A</p></div><Button variant="ghost" className="w-full justify-start text-muted-foreground hover:text-destructive group-data-[collapsible=icon]:justify-center" onClick={() => navigate("/login")}><LogOutIcon /><span className="group-data-[collapsible=icon]:hidden">Log out</span></Button></SidebarFooter>
    <SidebarRail />
  </Sidebar>
}
