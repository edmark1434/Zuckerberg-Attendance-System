import type { Teacher } from "@/types/attendance"

export const mockTeachers: Teacher[] = [
  ["Maria", "Santos", "maria.santos@university.edu", "Computer Studies"],
  ["Jose", "Garcia", "jose.garcia@university.edu", "Mathematics"],
  ["Elena", "Cruz", "elena.cruz@university.edu", "Humanities"],
  ["Ramon", "Reyes", "ramon.reyes@university.edu", "Sciences"],
  ["Patricia", "Mendoza", "patricia.mendoza@university.edu", "Computer Studies"],
  ["Daniel", "Torres", "daniel.torres@university.edu", "Languages"],
  ["Irene", "Flores", "irene.flores@university.edu", "Sciences"],
  ["Victor", "Lim", "victor.lim@university.edu", "Mathematics"],
].map(([firstName, lastName, email, department], index) => ({
  id: `teacher-${index + 1}`, firstName, lastName, email, department, status: index === 7 ? "Inactive" : "Active", password: "teacher-password",
}))
