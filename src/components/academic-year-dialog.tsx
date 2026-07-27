import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { AcademicYear, AccountStatus } from "@/types/attendance"

interface AcademicYearDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  year?: AcademicYear
  onSave: (input: Omit<AcademicYear, "id">) => void
}

export function AcademicYearDialog({
  open,
  onOpenChange,
  year,
  onSave,
}: AcademicYearDialogProps) {
  const [name, setName] = useState("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [status, setStatus] = useState<AccountStatus>("Inactive")

  useEffect(() => {
    setName(year?.name ?? "")
    setStartDate(year?.startDate ?? "")
    setEndDate(year?.endDate ?? "")
    setStatus(year?.status ?? "Inactive")
  }, [year, open])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {year ? "Edit academic year" : "Add academic year"}
          </DialogTitle>
          <DialogDescription>
            Only one academic year may be active at a time.
          </DialogDescription>
        </DialogHeader>

        <form
          className="grid gap-4"
          onSubmit={(event) => {
            event.preventDefault()
            onSave({ name, startDate, endDate, status, createdAt: new Date().toISOString() })
          }}
        >
          <div className="grid gap-1.5">
            <Label htmlFor="year-name">School year name</Label>
            <Input
              id="year-name"
              placeholder="2026–2027"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="start-date">Start date</Label>
              <Input
                id="start-date"
                type="date"
                value={startDate}
                onChange={(event) => setStartDate(event.target.value)}
                required
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="end-date">End date</Label>
              <Input
                id="end-date"
                type="date"
                value={endDate}
                onChange={(event) => setEndDate(event.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Status</Label>
            <Select
              value={status}
              onValueChange={(value) =>
                setStatus((value ?? "Inactive") as AccountStatus)
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Active">Active</SelectItem>
                <SelectItem value="Inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {year ? "Save changes" : "Create school year"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}