# Authentication

Authentication is custom.

Passwords are always stored as hashes.

---

## Admin Login

Username

Email Address

Password

Created manually by the system.

---

## Teacher Login

Username

Email Address

Password

Teacher accounts are created by Admin.

---

## Student Login

Username

Student Number (recommended for university) or LRN (if your institution uses it)

Password

Birthdate (default password)

Example

Username

2024-000123

Password

2005-10-27

After first login:

- Force password change
- Student creates a personal password
- Birthdate is no longer accepted as the login password

---

## Login Flow

Admin

Email
↓

Password
↓

Dashboard

Teacher

Email
↓

Password
↓

Teacher Dashboard

Student

Student Number (or LRN)
↓

Birthdate
↓

First Login?

YES
↓

Change Password

↓

Student Dashboard

NO

↓

Student Dashboard