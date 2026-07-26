import type { Section } from "@/types/attendance"

export const mockSections: Section[] = [
  { id: "section-1", code: "BSIT-1A", name: "Information Technology 1A", yearLevel: "First Year", schedule: "Mon & Wed · 8:00 AM", academicYearId: "academic-year-1", teacherId: "teacher-1", studentIds: ["student-1", "student-6", "student-11", "student-16", "student-21"] },
  { id: "section-2", code: "BSIT-1B", name: "Information Technology 1B", yearLevel: "First Year", schedule: "Tue & Thu · 9:30 AM", academicYearId: "academic-year-1", teacherId: "teacher-2", studentIds: ["student-2", "student-7", "student-12", "student-17", "student-22"] },
  { id: "section-3", code: "BSCS-1A", name: "Computer Science 1A", yearLevel: "First Year", schedule: "Mon & Wed · 1:00 PM", academicYearId: "academic-year-1", teacherId: "teacher-3", studentIds: ["student-3", "student-8", "student-13", "student-18", "student-23"] },
  { id: "section-4", code: "BSCS-2A", name: "Computer Science 2A", yearLevel: "Second Year", schedule: "Tue & Thu · 1:00 PM", academicYearId: "academic-year-1", teacherId: "teacher-5", studentIds: ["student-4", "student-9", "student-14", "student-19", "student-24"] },
  { id: "section-5", code: "BSIT-2A", name: "Information Technology 2A", yearLevel: "Second Year", schedule: "Fri · 10:00 AM", academicYearId: "academic-year-1", teacherId: "teacher-8", studentIds: ["student-5", "student-10", "student-15", "student-20", "student-25"] },
]
