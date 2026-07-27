// src/services/teacherAuthService.ts
import { database } from "../../firebase"
import { ref, query, orderByChild, equalTo, get } from "firebase/database"

/**
 * Get complete teacher data with section and academic year
 */
export const getTeacherWithDetails = async (uid: string) => {
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
    const AuthUser: any = {
      uid: teacher.uid || "",
      email: teacher.email || "",
      role: "teacher",
      firstName: teacher.firstName || "",
      lastName: teacher.lastName || "",
      middleName: teacher.middleName || "",
      is_first_login: teacher.is_first_login || false,
      status: teacher.status || "Active",
      teacher_id: teacherId || "",
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
      
      AuthUser.sectionId = sectionId || ""
      AuthUser.sectionCode = section.code || ""
      AuthUser.academicYearId = section.academicYearId || ""
      AuthUser.sectionName = section.name || ""
      AuthUser.sectionYearLevel = section.yearLevel || ""

      // Get academic year data
      if (section.academicYearId) {
        const academicYearSnapshot = await get(
          ref(database, `academicYears/${section.academicYearId}`)
        )
        
        if (academicYearSnapshot.exists()) {
          const academicYear = academicYearSnapshot.val()
          AuthUser.academicYearName = academicYear.name || ""
        }
      }
    }

    return AuthUser
  } catch (error) {
    console.error("Error fetching teacher details:", error)
    return null
  }
}

/**
 * Handle auth errors and return user-friendly messages
 */
export const getAuthErrorMessage = (error: any): string => {
  if (!error || !error.code) {
    return error?.message || 'An unexpected error occurred'
  }
  
  switch (error.code) {
    case 'auth/user-not-found':
      return 'No account found with this email address'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/invalid-email':
      return 'Invalid email address format'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.'
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.'
    case 'auth/email-already-in-use':
      return 'This email is already registered.'
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.'
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.'
    default:
      return error.message || 'Invalid email or password'
  }
}