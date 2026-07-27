import { useMemo, useState, useEffect } from "react"
import { KeyRoundIcon } from "lucide-react"
import { toast } from "sonner"

import { fullName, type Teacher, type Section } from "@/types/attendance"
import { AvatarCell, EmptyState, PageHeader, Pagination, SearchInput, StatusBadge } from "@/components/admin-ui"
import { ResetPasswordDialog } from "@/components/reset-password-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { database } from "../../../firebase"
import { ref, onValue } from "firebase/database"

const PAGE_SIZE = 8

export function ResetPasswordsPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [sections, setSections] = useState<Section[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [resetting, setResetting] = useState<Teacher>()

  // Fetch teachers from Firebase
  useEffect(() => {
    const teachersRef = ref(database, "teachers")

    const unsubscribe = onValue(
      teachersRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setTeachers([])
          setLoading(false)
          return
        }

        const teachersData: Teacher[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            uid: value.uid || "",
            firstName: value.firstName || "",
            lastName: value.lastName || "",
            middleName: value.middleName || "",
            email: value.email || "",
            status: value.status || "Active",
            password: value.password || "",
            current_password: value.current_password || value.password || "", // Use current_password if exists, fallback to password
            passwordHash: value.passwordHash || "",
            passwordResetAt: value.passwordResetAt || "",
          })
        )

        setTeachers(teachersData)
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load teachers")
        setTeachers([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  // Fetch sections from Firebase
  useEffect(() => {
    const sectionsRef = ref(database, "sections")

    const unsubscribe = onValue(
      sectionsRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setSections([])
          return
        }

        const sectionsData: Section[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            code: value.code || "",
            name: value.name || "",
            yearLevel: value.yearLevel || "Grade 7",
            academicYearId: value.academicYearId || "",
            teacherId: value.teacherId || "",
            studentIds: value.studentIds || [],
            schedule: value.schedule || "",
            createdAt: value.createdAt || new Date().toISOString(),
            updatedAt: value.updatedAt || new Date().toISOString(),
          })
        )

        setSections(sectionsData)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load sections")
        setSections([])
      }
    )

    return () => unsubscribe()
  }, [])

  const filtered = useMemo(
    () =>
      teachers.filter((teacher) =>
        `${fullName(teacher)} ${teacher.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [teachers, search]
  )

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const records = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const sectionFor = (teacherId: string) => {
    return sections.find((section) => section.teacherId === teacherId)
  }

  const handleResetComplete = async () => {
    // Don't close the dialog here - let the dialog handle closing
    // Just refresh the teacher list if needed
    console.log("Reset complete")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reset Password"
        description="Reset teacher account access by generating a new password."
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <SearchInput
              value={search}
              onChange={(value) => {
                setSearch(value)
                setPage(1)
              }}
              placeholder="Search teachers by name or email"
            />
            <p className="text-sm text-muted-foreground">
              {filtered.length} teacher account{filtered.length === 1 ? "" : "s"}
            </p>
          </div>

          <div className="overflow-x-auto">
            {records.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="hidden md:table-cell">Email address</TableHead>
                    <TableHead>Assigned section</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((teacher) => {
                    const section = sectionFor(teacher.id)
                    const hasResetRequest = !!teacher.passwordResetAt
                    
                    return (
                      <TableRow key={teacher.id}>
                        <TableCell>
                          <AvatarCell name={fullName(teacher)} />
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {teacher.email}
                        </TableCell>
                        <TableCell>
                          {section ? (
                            <>
                              <span className="font-medium">{section.code}</span>
                              <span className="block text-xs text-muted-foreground">
                                {section.name}
                              </span>
                            </>
                          ) : (
                            <span className="text-muted-foreground">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={teacher.status} />
                          {hasResetRequest && (
                            <span className="ml-2 text-xs text-muted-foreground">
                              (Reset requested)
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setResetting(teacher)}
                            disabled={teacher.status !== "Active" || !teacher.email || !teacher.current_password}
                          >
                            <KeyRoundIcon /> Reset password
                          </Button>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No teachers found"
                description="Try a different name or email address."
              />
            )}
          </div>

          {records.length > 0 && (
            <div className="p-4">
              <Pagination
                page={page}
                total={pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <ResetPasswordDialog
        open={!!resetting}
        onOpenChange={(open) => !open && setResetting(undefined)}
        userType="teacher"
        name={resetting ? fullName(resetting) : ""}
        identifier={resetting?.email ?? ""}
        userId={resetting?.id}
        email={resetting?.email}
        currentPassword={resetting?.current_password || resetting?.password} // Use current_password or fallback to password
        onReset={handleResetComplete}
      />
    </div>
  )
}