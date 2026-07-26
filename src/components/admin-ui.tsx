import type { ReactNode } from "react"
import { ChevronLeftIcon, ChevronRightIcon, InboxIcon, SearchIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export function PageHeader({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-2xl font-semibold tracking-tight">{title}</h1><p className="mt-1 text-sm text-muted-foreground">{description}</p></div>{action}</div>
}

export function StatsCard({ label, value, detail, icon }: { label: string; value: string | number; detail: string; icon: ReactNode }) {
  return <Card className="shadow-none"><CardContent className="p-5"><div className="flex items-start justify-between"><div><p className="text-sm font-medium text-muted-foreground">{label}</p><p className="mt-2 text-3xl font-semibold tracking-tight">{value}</p></div><div className="rounded-lg bg-primary/10 p-2.5 text-primary">{icon}</div></div><p className="mt-3 text-xs text-muted-foreground">{detail}</p></CardContent></Card>
}

export function SearchInput({ value, onChange, placeholder }: { value: string; onChange: (value: string) => void; placeholder: string }) {
  return <div className="relative w-full sm:max-w-sm"><SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" /><Input value={value} onChange={(event) => onChange(event.target.value)} className="h-9 pl-9" placeholder={placeholder} aria-label={placeholder} /></div>
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed px-6 text-center"><div className="rounded-full bg-muted p-3"><InboxIcon className="size-5 text-muted-foreground" /></div><h3 className="mt-4 font-medium">{title}</h3><p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>{action && <div className="mt-4">{action}</div>}</div>
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return <div className="space-y-3">{Array.from({ length: rows }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
}

export function StatusBadge({ status }: { status: string }) {
  const style = status === "Active" || status === "Present" || status === "Completed" ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-50" : status === "Late" || status === "Open" ? "bg-amber-50 text-amber-700 hover:bg-amber-50" : "bg-muted text-muted-foreground hover:bg-muted"
  return <Badge variant="secondary" className={cn("border-0 font-medium", style)}>{status}</Badge>
}

export function AvatarCell({ name }: { name: string }) {
  const initials = name.split(" ").map((part) => part[0]).slice(0, 2).join("")
  return <div className="flex items-center gap-3"><div className="grid size-8 place-items-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{initials}</div><span className="font-medium">{name}</span></div>
}

export function Pagination({ page, total, onPageChange }: { page: number; total: number; onPageChange: (page: number) => void }) {
  return <div className="flex items-center justify-between border-t px-1 pt-4"><p className="text-sm text-muted-foreground">Page {page} of {Math.max(total, 1)}</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => onPageChange(page - 1)} disabled={page === 1}><ChevronLeftIcon /> <span className="hidden sm:inline">Previous</span></Button><Button size="sm" variant="outline" onClick={() => onPageChange(page + 1)} disabled={page === total || total === 0}><span className="hidden sm:inline">Next</span><ChevronRightIcon /></Button></div></div>
}
