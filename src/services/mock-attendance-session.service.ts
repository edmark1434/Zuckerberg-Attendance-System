import type { TeacherAttendanceSession } from "@/types/teacher-attendance"

export function createMockSessionId(existing: TeacherAttendanceSession[]) {
  return `SESSION-2026-${String(existing.length + 1).padStart(5, "0")}`
}

export function createMockAttendanceSession(input: Omit<TeacherAttendanceSession, "id" | "qrValue">, existing: TeacherAttendanceSession[]): TeacherAttendanceSession {
  const id = createMockSessionId(existing)
  return { ...input, id, qrValue: id }
}
