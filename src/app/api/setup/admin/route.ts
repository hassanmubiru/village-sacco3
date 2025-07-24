import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';

/**
 * Setup endpoint to create the first admin user
 * This should only be used during initial setup
 * 
 * POST /api/setup/admin
 * Body: { email, name, phone, password, setupKey }
 */
export async function POST(request: NextRequest) {
  try {
    const { email, name, phone, password, setupKey } = await request.json();

    // Basic security check - you should set this in your environment
    const expectedSetupKey = process.env.ADMIN_SETUP_KEY || 'village-sacco-setup-2024';
    
    if (setupKey !== expectedSetupKey) {
      return NextResponse.json(
        { message: 'Invalid setup key' },
        { status: 403 }
      );
    }

    // Basic validation
    if (!email || !name || !phone || !password) {
      return NextResponse.json(
        { message: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { message: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Check if any admin users already exist
    const { data: existingAdmins, error: checkError } = await supabase
      .from('users')
      .select('id')
      .in('role', ['admin', 'super_admin'])
      .limit(1);

    if (checkError) {
      console.error('Error checking existing admins:', checkError);
      return NextResponse.json(
        { message: 'Database error' },
        { status: 500 }
      );
    }

    if (existingAdmins && existingAdmins.length > 0) {
      return NextResponse.json(
        { message: 'Admin user already exists. Use the regular registration process.' },
        { status: 400 }
      );
    }

    const [firstName, ...lastNameParts] = name.split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return NextResponse.json(
        { message: 'Failed to create user account: ' + authError.message },
        { status: 400 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { message: 'User creation failed - no user data returned' },
        { status: 400 }
      );
    }

    // Create user profile with super_admin role
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        role: 'super_admin', // First admin gets super_admin role
        kyc_status: 'approved',
        is_active: true,
      })
      .select()
      .single();

    if (userError) {
      // Clean up auth user if profile creation fails
      await supabase.auth.admin.deleteUser(authData.user.id);
      console.error('Profile creation error:', userError);
      return NextResponse.json(
        { message: 'Failed to create user profile: ' + userError.message },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully! You can now login and access the admin dashboard.',
      user: {
        id: user.id,
        email: user.email,
        name: `${user.first_name} ${user.last_name}`,
        role: user.role,
        created_at: user.created_at,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Admin setup error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
