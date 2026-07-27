// src/TeacherDashboard.tsx
import { useEffect, useState } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { toast } from "sonner"

import { TeacherAppSidebar } from "@/components/teacher-app-sidebar"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import { BellRingIcon } from "lucide-react"
import { useAuthContext } from "@/context/useContext"
import { auth, database } from "../firebase"
import { ref, query, orderByChild, equalTo, get } from "firebase/database"

const names: Record<string, string> = {
  "/teacher/dashboard": "Dashboard", 
  "/teacher/attendance": "Attendance Management", 
  "/teacher/attendance/scanner": "QR Scanner", 
  "/teacher/students": "Students",
}

export default function TeacherDashboard() {
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { teacher, setTeacher } = useAuthContext()
  const [isLoading, setIsLoading] = useState(true)
  const [authChecked, setAuthChecked] = useState(false) // ✅ Added this

  // Function to get teacher data with details (same as login)
  const getTeacherWithDetails = async (uid: string) => {
    try {
      // Get teacher data from database
      const usersQuery = query(
        ref(database, "teachers"),
        orderByChild("uid"),
        equalTo(uid)
      )
      
      const snapshot = await get(usersQuery)
      
      if (!snapshot.exists()) {
        return null
      }

      const teacherData = snapshot.val()
      const teacherId = Object.keys(teacherData)[0]
      const teacher = teacherData[teacherId]

      // Build AuthUser object
      const AuthUser = {
        ...teacher,
        id: teacherId,
      }

      // Get section data
      const sectionQuery = query(
        ref(database, "sections"),
        orderByChild("teacherId"),
        equalTo(teacherId)
      )
      
      const sectionSnapshot = await get(sectionQuery)
      
      if (sectionSnapshot.exists()) {
        const sectionData = sectionSnapshot.val()
        const sectionId = Object.keys(sectionData)[0]
        const section = sectionData[sectionId]
        
        AuthUser.sectionId = sectionId
        AuthUser.sectionCode = section.code
        AuthUser.academicYearId = section.academicYearId
        AuthUser.sectionName = section.name
        AuthUser.sectionYearLevel = section.yearLevel

        // Get academic year data
        if (section.academicYearId) {
          const academicYearSnapshot = await get(
            ref(database, `academicYears/${section.academicYearId}`)
          )
          
          if (academicYearSnapshot.exists()) {
            const academicYear = academicYearSnapshot.val()
            AuthUser.academicYearName = academicYear.name
          }
        }
      }

      return AuthUser
    } catch (error) {
      console.error("Error fetching teacher details:", error)
      return null
    }
  }

  // Check authentication using onAuthStateChanged
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (currentUser) => {
      console.log("Auth state changed:", currentUser?.uid)
      
      if (!currentUser) {
        // No user logged in
        setTeacher(null)
        setIsLoading(false)
        setAuthChecked(true) // ✅ Mark auth as checked
        navigate("/")
        return
      }

      try {
        // User is logged in, get their data
        const userData = await getTeacherWithDetails(currentUser.uid)
        
        if (!userData) {
          // User not found in database
          toast.error("Teacher profile not found")
          await auth.signOut()
          setTeacher(null)
          setIsLoading(false)
          setAuthChecked(true) // ✅ Mark auth as checked
          navigate("/")
          return
        }

        // Check if the teacher in context matches the logged in user
        if (!teacher || teacher.uid !== currentUser.uid) {
          // Update context with the teacher data
          setTeacher(userData)
        }

        setIsLoading(false)
        setAuthChecked(true) // ✅ Mark auth as checked
        
      } catch (error) {
        console.error("Auth check error:", error)
        toast.error("Authentication error")
        setIsLoading(false)
        setAuthChecked(true) // ✅ Mark auth as checked
        navigate("/")
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [navigate, setTeacher, teacher])

  // ✅ Check auth state and redirect if not authenticated
  useEffect(() => {
    if (authChecked && !teacher) {
      navigate("/")
    }
  }, [authChecked, teacher, navigate])

  // If loading, show loading state
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  // If no teacher, redirect (should be handled by useEffect)
  if (!teacher) {
    return null
  }

  return (
    <SidebarProvider>
      <TeacherAppSidebar teacher={teacher} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-4" />
          <div>
            <p className="text-xs text-muted-foreground">Teacher Portal</p>
            <p className="text-sm font-medium">{names[pathname] ?? "Teacher Portal"}</p>
          </div>
        </header>
        <div className="flex items-center gap-3 border-b bg-amber-50 px-4 py-2 text-sm text-amber-900 dark:bg-amber-950/40 dark:text-amber-100">
          <BellRingIcon className="size-4 shrink-0" />
          <span>
            <strong>Attendance reminder:</strong> 5 students still need their attendance status updated for today.
          </span>
        </div>
        <main className="flex flex-1 flex-col p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}