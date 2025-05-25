# OjaChat Admin Section

This directory contains the admin interface for OjaChat. The admin section is completely separate from the main application and requires special authentication with admin privileges.

## Structure

```
src/app/admin/
├── layout.tsx           # Admin layout with navigation and auth check
├── login/
│   └── page.tsx        # Admin login page
├── dashboard/
│   └── page.tsx        # Admin dashboard with statistics
└── README.md           # This file
```

## Features

- Separate authentication system for admin users
- Role-based access control
- Protected admin routes
- Admin-specific layout and navigation
- Dashboard with key metrics

## Authentication

Admin authentication is handled separately from the main application:

1. Admin users must have a role of 'admin' in the `user_roles` table
2. The admin login page checks for admin privileges
3. Admin routes are protected by the `AdminLayout` component
4. Non-admin users are redirected to the admin login page

## Database Requirements

The following tables are required for the admin section:

1. `user_roles` table:
```sql
create table user_roles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  role text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, role)
);
```

2. `payments` table (for revenue tracking):
```sql
create table payments (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users not null,
  amount numeric not null,
  status text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);
```

## Adding New Admin Features

1. Create a new directory under `src/app/admin/` for your feature
2. Create a `page.tsx` file in the new directory
3. Add the route to `App.tsx`
4. Add a navigation link in `layout.tsx`

Example:
```typescript
// src/app/admin/users/page.tsx
export default function UsersPage() {
  // Your component code
}

// In App.tsx
<Route path="users" element={<UsersPage />} />

// In layout.tsx
<a href="/admin/users">Users</a>
```

## Security Considerations

1. Always check for admin role in protected routes
2. Use Row Level Security (RLS) policies in Supabase
3. Never expose admin API endpoints to non-admin users
4. Keep admin routes separate from main application routes
5. Use proper error handling and logging

## Development

To add new admin features:

1. Create new components in the appropriate directory
2. Add new routes to `App.tsx`
3. Update the navigation in `layout.tsx`
4. Add necessary database tables and RLS policies
5. Test thoroughly with both admin and non-admin users 