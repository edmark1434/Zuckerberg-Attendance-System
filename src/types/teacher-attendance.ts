export type SessionStatus = "Upcoming" | "Active" | "Ended"
export type AttendanceType = "Time In" | "Time Out" | "Both Time In & Time Out"
export type SessionAttendanceStatus = "Present" | "Late" | "Time In Only" | "Completed" | "Absent"

export interface TeacherAttendanceSession {
  id: string
  sectionId: string
  academicYearId: string
  title: string
  date: string
  attendanceType: AttendanceType
  startTime: string
  endTime: string
  status: SessionStatus
  qrValue: string
}

export interface SessionAttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  timeIn?: string
  timeOut?: string
  status: SessionAttendanceStatus
}
