import type { SessionAttendanceRecord, TeacherAttendanceSession } from "@/types/teacher-attendance"

export const mockTeacherSessions: TeacherAttendanceSession[] = [
  { id: "SESSION-2026-00001", sectionId: "section-1", academicYearId: "academic-year-1", title: "Morning attendance", date: "2026-07-26", attendanceType: "Both Time In & Time Out", startTime: "08:00", endTime: "10:00", status: "Active", qrValue: "SESSION-2026-00001" },
  { id: "SESSION-2026-00002", sectionId: "section-1", academicYearId: "academic-year-1", title: "Laboratory attendance", date: "2026-07-28", attendanceType: "Time In", startTime: "13:00", endTime: "15:00", status: "Upcoming", qrValue: "SESSION-2026-00002" },
  { id: "SESSION-2026-00003", sectionId: "section-1", academicYearId: "academic-year-1", title: "Programming quiz", date: "2026-07-24", attendanceType: "Time In", startTime: "08:00", endTime: "09:00", status: "Ended", qrValue: "SESSION-2026-00003" },
]

export const mockSessionRecords: SessionAttendanceRecord[] = [
  { id: "attendance-1", sessionId: "SESSION-2026-00001", studentId: "student-1", timeIn: "08:01", timeOut: "09:57", status: "Completed" },
  { id: "attendance-2", sessionId: "SESSION-2026-00001", studentId: "student-6", timeIn: "08:04", status: "Time In Only" },
  { id: "attendance-3", sessionId: "SESSION-2026-00001", studentId: "student-11", timeIn: "08:12", status: "Late" },
  { id: "attendance-4", sessionId: "SESSION-2026-00001", studentId: "student-16", timeIn: "08:03", timeOut: "09:55", status: "Completed" },
  { id: "attendance-5", sessionId: "SESSION-2026-00001", studentId: "student-21", status: "Absent" },
]
