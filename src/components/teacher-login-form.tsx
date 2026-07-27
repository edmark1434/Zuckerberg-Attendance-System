import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { toast } from "sonner"

interface TeacherLoginFormProps extends Omit<React.ComponentProps<"div">, "onSubmit"> {
  onSubmit?: (data: { teacherId: string; password: string }) => Promise<void>
  isLoading?: boolean
}

export default function TeacherLoginForm({
  className,
  onSubmit,
  isLoading: externalLoading,
  ...props
}: TeacherLoginFormProps) {
  const [teacherId, setTeacherId] = useState("")
  const [password, setPassword] = useState("")
  const [internalLoading, setInternalLoading] = useState(false)
  const [errors, setErrors] = useState<{ teacherId?: string; password?: string }>({})

  const isLoading = externalLoading !== undefined ? externalLoading : internalLoading

  const validate = (): boolean => {
    const newErrors: { teacherId?: string; password?: string } = {}

    if (!teacherId.trim()) {
      newErrors.teacherId = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teacherId)) {
      newErrors.teacherId = "Please enter a valid email address"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Clear previous errors
    setErrors({})

    // Validate form
    if (!validate()) {
      toast.error("Please fix the errors before continuing")
      return
    }

    if (!onSubmit) {
      toast.error("Login handler not configured")
      return
    }

    // Set loading state
    if (externalLoading === undefined) {
      setInternalLoading(true)
    }

    try {
      await onSubmit({ teacherId, password })
      // Success is handled by parent component
    } catch (error: any) {
      console.error("Login error:", error)
      // Error is already handled by parent, but we catch to reset loading
    } finally {
      if (externalLoading === undefined) {
        setInternalLoading(false)
      }
    }
  }

  const clearError = (field: "teacherId" | "password") => {
    setErrors((prev) => ({ ...prev, [field]: undefined }))
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-primary"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
          <CardTitle className="text-2xl">Teacher Login</CardTitle>
          <CardDescription>
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} noValidate>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="teacher@school.edu"
                  value={teacherId}
                  onChange={(e) => {
                    setTeacherId(e.target.value)
                    if (errors.teacherId) clearError("teacherId")
                  }}
                  required
                  disabled={isLoading}
                  aria-invalid={!!errors.teacherId}
                  className={errors.teacherId ? "border-destructive" : ""}
                />
                {errors.teacherId && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.teacherId}
                  </p>
                )}
              </Field>

              <Field>
                <div className="flex items-center justify-between">
                  <FieldLabel htmlFor="password">Password</FieldLabel>
                  <a
                    href="#"
                    className="text-sm text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                    onClick={(e) => {
                      e.preventDefault()
                      toast.info("Password reset link will be sent to your email")
                    }}
                  >
                    Forgot password?
                  </a>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value)
                    if (errors.password) clearError("password")
                  }}
                  required
                  disabled={isLoading}
                  aria-invalid={!!errors.password}
                  className={errors.password ? "border-destructive" : ""}
                />
                {errors.password && (
                  <p className="text-sm text-destructive mt-1">
                    {errors.password}
                  </p>
                )}
              </Field>

              <Field className="space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Teacher Portal
                    </span>
                  </div>
                </div>

                <p className="text-center text-xs text-muted-foreground">
                  By continuing, you agree to our Terms of Service and Privacy Policy.
                </p>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}