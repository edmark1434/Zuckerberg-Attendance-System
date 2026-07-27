import { useMemo, useState } from "react"
import { 
  CheckCircle2Icon, 
  DownloadIcon, 
  EditIcon, 
  EyeIcon, 
  PlusIcon, 
  QrCodeIcon, 
  ScanLineIcon, 
  SearchIcon, 
  Trash2Icon 
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {useAuthContext} from "@/context/useContext"
// ==================== TYPES ====================
type Student = typeof classStudents[number]

// ==================== MOCK DATA ====================
export const teacherToday = { 
  date: "July 13, 2026", 
  schoolYear: "2025–2026", 
  present: 36, 
  late: 3, 
  absent: 2, 
  totalStudents: 41 
}

export const classStudents = [
  { id: "STU-001", name: "Juan Dela Cruz", lrn: "123456789012", status: "Present", timeIn: "7:28 AM" },
  { id: "STU-002", name: "Ana Reyes", lrn: "123456789013", status: "Late", timeIn: "7:43 AM" },
  { id: "STU-003", name: "Carlo Mendoza", lrn: "123456789014", status: "Absent", timeIn: "—" },
  { id: "STU-004", name: "Bianca Cruz", lrn: "123456789015", status: "Present", timeIn: "7:26 AM" },
  { id: "STU-005", name: "Diego Ramos", lrn: "123456789016", status: "Present", timeIn: "7:31 AM" },
]

export const reportSummary = { 
  dailyRate: 87.8, 
  weeklyRate: 91.2, 
  monthlyRate: 93.4 
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

function Status({ value }: { value: string }) {
  const style = 
    value === "Present" 
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" 
      : value === "Late" 
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" 
        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  
  return <Badge className={style}>{value}</Badge>
}

function Metric({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">
        {helper}
      </CardContent>
    </Card>
  )
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
        {records.map((student) => (
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
        ))}
      </TableBody>
    </Table>
  )
}

// ==================== STUDENT ROSTER ====================
function StudentRoster({ 
  records, 
  onDelete 
}: { 
  records: Student[]; 
  onDelete: (id: string) => void 
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Student</TableHead>
          <TableHead className="hidden md:table-cell">LRN</TableHead>
          <TableHead>Attendance</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {records.map((student) => (
          <TableRow key={student.id}>
            <TableCell className="font-medium">{student.name}</TableCell>
            <TableCell className="hidden font-mono text-xs md:table-cell">
              {student.lrn}
            </TableCell>
            <TableCell><Status value={student.status} /></TableCell>
            <TableCell className="space-x-1 text-right">
              <Button size="icon" variant="ghost" aria-label={`Edit ${student.name}`}>
                <EditIcon />
              </Button>
              <Button size="icon" variant="ghost" aria-label={`View ${student.name} QR code`}>
                <QrCodeIcon />
              </Button>
              <Button 
                size="icon" 
                variant="ghost" 
                className="text-destructive hover:text-destructive" 
                aria-label={`Delete ${student.name}`} 
                onClick={() => onDelete(student.id)}
              >
                <Trash2Icon />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

// ==================== TEACHER HOME PAGE ====================
export function TeacherHomePage() {
  const { teacher } = useAuthContext()
  console.log("Teacher in context:", teacher)
  const present = classStudents.filter((student) => student.status === "Present")
  const absent = classStudents.filter((student) => student.status === "Absent")

  return (
    <div className="space-y-6">
      <Heading 
        title="Teacher Dashboard" 
        text={`Attendance overview for ${teacherToday.date}.`} 
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric 
          label="Students present" 
          value={teacherToday.present} 
          helper={`Out of ${teacherToday.totalStudents} students`} 
        />
        <Metric 
          label="Late students" 
          value={teacherToday.late} 
          helper="Require follow-up" 
        />
        <Metric 
          label="Absent students" 
          value={teacherToday.absent} 
          helper="Require verification" 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Student attendance</CardTitle>
          <CardDescription>
            View students by their attendance status for today.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="present">
            <TabsList>
              <TabsTrigger value="present">
                Present ({present.length})
              </TabsTrigger>
              <TabsTrigger value="absent">
                Absent ({absent.length})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="present" className="pt-4">
              <AttendanceTable records={present} />
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

// ==================== ATTENDANCE MANAGEMENT PAGE ====================
export function AttendanceManagementPage() {
  const [records, setRecords] = useState(classStudents)
  const [date, setDate] = useState("2026-07-13")

  const editStatus = (id: string) => {
    setRecords((items) =>
      items.map((student) =>
        student.id === id 
          ? { 
              ...student, 
              status: student.status === "Present" ? "Late" : "Present" 
            } 
          : student
      )
    )
  }

  const exportCsv = () => {
    const blob = new Blob(
      ["student,status\n" + records.map((student) => `${student.name},${student.status}`).join("\n")], 
      { type: "text/csv" }
    )
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.download = `attendance-${date}.csv`
    link.click()
    URL.revokeObjectURL(link.href)
  }

  return (
    <div className="space-y-6">
      <Heading 
        title="Attendance Management" 
        text="Review student attendance and edit records for a selected date." 
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric 
          label="Daily attendance" 
          value={`${reportSummary.dailyRate}%`} 
          helper={`For ${date}`} 
        />
        <Metric 
          label="Weekly attendance" 
          value={`${reportSummary.weeklyRate}%`} 
          helper="Current school week" 
        />
        <Metric 
          label="Monthly attendance" 
          value={`${reportSummary.monthlyRate}%`} 
          helper="Current school month" 
        />
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Student attendance records</CardTitle>
            <CardDescription>
              Filter records before viewing or editing attendance.
            </CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            Record date 
            <select 
              value={date} 
              onChange={(event) => setDate(event.target.value)} 
              className="h-9 rounded-md border bg-background px-3 text-sm"
            >
              <option value="2026-07-13">July 13, 2026</option>
              <option value="2026-07-12">July 12, 2026</option>
              <option value="2026-07-11">July 11, 2026</option>
            </select>
          </label>
        </CardHeader>
        <CardContent className="space-y-4">
          <AttendanceTable records={records} editAction={editStatus} />
          <Button variant="outline" onClick={exportCsv}>
            <DownloadIcon /> Export CSV
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

// ==================== QR SCANNER PAGE ====================
export function QRScannerPage() {
  const [scanned, setScanned] = useState(false)
  const student = classStudents[0]

  return (
    <div className="space-y-6">
      <Heading 
        title="QR Scanner" 
        text="Scan a student QR code to record attendance." 
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-start">
        <Card>
          <CardHeader>
            <CardTitle>Scan student QR code</CardTitle>
            <CardDescription>
              Point the camera at the student's attendance QR code.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex aspect-video items-center justify-center rounded-xl border-2 border-dashed bg-muted/40">
              <div className="flex flex-col items-center gap-3 text-center text-muted-foreground">
                <ScanLineIcon className="size-16" />
                <p className="text-sm">Camera preview will appear here.</p>
              </div>
            </div>
            <Button className="w-full" onClick={() => setScanned(true)}>
              <ScanLineIcon /> {scanned ? "Scan another QR code" : "Start scanner"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scanned student</CardTitle>
            <CardDescription>
              {scanned 
                ? "Attendance has been recorded." 
                : "Student details will appear after a successful scan."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {scanned ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                  <CheckCircle2Icon className="size-5" />
                  <div>
                    <p className="font-medium">Marked present</p>
                    <p className="text-xs">July 13, 2026 · 7:28 AM</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-muted-foreground">Student name</p>
                    <p className="font-medium">{student.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Learner Reference Number</p>
                    <p className="font-mono text-sm">{student.lrn}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Class</p>
                    <p className="font-medium">Grade 10 – Section A</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Attendance status</p>
                    <div className="mt-1"><Status value="Present" /></div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex min-h-64 items-center justify-center text-center text-sm text-muted-foreground">
                Ready to scan a student QR code.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ==================== STUDENT LIST PAGE ====================
export function StudentListPage() {
  const [students, setStudents] = useState(classStudents)
  const [query, setQuery] = useState("")
  const [adding, setAdding] = useState(false)
  const [newName, setNewName] = useState("")

  const filtered = useMemo(
    () => students.filter(
      (student) => `${student.name} ${student.lrn}`
        .toLowerCase()
        .includes(query.toLowerCase())
    ),
    [students, query]
  )

  const addStudent = () => {
    if (!newName.trim()) return
    setStudents((current) => [
      ...current, 
      { 
        id: `STU-${String(current.length + 1).padStart(3, "0")}`, 
        name: newName, 
        lrn: "New LRN", 
        status: "Absent", 
        timeIn: "—" 
      }
    ])
    setNewName("")
    setAdding(false)
  }

  const deleteStudent = (id: string) => {
    setStudents((current) => current.filter((student) => student.id !== id))
  }

  return (
    <div className="space-y-6">
      <Heading 
        title="Students" 
        text="Manage students enrolled in 10 – Section A." 
      />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Class roster</CardTitle>
            <CardDescription>
              {students.length} enrolled students. Search, add, or manage student records.
            </CardDescription>
          </div>
          <Button onClick={() => setAdding((open) => !open)}>
            <PlusIcon /> Add student
          </Button>
        </CardHeader>

        <CardContent className="space-y-4">
          {adding && (
            <div className="flex flex-col gap-2 rounded-lg border bg-muted/40 p-3 sm:flex-row">
              <Input 
                placeholder="Student full name" 
                value={newName} 
                onChange={(event) => setNewName(event.target.value)} 
              />
              <Button onClick={addStudent}>Save student</Button>
            </div>
          )}

          <div className="relative max-w-sm">
            <SearchIcon className="absolute left-3 top-3 size-4 text-muted-foreground" />
            <Input 
              className="pl-9" 
              placeholder="Search student or LRN" 
              value={query} 
              onChange={(event) => setQuery(event.target.value)} 
            />
          </div>

          <StudentRoster records={filtered} onDelete={deleteStudent} />
        </CardContent>
      </Card>
    </div>
  )
}