// ==================== QR SCANNER PAGE ====================
import { useState, useEffect, useRef } from "react"
import { 
  ScanLineIcon, 
  CheckCircle2Icon, 
  ClockIcon, 
  CalendarIcon, 
  PlayIcon, 
  RefreshCwIcon,
  AlertCircleIcon,
  HistoryIcon,
  UserIcon,
  FingerprintIcon,
  LogInIcon,
  LogOutIcon,
  StopCircleIcon
} from "lucide-react"
import { toast } from "sonner"
import { useAuthContext } from "@/context/useContext"
import { database } from "../../../firebase"
import { ref, push, set, onValue, query, orderByChild, equalTo, get, update } from "firebase/database"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Scanner, type IDetectedBarcode } from "@yudiel/react-qr-scanner"

interface AttendanceSession {
  session_id: string
  sectionId: string
  academicYearId: string
  date: string
  created_at: string
  updated_at: string
  status: 'active' | 'completed' | 'cancelled'
  started_by_user_type: 'teacher' | 'admin'
  started_by_id: string
  started_by_name?: string
  timeInStartedAt?: string | null
  timeOutStartedAt?: string | null
  lateTime?: string | null
}

interface AttendanceRecord {
  attendance_id: string
  session_id: string
  studentNumber: string
  studentName?: string
  sectionId: string
  date: string
  time_in: string | null
  time_out: string | null
  status: 'present' | 'late' | 'absent'
  created_at: string
  updated_at: string
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
    value === "Present" || value === "present"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300" 
      : value === "Late" || value === "late"
        ? "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300" 
        : "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300"
  
  return <Badge className={style}>{value}</Badge>
}

// ==================== HELPER FUNCTIONS ====================
function formatTimeTo12Hour(timeStr: string): string {
  if (!timeStr) return ""
  const [hours, minutes] = timeStr.split(':').map(Number)
  const ampm = hours >= 12 ? 'PM' : 'AM'
  const hour12 = hours % 12 || 12
  return `${hour12}:${String(minutes).padStart(2, '0')} ${ampm}`
}

function getTodayDateStr(): string {
  return new Date().toISOString().split('T')[0]
}

// ==================== QR SCANNER PAGE ====================
export default function QRScannerPage() {
  const { teacher } = useAuthContext()
  const [scanned, setScanned] = useState(false)
  const [scannedStudent, setScannedStudent] = useState<any>(null)
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(null)
  const [sessions, setSessions] = useState<AttendanceSession[]>([])
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [showSessions, setShowSessions] = useState(false)
  const [isCreating, setIsCreating] = useState(false)
  const [isEnding, setIsEnding] = useState(false)
  const [studentNumberInput, setStudentNumberInput] = useState("")
  const [showSessionTypeModal, setShowSessionTypeModal] = useState(false)
  const [showLateTimeModal, setShowLateTimeModal] = useState(false)
  const [lateTime, setLateTime] = useState("")
  // Explicit "which mode am I recording in right now" — no longer inferred
  // by comparing timeInStartedAt/timeOutStartedAt (that broke once both were set).
  const [selectedType, setSelectedType] = useState<'time_in' | 'time_out' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [lastError, setLastError] = useState<string | null>(null)
  
  const unsubscribeRef = useRef<(() => void) | null>(null)
  const attendanceUnsubscribeRef = useRef<(() => void) | null>(null)

  // Fetch all sessions for this section (real-time)
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }

    if (!teacher?.sectionId) {
      setSessions([])
      setActiveSession(null)
      setLoading(false)
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
          setActiveSession(null)
          setLoading(false)
          return
        }

        const sessionsList: AttendanceSession[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            session_id: key,
            ...value
          })
        )

        sessionsList.sort((a, b) => b.date.localeCompare(a.date))
        setSessions(sessionsList)

        const dateStr = getTodayDateStr()
        const todaySession = sessionsList.find(s => s.date === dateStr) || null
        setActiveSession(todaySession)
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching sessions:", error)
        toast.error("Failed to load sessions")
        setLoading(false)
      }
    )

    unsubscribeRef.current = unsubscribe

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
        unsubscribeRef.current = null
      }
    }
  }, [teacher?.sectionId])

  // Fetch attendance records for today
  useEffect(() => {
    if (attendanceUnsubscribeRef.current) {
      attendanceUnsubscribeRef.current()
      attendanceUnsubscribeRef.current = null
    }

    if (!teacher?.sectionId) {
      setAttendanceRecords([])
      return
    }

    const dateStr = getTodayDateStr()

    const attendanceRef = ref(database, "attendance")
    const attendanceQuery = query(
      attendanceRef,
      orderByChild("date"),
      equalTo(dateStr)
    )

    const unsubscribe = onValue(
      attendanceQuery,
      (snapshot) => {
        const data = snapshot.val()
        
        if (!data) {
          setAttendanceRecords([])
          return
        }

        const records: AttendanceRecord[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            attendance_id: key,
            ...value
          })
        )

        const filteredRecords = records.filter(
          record => record.sectionId === teacher.sectionId
        )

        setAttendanceRecords(filteredRecords)
      },
      (error) => {
        console.error("Error fetching attendance records:", error)
      }
    )

    attendanceUnsubscribeRef.current = unsubscribe

    return () => {
      if (attendanceUnsubscribeRef.current) {
        attendanceUnsubscribeRef.current()
        attendanceUnsubscribeRef.current = null
      }
    }
  }, [teacher?.sectionId])

  // Single source of truth for "does today already have a session doc".
  // Reads from the already-synced `sessions` state — no extra network round trip.
  const getTodaySession = (): AttendanceSession | null => {
    const dateStr = getTodayDateStr()
    return sessions.find(s => s.date === dateStr) || null
  }

  // Handle session type selection (Time In / Time Out)
  const handleSessionTypeSelect = (type: 'time_in' | 'time_out') => {
    setSelectedType(type)
    setShowSessionTypeModal(false)

    const existingSession = getTodaySession()

    // If today's session already has this field set, don't touch it — just inform.
    if (existingSession) {
      const alreadyStarted = type === 'time_in'
        ? existingSession.timeInStartedAt
        : existingSession.timeOutStartedAt

      if (alreadyStarted) {
        toast.info(
          `${type === 'time_in' ? 'Time In' : 'Time Out'} already started at ${formatTimeTo12Hour(alreadyStarted)}`
        )
        setActiveSession(existingSession)
        return
      }
    }

    if (type === 'time_in') {
      // Time In always needs a Late Time cutoff, whether we're creating the
      // session doc or just adding timeInStartedAt to an existing one.
      setShowLateTimeModal(true)
      setLateTime("08:00")
    } else {
      upsertSession('time_out', existingSession)
    }
  }

  // Create the Time In field (after Late Time is confirmed) on today's session,
  // creating the session doc only if it doesn't exist yet.
  const createTimeInSession = () => {
    if (!lateTime || lateTime.trim() === "") {
      toast.error("Please set a Late Time")
      return
    }
    const existingSession = getTodaySession()
    upsertSession('time_in', existingSession, lateTime)
  }

  // Create OR update the single attendance session for today.
  // - If a session already exists for (date, sectionId): update just the
  //   relevant field on that doc.
  // - If it doesn't exist yet: create it once, with both timestamp fields
  //   present (the other left null) so future Time In/Out calls always find it.
  const upsertSession = async (
    type: 'time_in' | 'time_out',
    existingSession: AttendanceSession | null,
    lateTimeValue?: string
  ) => {
    if (!teacher) return

    setIsCreating(true)

    try {
      const now = new Date()
      const dateStr = getTodayDateStr()
      const timeStr = now.toTimeString().slice(0, 8)

      if (existingSession) {
        const sessionRef = ref(database, `attendanceSessions/${existingSession.session_id}`)
        const updateData: any = {
          status: 'active',
          updated_at: now.toISOString(),
        }

        if (type === 'time_in') {
          updateData.timeInStartedAt = timeStr
          if (lateTimeValue) updateData.lateTime = lateTimeValue
        } else {
          updateData.timeOutStartedAt = timeStr
        }

        await update(sessionRef, updateData)

        const updatedSession: AttendanceSession = { ...existingSession, ...updateData }
        setActiveSession(updatedSession)

        toast.success(
          type === 'time_in'
            ? `Time In started at ${formatTimeTo12Hour(timeStr)}`
            : `Time Out started at ${formatTimeTo12Hour(timeStr)}`
        )
      } else {
        const sessionsRef = ref(database, "attendanceSessions")
        const newSessionRef = push(sessionsRef)

        const sessionData: any = {
          sectionId: teacher.sectionId,
          academicYearId: teacher.academicYearId || "",
          date: dateStr,
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          status: 'active' as const,
          started_by_user_type: 'teacher' as const,
          started_by_id: teacher.teacher_id || teacher.uid,
          started_by_name: `${teacher.firstName} ${teacher.lastName}`,
          timeInStartedAt: type === 'time_in' ? timeStr : null,
          timeOutStartedAt: type === 'time_out' ? timeStr : null,
        }

        if (type === 'time_in' && lateTimeValue) {
          sessionData.lateTime = lateTimeValue
        }

        await set(newSessionRef, sessionData)

        const newSession: AttendanceSession = { session_id: newSessionRef.key!, ...sessionData }
        setActiveSession(newSession)

        toast.success(
          type === 'time_in'
            ? `Time In session created with Late Time: ${lateTimeValue}`
            : `Time Out session started!`
        )
      }

      setShowLateTimeModal(false)
    } catch (error) {
      console.error("Error saving session:", error)
      toast.error("Failed to save session")
    } finally {
      setIsCreating(false)
    }
  }

  // End the current attendance session
  const endSession = async () => {
    if (!activeSession) return

    setIsEnding(true)

    try {
      const sessionRef = ref(database, `attendanceSessions/${activeSession.session_id}`)
      const now = new Date()

      await set(sessionRef, {
        ...activeSession,
        updated_at: now.toISOString()
      })

      toast.success("Attendance session ended!")
      setActiveSession(null)
      setScanned(false)
      setScannedStudent(null)
      setSelectedType(null)

    } catch (error) {
      console.error("Error ending session:", error)
      toast.error("Failed to end attendance session")
    } finally {
      setIsEnding(false)
    }
  }

  // Handle scan from QR scanner
  const handleScan = (detectedCodes: IDetectedBarcode[]) => {
    if (isProcessing) return
    if (!detectedCodes || detectedCodes.length === 0) return

    const value = detectedCodes[0].rawValue
    console.log("Scanned:", value)

    processScannedData(value)

    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 1500)
  }

  // Handle scanner errors
  const handleError = (error: unknown) => {
    console.error("Scanner error:", error)
    const message = error instanceof Error ? error.message : String(error)
    setLastError(message)
    
    if (message.includes("Permission denied")) {
      toast.error("Camera permission denied. Please allow camera access.")
    } else if (message.includes("NotFoundError")) {
      toast.error("No camera found. Please connect a camera.")
    }
  }

  // Process scanned QR data
  const processScannedData = (scannedData: string) => {
    if (isProcessing) return
    
    console.log("Processing scanned data:", scannedData)
    setIsProcessing(true)
    
    try {
      let studentNumber: string | null = null
      let studentData: any = null
      
      try {
        const parsedData = JSON.parse(scannedData)
        studentNumber = parsedData.studentNumber || parsedData.student_number || parsedData.id
        studentData = parsedData
      } catch {
        if (typeof scannedData === 'string') {
          if (scannedData.match(/^STUD-\d+$/) || scannedData.match(/^\d+$/)) {
            studentNumber = scannedData
          } else {
            const numberMatch = scannedData.match(/(STUD-\d+|\d+)/)
            if (numberMatch) {
              studentNumber = numberMatch[1]
            }
          }
        }
      }
      
      if (studentNumber) {
        recordAttendance(studentNumber, studentData)
      } else {
        toast.error("Invalid QR code: No student number found")
        setIsProcessing(false)
      }
    } catch (error) {
      console.error("Error processing scan:", error)
      toast.error("Failed to process QR code")
      setIsProcessing(false)
    }
  }

  // Get student by student number from database
  const getStudentByNumber = async (studentNumber: string) => {
    try {
      const studentsRef = ref(database, "students")
      const studentsQuery = query(
        studentsRef,
        orderByChild("studentNumber"),
        equalTo(studentNumber)
      )
      
      const snapshot = await get(studentsQuery)
      
      if (!snapshot.exists()) {
        return null
      }

      const studentData = snapshot.val()
      const studentId = Object.keys(studentData)[0]
      const student = studentData[studentId]

      return {
        id: studentId,
        ...student
      }
    } catch (error) {
      console.error("Error fetching student:", error)
      return null
    }
  }

  // Record attendance for a student
  const recordAttendance = async (studentNumber: string, qrStudentData?: any) => {
    if (!activeSession) {
      toast.warning("No active attendance session. Please start a session first.")
      setIsProcessing(false)
      return
    }

    if (!studentNumber || studentNumber.trim() === "") {
      toast.error("Please enter or scan a student number")
      setIsProcessing(false)
      return
    }

    // Which mode are we recording in? Prefer the explicit selection from the
    // button the teacher clicked. Fall back to a sensible default only if
    // selectedType hasn't been set yet (e.g. right after a page reload).
    const mode: 'time_in' | 'time_out' =
      selectedType ??
      (!activeSession.timeInStartedAt ? 'time_in' : 'time_out')

    try {
      let student = qrStudentData
      
      if (!student || !student.firstName) {
        student = await getStudentByNumber(studentNumber.trim())
      }
      
      if (!student) {
        toast.error(`Student with number ${studentNumber} not found`)
        setIsProcessing(false)
        return
      }

      const now = new Date()
      const dateStr = getTodayDateStr()
      const timeStr = now.toTimeString().slice(0, 8)
      const timeFormatted = formatTimeTo12Hour(timeStr)

      // Find existing record for today
      const existingRecord = attendanceRecords.find(
        record => record.studentNumber === studentNumber.trim()
      )

      if (mode === 'time_in') {
        if (existingRecord && existingRecord.time_in) {
          const existingTime = formatTimeTo12Hour(existingRecord.time_in)
          toast.warning(`${student.firstName} ${student.lastName} already timed in today at ${existingTime}`)
          setScanned(true)
          setScannedStudent({
            ...student,
            status: existingRecord.status || 'present',
            time_in: existingRecord.time_in
          })
          setIsProcessing(false)
          return
        }

        // Determine status based on Late Time
        let status: 'present' | 'late' = 'present'
        if (activeSession.lateTime) {
          const scanTime = new Date(`${dateStr}T${timeStr}`)
          const lateTimeDate = new Date(`${dateStr}T${activeSession.lateTime}`)
          status = scanTime <= lateTimeDate ? 'present' : 'late'
        }

        const attendanceRef = ref(database, "attendance")
        
        if (existingRecord) {
          const recordRef = ref(database, `attendance/${existingRecord.attendance_id}`)
          await update(recordRef, {
            time_in: timeStr,
            status: status,
            session_id: activeSession.session_id,
            updated_at: now.toISOString()
          })
          existingRecord.time_in = timeStr
          existingRecord.status = status
          existingRecord.session_id = activeSession.session_id
        } else {
          const newAttendanceRef = push(attendanceRef)

          const attendanceData = {
            session_id: activeSession.session_id,
            studentNumber: studentNumber.trim(),
            studentName: `${student.firstName} ${student.lastName}`,
            sectionId: activeSession.sectionId,
            date: dateStr,
            time_in: timeStr,
            time_out: null,
            status: status,
            created_at: now.toISOString(),
            updated_at: now.toISOString()
          }

          await set(newAttendanceRef, attendanceData)
        }

        const statusDisplay = status === 'present' ? 'Present' : 'Late'
        setScanned(true)
        setScannedStudent({
          ...student,
          status: status,
          time_in: timeStr
        })
        toast.success(`${student.firstName} ${student.lastName} marked ${statusDisplay}!`)

      } else {
        // Time Out logic
        if (!existingRecord || !existingRecord.time_in) {
          toast.warning(`${student.firstName} ${student.lastName} has not timed in today`)
          setIsProcessing(false)
          return
        }

        if (existingRecord.time_out) {
          const existingTime = formatTimeTo12Hour(existingRecord.time_out)
          toast.warning(`${student.firstName} ${student.lastName} already timed out today at ${existingTime}`)
          setScanned(true)
          setScannedStudent({
            ...student,
            status: existingRecord.status || 'present',
            time_in: existingRecord.time_in
          })
          setIsProcessing(false)
          return
        }

        const recordRef = ref(database, `attendance/${existingRecord.attendance_id}`)
        await update(recordRef, {
          time_out: timeStr,
          session_id: activeSession.session_id,
          updated_at: now.toISOString()
        })

        existingRecord.time_out = timeStr
        existingRecord.session_id = activeSession.session_id

        setScanned(true)
        setScannedStudent({
          ...student,
          status: existingRecord.status || 'present',
          time_in: existingRecord.time_in,
          time_out: timeStr
        })
        toast.success(`${student.firstName} ${student.lastName} timed out at ${timeFormatted}!`)
      }
      
    } catch (error) {
      console.error("Error recording attendance:", error)
      toast.error("Failed to record attendance")
    } finally {
      setIsProcessing(false)
      setStudentNumberInput("")
    }
  }

  // Manual student number entry
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    recordAttendance(studentNumberInput)
  }

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300'
      case 'completed': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300'
      default: return 'bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'active': return 'bg-green-500'
      case 'completed': return 'bg-blue-500'
      case 'cancelled': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading sessions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <Heading 
        title="QR Scanner" 
        text="Start an attendance session and scan student QR codes." 
      />

      {/* Session Controls */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>Attendance Session</CardTitle>
              <CardDescription>
                {teacher?.sectionName || 'No section assigned'}
                {teacher?.sectionYearLevel && ` · ${teacher.sectionYearLevel}`}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {activeSession ? (
                <>
                  {!activeSession.timeInStartedAt && (
                    <Button variant="outline" onClick={() => handleSessionTypeSelect('time_in')} disabled={isCreating}>
                      <LogInIcon className="mr-2 size-4" /> Start Time In
                    </Button>
                  )}
                  {!activeSession.timeOutStartedAt && (
                    <Button variant="outline" onClick={() => handleSessionTypeSelect('time_out')} disabled={isCreating}>
                      <LogOutIcon className="mr-2 size-4" /> Start Time Out
                    </Button>
                  )}
                  <Button 
                    variant="destructive" 
                    onClick={endSession}
                    disabled={isEnding}
                  >
                    {isEnding ? (
                      <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                    ) : (
                      <StopCircleIcon className="mr-2 size-4" />
                    )}
                    {isEnding ? "Ending..." : "End Session"}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={() => setShowSessionTypeModal(true)}
                  disabled={isCreating || !teacher?.sectionId}
                >
                  {isCreating ? (
                    <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <PlayIcon className="mr-2 size-4" />
                  )}
                  {isCreating ? "Starting..." : "Start Session"}
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {activeSession ? (
            <div className="flex flex-wrap items-center gap-4 p-3 bg-green-50 rounded-lg border border-green-200 dark:bg-green-950/40 dark:border-green-800">
              <div className="flex items-center gap-2">
                <div className={`size-3 rounded-full ${getStatusBadge(activeSession.status)} animate-pulse`} />
                <span className="font-medium text-green-700 dark:text-green-300">Session Active</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CalendarIcon className="size-4" />
                <span>{new Date(activeSession.date).toLocaleDateString()}</span>
              </div>
              {activeSession.lateTime && (
                <div className="flex items-center gap-2 text-sm text-amber-600">
                  <AlertCircleIcon className="size-4" />
                  <span>Late Time: {formatTimeTo12Hour(activeSession.lateTime)}</span>
                </div>
              )}
             
              {selectedType && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClockIcon className="size-4" />
                  <span>Currently recording: {selectedType === 'time_in' ? 'Time In' : 'Time Out'}</span>
                </div>
              )}
              <div className="text-sm text-muted-foreground ml-auto">
                {attendanceRecords.length} students recorded
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-3 bg-muted/30 rounded-lg border">
              <AlertCircleIcon className="size-5 text-muted-foreground" />
              <span className="text-muted-foreground">
                {teacher?.sectionId 
                  ? "No active session. Click 'Start Session' to begin taking attendance." 
                  : "You are not assigned to any section. Please contact admin."}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Type Modal */}
      {showSessionTypeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Select Session Type</CardTitle>
              <CardDescription>Choose whether to take time in or time out attendance.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                className="w-full" 
                onClick={() => handleSessionTypeSelect('time_in')}
                disabled={isCreating}
              >
                <LogInIcon className="mr-2 size-4" />
                Time In
              </Button>
              <Button 
                className="w-full" 
                variant="outline"
                onClick={() => handleSessionTypeSelect('time_out')}
                disabled={isCreating}
              >
                <LogOutIcon className="mr-2 size-4" />
                Time Out
              </Button>
              <Button 
                variant="ghost" 
                className="w-full" 
                onClick={() => setShowSessionTypeModal(false)}
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Late Time Configuration Modal */}
      {showLateTimeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Configure Late Time</CardTitle>
              <CardDescription>
                Set the cut-off time for marking students as "Present". 
                Students scanning after this time will be marked as "Late".
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="lateTime">Late Time (HH:MM)</Label>
                <Input
                  id="lateTime"
                  type="time"
                  value={lateTime}
                  onChange={(e) => setLateTime(e.target.value)}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Example: If set to 08:00, students scanning at 08:01 or later will be marked as "Late".
                </p>
              </div>
              <div className="flex gap-2">
                <Button 
                  className="flex-1"
                  onClick={createTimeInSession}
                  disabled={isCreating || !lateTime}
                >
                  {isCreating ? (
                    <RefreshCwIcon className="mr-2 size-4 animate-spin" />
                  ) : (
                    <LogInIcon className="mr-2 size-4" />
                  )}
                  {isCreating ? "Saving..." : "Start Time In Session"}
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => {
                    setShowLateTimeModal(false)
                    setSelectedType(null)
                    setLateTime("")
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* QR Scanner - Direct display with smaller size */}
      {activeSession && (
        <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
          <Card>
            <CardHeader>
              <CardTitle>QR Scanner</CardTitle>
              <CardDescription>
                Session active. Scanning as {selectedType === 'time_in' ? 'Time In' : selectedType === 'time_out' ? 'Time Out' : '—'}.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative overflow-hidden rounded-lg bg-black max-w-md mx-auto">
                <div className="w-full" style={{ minHeight: '300px', maxHeight: '400px' }}>
                  <Scanner
                    onScan={handleScan}
                    onError={handleError}
                    paused={isPaused}
                    constraints={{ facingMode: "environment" }}
                    formats={["qr_code"]}
                    styles={{
                      container: { width: '100%', height: '100%' },
                      video: { objectFit: 'cover' }
                    }}
                  />
                </div>
                {isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <div className="text-center text-white">
                      <RefreshCwIcon className="size-12 animate-spin mx-auto mb-2" />
                      <p>Processing...</p>
                    </div>
                  </div>
                )}
                {lastError && !isProcessing && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                    <div className="text-center text-white p-4">
                      <AlertCircleIcon className="size-12 mx-auto mb-2 text-red-400" />
                      <p className="text-sm font-medium text-red-400">Camera Error</p>
                      <p className="text-xs text-white/70 mt-1">{lastError}</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 text-white border-white/30 hover:bg-white/10"
                        onClick={() => {
                          setLastError(null)
                        }}
                      >
                        Retry
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center text-sm text-muted-foreground mt-2">
                Position the QR code within the frame to scan
              </div>
            </CardContent>
          </Card>

          {/* Scanned Student Info - Side Panel */}
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
              {scanned && scannedStudent ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-3 rounded-lg bg-emerald-50 p-3 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-200">
                    <CheckCircle2Icon className="size-5" />
                    <div>
                      <p className="font-medium">Recorded</p>
                      <p className="text-xs">{new Date().toLocaleString()}</p>
                      {scannedStudent.status && (
                        <p className={`text-xs ${scannedStudent.status === 'late' ? 'text-amber-600' : 'text-emerald-600'}`}>
                          Status: {scannedStudent.status.charAt(0).toUpperCase() + scannedStudent.status.slice(1)}
                        </p>
                      )}
                      {scannedStudent.time_in && (
                        <p className="text-xs text-muted-foreground">
                          Time In: {formatTimeTo12Hour(scannedStudent.time_in)}
                        </p>
                      )}
                      {scannedStudent.time_out && (
                        <p className="text-xs text-muted-foreground">
                          Time Out: {formatTimeTo12Hour(scannedStudent.time_out)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs text-muted-foreground">Student name</p>
                      <p className="font-medium">{scannedStudent.firstName} {scannedStudent.lastName}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Student Number</p>
                      <p className="font-mono text-sm">{scannedStudent.studentNumber}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Class</p>
                      <p className="font-medium">{teacher?.sectionName || 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Attendance status</p>
                      <div className="mt-1">
                        <Status value={scannedStudent.status || 'Present'} />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex min-h-[200px] items-center justify-center text-center text-sm text-muted-foreground">
                  <div>
                    <FingerprintIcon className="size-12 mx-auto mb-2 opacity-50" />
                    <p>Scan a QR code or enter student number</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Manual Entry */}
      {activeSession && (
        <Card>
          <CardHeader>
            <CardTitle>Manual Entry</CardTitle>
            <CardDescription>Enter student number manually if QR scan fails.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleManualSubmit} className="flex gap-2 max-w-md">
              <div className="flex-1">
                <Input
                  placeholder="Enter student number..."
                  value={studentNumberInput}
                  onChange={(e) => setStudentNumberInput(e.target.value)}
                  disabled={!activeSession || isProcessing}
                  className="flex-1"
                />
              </div>
              <Button 
                type="submit" 
                disabled={!activeSession || isProcessing || !studentNumberInput.trim()}
              >
                <UserIcon className="mr-2 size-4" />
                Record
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Session History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Session History</CardTitle>
              <CardDescription>
                {sessions.length} total session{sessions.length !== 1 ? 's' : ''} for this section
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSessions(!showSessions)}
            >
              <HistoryIcon className="mr-2 size-4" />
              {showSessions ? 'Hide' : 'Show'} History
            </Button>
          </div>
        </CardHeader>
        {showSessions && (
          <CardContent>
            {sessions.length > 0 ? (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                {sessions.map((session) => (
                  <div 
                    key={session.session_id}
                    className={`flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-lg border ${getStatusColor(session.status)}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`size-2 rounded-full ${getStatusBadge(session.status)}`} />
                      <div className="text-sm">
                        <p className="font-medium">
                          {new Date(session.date).toLocaleDateString()}
                        </p>
                        {session.lateTime && (
                          <p className="text-xs text-amber-600">
                            Late Time: {formatTimeTo12Hour(session.lateTime)}
                          </p>
                        )}
                        {session.timeInStartedAt && (
                          <p className="text-xs opacity-75">
                            Time In: {formatTimeTo12Hour(session.timeInStartedAt)}
                          </p>
                        )}
                        {session.timeOutStartedAt && (
                          <p className="text-xs opacity-75">
                            Time Out: {formatTimeTo12Hour(session.timeOutStartedAt)}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span className={`text-xs px-2 py-1 rounded-full capitalize bg-white/50 dark:bg-black/20`}>
                        {session.status}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {session.started_by_name || 'Teacher'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <RefreshCwIcon className="size-12 mx-auto mb-2 opacity-50" />
                <p>No sessions yet</p>
                <p className="text-sm">Start your first attendance session</p>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  )
}