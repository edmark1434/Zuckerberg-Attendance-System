import { useMemo, useState, useEffect } from "react"
import { MoreHorizontalIcon, PlusIcon, UsersIcon, EyeIcon, XIcon, SearchIcon, FilterIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { fullName, type Section, type AcademicYear, type Teacher, type Student } from "@/types/attendance"
import { EmptyState, PageHeader, SearchInput, StatusBadge, AvatarCell } from "@/components/admin-ui"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { SectionDialog } from "@/components/entity-dialogs"
import { AssignStudentsDialog, AssignTeacherDialog } from "@/components/section-assignment-dialogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { database } from "../../../firebase"
import { ref, push, set, remove, onValue, update } from "firebase/database"

export function ClassesPage() {
  const [sections, setSections] = useState<Section[]>([])
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [dialog, setDialog] = useState<"create" | "edit" | "teacher" | "students" | "view" | undefined>()
  const [selected, setSelected] = useState<Section>()
  const [deleting, setDeleting] = useState<Section>()

  // Modal filters and sorting
  const [modalSearch, setModalSearch] = useState("")
  const [modalGenderFilter, setModalGenderFilter] = useState<string>("All")
  const [modalSortField, setModalSortField] = useState<"firstName" | "lastName" | "studentNumber">("lastName")
  const [modalSortOrder, setModalSortOrder] = useState<"asc" | "desc">("asc")

  // Fetch academic years from Firebase
  useEffect(() => {
    const academicYearsRef = ref(database, "academicYears")

    const unsubscribe = onValue(
      academicYearsRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setAcademicYears([])
          return
        }

        const years: AcademicYear[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            name: value.name || "",
            startDate: value.startDate || "",
            endDate: value.endDate || "",
            status: value.status || "Inactive",
            createdAt: value.createdAt || new Date().toISOString(),
          })
        )

        setAcademicYears(years)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load academic years")
        setAcademicYears([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Fetch teachers from Firebase
  useEffect(() => {
    const teachersRef = ref(database, "teachers")

    const unsubscribe = onValue(
      teachersRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setTeachers([])
          return
        }

        const teachersData: Teacher[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            uid: value.uid || "",
            firstName: value.firstName || "",
            lastName: value.lastName || "",
            middleName: value.middleName || "",
            email: value.email || "",
            status: value.status || "Active",
            department: value.department || "",
          })
        )

        setTeachers(teachersData)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load teachers")
        setTeachers([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Fetch students from Firebase
  useEffect(() => {
    const studentsRef = ref(database, "students")

    const unsubscribe = onValue(
      studentsRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setStudents([])
          return
        }

        const studentsData: Student[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            studentNumber: value.studentNumber || "",
            firstName: value.firstName || "",
            lastName: value.lastName || "",
            middleName: value.middleName || "",
            suffix: value.suffix || "",
            birthdate: value.birthdate || "",
            gender: value.gender || "",
            status: value.status || "Active",
          })
        )

        setStudents(studentsData)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load students")
        setStudents([])
      }
    )

    return () => unsubscribe()
  }, [])

  // Fetch sections from Firebase
  useEffect(() => {
    const sectionsRef = ref(database, "sections")

    const unsubscribe = onValue(
      sectionsRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setSections([])
          setLoading(false)
          return
        }

        const sectionsData: Section[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            code: value.code || "",
            name: value.name || "",
            yearLevel: value.yearLevel || "Grade 7",
            academicYearId: value.academicYearId || "",
            teacherId: value.teacherId || "",
            studentIds: value.studentIds || [],
            createdAt: value.createdAt || new Date().toISOString(),
            updatedAt: value.updatedAt || new Date().toISOString(),
          })
        )

        setSections(sectionsData)
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load sections")
        setSections([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const records = useMemo(
    () =>
      sections.filter((section) =>
        `${section.code} ${section.name} ${section.yearLevel}`
          .toLowerCase()
          .includes(search.toLowerCase())
      ),
    [sections, search]
  )

  const save = async (input: Omit<Section, "id" | "studentIds" | "teacherId">) => {
    try {
      const sectionsRef = ref(database, "sections")

      if (dialog === "edit" && selected) {
        const sectionRef = ref(database, `sections/${selected.id}`)
        
        await update(sectionRef, {
          code: input.code || "",
          name: input.name || "",
          yearLevel: input.yearLevel || "Grade 7",
          academicYearId: input.academicYearId || "",
          updatedAt: new Date().toISOString()
        })
        
        toast.success("Section updated")
      } else {
        const newSectionRef = push(sectionsRef)
        const activeYear = academicYears.find((year) => year.status === "Active")
        
        await set(newSectionRef, {
          code: input.code || "",
          name: input.name || "",
          yearLevel: input.yearLevel || "Grade 7",
          academicYearId: activeYear?.id || "",
          teacherId: "",
          studentIds: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        toast.success("Section created")
      }
    } catch (error) {
      console.error("Error saving section:", error)
      toast.error("An error occurred")
    } finally {
      setDialog(undefined)
      setSelected(undefined)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    try {
      const sectionRef = ref(database, `sections/${deleting.id}`)
      await remove(sectionRef)
      
      toast.success("Section removed")
      setDeleting(undefined)
    } catch (error) {
      console.error("Error deleting section:", error)
      toast.error("Failed to delete section")
    }
  }

  const assignTeacher = async (teacherId?: string) => {
    if (!selected) return

    try {
      const sectionRef = ref(database, `sections/${selected.id}`)
      await update(sectionRef, {
        teacherId: teacherId || "",
        updatedAt: new Date().toISOString()
      })
      
      toast.success(teacherId ? "Teacher assigned" : "Teacher removed")
      setDialog(undefined)
    } catch (error) {
      console.error("Error assigning teacher:", error)
      toast.error("Failed to assign teacher")
    }
  }

  const assignStudents = async (studentIds: string[]) => {
    if (!selected) return

    try {
      const sectionRef = ref(database, `sections/${selected.id}`)
      await update(sectionRef, {
        studentIds: studentIds,
        updatedAt: new Date().toISOString()
      })
      
      toast.success("Student enrolment updated")
      setDialog(undefined)
    } catch (error) {
      console.error("Error assigning students:", error)
      toast.error("Failed to assign students")
    }
  }

  const choose = (type: "edit" | "teacher" | "students" | "view", section: Section) => {
    setSelected(section)
    // Reset modal filters when opening
    setModalSearch("")
    setModalGenderFilter("All")
    setModalSortField("lastName")
    setModalSortOrder("asc")
    setDialog(type)
  }

  // Get filtered and sorted students in a section
  const getFilteredSectionStudents = (section: Section) => {
    // First filter by section
    let filtered = students.filter(student => section.studentIds?.includes(student.id))
    
    // Then filter by search
    if (modalSearch) {
      const searchTerm = modalSearch.toLowerCase()
      filtered = filtered.filter(student => 
        fullName(student).toLowerCase().includes(searchTerm) ||
        student.studentNumber?.toLowerCase().includes(searchTerm)
      )
    }
    
    // Then filter by gender
    if (modalGenderFilter !== "All") {
      filtered = filtered.filter(student => student.gender === modalGenderFilter)
    }
    
    // Then sort
    return filtered.sort((a, b) => {
      let compareA = ""
      let compareB = ""
      
      switch (modalSortField) {
        case "firstName":
          compareA = a.firstName || ""
          compareB = b.firstName || ""
          break
        case "lastName":
          compareA = a.lastName || ""
          compareB = b.lastName || ""
          break
        case "studentNumber":
          compareA = a.studentNumber || ""
          compareB = b.studentNumber || ""
          break
        default:
          compareA = a.lastName || ""
          compareB = b.lastName || ""
      }
      
      const comparison = compareA.localeCompare(compareB)
      return modalSortOrder === "asc" ? comparison : -comparison
    })
  }

  const getGenderBadgeColor = (gender: string) => {
    if (!gender) return 'bg-gray-100 text-gray-800 border-gray-200'
    switch(gender) {
      case 'Male': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Female': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  const toggleModalSort = (field: "firstName" | "lastName" | "studentNumber") => {
    if (modalSortField === field) {
      setModalSortOrder(modalSortOrder === "asc" ? "desc" : "asc")
    } else {
      setModalSortField(field)
      setModalSortOrder("asc")
    }
  }

  const getModalSortIcon = (field: "firstName" | "lastName" | "studentNumber") => {
    if (modalSortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />
    }
    return modalSortOrder === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading sections...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sections"
        description="Manage sections, school years, teacher assignments, and enrolment."
        action={
          <Button
            onClick={() => {
              setSelected(undefined)
              setDialog("create")
            }}
            disabled={!academicYears.length}
          >
            <PlusIcon /> Add section
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-4">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search sections"
          />
        </CardContent>
      </Card>

      {records.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {records.map((section) => {
            const teacher = teachers.find((item) => item.id === section.teacherId)
            const schoolYear = academicYears.find((item) => item.id === section.academicYearId)

            return (
              <Card key={section.id} className="shadow-none hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div 
                      className="cursor-pointer flex-1"
                      onClick={() => choose("view", section)}
                    >
                      <p className="text-xs font-semibold tracking-wide text-primary">
                        {section.code}
                      </p>
                      <h2 className="mt-1 font-semibold">{section.name}</h2>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {section.yearLevel}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Actions for ${section.name}`}
                          />
                        }
                      >
                        <MoreHorizontalIcon />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => choose("view", section)}>
                          <EyeIcon /> View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => choose("edit", section)}>
                          Edit section
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => choose("teacher", section)}>
                          {teacher ? "Change teacher" : "Assign teacher"}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => choose("students", section)}>
                          Assign students
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          variant="destructive"
                          onClick={() => setDeleting(section)}
                        >
                          Delete section
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="mt-5 space-y-3 border-t pt-4 text-sm">
                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">School year</span>
                      <span className="font-medium">
                        {schoolYear?.name ?? "Not set"}
                      </span>
                    </div>

                    <div className="flex justify-between gap-3">
                      <span className="text-muted-foreground">Teacher</span>
                      <button
                        type="button"
                        className="text-right font-medium hover:underline"
                        onClick={() => choose("teacher", section)}
                      >
                        {teacher ? fullName(teacher) : "Unassigned"}
                      </button>
                    </div>

                    <button
                      type="button"
                      className="flex items-center gap-2 text-muted-foreground hover:text-foreground w-full"
                      onClick={() => choose("students", section)}
                    >
                      <UsersIcon className="size-4" />
                      {section.studentIds?.length || 0} enrolled students
                    </button>

                    <button
                      type="button"
                      className="text-xs text-primary hover:underline w-full text-left mt-1"
                      onClick={() => choose("view", section)}
                    >
                      View all details →
                    </button>

                    {schoolYear && <StatusBadge status={schoolYear.status} />}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <EmptyState
          title="No sections found"
          description="Create a section to start organizing classes and attendance."
          action={
            <Button
              onClick={() => setDialog("create")}
              disabled={!academicYears.length}
            >
              <PlusIcon /> Add section
            </Button>
          }
        />
      )}

      <SectionDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        section={dialog === "edit" ? selected : undefined}
        academicYears={academicYears}
        onSave={save}
      />

<AssignTeacherDialog
  open={dialog === "teacher"}
  section={selected}
  teachers={teachers}
  sections={sections} // Pass sections
  onOpenChange={(open) => !open && setDialog(undefined)}
  onSave={assignTeacher}
/>

<AssignStudentsDialog
  open={dialog === "students"}
  section={selected}
  students={students}
  sections={sections} // Pass sections
  onOpenChange={(open) => !open && setDialog(undefined)}
  onSave={assignStudents}
/>


 {/* Section Details Dialog */}
<Dialog
  open={dialog === "view"}
  onOpenChange={(open) => !open && setDialog(undefined)}
>
  <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
    <DialogHeader>
      <DialogTitle>Section Details</DialogTitle>
      <DialogDescription>
        {selected?.code} - {selected?.name}
      </DialogDescription>
    </DialogHeader>

    {selected && (
      <div className="flex-1 overflow-y-auto pr-2 space-y-4">
        {/* Section Information */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4 bg-muted/30 rounded-lg">
          <div>
            <p className="text-xs text-muted-foreground">Section Code</p>
            <p className="font-medium truncate">{selected.code}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Section Name</p>
            <p className="font-medium truncate">{selected.name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Year Level</p>
            <p className="font-medium truncate">{selected.yearLevel}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">School Year</p>
            <p className="font-medium truncate">
              {academicYears.find(y => y.id === selected.academicYearId)?.name || "Not set"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Teacher</p>
            <p className="font-medium truncate">
              {teachers.find(t => t.id === selected.teacherId) 
                ? fullName(teachers.find(t => t.id === selected.teacherId)!)
                : "Unassigned"}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Total Students</p>
            <p className="font-medium">{selected.studentIds?.length || 0}</p>
          </div>
        </div>

        {/* Students List with Search and Filters */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-semibold flex items-center gap-2 whitespace-nowrap">
              <UsersIcon className="size-4 flex-shrink-0" />
              Enrolled Students ({getFilteredSectionStudents(selected).length})
            </h3>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-2 mb-3">
            <div className="relative flex-1 min-w-[200px]">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search students by name or number..."
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                className="pl-9 h-9 w-full"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              <div className="flex items-center gap-1">
                <FilterIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <select
                  value={modalGenderFilter}
                  onChange={(e) => setModalGenderFilter(e.target.value)}
                  className="h-9 rounded-md border border-input bg-background px-2 py-1 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring"
                >
                  <option value="All">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-xs text-muted-foreground hidden sm:inline">Sort:</span>
                <Button
                  variant={modalSortField === "lastName" ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleModalSort("lastName")}
                  className="h-8 text-xs px-2"
                >
                  Last {getModalSortIcon("lastName")}
                </Button>
                <Button
                  variant={modalSortField === "firstName" ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleModalSort("firstName")}
                  className="h-8 text-xs px-2"
                >
                  First {getModalSortIcon("firstName")}
                </Button>
                <Button
                  variant={modalSortField === "studentNumber" ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleModalSort("studentNumber")}
                  className="h-8 text-xs px-2"
                >
                  # {getModalSortIcon("studentNumber")}
                </Button>
              </div>
            </div>
          </div>

          {/* Students Table - Scrollable */}
          {getFilteredSectionStudents(selected).length > 0 ? (
            <div className="border rounded-lg overflow-hidden flex-1 min-h-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    <TableRow>
                      <TableHead className="min-w-[120px]">Student</TableHead>
                      <TableHead className="hidden sm:table-cell min-w-[100px]">Student Number</TableHead>
                      <TableHead className="hidden md:table-cell min-w-[80px]">Gender</TableHead>
                      <TableHead className="hidden lg:table-cell min-w-[100px]">Birthdate</TableHead>
                      <TableHead className="min-w-[80px]">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                </Table>
                <div className="max-h-[300px] overflow-y-auto">
                  <Table>
                    <TableBody>
                      {getFilteredSectionStudents(selected).map((student) => (
                        <TableRow key={student.id}>
                          <TableCell className="min-w-[120px]">
                            <div className="flex items-center gap-2 min-w-0">
                              <AvatarCell name={fullName(student)} />
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell min-w-[100px]">
                            <span className="font-mono text-xs truncate block max-w-[120px]">
                              {student.studentNumber}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell min-w-[80px]">
                            {student.gender ? (
                              <Badge className={getGenderBadgeColor(student.gender)}>
                                {student.gender}
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">Not set</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden lg:table-cell min-w-[100px]">
                            {formatDate(student.birthdate)}
                          </TableCell>
                          <TableCell className="min-w-[80px]">
                            <StatusBadge status={student.status || "Active"} />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg flex-1 flex flex-col items-center justify-center min-h-[200px]">
              <UsersIcon className="size-12 mx-auto mb-2 opacity-50" />
              <p>
                {modalSearch || modalGenderFilter !== "All" 
                  ? "No students match your filters" 
                  : "No students enrolled in this section"}
              </p>
              {modalSearch || modalGenderFilter !== "All" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setModalSearch("")
                    setModalGenderFilter("All")
                  }}
                >
                  Clear filters
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    setDialog(undefined)
                    choose("students", selected)
                  }}
                >
                  Assign students
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    )}
  </DialogContent>
</Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete section?"
        description={`This will permanently remove ${deleting?.name ?? "this section"} and all its assignments.`}
        onConfirm={handleDelete}
      />
    </div>
  )
}