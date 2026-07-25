import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    lrn: "",
    birthdate: ""
  })
  const [errors, setErrors] = useState<{
    lrn?: string;
    birthdate?: string;
  }>({})

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setFormData(prev => ({
      ...prev,
      [id]: value
    }))
    // Clear error when user starts typing
    if (errors[id as keyof typeof errors]) {
      setErrors(prev => ({
        ...prev,
        [id]: undefined
      }))
    }
  }

  const validateForm = () => {
    const newErrors: typeof errors = {}
    
    // Validate LRN
    if (!formData.lrn) {
      newErrors.lrn = "LRN is required"
    } else if (!/^[0-9]{12}$/.test(formData.lrn)) {
      newErrors.lrn = "LRN must be exactly 12 digits"
    }
    
    // Validate Birthdate
    if (!formData.birthdate) {
      newErrors.birthdate = "Birthdate is required"
    } else {
      const birthDate = new Date(formData.birthdate)
      const today = new Date()
      const age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      
      if (age < 5 || (age === 5 && monthDiff < 0)) {
        newErrors.birthdate = "Student must be at least 5 years old"
      }
      if (age > 65) {
        newErrors.birthdate = "Invalid birthdate"
      }
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsLoading(true)
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      console.log("Student Sign In Data:", {
        lrn: formData.lrn,
        birthdate: formData.birthdate,
        timestamp: new Date().toISOString()
      })
      
      // Here you would typically:
      // - Call your authentication API
      // - Store the session/token
      // - Redirect to dashboard
      navigate("/student/dashboard")
      alert("Sign in successful! Redirecting to dashboard...")
      
      // Reset form after successful submission (optional)
      // setFormData({ lrn: "", birthdate: "" })
      
    } catch (error) {
      console.error("Sign in error:", error)
      alert("Failed to sign in. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSignIn}>
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center">
                <h1 className="text-2xl font-bold">Student Attendance Portal</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to your student account
                </p>
              </div>

              {/* LRN - Learner Reference Number */}
              <Field>
                <FieldLabel htmlFor="lrn">LRN (Learner Reference Number)</FieldLabel>
                <Input
                  id="lrn"
                  type="text"
                  placeholder="123456789012"
                  required
                  pattern="[0-9]{12}"
                  maxLength={12}
                  value={formData.lrn}
                  onChange={handleInputChange}
                  className={errors.lrn ? "border-red-500" : ""}
                />
                {errors.lrn ? (
                  <FieldDescription className="text-xs text-red-500">
                    {errors.lrn}
                  </FieldDescription>
                ) : (
                  <FieldDescription className="text-xs text-muted-foreground">
                    12-digit number found on your school ID or report card
                  </FieldDescription>
                )}
              </Field>

              {/* Birthdate */}
              <Field>
                <FieldLabel htmlFor="birthdate">Birthdate</FieldLabel>
                <Input
                  id="birthdate"
                  type="date"
                  max={new Date().toISOString().split("T")[0]} // Prevent future dates
                  required
                  value={formData.birthdate}
                  onChange={handleInputChange}
                  className={errors.birthdate ? "border-red-500" : ""}
                />
                {errors.birthdate && (
                  <FieldDescription className="text-xs text-red-500">
                    {errors.birthdate}
                  </FieldDescription>
                )}
              </Field>

              {/* Submit Button */}
              <Field>
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Signing in...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </Field>
            </FieldGroup>
          </form>

          {/* Image Section - kept for visual balance */}
          <div className="relative hidden bg-muted md:block">
            <img
              src="https://scontent.fceb3-1.fna.fbcdn.net/v/t39.30808-6/358377925_734220205379535_7943184577678097036_n.jpg?stp=dst-jpg_tt6&cstp=mx547x456&ctp=s547x456&_nc_cat=101&ccb=1-7&_nc_sid=6ee11a&_nc_eui2=AeFcbSvVe-c6lEUb1eH1GU7SlsFBttW9KM2WwUG21b0ozag75fW8nI3OdegH_bO_z8Lkou8ZVZgO74AxFzueTVPa&_nc_ohc=0v-qAq_pvfcQ7kNvwEgTjtR&_nc_oc=AdoPVMalyXnEtl6qlSAdJv8ruHF8r1U-zk6pYEE8lfd3FBQ98YVyKOBaAHY5qvuuiDE&_nc_zt=23&_nc_ht=scontent.fceb3-1.fna&_nc_gid=HWlhxyOlAHwQaBmX5k97jQ&_nc_ss=7b2a8&oh=00_AQBN4QmyECZWMCwg4Ms3V3HdpR29gq9k5H1UaNYSSml91g&oe=6A59698F"
              alt="Student registration illustration"
              className="absolute inset-0 h-full w-full object-contain dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>

      <FieldDescription className="px-6 text-center">
        By signing in, you agree to our <a href="#">Terms of Service</a>{" "}
        and <a href="#">Privacy Policy</a>.
      </FieldDescription>
    </div>
  )
}