import { useState } from "react"
import { AlertTriangleIcon, LoaderCircleIcon, CopyIcon, CheckIcon } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { auth, database } from "../../firebase"
import { ref, update } from "firebase/database"
import { updatePassword, signInWithEmailAndPassword } from "firebase/auth"

interface ResetPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userType: "student" | "teacher"
  name: string
  identifier: string
  userId?: string
  email?: string
  currentPassword?: string
  onReset: () => Promise<void>
}

export function ResetPasswordDialog({
  open,
  onOpenChange,
  userType,
  name,
  identifier,
  userId,
  email,
  currentPassword,
  onReset,
}: ResetPasswordDialogProps) {
  const [isResetting, setIsResetting] = useState(false)
  const [newPassword, setNewPassword] = useState("")
  const [copied, setCopied] = useState(false)

  const label = userType === "student" ? "Student number" : "Email"

  function generatePassword(length = 16) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*"
    const randomValues = new Uint32Array(length)
    crypto.getRandomValues(randomValues)
    return Array.from(randomValues)
      .map((x) => chars[x % chars.length])
      .join("")
  }

  const handleReset = async () => {
    if (!email) {
      toast.error("No email address found for this user")
      return
    }

    if (!currentPassword) {
      toast.error("Current password is required to reset")
      return
    }

    setIsResetting(true)

    try {
      const password = generatePassword(16)
      setNewPassword(password)

      // STEP 1: Sign in with current password
      const userCredential = await signInWithEmailAndPassword(auth, email, currentPassword)
      const user = userCredential.user

      // STEP 2: Update password in Firebase Auth
      await updatePassword(user, password)

      // STEP 3: Update password in Realtime Database
      if (userId) {
        const userRef = ref(database, `${userType}s/${userId}`)
        await update(userRef, {
          password: password,
          current_password: password, // Update both fields
          passwordResetAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      }

      toast.success("Password reset successfully")
      
      // Call the onReset callback
      await onReset()
      
      // Don't close the dialog automatically - let user close it after copying password
      // The user will close it manually after copying the password
      
    } catch (error: any) {
      console.error("Error resetting password:", error)
      
      if (error.code === 'auth/wrong-password') {
        toast.error("Current password is incorrect")
      } else if (error.code === 'auth/user-not-found') {
        toast.error("User not found")
      } else {
        toast.error(error.message || "Failed to reset password")
      }
      
      // Close dialog on error
      onOpenChange(false)
    } finally {
      setIsResetting(false)
    }
  }

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword)
      setCopied(true)
      toast.success("Password copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    setNewPassword("")
    setCopied(false)
    onOpenChange(false)
  }

  return (
    <Dialog 
      open={open} 
      onOpenChange={(nextOpen) => {
        // Only allow closing if not resetting, or if the user explicitly clicks close
        if (!isResetting && !newPassword) {
          handleClose()
        } else if (!nextOpen && newPassword) {
          // If password is generated and user tries to close, allow it
          handleClose()
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reset {userType} password</DialogTitle>
          <DialogDescription>
            This will generate a new strong password for the user.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 rounded-lg border bg-muted/30 p-4 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">
              {userType === "student" ? "Student" : "Teacher"}
            </p>
            <p className="font-medium">{name}</p>
          </div>
          
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="font-medium">{identifier}</p>
          </div>
        </div>

        {newPassword ? (
          <div className="space-y-3">
            <div className="flex gap-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-950">
              <AlertTriangleIcon className="mt-0.5 size-4 shrink-0 text-green-600" />
              <div className="flex-1">
                <p className="font-medium text-green-700">New password generated</p>
                <div className="mt-2 flex items-center gap-2">
                  <code className="flex-1 rounded bg-white px-3 py-2 font-mono text-sm border">
                    {newPassword}
                  </code>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-9 w-9 shrink-0"
                    onClick={handleCopyPassword}
                  >
                    {copied ? (
                      <CheckIcon className="h-4 w-4 text-green-600" />
                    ) : (
                      <CopyIcon className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {userType === "teacher" 
                    ? "The teacher must use this password to sign in." 
                    : "The student must use this password to sign in."}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950">
            <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
            <p>
              A new strong password will be generated for this {userType}.
            </p>
          </div>
        )}

        <DialogFooter>
          <Button 
            variant="outline" 
            disabled={isResetting} 
            onClick={handleClose}
          >
            {newPassword ? "Close" : "Cancel"}
          </Button>
          {!newPassword && (
            <Button 
              variant="destructive" 
              disabled={isResetting} 
              onClick={handleReset}
            >
              {isResetting && <LoaderCircleIcon className="animate-spin" />}
              Reset password
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}