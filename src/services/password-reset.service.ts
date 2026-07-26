import type { Student, Teacher } from "@/types/attendance"

export const TEACHER_TEMPORARY_PASSWORD = "Temp@12345"

export function resetStudentPassword(student: Student): Student {
  return { ...student, password: student.birthdate ?? "2005-01-01", passwordResetAt: new Date().toISOString() }
}

export function resetTeacherPassword(teacher: Teacher): Teacher {
  return { ...teacher, password: TEACHER_TEMPORARY_PASSWORD, passwordResetAt: new Date().toISOString() }
}
