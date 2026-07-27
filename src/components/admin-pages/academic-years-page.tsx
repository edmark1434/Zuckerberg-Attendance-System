import { useState, useEffect } from "react"
import { MoreHorizontalIcon, PlusIcon } from "lucide-react"
import { toast } from "sonner"

import type { AcademicYear } from "@/types/attendance"
import { PageHeader, StatusBadge } from "@/components/admin-ui"
import { AcademicYearDialog } from "@/components/academic-year-dialog"
import { ConfirmDialog } from "@/components/confirm-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { database } from "../../../firebase"
import { ref, push, set, update, remove, onValue, get } from "firebase/database"

export function AcademicYearsPage() {
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([])
  const [loading, setLoading] = useState(true)
  const [dialog, setDialog] = useState<"create" | "edit" | undefined>()
  const [selected, setSelected] = useState<AcademicYear>()
  const [deleting, setDeleting] = useState<AcademicYear>()

  // Fetch academic years from Firebase
  useEffect(() => {
    const academicYearsRef = ref(database, "academicYears")

    const unsubscribe = onValue(
      academicYearsRef,
      (snapshot) => {
        const data = snapshot.val()

        if (!data) {
          setAcademicYears([])
          setLoading(false)
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
        setLoading(false)
      },
      (error) => {
        console.error(error)
        toast.error("Failed to load academic years")
        setAcademicYears([])
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [])

  const save = async (input: Omit<AcademicYear, "id">) => {
    try {
      const academicYearsRef = ref(database, "academicYears")

      if (dialog === "edit" && selected) {
        // Update existing academic year
        const yearRef = ref(database, `academicYears/${selected.id}`)
        
        // If setting to active, deactivate all others
        if (input.status === "Active") {
          await deactivateAllOtherYears(selected.id)
        }
        
        await update(yearRef, {
          name: input.name || "",
          startDate: input.startDate || "",
          endDate: input.endDate || "",
          status: input.status || "Inactive",
          updatedAt: new Date().toISOString()
        })
        
        toast.success("Academic year updated")
      } else {
        // Create new academic year
        const newYearRef = push(academicYearsRef)
        
        // If creating as active, deactivate all others
        if (input.status === "Active") {
          await deactivateAllOtherYears()
        }
        
        await set(newYearRef, {
          name: input.name || "",
          startDate: input.startDate || "",
          endDate: input.endDate || "",
          status: input.status || "Inactive",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
        
        toast.success("Academic year created")
      }
    } catch (error) {
      console.error("Error saving academic year:", error)
      toast.error("An error occurred")
    } finally {
      setDialog(undefined)
      setSelected(undefined)
    }
  }

  const deactivateAllOtherYears = async (excludeId?: string) => {
    try {
      const academicYearsRef = ref(database, "academicYears")
      const snapshot = await get(academicYearsRef)
      const data = snapshot.val()

      if (!data) return

      // Update all other years to inactive
      const updates: { [key: string]: any } = {}
      Object.entries(data).forEach(([key, value]: [string, any]) => {
        if (key !== excludeId && value.status === "Active") {
          updates[`academicYears/${key}/status`] = "Inactive"
          updates[`academicYears/${key}/updatedAt`] = new Date().toISOString()
        }
      })

      if (Object.keys(updates).length > 0) {
        await update(ref(database), updates)
      }
    } catch (error) {
      console.error("Error deactivating years:", error)
      throw error
    }
  }

  const handleMakeActive = async (year: AcademicYear) => {
    try {
      // Deactivate all other years
      await deactivateAllOtherYears(year.id)
      
      // Update this year to active using update (not set)
      const yearRef = ref(database, `academicYears/${year.id}`)
      await update(yearRef, {
        status: "Active",
        updatedAt: new Date().toISOString()
      })
      
      toast.success(`${year.name} is now active`)
    } catch (error) {
      console.error("Error making year active:", error)
      toast.error("Failed to make year active")
    }
  }

  const handleDelete = async () => {
    if (!deleting) return

    try {
      const yearRef = ref(database, `academicYears/${deleting.id}`)
      await remove(yearRef)
      
      toast.success("Academic year removed")
      setDeleting(undefined)
    } catch (error) {
      console.error("Error deleting academic year:", error)
      toast.error("Failed to delete academic year")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading academic years...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Academic school years"
        description="Manage the academic periods available when creating sections."
        action={
          <Button
            onClick={() => {
              setSelected(undefined)
              setDialog("create")
            }}
          >
            <PlusIcon /> Add school year
          </Button>
        }
      />

      <Card className="shadow-none">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>School year</TableHead>
                  <TableHead>Start date</TableHead>
                  <TableHead>End date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-12" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {academicYears.length > 0 ? (
                  academicYears.map((year) => (
                    <TableRow key={year.id}>
                      <TableCell className="font-medium">{year.name}</TableCell>
                      <TableCell>{year.startDate}</TableCell>
                      <TableCell>{year.endDate}</TableCell>
                      <TableCell>
                        <StatusBadge status={year.status} />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button
                                size="icon"
                                variant="ghost"
                                aria-label={`Actions for ${year.name}`}
                              />
                            }
                          >
                            <MoreHorizontalIcon />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => {
                                setSelected(year)
                                setDialog("edit")
                              }}
                            >
                              Edit school year
                            </DropdownMenuItem>
                            {year.status !== "Active" && (
                              <DropdownMenuItem
                                onClick={() => handleMakeActive(year)}
                              >
                                Make active
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => setDeleting(year)}
                              disabled={year.status === "Active"}
                            >
                              Delete school year
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No academic years found. Click "Add school year" to create one.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <AcademicYearDialog
        open={dialog === "create" || dialog === "edit"}
        onOpenChange={(open) => !open && setDialog(undefined)}
        year={dialog === "edit" ? selected : undefined}
        onSave={save}
      />

      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(open) => !open && setDeleting(undefined)}
        title="Delete academic year?"
        description="Sections already using this school year should be reassigned before it is removed."
        onConfirm={handleDelete}
      />
    </div>
  )
}