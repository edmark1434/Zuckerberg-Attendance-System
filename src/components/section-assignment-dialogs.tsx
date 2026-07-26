import { useEffect, useMemo, useState } from "react"
import { SearchIcon, UserMinusIcon } from "lucide-react"
import { mockStudents } from "@/mock/students"
import { mockTeachers } from "@/mock/teachers"
import { fullName, type Section } from "@/types/attendance"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

export function AssignTeacherDialog({ open, section, onOpenChange, onSave }: { open: boolean; section?: Section; onOpenChange: (open: boolean) => void; onSave: (teacherId?: string) => void }) {
  const [query, setQuery] = useState("")
  useEffect(() => { if (open) setQuery("") }, [open])
  const teachers = useMemo(() => mockTeachers.filter((teacher) => teacher.status === "Active" && `${fullName(teacher)} ${teacher.department}`.toLowerCase().includes(query.toLowerCase())), [query])
  const assigned = mockTeachers.find((teacher) => teacher.id === section?.teacherId)
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-lg"><DialogHeader><DialogTitle>Assign teacher</DialogTitle><DialogDescription>Choose one teacher for {section?.name}.</DialogDescription></DialogHeader>{assigned && <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3"><span className="text-sm"><span className="text-muted-foreground">Currently assigned:</span> <strong>{fullName(assigned)}</strong></span><Button variant="ghost" size="sm" className="text-destructive" onClick={() => onSave(undefined)}><UserMinusIcon /> Remove</Button></div>}<div className="relative"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search available teachers" /></div><div className="max-h-64 space-y-1 overflow-auto">{teachers.map((teacher) => <button type="button" key={teacher.id} onClick={() => onSave(teacher.id)} className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left hover:bg-muted"><span className="font-medium">{fullName(teacher)}</span><span className="text-xs text-muted-foreground">{teacher.department}</span></button>)}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button></DialogFooter></DialogContent></Dialog>
}

export function AssignStudentsDialog({ open, section, onOpenChange, onSave }: { open: boolean; section?: Section; onOpenChange: (open: boolean) => void; onSave: (studentIds: string[]) => void }) {
  const [query, setQuery] = useState(""); const [selected, setSelected] = useState<string[]>([])
  useEffect(() => { if (open) { setQuery(""); setSelected(section?.studentIds ?? []) } }, [open, section])
  const students = useMemo(() => mockStudents.filter((student) => `${fullName(student)} ${student.studentNumber}`.toLowerCase().includes(query.toLowerCase())), [query])
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id])
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="sm:max-w-xl"><DialogHeader><DialogTitle>Assign students</DialogTitle><DialogDescription>Select all students enrolled in {section?.name}.</DialogDescription></DialogHeader><div className="relative"><SearchIcon className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={query} onChange={(event) => setQuery(event.target.value)} className="pl-9" placeholder="Search students" /></div><p className="text-xs text-muted-foreground">{selected.length} student{selected.length === 1 ? "" : "s"} selected</p><div className="max-h-64 space-y-1 overflow-auto rounded-lg border p-1">{students.map((student) => <label key={student.id} className="flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 hover:bg-muted"><Checkbox checked={selected.includes(student.id)} onCheckedChange={() => toggle(student.id)} /><span className="text-sm font-medium">{fullName(student)}</span><span className="ml-auto text-xs text-muted-foreground">{student.studentNumber}</span></label>)}</div><DialogFooter><Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button><Button onClick={() => onSave(selected)}>Save students</Button></DialogFooter></DialogContent></Dialog>
}
