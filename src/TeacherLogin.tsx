import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "sonner"

import TeacherLoginForm from "@/components/teacher-login-form"
import Navbar from "@/components/ui/navbar"
import { auth } from "../firebase"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useAuthContext } from "../src/context/useContext"
import { getTeacherWithDetails, getAuthErrorMessage } from "./services/teacherAuthService"

const TeacherLogin = () => {
  const navigate = useNavigate()
  const { setTeacher } = useAuthContext()
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (data: { teacherId: string; password: string }) => {
    setIsLoading(true)

    try {
      // Step 1: Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth, 
        data.teacherId, 
        data.password
      )

      const uid = userCredential.user.uid

      // Step 2: Get teacher data with details
      const AuthUser = await getTeacherWithDetails(uid)
      
      if (!AuthUser) {
        toast.error("Teacher profile not found")
        await auth.signOut()
        setIsLoading(false)
        return
      }

      // Step 3: Set user in context
      setTeacher(AuthUser)
      
      // Step 4: Show success message and navigate
      toast.success(`Welcome back, ${AuthUser.firstName}!`)
      navigate("/teacher/dashboard")
      
    } catch (error: any) {
      console.error("Login error:", error)
      toast.error(getAuthErrorMessage(error))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-white text-black scroll-smooth min-h-screen">
      <Navbar />
      <div className="flex min-h-[calc(100vh-4rem)] w-full items-center justify-center p-6 md:p-10">
        <div className="w-full max-w-sm">
          <TeacherLoginForm 
            onSubmit={handleSubmit} 
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  )
}

export default TeacherLogin