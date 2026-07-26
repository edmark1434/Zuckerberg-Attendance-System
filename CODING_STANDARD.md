# Coding Standards

## TypeScript

Strict Mode

Avoid any.

Prefer interfaces.

---

## React

Functional Components

Hooks

Reusable Components

No class components.

---

## Database

Never access Supabase directly inside UI components.

Always use service files.

Example

student.service.ts

teacher.service.ts

attendance.service.ts

---

## Components

Keep components focused.

Extract reusable logic.

Extract reusable dialogs.

Extract reusable tables.

---

## Naming

Components

PascalCase

Files

kebab-case

Hooks

useSomething

Services

something.service.ts

Types

something.types.ts