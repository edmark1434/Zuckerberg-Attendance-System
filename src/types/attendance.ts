export type AccountStatus = "Active" | "Inactive"
export type AttendanceStatus = "Present" | "Late" | "Absent"

export interface Student {
  id: string
  studentNumber: string
  firstName: string
  lastName: string
  middleName?: string
  suffix?: string
  sectionId?: string
  status: AccountStatus
  birthdate: string | Date
  password?: string
  passwordResetAt?: string
  createdAt?: string
  gender?: "Male" | "Female"
}

export interface Teacher {
  id: string
  firstName: string
  lastName: string
  middleName?: string
  email: string
  status: AccountStatus
  password: string
  current_password?: string
  passwordResetAt?: string
  accountId?: string
}

export interface Section {
  id: string
  code: string
  name: string
  yearLevel: string
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
  createdAt: string
}

export interface AttendanceSession {
  id: string
  sectionId: string
  date: string
  startedAt: string
  createdAt: string
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
  createdAt: string
}

export const fullName = (person: Pick<Student | Teacher, "firstName" | "lastName">) =>
  `${person.firstName} ${person.lastName}`
