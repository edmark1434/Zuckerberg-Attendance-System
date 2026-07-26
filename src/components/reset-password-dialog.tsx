import { useState } from "react"
import { AlertTriangleIcon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export function ResetPasswordDialog({ open, onOpenChange, userType, name, identifier, onReset }: { open: boolean; onOpenChange: (open: boolean) => void; userType: "student" | "teacher"; name: string; identifier: string; onReset: () => Promise<void> }) {
  const [isResetting, setIsResetting] = useState(false)
  const label = userType === "student" ? "Student number" : "Email"
  const defaultPassword = userType === "student" ? "their birthdate" : "Temp@12345"
  const submit = async () => { setIsResetting(true); try { await onReset(); onOpenChange(false) } finally { setIsResetting(false) } }
  return <Dialog open={open} onOpenChange={(nextOpen) => !isResetting && onOpenChange(nextOpen)}><DialogContent><DialogHeader><DialogTitle>Reset {userType} password?</DialogTitle><DialogDescription>This action changes the account password immediately in the mock directory.</DialogDescription></DialogHeader><div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm"><div><p className="text-xs text-muted-foreground">{userType === "student" ? "Student" : "Teacher"}</p><p className="font-medium">{name}</p></div><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{identifier}</p></div></div><div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><AlertTriangleIcon className="mt-0.5 size-4 shrink-0" /><p>The password will be reset to <strong>{defaultPassword}</strong>. {userType === "teacher" && "The teacher must change it after signing in."}</p></div><DialogFooter><Button variant="outline" disabled={isResetting} onClick={() => onOpenChange(false)}>Cancel</Button><Button variant="destructive" disabled={isResetting} onClick={submit}>{isResetting && <LoaderCircleIcon className="animate-spin" />}Reset password</Button></DialogFooter></DialogContent></Dialog>
}
