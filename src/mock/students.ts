import type { Student } from "@/types/attendance"

const names = [
  ["Aira", "Villanueva"], ["Paolo", "Reyes"], ["Bianca", "Cruz"], ["Miguel", "Santos"], ["Jasmine", "Garcia"],
  ["Noah", "Mendoza"], ["Sofia", "Ramos"], ["Ethan", "Navarro"], ["Lia", "Torres"], ["Gabriel", "Flores"],
  ["Hannah", "Castro"], ["Marco", "Diaz"], ["Isabela", "Aquino"], ["John", "Bautista"], ["Kyla", "Lim"],
  ["Andre", "Tan"], ["Mikaela", "Chua"], ["Rafael", "Gomez"], ["Andrea", "Lopez"], ["Luis", "Mercado"],
  ["Trisha", "Perez"], ["Carlo", "Morales"], ["Nina", "Valdez"], ["Joshua", "Dela Cruz"], ["Mara", "Rivera"],
] as const

export const mockStudents: Student[] = names.map(([firstName, lastName], index) => ({
  id: `student-${index + 1}`,
  studentNumber: `2026-${String(index + 101).padStart(6, "0")}`,
  firstName,
  lastName,
  email: `${firstName.toLowerCase()}.${lastName.toLowerCase().replace(" ", "")}@students.university.edu`,
  yearLevel: index < 15 ? "First Year" : "Second Year",
  sectionId: `section-${(index % 5) + 1}`,
  status: index === 22 ? "Inactive" : "Active",
  birthdate: `${2005 + (index % 2)}-${String((index % 10) + 1).padStart(2, "0")}-${String((index % 25) + 1).padStart(2, "0")}`,
  password: "student-password",
}))
