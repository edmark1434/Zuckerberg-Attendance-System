import type { AttendanceRecord, AttendanceSession } from "@/types/attendance"

export const mockSessions: AttendanceSession[] = [
  { id: "session-1", sectionId: "section-1", date: "2026-07-24", startedAt: "8:00 AM", status: "Completed", present: 4, late: 1, absent: 0 },
  { id: "session-2", sectionId: "section-2", date: "2026-07-24", startedAt: "9:30 AM", status: "Completed", present: 4, late: 0, absent: 1 },
  { id: "session-3", sectionId: "section-4", date: "2026-07-23", startedAt: "1:00 PM", status: "Completed", present: 5, late: 0, absent: 0 },
  { id: "session-4", sectionId: "section-3", date: "2026-07-23", startedAt: "1:00 PM", status: "Open", present: 3, late: 0, absent: 2 },
]

export const mockAttendanceRecords: AttendanceRecord[] = [
  ...["student-1", "student-6", "student-11", "student-16", "student-21"].map((studentId, index) => ({ id: `record-${index + 1}`, sessionId: "session-1", studentId, status: index === 4 ? "Late" : "Present", time: index === 4 ? "8:09 AM" : "8:0" + (index + 1) + " AM" } as AttendanceRecord)),
  ...["student-2", "student-7", "student-12", "student-17", "student-22"].map((studentId, index) => ({ id: `record-${index + 6}`, sessionId: "session-2", studentId, status: index === 4 ? "Absent" : "Present", time: index === 4 ? undefined : "9:3" + index + " AM" } as AttendanceRecord)),
]
