import { useEffect, useState } from "react"
import { EyeIcon, EyeOffIcon } from "lucide-react"
import { toast } from "sonner"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { AcademicYear, Section, Student, Teacher } from "@/types/attendance"

type StudentInput = Omit<Student, "id">
type TeacherInput = Omit<Teacher, "id">
type SectionInput = Omit<Section, "id" | "studentIds" | "teacherId">

// Year level options
const YEAR_LEVELS = [
  "Grade 7",
  "Grade 8", 
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12"
] as const

type YearLevel = typeof YEAR_LEVELS[number]

function Field({
  label,
  id,
  value,
  onChange,
  type = "text",
  required = false,
}: {
  label: string
  id: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
      />
    </div>
  )
}

// ==================== STUDENT DIALOG ====================
export function StudentDialog({
  open,
  onOpenChange,
  student,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  student?: Student
  onSave: (input: StudentInput) => void
}) {
  const [form, setForm] = useState<StudentInput>({
    studentNumber: "",
    firstName: "",
    lastName: "",
    middleName: "",
    suffix: "",
    birthdate: "",
    gender: "",
    status: "Active",
  })
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (student) {
      setForm({
        studentNumber: student.studentNumber,
        firstName: student.firstName,
        lastName: student.lastName,
        middleName: student.middleName,
        suffix: student.suffix,
        sectionId: student.sectionId,
        status: student.status,
        birthdate: student.birthdate instanceof Date 
          ? student.birthdate.toISOString().split("T")[0] 
          : student.birthdate || "",
        gender: student.gender || "",
        password: student.password,
        passwordResetAt: student.passwordResetAt,
      })
    } else {
      setForm({
        studentNumber: "",
        firstName: "",
        lastName: "",
        middleName: "",
        suffix: "",
        birthdate: "",
        gender: "",
        status: "Active",
      })
    }
    setIsSaving(false)
  }, [student, open])

  const set = <K extends keyof StudentInput>(key: K, value: StudentInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    try {
      await onSave(form)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{student ? "Edit student" : "Add student"}</DialogTitle>
          <DialogDescription>
            Create or edit student account details.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              id="student-first"
              value={form.firstName}
              required={true}
              onChange={(value) => set("firstName", value)}
            />
            <Field
              label="Last name"
              id="student-last"
              required={true}
              value={form.lastName}
              onChange={(value) => set("lastName", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Middle name"
              id="student-middle"
              value={form.middleName ?? ""}
              onChange={(value) => set("middleName", value)}
            />
            <Field
              label="Suffix"
              id="student-suffix"
              value={form.suffix ?? ""}
              onChange={(value) => set("suffix", value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Birthdate"
              id="student-birthdate"
              type="date"
              required={true}
              value={form.birthdate || ""}
              onChange={(value) => set("birthdate", value)}
            />
            
            <div className="grid gap-1.5">
              <Label htmlFor="student-gender">Gender</Label>
              <Select
                value={form.gender}
                required={true}
                onValueChange={(value) => set("gender", value)}
              >
                <SelectTrigger id="student-gender">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : (student ? "Save changes" : "Create student")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== TEACHER DIALOG ====================
export function TeacherDialog({
  open,
  onOpenChange,
  teacher,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  teacher?: Teacher
  onSave: (input: TeacherInput) => void
}) {
  const [showPassword, setShowPassword] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  function generatePassword(length = 16) {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"

    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)

    return Array.from(randomValues)
      .map((x) => chars[x % chars.length])
      .join("")
  }

  const [form, setForm] = useState<TeacherInput>({
    firstName: "",
    lastName: "",
    middleName: "",
    email: "",
    password: "",
    current_password: "",
    status: "Active",
  })

  useEffect(() => {
    if (teacher) {
      setForm({
        firstName: teacher.firstName,
        lastName: teacher.lastName,
        middleName: teacher.middleName,
        email: teacher.email,
        status: teacher.status,
        password: teacher.password || "",
        current_password: teacher.current_password || "",
        passwordResetAt: teacher.passwordResetAt,
      })
    } else {
      const newPassword = generatePassword()
      setForm({
        firstName: "",
        lastName: "",
        middleName: "",
        email: "",
        password: newPassword,
        current_password: newPassword,
        status: "Active",
      })
    }
    setShowPassword(false)
    setIsSaving(false)
  }, [teacher, open])

  const set = <K extends keyof TeacherInput>(key: K, value: TeacherInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword)
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSaving) return
    setIsSaving(true)
    try {
      await onSave(form)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{teacher ? "Edit teacher" : "Add teacher"}</DialogTitle>
          <DialogDescription>
            Create a teacher account and teaching profile.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="First name"
              id="teacher-first"
              value={form.firstName}
              onChange={(value) => set("firstName", value)}
              required={true}
            />
            <Field
              label="Last name"
              id="teacher-last"
              value={form.lastName}
              onChange={(value) => set("lastName", value)}
              required={true}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Middle name"
              id="teacher-middle"
              value={form.middleName || ""}
              onChange={(value) => set("middleName", value)}
            />
          </div>

          <Field
            label="Email address" 
            id="teacher-email"
            type="email"
            required={true}
            value={form.email}
            onChange={(value) => set("email", value)}
          />

          <div className="grid gap-1.5">
            <Label htmlFor="teacher-password">Password</Label>
            <div className="relative">
              <Input
                id="teacher-password"
                type={showPassword ? "text" : "password"}
                value={form.password || ""}
                required={true}
                onChange={(event) => set("password", event.target.value)}
                className="pr-10"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={togglePasswordVisibility}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Password is auto-generated but you can change it.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : (teacher ? "Save changes" : "Create teacher")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

// ==================== SECTION DIALOG ====================
export function SectionDialog({
  open,
  onOpenChange,
  section,
  academicYears,
  onSave,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  section?: Section
  academicYears: AcademicYear[]
  onSave: (input: SectionInput) => void
}) {
  const [form, setForm] = useState<SectionInput>({
    code: "",
    name: "",
    yearLevel: "Grade 7",
    academicYearId: "",
  })
  const [isSaving, setIsSaving] = useState(false)

  // Find the active academic year
  const activeYear = academicYears.find((year) => year.status === "Active")
  const selectedYear = academicYears.find((year) => year.id === form.academicYearId)

  useEffect(() => {
    if (section) {
      setForm({
        code: section.code,
        name: section.name,
        yearLevel: section.yearLevel,
        academicYearId: section.academicYearId,
      })
    } else {
      setForm({
        code: "",
        name: "",
        yearLevel: "Grade 7",
        academicYearId: activeYear?.id || "",
      })
    }
    setIsSaving(false)
  }, [section, open, activeYear])

  const set = <K extends keyof SectionInput>(key: K, value: SectionInput[K]) =>
    setForm((current) => ({ ...current, [key]: value }))

  // Get the academic year name for display
  const getAcademicYearName = (id: string) => {
    const year = academicYears.find((y) => y.id === id)
    return year ? year.name : "Not set"
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (isSaving) return
    if (!form.academicYearId) {
      toast.error("Please select an academic year")
      return
    }
    setIsSaving(true)
    try {
      await onSave(form)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{section ? "Edit section" : "Add section"}</DialogTitle>
          <DialogDescription>
            Configure the section before assigning its teacher and students.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Section code"
              id="section-code"
              value={form.code}
              onChange={(value) => set("code", value)}
              required
            />
            
            <div className="grid gap-1.5">
              <Label>Year level</Label>
              <Select
                value={form.yearLevel}
                onValueChange={(value) => set("yearLevel", value as YearLevel)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {YEAR_LEVELS.map((level) => (
                    <SelectItem key={level} value={level}>
                      {level}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Field
            label="Section name"
            id="section-name"
            value={form.name}
            onChange={(value) => set("name", value)}
            required
          />

          <div className="grid gap-1.5">
            <Label>Academic school year</Label>
            <div className="flex h-10 w-full items-center rounded-md border border-input bg-muted/50 px-3 py-2 text-sm">
              {form.academicYearId ? (
                <span>
                  {getAcademicYearName(form.academicYearId)}
                  {selectedYear?.status === "Active" && (
                    <span className="ml-2 text-xs text-green-600 font-medium">(Active)</span>
                  )}
                </span>
              ) : (
                <span className="text-muted-foreground">No academic year assigned</span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {section 
                ? "Academic year is set when the section is created and cannot be changed." 
                : "The section will be created under the active academic year."}
            </p>
            {activeYear && !section && (
              <p className="text-xs text-green-600">
                ✓ Will be created under: {activeYear.name}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!form.academicYearId || academicYears.length === 0 || isSaving}
            >
              {isSaving ? "Saving..." : (section ? "Save changes" : "Create section")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}