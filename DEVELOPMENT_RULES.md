# Development Rules

Always use shadcn/ui components.

Always use Tailwind CSS utilities.

Avoid custom CSS whenever possible.

Keep business logic inside services.

Keep UI components focused on rendering.

Use Supabase Realtime instead of polling.

Use PostgreSQL relationships instead of manual joins whenever possible.

Use Row Level Security.

Never expose admin functionality to teachers or students.

Keep files modular.

Create reusable dialogs, tables, cards, and forms.

Follow TypeScript strict mode.

Prefer composition over duplication.

When adding new features:

1. Create database table if needed.
2. Create TypeScript types.
3. Create service file.
4. Create reusable components.
5. Connect UI.
6. Add Realtime if necessary.
7. Test CRUD operations.