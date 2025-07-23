# Admin Dashboard Setup Guide

## Overview
The admin dashboard has been successfully added to the Village SACCO platform. This feature allows administrators to manage users, SACCO groups, transactions, and system-wide operations.

## Features Added

### 1. Database Schema Updates
- Added `role` field to users table with values: `member`, `admin`, `super_admin`
- Added RLS policies for admin access to all tables
- Created appropriate indexes for performance

### 2. Admin Redux Slice
- Complete state management for admin operations
- Async thunks for all admin actions:
  - `fetchAdminStats` - Get system statistics
  - `fetchAllUsers` - Get all users with admin privileges
  - `fetchAllSaccoGroups` - Get all SACCO groups
  - `fetchAllTransactions` - Get all transactions
  - `updateUserStatus` - Activate/deactivate users
  - `updateSaccoGroupStatus` - Activate/deactivate SACCO groups
  - `approveKyc` - Approve or reject KYC requests

### 3. Admin Dashboard Page
- Located at `/admin` route
- Four main sections:
  - **Overview**: System statistics and metrics
  - **Users**: User management with KYC approval
  - **SACCO Groups**: Group management and monitoring
  - **Transactions**: Transaction monitoring
- Role-based access control
- Responsive design with Tailwind CSS

### 4. Admin API Routes
- `/api/admin` endpoint with GET and POST methods
- Server-side role verification
- Actions supported:
  - GET: `stats`, `users`, `groups`, `transactions`
  - POST: `update_user`, `update_group`, `approve_kyc`

### 5. Enhanced Security
- Updated middleware for admin route protection
- Server-side authentication checks
- Role-based authorization

### 6. Navigation Updates
- Admin link appears in navbar for admin/super_admin users
- Distinguishable styling for admin navigation

## Setup Instructions

### 1. Database Setup
Run the updated SQL migration in your Supabase SQL editor:
```sql
-- The schema has already been updated in the migration file
-- Run the entire 001_initial_schema.sql file
```

### 2. Create First Admin User
To create your first admin user, you'll need to manually update the database:

```sql
-- After a user registers normally, update their role
UPDATE public.users 
SET role = 'super_admin' 
WHERE email = 'your-admin-email@example.com';
```

### 3. Environment Variables
Ensure these environment variables are set in your `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Usage

### 1. Access Admin Dashboard
- Login with an admin account
- Navigate to `/admin` or click the "Admin" button in the navbar
- Only users with `admin` or `super_admin` roles can access

### 2. Admin Functions

#### User Management
- View all registered users
- Activate/deactivate user accounts
- Approve or reject KYC requests
- Monitor user registration trends

#### SACCO Group Management
- View all SACCO groups
- Activate/deactivate groups
- Monitor group membership and contributions
- Track group performance

#### Transaction Monitoring
- View recent transactions across all users
- Monitor transaction volumes and patterns
- Track payment methods and success rates

#### System Overview
- Total users and active users
- Total SACCO groups and active groups
- Transaction volume and counts
- Pending KYC requests requiring attention

## Security Features

### Role-Based Access Control
- `member`: Regular users with dashboard access
- `admin`: Can access admin dashboard and manage users/groups
- `super_admin`: Full system access (future expansion)

### Server-Side Protection
- Middleware checks for admin routes
- API endpoint authentication
- Database RLS policies prevent unauthorized access

## File Structure
```
src/
├── app/
│   ├── (dashboard)/
│   │   └── admin/
│   │       └── page.tsx          # Admin dashboard UI
│   └── api/
│       └── admin/
│           └── route.ts           # Admin API endpoints
├── store/
│   └── slices/
│       └── adminSlice.ts          # Admin state management
├── components/
│   └── layout/
│       └── Navbar.tsx             # Updated with admin nav
└── middleware.ts                  # Route protection
```

## Next Steps

1. **Test the Admin Dashboard**:
   - Create a test user account
   - Manually promote them to admin in the database
   - Login and test all admin functions

2. **Create Sample Data**:
   - Register a few test users
   - Create some SACCO groups
   - Generate test transactions

3. **Customize Styling**:
   - Adjust colors and layouts to match your brand
   - Add company logos and branding elements

4. **Additional Features** (Future):
   - Export data functionality
   - Advanced reporting and analytics
   - Email notifications for admin actions
   - Audit logging for admin activities

## Troubleshooting

### Common Issues
1. **Access Denied**: Ensure user role is set to 'admin' or 'super_admin' in database
2. **Middleware Errors**: Check Supabase environment variables
3. **API Errors**: Verify database policies and user permissions

### Testing Admin Access
```sql
-- Check user role
SELECT id, email, role FROM public.users WHERE email = 'your-email@example.com';

-- Update user role if needed
UPDATE public.users SET role = 'admin' WHERE email = 'your-email@example.com';
```

The admin dashboard is now fully functional and ready for use!
