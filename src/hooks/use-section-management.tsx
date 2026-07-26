import { createContext, useContext, useMemo, useState, type ReactNode } from "react"
import { mockAcademicYears } from "@/mock/academic-years"
import { mockSections } from "@/mock/sections"
import type { AcademicYear, Section } from "@/types/attendance"

interface SectionManagementState {
  sections: Section[]
  academicYears: AcademicYear[]
  createSection: (section: Section) => void
  updateSection: (section: Section) => void
  removeSection: (id: string) => void
  createAcademicYear: (year: AcademicYear) => void
  updateAcademicYear: (year: AcademicYear) => void
  removeAcademicYear: (id: string) => void
}

const SectionManagementContext = createContext<SectionManagementState | undefined>(undefined)

export function SectionManagementProvider({ children }: { children: ReactNode }) {
  const [sections, setSections] = useState(mockSections)
  const [academicYears, setAcademicYears] = useState(mockAcademicYears)
  const value = useMemo<SectionManagementState>(() => ({
    sections, academicYears,
    createSection: (section) => setSections((current) => [section, ...current]),
    updateSection: (section) => setSections((current) => current.map((item) => item.id === section.id ? section : item)),
    removeSection: (id) => setSections((current) => current.filter((item) => item.id !== id)),
    createAcademicYear: (year) => setAcademicYears((current) => year.status === "Active" ? [year, ...current.map((item) => ({ ...item, status: "Inactive" as const }))] : [year, ...current]),
    updateAcademicYear: (year) => setAcademicYears((current) => current.map((item) => ({ ...item, ...((item.id === year.id || year.status === "Active") ? (item.id === year.id ? year : { status: "Inactive" as const }) : {}) }))),
    removeAcademicYear: (id) => setAcademicYears((current) => current.filter((item) => item.id !== id)),
  }), [sections, academicYears])
  return <SectionManagementContext.Provider value={value}>{children}</SectionManagementContext.Provider>
}

export function useSectionManagement() {
  const context = useContext(SectionManagementContext)
  if (!context) throw new Error("useSectionManagement must be used within SectionManagementProvider")
  return context
}
