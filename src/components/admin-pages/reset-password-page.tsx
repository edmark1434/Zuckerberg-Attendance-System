import { useMemo, useState } from "react"
import { KeyRoundIcon } from "lucide-react"
import { toast } from "sonner"
import { mockTeachers } from "@/mock/teachers"
import { useMockCollection } from "@/hooks/use-mock-collection"
import { useSectionManagement } from "@/hooks/use-section-management"
import { fullName, type Teacher } from "@/types/attendance"
import { AvatarCell, EmptyState, PageHeader, Pagination, SearchInput, StatusBadge } from "@/components/admin-ui"
import { ResetPasswordDialog } from "@/components/reset-password-dialog"
import { resetTeacherPassword } from "@/services/password-reset.service"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

const PAGE_SIZE = 8

export function ResetPasswordsPage() {
  const collection = useMockCollection(mockTeachers)
  const { sections } = useSectionManagement()
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [resetting, setResetting] = useState<Teacher>()
  const filtered = useMemo(() => collection.records.filter((teacher) => `${fullName(teacher)} ${teacher.email}`.toLowerCase().includes(search.toLowerCase())), [collection.records, search])
  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const records = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const sectionFor = (teacherId: string) => sections.find((section) => section.teacherId === teacherId)
  return <div className="space-y-6"><PageHeader title="Reset Password" description="Reset teacher account access and issue a temporary password." /><Card className="shadow-none"><CardContent className="p-0"><div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between"><SearchInput value={search} onChange={(value) => { setSearch(value); setPage(1) }} placeholder="Search teachers by name or email" /><p className="text-sm text-muted-foreground">{filtered.length} teacher account{filtered.length === 1 ? "" : "s"}</p></div><div className="overflow-x-auto">{records.length ? <Table><TableHeader><TableRow><TableHead>Teacher</TableHead><TableHead className="hidden md:table-cell">Email address</TableHead><TableHead>Assigned section</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Action</TableHead></TableRow></TableHeader><TableBody>{records.map((teacher) => { const section = sectionFor(teacher.id); return <TableRow key={teacher.id}><TableCell><AvatarCell name={fullName(teacher)} /></TableCell><TableCell className="hidden text-muted-foreground md:table-cell">{teacher.email}</TableCell><TableCell><span className="font-medium">{section?.code ?? "Unassigned"}</span>{section && <span className="block text-xs text-muted-foreground">{section.name}</span>}</TableCell><TableCell><StatusBadge status={teacher.status} /></TableCell><TableCell className="text-right"><Button size="sm" variant="outline" onClick={() => setResetting(teacher)}><KeyRoundIcon /> Reset password</Button></TableCell></TableRow> })}</TableBody></Table> : <EmptyState title="No teachers found" description="Try a different name or email address." />}</div>{records.length > 0 && <div className="p-4"><Pagination page={page} total={pages} onPageChange={setPage} /></div>}</CardContent></Card><ResetPasswordDialog open={!!resetting} onOpenChange={(open) => !open && setResetting(undefined)} userType="teacher" name={resetting ? fullName(resetting) : ""} identifier={resetting?.email ?? ""} onReset={async () => { if (!resetting) return; collection.update(resetTeacherPassword(resetting)); await new Promise<void>((resolve) => setTimeout(resolve, 400)); toast.success("Teacher password reset. They must change it after signing in."); setResetting(undefined) }} /></div>
}
