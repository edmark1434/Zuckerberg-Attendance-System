import { useEffect, useMemo, useState } from "react"
import { SearchIcon, UserMinusIcon, CheckCircleIcon } from "lucide-react"
import { fullName, type Section, type Teacher, type Student } from "@/types/attendance"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

interface AssignTeacherDialogProps {
  open: boolean
  section?: Section
  teachers: Teacher[]
  sections: Section[]
  onOpenChange: (open: boolean) => void
  onSave: (teacherId?: string) => void
}

export function AssignTeacherDialog({
  open,
  section,
  teachers,
  sections,
  onOpenChange,
  onSave,
}: AssignTeacherDialogProps) {
  const [query, setQuery] = useState("")

  useEffect(() => {
    if (open) setQuery("")
  }, [open])

  // Get all teacher IDs that are already assigned to other sections
  const assignedTeacherIds = useMemo(() => {
    const assigned = new Set<string>()
    sections.forEach((s) => {
      if (s.id === section?.id) return
      if (s.teacherId) {
        assigned.add(s.teacherId)
      }
    })
    return assigned
  }, [sections, section])

  const isTeacherAssignedElsewhere = (teacherId: string) => {
    return assignedTeacherIds.has(teacherId)
  }

  const isTeacherAssignedToCurrent = (teacherId: string) => {
    return section?.teacherId === teacherId
  }

  const availableTeachers = useMemo(
    () =>
      teachers.filter((teacher) => {
        const isActive = teacher.status === "Active"
        const isAssignedElsewhere = isTeacherAssignedElsewhere(teacher.id)
        const isCurrentAssignment = isTeacherAssignedToCurrent(teacher.id)
        
        const isAvailable = isActive && (!isAssignedElsewhere || isCurrentAssignment)
        
        const matchesSearch = `${fullName(teacher)} ${teacher.email || ""}`
          .toLowerCase()
          .includes(query.toLowerCase())
        
        return isAvailable && matchesSearch
      }),
    [teachers, query, section]
  )

  const assigned = teachers.find((teacher) => teacher.id === section?.teacherId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Assign teacher</DialogTitle>
          <DialogDescription>
            Choose one teacher for {section?.name}. Teachers can only be assigned to one section at a time.
          </DialogDescription>
        </DialogHeader>

        {assigned && (
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3">
            <span className="text-sm">
              <span className="text-muted-foreground">Currently assigned:</span>{" "}
              <strong>{fullName(assigned)}</strong>
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-destructive"
              onClick={() => onSave(undefined)}
            >
              <UserMinusIcon /> Remove
            </Button>
          </div>
        )}

        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            placeholder="Search available teachers..."
          />
        </div>

        <div className="max-h-64 space-y-1 overflow-auto">
          {availableTeachers.length > 0 ? (
            availableTeachers.map((teacher) => {
              const isAssignedElsewhere = isTeacherAssignedElsewhere(teacher.id)
              const isCurrentAssignment = isTeacherAssignedToCurrent(teacher.id)
              
              return (
                <button
                  type="button"
                  key={teacher.id}
                  onClick={() => {
                    if (!isAssignedElsewhere || isCurrentAssignment) {
                      onSave(teacher.id)
                    }
                  }}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-muted transition-colors ${
                    isAssignedElsewhere && !isCurrentAssignment ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                  disabled={isAssignedElsewhere && !isCurrentAssignment}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{fullName(teacher)}</span>
                    {isCurrentAssignment && (
                      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        <CheckCircleIcon className="h-3 w-3 mr-1" />
                        Current
                      </Badge>
                    )}
                    {isAssignedElsewhere && !isCurrentAssignment && (
                      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                        Assigned to another section
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {teacher.email || ""}
                  </span>
                </button>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                {query ? "No teachers match your search" : "No available teachers found"}
              </p>
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ==================== ASSIGN STUDENTS DIALOG ====================
interface AssignStudentsDialogProps {
  open: boolean
  section?: Section
  students: Student[]
  sections: Section[] // Add sections prop
  onOpenChange: (open: boolean) => void
  onSave: (studentIds: string[]) => void
}

export function AssignStudentsDialog({
  open,
  section,
  students,
  sections,
  onOpenChange,
  onSave,
}: AssignStudentsDialogProps) {
  const [query, setQuery] = useState("")
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (open) {
      setQuery("")
      setSelected(section?.studentIds ?? [])
    }
  }, [open, section])

  // Get all student IDs that are already assigned to other sections
  const assignedStudentIds = useMemo(() => {
    const assigned = new Set<string>()
    sections.forEach((s) => {
      if (s.id === section?.id) return // Skip current section
      if (s.studentIds) {
        s.studentIds.forEach(id => assigned.add(id))
      }
    })
    return assigned
  }, [sections, section])

  const isStudentAssignedElsewhere = (studentId: string) => {
    return assignedStudentIds.has(studentId)
  }

  const isStudentInCurrentSection = (studentId: string) => {
    return section?.studentIds?.includes(studentId) || false
  }

  const filteredStudents = useMemo(
    () =>
      students.filter((student) => {
        const isAssignedElsewhere = isStudentAssignedElsewhere(student.id)
        const isInCurrentSection = isStudentInCurrentSection(student.id)
        
        // Show student if they are NOT assigned elsewhere OR are in the current section
        const isAvailable = !isAssignedElsewhere || isInCurrentSection
        
        const matchesSearch = `${fullName(student)} ${student.studentNumber}`
          .toLowerCase()
          .includes(query.toLowerCase())
        
        return isAvailable && matchesSearch
      }),
    [students, query, section]
  )

  const toggle = (id: string) => {
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>Assign students</DialogTitle>
          <DialogDescription>
            Select all students enrolled in {section?.name}. Students can only be assigned to one section at a time.
          </DialogDescription>
        </DialogHeader>

        <div className="relative">
          <SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="pl-9"
            placeholder="Search students..."
          />
        </div>

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {selected.length} student{selected.length === 1 ? "" : "s"} selected
          </p>
          {selected.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-muted-foreground"
              onClick={() => setSelected([])}
            >
              Clear all
            </Button>
          )}
        </div>

        <div className="max-h-64 space-y-1 overflow-auto rounded-lg border p-1">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => {
              const isAssignedElsewhere = isStudentAssignedElsewhere(student.id)
              const isInCurrentSection = isStudentInCurrentSection(student.id)
              const isSelected = selected.includes(student.id)
              
              return (
                <label
                  key={student.id}
                  className={`flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted transition-colors ${
                    isAssignedElsewhere && !isInCurrentSection ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => {
                      if (!isAssignedElsewhere || isInCurrentSection) {
                        toggle(student.id)
                      }
                    }}
                    disabled={isAssignedElsewhere && !isInCurrentSection}
                  />
                  <span className="text-sm font-medium">{fullName(student)}</span>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {student.studentNumber}
                  </span>
                  {isInCurrentSection && isAssignedElsewhere && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      <CheckCircleIcon className="h-3 w-3 mr-1" />
                      Current
                    </Badge>
                  )}
                  {isAssignedElsewhere && !isInCurrentSection && (
                    <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
                      Assigned to another section
                    </Badge>
                  )}
                </label>
              )
            })
          ) : (
            <div className="px-3 py-4 text-center">
              <p className="text-sm text-muted-foreground">
                {query ? "No students match your search" : "No available students found"}
              </p>
              {query && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setQuery("")}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={() => onSave(selected)}
            disabled={selected.length === 0}
          >
            Save students ({selected.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}