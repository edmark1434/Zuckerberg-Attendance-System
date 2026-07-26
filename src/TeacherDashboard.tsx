// src/TeacherDashboard.tsx
import { Outlet, useLocation } from "react-router-dom"
import { TeacherAppSidebar } from "@/components/teacher-app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { BellRingIcon } from "lucide-react"

const names: Record<string, string> = {
  "/teacher/dashboard": "Dashboard", 
  "/teacher/attendance": "Attendance Management", 
  "/teacher/attendance/scanner": "QR Scanner", 
  "/teacher/students": "Students",
}

export default function TeacherDashboard() {
  const { pathname } = useLocation()
  
  return (
    <SidebarProvider>
      <TeacherAppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
            <p className="text-sm font-medium">{names[pathname] ?? "Teacher Portal"}</p>
          </div>
        </header>
        <div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <BellRingIcon className="size-4 shrink-0" />
          <span>
            <strong>Attendance reminder:</strong> 5 students still need their attendance status updated for today.
          </span>
        </div>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}