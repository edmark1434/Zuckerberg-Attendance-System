import { create } from "zustand";

interface TeacherUser {
  uid: string;
  email: string;
  role: "admin" | "teacher";
  firstName: string;
  lastName: string;
  middleName?: string;
  is_first_login: boolean;
  status: string;
  academicYearId?: string;
  academicYearName?: string;
  sectionId?: string;
  sectionCode?: string;
  sectionName?: string;
  sectionYearLevel?: string;
  teacher_id?: string;
}

interface AuthContext {
  teacher: TeacherUser | null;

  setTeacher: (user: TeacherUser) => void;
  clearUser: () => void;
}

export const useAuthContext = create<AuthContext>((set) => ({
  teacher: null,

  setTeacher: (user: TeacherUser) => set({ teacher: user }),

  clearUser: () => set({ teacher: null }),
}));