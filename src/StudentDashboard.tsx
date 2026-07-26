// src/StudentDashboard.tsx
import { Outlet, useLocation } from "react-router-dom"
import { StudentAppSidebar } from "@/components/student-app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"

const names: Record<string, string> = {
  "/student/dashboard": "Dashboard", 
  "/student/profile": "My Profile",
}

export default function StudentDashboard() {
  const { pathname } = useLocation()
  
  return (
    <SidebarProvider>
      <StudentAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div>
            <p className="text-xs text-muted-foreground">Student Portal</p>
            <p className="text-sm font-medium">{names[pathname] ?? "Student Portal"}</p>
          </div>
        </header>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}