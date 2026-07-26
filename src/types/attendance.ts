export type AccountStatus = "Active" | "Inactive"
export type AttendanceStatus = "Present" | "Late" | "Absent"

export interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  email: string
  yearLevel: string
  sectionId?: string
  status: AccountStatus
  birthdate?: string
  password?: string
  passwordResetAt?: string
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  email: string
  department: string
  status: AccountStatus
  password?: string
  passwordResetAt?: string
}

export interface Section {
  id: string
  code: string
  name: string
  yearLevel: string
  schedule: string
  academicYearId: string
  teacherId?: string
  studentIds: string[]
}

export interface AcademicYear {
  id: string
  name: string
  startDate: string
  endDate: string
  status: AccountStatus
}

export interface AttendanceSession {
  id: string
  sectionId: string
  date: string
  startedAt: string
  status: "Open" | "Completed"
  present: number
  late: number
  absent: number
}

export interface AttendanceRecord {
  id: string
  sessionId: string
  studentId: string
  status: AttendanceStatus
  time?: string
}

export const fullName = (person: Pick<Student | Teacher, "firstName" | "lastName">) =>
  `${person.firstName} ${person.lastName}`
