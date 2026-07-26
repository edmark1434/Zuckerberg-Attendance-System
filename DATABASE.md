# Database

## Tables

accounts

Authentication

admins

Admin profile

teachers

Teacher profile

students

Student profile

sections

University sections

student_sections

Student assignments

attendance_sessions

Attendance session

attendance

Attendance records

---

## Relationships

accounts

↓

admins

teachers

students

↓

student_sections

↓

sections

↓

attendance_sessions

↓

attendance

---

## Attendance Flow

Teacher

↓

Select Section

↓

Start Attendance

↓

Create Attendance Session

↓

Generate QR Code

↓

Students Scan

↓

Attendance Recorded

↓

Realtime Updates Teacher Dashboard

↓

End Attendance