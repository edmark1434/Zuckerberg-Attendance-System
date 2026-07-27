// ==================== TEACHER HOME PAGE ====================
import { useState, useEffect, useMemo } from "react"
import { EditIcon } from "lucide-react"
import { useAuthContext } from "@/context/useContext"
import { database } from "../../../firebase"
import { ref, onValue, query, orderByChild, equalTo } from "firebase/database"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

// ==================== TYPES ====================
interface AttendanceSession {
  session_id: string
  sectionId: string
  date: string
  status: 'active' | 'completed' | 'cancelled'
  lateTime?: string | null
  timeInStartedAt?: string | null
  timeOutStartedAt?: string | null
}

interface AttendanceRecordRaw {
  attendance_id: string
  session_id: string
  studentNumber: string
  studentName?: string
  sectionId: string
  date: string
  time_in: string | null
  time_out: string | null
  status: 'present' | 'late' | 'absent'
}

interface Student {
  id: string
  name: string
  lrn: string
  timeIn: string
  status: 'Present' | 'Late' | 'Absent'
}

// ==================== COMMON COMPONENTS ====================
function Heading({ title, text }: { title: string; text: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{text}</p>
    </div>
  )
}

function Metric({ label, value, helper }: { label: string; value: number | string; helper?: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl">{value}</CardTitle>
      </CardHeader>
      {helper && (
        <CardContent className="pt-0">
          <p className="text-xs text-muted-foreground">{helper}</p>
        </CardContent>
      )}
    </Card>
  )
}

function Status({ value }: { value: string }) {
  const style =
    value === "Present" || value === "present"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
      : value === "Late" || value === "late"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"

  return <Badge className={style}>{value}</Badge>
}

// ==================== HELPERS ====================
function formatTimeTo12Hour(timeStr: string | null | undefined): string {
  if (!timeStr) return "—"
  const [hours, minutes] = timeStr.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`
}

// ==================== ATTENDANCE TABLE ====================
function AttendanceTable({
  records,
  editAction
}: {
  records: Student[];
  editAction?: (id: string) => void
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">LRN</TableHead>
          <TableHead>Time in</TableHead>
          <TableHead>Status</TableHead>
          {editAction && <TableHead className="text-right">Edit</TableHead>}
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.length === 0 ? (
          <TableRow>
            <TableCell colSpan={editAction ? 5 : 4} className="text-center text-sm text-muted-foreground py-8">
              No students in this category
            </TableCell>
          </TableRow>
        ) : (
          records.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium">{student.name}</TableCell>
              <TableCell className="hidden font-mono text-xs md:table-cell">
                {student.lrn}
              </TableCell>
              <TableCell>{student.timeIn}</TableCell>
              <TableCell><Status value={student.status} /></TableCell>
              {editAction && (
                <TableCell className="text-right">
                  <Button
                    size="icon"
                    variant="ghost"
                    aria-label={`Edit ${student.name} attendance`}
                    onClick={() => editAction(student.id)}
                  >
                    <EditIcon />
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

// ==================== TEACHER HOME PAGE ====================
export default function TeacherHomePage() {
  const { teacher } = useAuthContext()
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecordRaw[]>([])
  const [loadingSessions, setLoadingSessions] = useState(true)
  const [loadingAttendance, setLoadingAttendance] = useState(true)

  // Load all attendance sessions for this section so we can find the latest date
  useEffect(() => {
    if (!teacher?.sectionId) {
      setSessions([])
      setLoadingSessions(false)
      return
    }

    const sessionsRef = ref(database, "attendanceSessions")
    const sessionsQuery = query(
      sessionsRef,
      orderByChild("sectionId"),
      equalTo(teacher.sectionId)
    )

    const unsubscribe = onValue(
      sessionsQuery,
      (snapshot) => {
        const data = snapshot.val()
        if (!data) {
          setSessions([])
          setLoadingSessions(false)
          return
        }

        const list: AttendanceSession[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({ session_id: key, ...value })
        )
        setSessions(list)
        setLoadingSessions(false)
      },
      (error) => {
        console.error("Error fetching sessions:", error)
        setLoadingSessions(false)
      }
    )

    return () => unsubscribe()
  }, [teacher?.sectionId])

  // date strings are YYYY-MM-DD, so a plain string comparison finds the latest one
  const latestSession = useMemo(() => {
    if (sessions.length === 0) return null
    return sessions.reduce((latest, s) => (s.date > latest.date ? s : latest), sessions[0])
  }, [sessions])

  // Load attendance records tied to the latest session
  useEffect(() => {
    if (!latestSession) {
      setAttendanceRecords([])
      setLoadingAttendance(false)
      return
    }

    setLoadingAttendance(true)

    const attendanceRef = ref(database, "attendance")
    const attendanceQuery = query(
      attendanceRef,
      orderByChild("session_id"),
      equalTo(latestSession.session_id)
    )

    const unsubscribe = onValue(
      attendanceQuery,
      (snapshot) => {
        const data = snapshot.val()
        console.log("Attendance fetch for session", latestSession.session_id, "raw data:", data)

        if (!data) {
          setAttendanceRecords([])
          setLoadingAttendance(false)
          return
        }

        const list: AttendanceRecordRaw[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({ attendance_id: key, ...value })
        )
        setAttendanceRecords(list)
        setLoadingAttendance(false)
      },
      (error) => {
        console.error("Error fetching attendance records:", error)
        setLoadingAttendance(false)
      }
    )

    return () => unsubscribe()
  }, [latestSession?.session_id])

  // Build rows directly from the attendance records for the latest session.
  // studentName is already stored on each record at scan time, so no
  // separate roster lookup is needed here.
  const classStudents: Student[] = useMemo(() => {
    return attendanceRecords
      .filter(r => !!r.time_in) // only show students who actually timed in
      .map((r) => ({
        id: r.attendance_id,
        name: r.studentName || r.studentNumber,
        lrn: r.studentNumber,
        timeIn: formatTimeTo12Hour(r.time_in),
        status: r.status === 'late' ? 'Late' as const : 'Present' as const
      }))
  }, [attendanceRecords])

  const present = classStudents.filter((student) => student.status === "Present")
  const late = classStudents.filter((student) => student.status === "Late")
  const absent: Student[] = [] // no full roster loaded here, so absentees can't be derived

  const loading = loadingSessions || loadingAttendance

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!teacher?.sectionId) {
    return (
      <div className="space-y-6">
        <Heading title="Teacher Dashboard" text="No section assigned." />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            You are not assigned to any section. Please contact admin.
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!latestSession) {
    return (
      <div className="space-y-6">
        <Heading title="Teacher Dashboard" text={teacher?.sectionName || "No attendance data yet."} />
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            No attendance sessions have been recorded for your section yet.
          </CardContent>
        </Card>
      </div>
    )
  }

  const formattedDate = new Date(latestSession.date).toLocaleDateString()

  return (
    <div className="space-y-6">
      <Heading
        title="Teacher Dashboard"
        text={`Attendance overview for ${formattedDate}.`}
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric
          label="Students present"
          value={present.length}
          helper={`Out of ${classStudents.length} students`}
        />
        <Metric
          label="Late students"
          value={late.length}
          helper="Require follow-up"
        />
        <Metric
          label="Absent students"
          value={absent.length}
          helper="Requires a full class roster to compute"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student attendance</CardTitle>
          <CardDescription>
            View students by their attendance status for {formattedDate}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="present">
            <TabsList>
              <TabsTrigger value="present">
                Present ({present.length})
              </TabsTrigger>
              <TabsTrigger value="late">
                Late ({late.length})
              </TabsTrigger>
              <TabsTrigger value="absent">
                Absent ({absent.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="present" className="pt-4">
              <AttendanceTable records={present} />
            </TabsContent>
            <TabsContent value="late" className="pt-4">
              <AttendanceTable records={late} />
            </TabsContent>
            <TabsContent value="absent" className="pt-4">
              <AttendanceTable records={absent} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}