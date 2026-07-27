import { useMemo, useState, useEffect } from "react"
import { MoreHorizontalIcon, PlusIcon, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react"
import { toast } from "sonner"

import { useMockCollection } from "@/hooks/use-mock-collection"
import { fullName, type Teacher } from "@/types/attendance"
import { AvatarCell, EmptyState, PageHeader, Pagination, SearchInput, StatusBadge } from "@/components/admin-ui"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { TeacherDialog } from "@/components/entity-dialogs"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { database, auth } from "../../../firebase"
import { ref, push, set, update, remove, onValue, get } from "firebase/database"
import { createUserWithEmailAndPassword, deleteUser, signInWithEmailAndPassword } from "firebase/auth"

const PAGE_SIZE = 8

type SortField = "firstName" | "lastName"
type SortOrder = "asc" | "desc"

export function TeacherAccountsPage() {
  const collection = useMockCollection<Teacher>([])
  const [search, setSearch] = useState("")
  const [page, setPage] = useState(1)
  const [sortField, setSortField] = useState<SortField>("lastName")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")
  const [dialog, setDialog] = useState<"create" | "edit" | undefined>()
  const [selected, setSelected] = useState<Teacher>()
  const [deleting, setDeleting] = useState<Teacher>()
  const [loading, setLoading] = useState(true)

  // Function to display name based on sort field
  const getDisplayName = (teacher: Teacher) => {
    const firstName = teacher.firstName || ""
    const lastName = teacher.lastName || ""
    const middleName = teacher.middleName || ""

    // If sorting by last name, show "Last Name, First Name MiddleName"
    if (sortField === "lastName") {
      const parts = [lastName]
      if (firstName) parts.push(firstName)
      if (middleName) parts.push(middleName)
      return parts.join(" ")
    }
    
    // If sorting by first name, show "First Name MiddleName Last Name"
    if (sortField === "firstName") {
      const parts = []
      if (firstName) parts.push(firstName)
      if (middleName) parts.push(middleName)
      if (lastName) parts.push(lastName)
      return parts.join(" ")
    }
    
    // Default: show full name
    return fullName(teacher)
  }

  // Fetch teachers from Firebase Realtime Database
  useEffect(() => {
    const teachersRef = ref(database, "teachers");

    const unsubscribe = onValue(
      teachersRef,
      (snapshot) => {
        const data = snapshot.val();

        if (!data) {
          collection.setRecords([]);
          setLoading(false);
          return;
        }

        const teachers: Teacher[] = Object.entries(data).map(
          ([key, value]: [string, any]) => ({
            id: key,
            uid: value.uid || "",
            firstName: value.firstName || "",
            lastName: value.lastName || "",
            middleName: value.middleName || "",
            email: value.email || "",
            status: value.status || "Active",
            password: value.password || "",
            current_password: value.current_password || "",
            passwordResetAt: value.passwordResetAt || "",
          })
        );

        collection.setRecords(teachers);
        setLoading(false);
      },
      (error) => {
        console.error(error);
        toast.error("Failed to load teachers");
        collection.setRecords([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const filtered = useMemo(
    () => {
      // First filter the data
      const filteredData = collection.records.filter((teacher) =>
        `${fullName(teacher)} ${teacher.email}`
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      // Then sort the filtered data
      return filteredData.sort((a, b) => {
        let compareA = ""
        let compareB = ""

        switch (sortField) {
          case "firstName":
            compareA = a.firstName || ""
            compareB = b.firstName || ""
            break
          case "lastName":
            compareA = a.lastName || ""
            compareB = b.lastName || ""
            break
          default:
            compareA = a.lastName || ""
            compareB = b.lastName || ""
        }

        const comparison = compareA.localeCompare(compareB)
        return sortOrder === "asc" ? comparison : -comparison
      });
    },
    [collection.records, search, sortField, sortOrder]
  )

  const pages = Math.ceil(filtered.length / PAGE_SIZE)
  const records = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const save = async (input: Omit<Teacher, "id">) => {
    try {
      const teachersRef = ref(database, 'teachers')
      
      if (dialog === "edit" && selected) {
        const teacherRef = ref(database, `teachers/${selected.id}`)
        
        const snapshot = await get(teacherRef);
        const existingData = snapshot.val();

        if (!existingData) {
          toast.error("Teacher not found");
          return;
        }

        const updateData = {
          firstName: input.firstName || '',
          lastName: input.lastName || '',
          middleName: input.middleName || '',
          email: input.email || '',
          status: input.status || 'Active',
          updatedAt: new Date().toISOString()
        };

        if (input.current_password && input.current_password !== existingData.current_password) {
          Object.assign(updateData, { current_password: input.current_password });
        }

        await update(teacherRef, updateData);
        toast.success("Teacher account updated")
      } else {
        try {
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            input.email,
            input.password || 'defaultPassword123'
          );
          
          const user = userCredential.user;

          const newTeacherRef = push(teachersRef)
          
          const teacherData = {
            uid: user.uid,
            firstName: input.firstName || '',
            lastName: input.lastName || '',
            middleName: input.middleName || '',
            email: input.email || '',
            status: 'Active',
            password: input.password || '',
            current_password: input.password || '',
            is_first_login: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };

          await set(newTeacherRef, teacherData);
          toast.success("Teacher account created successfully")
        } catch (authError: any) {
          console.error("Auth error:", authError);
          
          if (authError.code === 'auth/email-already-in-use') {
            toast.error("This email is already registered.");
          } else if (authError.code === 'auth/weak-password') {
            toast.error("Password should be at least 6 characters.");
          } else {
            toast.error(authError.message || "Failed to create teacher account");
          }
          return;
        }
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An error occurred");
    } finally {
      setDialog(undefined);
      setSelected(undefined);
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    try {
      const teacherRef = ref(database, `teachers/${deleting.id}`)
      const snapshot = await get(teacherRef);
      const teacherData = snapshot.val();
      
      if (!teacherData) {
        toast.error("Teacher not found");
        setDeleting(undefined);
        return;
      }

      let authDeleted = false;
      if (teacherData.uid) {
        try {
          if (teacherData.current_password) {
            try {
              const userCredential = await signInWithEmailAndPassword(
                auth,
                teacherData.email,
                teacherData.current_password
              );
              await deleteUser(userCredential.user);
              authDeleted = true;
              console.log(`✅ Auth user ${teacherData.uid} deleted successfully`);
            } catch (signInError: any) {
              console.error("Sign in error:", signInError);
              
              if (signInError.code === 'auth/wrong-password' || signInError.code === 'auth/invalid-credential') {
                toast.info("Password may be incorrect. Attempting to delete via admin...");
                toast.warning("Cannot delete authentication record without Admin SDK. Please use Firebase Console to delete the user.");
              }
            }
          } else {
            toast.warning("No password found for authentication deletion.");
          }
        } catch (authError: any) {
          console.error("Error deleting auth user:", authError);
          
          if (authError.code === 'auth/user-not-found') {
            authDeleted = true;
            console.log("ℹ️ Auth user already deleted");
          }
        }
      }

      await remove(teacherRef);
      console.log(`✅ Teacher ${deleting.id} deleted from database`);

      collection.remove(deleting.id);

      if (authDeleted) {
        toast.success(`✅ ${fullName(deleting)} removed successfully (Auth + Database)`);
      } else {
        toast.warning(`⚠️ ${fullName(deleting)} removed from database. Authentication record must be deleted manually from Firebase Console.`);
      }
      
      setDeleting(undefined);
    } catch (error) {
      console.error("Error deleting teacher:", error);
      toast.error("Failed to delete teacher");
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading teachers...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teachers"
        description="Manage faculty accounts and teaching profiles."
        action={
          <Button
            onClick={() => {
              setSelected(undefined)
              setDialog("create")
            }}
          >
            <PlusIcon /> Add teacher
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
                placeholder="Search teachers by name or email"
                className="flex-1"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span>{filtered.length} teacher{filtered.length === 1 ? "" : "s"}</span>
            </div>
          </div>

          {/* Sort Bar */}
          <div className="border-b p-3 bg-muted/30 flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground mr-2">Sort by:</span>
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
            <Badge variant="secondary" className="text-xs ml-2">
              {sortField === "firstName" ? "First Name" : "Last Name"} 
              ({sortOrder === "asc" ? "A→Z" : "Z→A"})
            </Badge>
          </div>

          <div className="overflow-x-auto">
            {records.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Teacher</TableHead>
                    <TableHead className="hidden md:table-cell">Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-12" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((teacher) => (
                    <TableRow key={teacher.id}>
                      <TableCell>
                        <AvatarCell name={getDisplayName(teacher)} />
                      </TableCell>
                      <TableCell className="hidden text-muted-foreground md:table-cell">
                        {teacher.email}
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={teacher.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Actions for ${fullName(teacher)}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelected(teacher)
                                setDialog("edit")
                              }}
                            >
                              Edit teacher
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(teacher)}
                            >
                              Delete teacher
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
                title="No teachers found"
                description="Try another search term or add a new faculty account."
              />
            )}
          </div>

          {records.length > 0 && (
            <div className="p-4">
              <Pagination
                page={page}
                total={pages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <TeacherDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        teacher={dialog === "edit" ? selected : undefined}
        onSave={save}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete teacher?"
        description={
          <>
            <p>This will permanently remove <strong>{deleting ? fullName(deleting) : "this teacher"}</strong> from the system.</p>
            <div className="mt-3 p-3 bg-destructive/10 rounded-md">
              <p className="text-sm font-medium text-destructive">This will delete:</p>
              <ul className="mt-1 text-sm text-destructive/80 list-disc list-inside">
                <li>All teacher data from the database</li>
                <li className="text-amber-600">⚠️ Authentication record may need manual deletion from Firebase Console</li>
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