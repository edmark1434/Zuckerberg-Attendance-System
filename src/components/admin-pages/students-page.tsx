import { useMemo, useState, useEffect } from "react"
import { EyeIcon, MoreHorizontalIcon, PlusIcon, FilterIcon, XIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"
import QRCode from "react-qr-code"

import { useMockCollection } from "@/hooks/use-mock-collection"
import { fullName, type Student, type Section } from "@/types/attendance"
import { AvatarCell, EmptyState, PageHeader, Pagination, SearchInput } from "@/components/admin-ui"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { StudentDialog } from "@/components/entity-dialogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { database } from "../../../firebase"
import { ref, push, set, remove, onValue, update } from "firebase/database"

const PAGE_SIZE = 8

const GENDER_OPTIONS = [
  "All",
  "Male",
  "Female"
] as const

type GenderFilter = typeof GENDER_OPTIONS[number]

type SortField = "firstName" | "lastName" | "studentNumber" | "birthdate"
type SortOrder = "asc" | "desc"

export function StudentAccountsPage() {
  const collection = useMockCollection<Student>([])
  const [sections, setSections] = useState<Section[]>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("All")
  const [showFilter, setShowFilter] = useState(false)
  
  // Sort state
  const [sortField, setSortField] = useState<SortField>("lastName")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  
  const [dialog, setDialog] = useState<"create" | "edit" | "view" | undefined>()
  const [selected, setSelected] = useState<Student>()
  const [deleting, setDeleting] = useState<Student>()
  const [loading, setLoading] = useState(true)

  // Function to display name based on sort field
  const getDisplayName = (student: Student) => {
    const firstName = student.firstName || ""
    const lastName = student.lastName || ""
    const middleName = student.middleName || ""
    const suffix = student.suffix || ""

    // If sorting by last name, show "Last Name, First Name MiddleName Suffix"
    if (sortField === "lastName") {
      const parts = [lastName]
      if (firstName) parts.push(firstName)
      if (middleName) parts.push(middleName)
      if (suffix) parts.push(suffix)
      return parts.join(", ")
    }
    
    // If sorting by first name, show "First Name MiddleName Last Name Suffix"
    if (sortField === "firstName") {
      const parts = []
      if (firstName) parts.push(firstName)
      if (middleName) parts.push(middleName)
      if (lastName) parts.push(lastName)
      if (suffix) parts.push(suffix)
      return parts.join(" ")
    }
    
    // Default: show full name as "First Name MiddleName Last Name Suffix"
    return fullName(student)
  }

  // Generate student number
  const generateStudentNumber = () => {
    const numbers = collection.records
      .map((student) => {
        const match = student.studentNumber?.match(/^STUD-(\d+)$/);
        return match ? Number(match[1]) : 0;
      })
      .filter(num => num > 0);

    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1230001;
    return `STUD-${nextNumber}`;
  };

  // Fetch students from Firebase
  useEffect(() => {
    const studentsRef = ref(database, "students");

    const unsubscribe = onValue(
      studentsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          collection.setRecords([]);
          setLoading(false);
          return;
        }

        const students: Student[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            studentNumber: value.studentNumber ?? "",
            firstName: value.firstName ?? "",
            lastName: value.lastName ?? "",
            middleName: value.middleName ?? "",
            suffix: value.suffix ?? "",
            birthdate: value.birthdate ?? "",
            gender: value.gender ?? "",
            status: value.status ?? "Active",
          })
        );

        collection.setRecords(students);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load students");
        collection.setRecords([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Fetch sections from Firebase
  useEffect(() => {
    const sectionsRef = ref(database, "sections");

    const unsubscribe = onValue(
      sectionsRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          setSections([]);
          return;
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
            schedule: value.schedule || "",
            createdAt: value.createdAt || new Date().toISOString(),
            updatedAt: value.updatedAt || new Date().toISOString(),
          })
        );

        setSections(sectionsData);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load sections");
        setSections([]);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(
    () => {
      // First filter the data
      const filteredData = collection.records.filter((student) => {
        // Search filter (name or student number)
        const searchTerm = search.toLowerCase()
        const fullNameStr = `${student.firstName} ${student.lastName} ${student.middleName || ""}`.toLowerCase()
        const searchMatch = fullNameStr.includes(searchTerm) || 
                           student.studentNumber?.toLowerCase().includes(searchTerm)
        
        // Gender filter
        const genderMatch = genderFilter === "All" || student.gender === genderFilter
        
        return searchMatch && genderMatch
      });

      // Then sort the filtered data
      return filteredData.sort((a, b) => {
        let compareA: string | number = ""
        let compareB: string | number = ""

        switch (sortField) {
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
          case "birthdate":
            compareA = a.birthdate || ""
            compareB = b.birthdate || ""
            break
          default:
            compareA = a.lastName || ""
            compareB = b.lastName || ""
        }

        // Handle string comparison
        if (typeof compareA === "string" && typeof compareB === "string") {
          const comparison = compareA.localeCompare(compareB)
          return sortOrder === "asc" ? comparison : -comparison
        }

        // Handle number comparison (for student numbers)
        if (typeof compareA === "number" && typeof compareB === "number") {
          return sortOrder === "asc" ? compareA - compareB : compareB - compareA
        }

        return 0
      });
    },
    [collection.records, search, genderFilter, sortField, sortOrder]
  )

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const records = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const choose = (action: "edit" | "view", student: Student) => {
    setSelected(student)
    setDialog(action)
  }

  const save = async (input: Omit<Student, "id">) => {
    try {
      const studentsRef = ref(database, 'students')
      
      if (selected && dialog === "edit") {
        const studentRef = ref(database, `students/${selected.id}`)
        
        const birthdateString = input.birthdate 
          ? new Date(input.birthdate).toISOString().split('T')[0]
          : "";

        await set(studentRef, {
          studentNumber: selected.studentNumber,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          middleName: input.middleName || '',
          suffix: input.suffix || '',
          birthdate: birthdateString,
          gender: input.gender || '',
          status: input.status || 'Active',
          updatedAt: new Date().toISOString()
        })

        toast.success("Student account updated")
      } else {
        const newStudentRef = push(studentsRef)
        const newStudentNumber = generateStudentNumber();
        
        const birthdateString = input.birthdate 
          ? new Date(input.birthdate).toISOString().split('T')[0]
          : "";

        await set(newStudentRef, {
          studentNumber: newStudentNumber,
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          middleName: input.middleName || '',
          suffix: input.suffix || '',
          birthdate: birthdateString,
          gender: input.gender || '',
          status: input.status || 'Active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })

        toast.success("Student account created")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("An error occurred")
    } finally {
      setDialog(undefined)
      setSelected(undefined)
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    try {
      const sectionsWithStudent = sections.filter(
        (section) => section.studentIds && section.studentIds.includes(deleting.id)
      );

      if (sectionsWithStudent.length > 0) {
        for (const section of sectionsWithStudent) {
          const sectionRef = ref(database, `sections/${section.id}`);
          const updatedStudentIds = section.studentIds.filter((id) => id !== deleting.id);
          
          await update(sectionRef, {
            studentIds: updatedStudentIds,
            updatedAt: new Date().toISOString()
          });
        }
        
        toast.info(`Student removed from ${sectionsWithStudent.length} section(s)`);
      }

      const studentRef = ref(database, `students/${deleting.id}`)
      await remove(studentRef);

      collection.remove(deleting.id);

      toast.success(`✅ ${fullName(deleting)} removed successfully`);
      setDeleting(undefined);
    } catch (error) {
      console.error("Error deleting student:", error);
      toast.error("Failed to delete student");
    }
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString()
  }

  const getGenderBadgeColor = (gender: string) => {
    switch(gender) {
      case 'Male': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'Female': return 'bg-pink-100 text-pink-800 border-pink-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("asc")
    }
    setPage(1)
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 ml-1" />
    }
    return sortOrder === "asc" 
      ? <ArrowUp className="h-3 w-3 ml-1" />
      : <ArrowDown className="h-3 w-3 ml-1" />
  }

  const clearAllFilters = () => {
    setSearch("")
    setGenderFilter("All")
    setPage(1)
  }

  const hasActiveFilters = search || genderFilter !== "All"

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading students...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Students"
        description="Manage student accounts, enrolment, and access."
        action={
          <Button
            onClick={() => {
              setSelected(undefined)
              setDialog("create")
            }}
          >
            <PlusIcon /> Add student
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-2">
              <SearchInput
                value={search}
                onChange={(value) => {
                  setSearch(value)
                  setPage(1)
                }}
                placeholder="Search students by name or student number"
                className="flex-1"
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => setShowFilter(!showFilter)}
                className={showFilter ? "bg-primary/10" : ""}
              >
                <FilterIcon className="h-4 w-4" />
              </Button>
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAllFilters}
                  className="text-xs text-muted-foreground"
                >
                  <XIcon className="h-3 w-3 mr-1" />
                  Clear all
                </Button>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filtered.length} student{filtered.length === 1 ? "" : "s"}</span>
              {genderFilter !== "All" && (
                <Badge 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {genderFilter}
                  <XIcon 
                    className="h-3 w-3 cursor-pointer hover:text-destructive" 
                    onClick={() => setGenderFilter("All")}
                  />
                </Badge>
              )}
            </div>
          </div>

          {/* Filter Bar */}
          {showFilter && (
            <div className="border-b p-4 bg-muted/30">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Gender Filter */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Gender</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {GENDER_OPTIONS.map((option) => (
                      <Button
                        key={option}
                        variant={genderFilter === option ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setGenderFilter(option)
                          setPage(1)
                        }}
                        className="text-xs h-7"
                      >
                        {option}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Sort Options */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Sort by</Label>
                  <div className="flex flex-wrap gap-1.5">
                    <Button
                      variant={sortField === "firstName" ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("firstName")}
                      className="text-xs h-7"
                    >
                      First Name {getSortIcon("firstName")}
                    </Button>
                    <Button
                      variant={sortField === "lastName" ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("lastName")}
                      className="text-xs h-7"
                    >
                      Last Name {getSortIcon("lastName")}
                    </Button>
                    <Button
                      variant={sortField === "studentNumber" ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("studentNumber")}
                      className="text-xs h-7"
                    >
                      Student # {getSortIcon("studentNumber")}
                    </Button>
                    <Button
                      variant={sortField === "birthdate" ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleSort("birthdate")}
                      className="text-xs h-7"
                    >
                      Birthdate {getSortIcon("birthdate")}
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Display */}
              {hasActiveFilters && (
                <div className="mt-3 flex flex-wrap items-center gap-2 pt-3 border-t">
                  <span className="text-xs text-muted-foreground">Active filters:</span>
                  {search && (
                    <Badge variant="secondary" className="text-xs">
                      Search: {search}
                      <XIcon 
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                        onClick={() => setSearch("")}
                      />
                    </Badge>
                  )}
                  {genderFilter !== "All" && (
                    <Badge variant="secondary" className="text-xs">
                      Gender: {genderFilter}
                      <XIcon 
                        className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                        onClick={() => setGenderFilter("All")}
                      />
                    </Badge>
                  )}
                  <Badge variant="secondary" className="text-xs">
                    Sort: {sortField === "firstName" ? "First Name" : 
                           sortField === "lastName" ? "Last Name" :
                           sortField === "studentNumber" ? "Student #" : "Birthdate"} 
                    ({sortOrder === "asc" ? "A→Z" : "Z→A"})
                  </Badge>
                </div>
              )}
            </div>
          )}

          <div className="overflow-x-auto">
            {records.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead className="hidden md:table-cell">Gender</TableHead>
                    <TableHead className="hidden md:table-cell">Student ID</TableHead>
                    <TableHead className="hidden md:table-cell">Student Number</TableHead>
                    <TableHead className="hidden md:table-cell">Birthdate</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>
                        <AvatarCell name={getDisplayName(student)} />
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.gender && (
                          <Badge className={getGenderBadgeColor(student.gender)}>
                            {student.gender}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {student.id}
                      </TableCell>
                      <TableCell className="hidden font-mono text-xs md:table-cell">
                        {student.studentNumber}
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {formatDate(student.birthdate)}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Actions for ${fullName(student)}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => choose("view", student)}>
                              <EyeIcon /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => choose("edit", student)}>
                              Edit student
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem variant="destructive" onClick={() => setDeleting(student)}>
                              Delete student
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="No students found"
                description={
                  hasActiveFilters
                    ? "No students match your filters. Try adjusting your search criteria."
                    : "Try a different search or add a new student account."
                }
                action={
                  <Button onClick={clearAllFilters}>
                    Clear all filters
                  </Button>
                }
              />
            )}
          </div>

          {records.length > 0 && (
            <div className="p-4">
              <Pagination page={page} total={pages} onPageChange={setPage} />
            </div>
          )}
        </CardContent>
      </Card>

      <StudentDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        student={dialog === "edit" ? selected : undefined}
        onSave={save}
      />

      <Dialog
        open={dialog === "view"}
        onOpenChange={(open) => !open && setDialog(undefined)}
      >
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Student profile</DialogTitle>
            <DialogDescription>{selected && fullName(selected)}</DialogDescription>
          </DialogHeader>
          {selected && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <dl className="grid gap-3 text-sm">
                <div>
                  <dt className="text-muted-foreground">Student ID</dt>
                  <dd className="font-medium">{selected.id}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Student number</dt>
                  <dd className="font-medium">{selected.studentNumber}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">First name</dt>
                  <dd className="font-medium">{selected.firstName}</dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Last name</dt>
                  <dd className="font-medium">{selected.lastName}</dd>
                </div>
                {selected.middleName && (
                  <div>
                    <dt className="text-muted-foreground">Middle name</dt>
                    <dd className="font-medium">{selected.middleName}</dd>
                  </div>
                )}
                {selected.suffix && (
                  <div>
                    <dt className="text-muted-foreground">Suffix</dt>
                    <dd className="font-medium">{selected.suffix}</dd>
                  </div>
                )}
                {selected.birthdate && (
                  <div>
                    <dt className="text-muted-foreground">Birthdate</dt>
                    <dd className="font-medium">
                      {formatDate(selected.birthdate)}
                    </dd>
                  </div>
                )}
                {selected.gender && (
                  <div>
                    <dt className="text-muted-foreground">Gender</dt>
                    <dd className="font-medium">
                      <Badge className={getGenderBadgeColor(selected.gender)}>
                        {selected.gender}
                      </Badge>
                    </dd>
                  </div>
                )}
              </dl>
              <div className="flex flex-col items-center justify-center">
                <div className="bg-white p-4 rounded-lg shadow-sm border">
                  <QRCode
                    value={JSON.stringify({
                      id: selected.id,
                      studentNumber: selected.studentNumber,
                      firstName: selected.firstName,
                      lastName: selected.lastName,
                      gender: selected.gender,
                    })}
                    size={200}
                    level="H"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">Scan QR code for student details</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete student?"
        description={
          <>
            <p>This will permanently remove <strong>{deleting ? fullName(deleting) : "this student"}</strong> from the system.</p>
            {deleting && sections.some(s => s.studentIds?.includes(deleting.id)) && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-md">
                <p className="text-sm text-amber-800">
                  ⚠️ This student is currently enrolled in one or more sections and will be removed from all of them.
                </p>
              </div>
            )}
            <div className="mt-3 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm font-medium text-destructive">This will delete:</p>
              <ul className="mt-1 text-sm text-destructive/80 list-disc list-inside">
                <li>Student record from the database</li>
                <li>Student from all enrolled sections</li>
                <li>This action cannot be undone</li>
              </ul>
            </div>
          </>
        }
        onConfirm={handleDelete}
      />
    </div>
  )
}