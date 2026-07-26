export { AdminHomePage } from "@/components/admin-pages/dashboard-page"
export { StudentAccountsPage } from "@/components/admin-pages/students-page"
export { TeacherAccountsPage } from "@/components/admin-pages/teachers-page"
export { ClassesPage } from "@/components/admin-pages/sections-page"
export { AttendanceReportsPage } from "@/components/admin-pages/attendance-page"
export { AcademicYearsPage } from "@/components/admin-pages/academic-years-page"
export { ResetPasswordsPage } from "@/components/admin-pages/reset-password-page"

import { ConstructionIcon } from "lucide-react"
import { PageHeader } from "@/components/admin-ui"
import { Card, CardContent } from "@/components/ui/card"

function PendingPage({ title, description }: { title: string; description: string }) {
  return <div className="space-y-6"><PageHeader title={title} description={description} /><Card className="shadow-none"><CardContent className="flex min-h-56 flex-col items-center justify-center text-center"><ConstructionIcon className="size-6 text-muted-foreground" /><h2 className="mt-3 font-medium">Module ready for integration</h2><p className="mt-1 max-w-md text-sm text-muted-foreground">This supporting administrative workflow will use the same service layer and reusable dashboard components when connected.</p></CardContent></Card></div>
}

export function AssignTeachersPage() { return <PendingPage title="Teaching assignments" description="Review and maintain section instructor assignments." /> }
