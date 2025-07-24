# Admin Dashboard Access Guide

## Current Status
The Village SACCO platform has admin functionality built-in, but you need to create an admin user first.

## Method 1: Using Setup Page (Recommended)

1. **Access the setup page:**
   - Navigate to `http://localhost:3000/setup/admin`
   - This page only works if no admin users exist yet

2. **Fill in the form:**
   - Email: Your admin email
   - Name: Your full name
   - Phone: Your phone number
   - Password: Minimum 6 characters
   - Setup Key: `village-sacco-setup-2024` (default)

3. **Submit and login:**
   - After successful creation, you'll be redirected to login
   - Login with your new admin credentials
   - Navigate to `/admin` to access the dashboard

## Method 2: Direct Database Update (Alternative)

1. **Register a normal user first:**
   - Go to `/signup` and create a regular account
   - Use your email and complete the registration

2. **Update user role in Supabase:**
   - Log into your Supabase dashboard
   - Go to Table Editor → `users` table
   - Find your user record (by email)
   - Change the `role` column from `'member'` to `'admin'` or `'super_admin'`
   - Save the changes

3. **Access admin dashboard:**
   - Navigate to `/admin` in your browser
   - You should now see the admin dashboard

## Method 3: API Call (Programmatic)

You can also create an admin user via API:

```bash
curl -X POST http://localhost:3000/api/setup/admin \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "Admin User",
    "phone": "+256700000000",
    "password": "admin123456",
    "setupKey": "village-sacco-setup-2024"
  }'
```

## Admin Dashboard Features

Once you have admin access, you can:

- View platform statistics (users, groups, transactions)
- Manage all users (activate/deactivate, approve KYC)
- Manage SACCO groups (approve/reject applications)
- View all transactions across the platform
- Approve member applications to join SACCO groups

## URLs:
- Admin Dashboard: `http://localhost:3000/admin`
- Regular Dashboard: `http://localhost:3000/dashboard`
- Login: `http://localhost:3000/login`
- Signup: `http://localhost:3000/signup`

## Security Notes:
- Admin access is protected by middleware
- Only users with 'admin' or 'super_admin' roles can access admin routes
- Non-admin users are redirected to the regular dashboard
