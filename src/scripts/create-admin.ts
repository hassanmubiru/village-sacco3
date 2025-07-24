/**
 * Admin User Setup Script
 * Run this script to create the first admin user for your Village SACCO platform
 * 
 * Usage:
 * 1. Start your development server (npm run dev)
 * 2. Create a regular user account first via /signup
 * 3. Run this script with the user's email to promote them to admin
 */

import { createServerSupabaseClient } from '../lib/supabase';

interface CreateAdminUserParams {
  email: string;
  name: string;
  phone: string;
  password: string;
  role?: 'admin' | 'super_admin';
}

export async function createAdminUser(params: CreateAdminUserParams) {
  const supabase = createServerSupabaseClient();
  const { email, name, phone, password, role = 'admin' } = params;
  
  try {
    // Split name
    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      throw new Error(`Auth creation failed: ${authError.message}`);
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user data returned');
    }

    // Create user profile with admin role
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role, // This will be 'admin' or 'super_admin'
        kyc_status: 'approved', // Admin users can be pre-approved
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw new Error(`Profile creation failed: ${userError.message}`);
    }

    console.log('✅ Admin user created successfully:', {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`,
      role: user.role,
    });

    return user;
  } catch (error) {
    console.error('❌ Failed to create admin user:', error);
    throw error;
  }
}

export async function promoteUserToAdmin(email: string, role: 'admin' | 'super_admin' = 'admin') {
  const supabase = createServerSupabaseClient();
  
  try {
    // Find user by email
    const { data: user, error: findError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (findError || !user) {
      throw new Error(`User not found with email: ${email}`);
    }

    // Update user role
    const { data: updatedUser, error: updateError } = await supabase
      .from('users')
      .update({ role })
      .eq('id', user.id)
      .select()
      .single();

    if (updateError) {
      throw new Error(`Failed to update user role: ${updateError.message}`);
    }

    console.log('✅ User promoted to admin successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      name: `${updatedUser.first_name} ${updatedUser.last_name}`,
      role: updatedUser.role,
    });

    return updatedUser;
  } catch (error) {
    console.error('❌ Failed to promote user to admin:', error);
    throw error;
  }
}

// Example usage (uncomment and run):
/*
// Method 1: Create new admin user
createAdminUser({
  email: 'admin@villagesacco.com',
  name: 'Admin User',
  phone: '+256700000000',
  password: 'admin123456',
  role: 'super_admin'
});

// Method 2: Promote existing user
promoteUserToAdmin('your-email@example.com', 'admin');
*/
