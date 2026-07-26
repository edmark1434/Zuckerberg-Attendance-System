// src/AdminDashboard.tsx
import { Outlet, useLocation } from "react-router-dom"
import { AdminAppSidebar } from "@/components/admin-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { BellIcon, ShieldIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SectionManagementProvider } from "@/hooks/use-section-management"

const names: Record<string, string> = {
  "/admin/dashboard": "Dashboard",
  "/admin/students": "Student Accounts",
  "/admin/teachers": "Teacher Accounts",
  "/admin/classes": "Classes",
  "/admin/reset-passwords": "Reset Password",
  "/admin/academic-years": "Academic Years",
  "/admin/attendance-reports": "Attendance Reports",
}

export default function AdminDashboard() {
  const { pathname } = useLocation()
  
  return (
    <SectionManagementProvider>
    <SidebarProvider>
      <AdminAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 px-4 backdrop-blur md:px-6">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div className="flex-1">
            <p className="text-xs text-muted-foreground">Admin Portal</p>
            <p className="text-sm font-medium">
              {names[pathname] ?? "Admin Dashboard"}
            </p>
          </div>
          <Button variant="ghost" size="icon" aria-label="Notifications"><BellIcon className="size-4" /></Button>
        </header>
        
        <div className="flex items-center gap-3 border-b bg-primary/5 px-4 py-2 text-sm text-muted-foreground md:px-6">
          <ShieldIcon className="size-4 shrink-0" />
          <span>
            <strong>Admin access:</strong> You have full system access to manage students, teachers, classes, and attendance reports.
          </span>
        </div>
        
        <main className="flex flex-1 flex-col bg-muted/20 p-4 md:p-6 lg:p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
    </SectionManagementProvider>
  )
}
