import { useState } from "react"
import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts"
import {
  CalendarCheck2Icon,
  CheckCircle2Icon,
  Clock3Icon,
  DownloadIcon,
  QrCodeIcon,
  XCircleIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"

// Replace these objects with data from your API (for example, GET /api/students/me).
export const studentProfile = {
  id: "STU-2024-001",
  firstName: "Juan",
  lastName: "Dela Cruz",
  email: "juan.delacruz@acme.edu.ph",
  lrn: "123456789012",
  gradeLevel: "Grade 10",
  section: "Section A",
  adviser: "Maria Santos",
  schoolYear: "2025–2026",
}

export const attendanceSummary = {
  status: "present" as const,
  date: "July 13, 2026",
  timeIn: "7:28 AM",
  timeOut: "4:31 PM",
  presentDays: 87,
  lateDays: 4,
  absentDays: 2,
  attendanceRate: 94.6,
}

const attendanceChartData = [
  { label: "Present", days: attendanceSummary.presentDays, fill: "var(--color-present)" },
  { label: "Late", days: attendanceSummary.lateDays, fill: "var(--color-late)" },
  { label: "Absent", days: attendanceSummary.absentDays, fill: "var(--color-absent)" },
]

const attendanceChartConfig = {
  days: { label: "Days" },
  present: { label: "Present", color: "oklch(0.696 0.17 162.48)" },
  late: { label: "Late", color: "oklch(0.769 0.188 70.08)" },
  absent: { label: "Absent", color: "oklch(0.637 0.237 25.331)" },
} satisfies ChartConfig

export const attendanceHistory = [
  { id: "ATT-001", date: "July 13, 2026", timeIn: "7:28 AM", timeOut: "4:31 PM", status: "Present" },
  { id: "ATT-002", date: "July 12, 2026", timeIn: "7:43 AM", timeOut: "4:29 PM", status: "Late" },
  { id: "ATT-003", date: "July 11, 2026", timeIn: "7:25 AM", timeOut: "4:33 PM", status: "Present" },
  { id: "ATT-004", date: "July 10, 2026", timeIn: "—", timeOut: "—", status: "Absent" },
  { id: "ATT-005", date: "July 9, 2026", timeIn: "7:31 AM", timeOut: "4:30 PM", status: "Present" },
  { id: "ATT-006", date: "June 30, 2026", timeIn: "7:29 AM", timeOut: "4:28 PM", status: "Present" },
  { id: "ATT-007", date: "June 29, 2026", timeIn: "7:35 AM", timeOut: "4:30 PM", status: "Late" },
]

export const studentQrCode = {
  token: "STU-2024-001-7K2P9",
  issuedAt: "July 1, 2026",
  expiresAt: "March 31, 2027",
  // Set this to the QR image returned by your backend, e.g. "/api/students/me/qr-code".
  imageUrl: null as string | null,
}

function PageHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    Present: "bg-emerald-100 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950 dark:text-emerald-300",
    Late: "bg-amber-100 text-amber-700 hover:bg-amber-100 dark:bg-amber-950 dark:text-amber-300",
    Absent: "bg-red-100 text-red-700 hover:bg-red-100 dark:bg-red-950 dark:text-red-300",
  }

  return <Badge className={styles[status as keyof typeof styles] ?? ""}>{status}</Badge>
}

function MetricCard({ label, value, helper }: { label: string; value: string | number; helper: string }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl">{value}</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-muted-foreground">{helper}</CardContent>
    </Card>
  )
}

export function DashboardHomePage() {
  const [month, setMonth] = useState("July 2026")
  const recentRecords = attendanceHistory.filter((record) => record.date.startsWith(month.split(" ")[0]))

  return (
    <div className="space-y-6">
      <PageHeading title={`Welcome back, ${studentProfile.firstName}`} description="Here is a quick view of your attendance." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader><CardTitle>Today’s attendance</CardTitle><CardDescription>{attendanceSummary.date}</CardDescription></CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-3">
            <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><StatusBadge status="Present" /></div></div>
            <div><p className="text-sm text-muted-foreground">Time in</p><p className="mt-1 font-semibold">{attendanceSummary.timeIn}</p></div>
            <div><p className="text-sm text-muted-foreground">Time out</p><p className="mt-1 font-semibold">{attendanceSummary.timeOut}</p></div>
            <div className="sm:col-span-3"><p className="text-3xl font-bold">{attendanceSummary.attendanceRate}%</p><p className="text-sm text-muted-foreground">Attendance rate for the current school year</p></div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Attendance statistics</CardTitle><CardDescription>Recorded days this school year.</CardDescription></CardHeader>
          <CardContent>
            <ChartContainer config={attendanceChartConfig} className="h-56 w-full">
              <BarChart accessibilityLayer data={attendanceChartData} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="days" radius={6}>
                  {attendanceChartData.map((entry) => <Cell key={entry.label} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Recent attendance</CardTitle>
            <CardDescription>Attendance records for the selected month.</CardDescription>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium">
            Month
            <select value={month} onChange={(event) => setMonth(event.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
              <option>July 2026</option>
              <option>June 2026</option>
            </select>
          </label>
        </CardHeader>
        <CardContent>
          <AttendanceTable records={recentRecords} />
        </CardContent>
      </Card>
    </div>
  )
}

export function ProfilePage() {
  const fields = [
    ["Student ID", studentProfile.id], ["LRN", studentProfile.lrn], ["Email address", studentProfile.email],
    ["Grade level", studentProfile.gradeLevel], ["Section", studentProfile.section], ["Adviser", studentProfile.adviser],
    ["School year", studentProfile.schoolYear],
  ]
  const handleDownload = () => {
    if (!studentQrCode.imageUrl) return
    const link = document.createElement("a")
    link.href = studentQrCode.imageUrl
    link.download = `${studentProfile.id}-attendance-qr.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      <PageHeading title="My Profile" description="Your student information on file." />
      <div className="grid gap-6 lg:grid-cols-[1fr_15rem] lg:items-start">
      <Card>
        <CardHeader>
          <CardTitle>{studentProfile.firstName} {studentProfile.lastName}</CardTitle>
          <CardDescription>Verify these details with your school registrar if anything is incorrect.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
          {fields.map(([label, value]) => (
            <div key={label} className="space-y-1 border-b pb-3 sm:border-b-0 sm:pb-0">
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
      <Card className="lg:max-w-none">
        <CardHeader><CardTitle>Attendance QR code</CardTitle><CardDescription>Issued {studentQrCode.issuedAt} · Expires {studentQrCode.expiresAt}</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="mx-auto flex size-40 items-center justify-center rounded-xl border bg-muted/40">
            {studentQrCode.imageUrl ? <img src={studentQrCode.imageUrl} alt="Student attendance QR code" className="size-full rounded-xl object-contain p-3" /> : <div className="flex flex-col items-center gap-2 text-center text-muted-foreground"><QrCodeIcon className="size-14" /><p className="text-xs">QR code will appear here.</p></div>}
          </div>
          <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Attendance token</p><p className="mt-1 font-mono text-sm font-medium">{studentQrCode.token}</p></div>
          <Button className="w-full" disabled={!studentQrCode.imageUrl} onClick={handleDownload}><DownloadIcon /> Download QR code</Button>
          {!studentQrCode.imageUrl && <p className="text-center text-xs text-muted-foreground">Set <code>studentQrCode.imageUrl</code> to enable downloading.</p>}
        </CardContent>
      </Card>
      </div>
    </div>
  )
}

export function AttendanceStatisticsPage() {
  const todayStatus = attendanceSummary.status === "present" ? "Present" : attendanceSummary.status
  return (
    <div className="space-y-6">
      <PageHeading title="View Attendance" description="Your attendance status and school-year summary." />
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2 text-primary"><CalendarCheck2Icon className="size-5" /></div>
            <div><CardTitle>Today, {attendanceSummary.date}</CardTitle><CardDescription>Current attendance record</CardDescription></div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div><p className="text-sm text-muted-foreground">Status</p><div className="mt-1"><StatusBadge status={todayStatus} /></div></div>
          <div><p className="text-sm text-muted-foreground">Time in</p><p className="mt-1 font-semibold">{attendanceSummary.timeIn}</p></div>
          <div><p className="text-sm text-muted-foreground">Time out</p><p className="mt-1 font-semibold">{attendanceSummary.timeOut}</p></div>
        </CardContent>
      </Card>
      <div className="grid gap-4 sm:grid-cols-3">
        <MetricCard label="Present" value={attendanceSummary.presentDays} helper="Recorded days" />
        <MetricCard label="Late" value={attendanceSummary.lateDays} helper="Recorded days" />
        <MetricCard label="Absent" value={attendanceSummary.absentDays} helper="Recorded days" />
      </div>
    </div>
  )
}

export function AttendanceHistoryPage() {
  return (
    <div className="space-y-6">
      <PageHeading title="Attendance History" description="Your latest school attendance records." />
      <Card>
        <CardHeader>
          <CardTitle>Attendance records</CardTitle>
          <CardDescription>{attendanceHistory.length} records shown. Connect this table to your attendance-history API.</CardDescription>
        </CardHeader>
        <CardContent><AttendanceTable records={attendanceHistory} /></CardContent>
      </Card>
    </div>
  )
}

function AttendanceTable({ records }: { records: typeof attendanceHistory }) {
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Time in</TableHead><TableHead>Time out</TableHead><TableHead className="text-right">Status</TableHead></TableRow></TableHeader>
      <TableBody>
        {records.map((record) => <TableRow key={record.id}><TableCell className="font-medium">{record.date}</TableCell><TableCell>{record.timeIn}</TableCell><TableCell>{record.timeOut}</TableCell><TableCell className="text-right"><StatusBadge status={record.status} /></TableCell></TableRow>)}
      </TableBody>
    </Table>
  )
}

export function QRCodePage() {
  const handleDownload = () => {
    if (!studentQrCode.imageUrl) return
    const link = document.createElement("a")
    link.href = studentQrCode.imageUrl
    link.download = `${studentProfile.id}-attendance-qr.png`
    link.click()
  }

  return (
    <div className="space-y-6">
      <PageHeading title="My QR Code" description="Present this code to record your attendance." />
      <Card className="max-w-md">
        <CardHeader><CardTitle>Attendance QR code</CardTitle><CardDescription>Issued {studentQrCode.issuedAt} · Expires {studentQrCode.expiresAt}</CardDescription></CardHeader>
        <CardContent className="space-y-5">
          <div className="flex aspect-square items-center justify-center rounded-xl border bg-muted/40">
            {studentQrCode.imageUrl ? <img src={studentQrCode.imageUrl} alt="Student attendance QR code" className="size-full rounded-xl object-contain p-6" /> : <div className="flex flex-col items-center gap-3 text-center text-muted-foreground"><QrCodeIcon className="size-24" /><p className="max-w-56 text-sm">Your backend QR image will appear here.</p></div>}
          </div>
          <div className="rounded-lg bg-muted p-3"><p className="text-xs text-muted-foreground">Attendance token</p><p className="mt-1 font-mono text-sm font-medium">{studentQrCode.token}</p></div>
          <Button className="w-full" disabled={!studentQrCode.imageUrl} onClick={handleDownload}><DownloadIcon /> Download QR code</Button>
          {!studentQrCode.imageUrl && <p className="text-center text-xs text-muted-foreground">Set <code>studentQrCode.imageUrl</code> to enable downloading.</p>}
        </CardContent>
      </Card>
    </div>
  )
}
