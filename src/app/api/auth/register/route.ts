import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { UserService } from '../../../../services/user.service';
import { bitnobService } from '../../../../services/bitnob.service';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, password } = await request.json();

    // Basic validation
    if (!name || !email || !phone || !password) {
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

    try {
      // Create Bitcoin wallet with Bitnob
      const bitnobWallet = await bitnobService.createWallet({
        email: email,
        firstName,
        lastName,
        phoneNumber: phone,
      });

      // Create user profile in database
      const { data: user, error: userError } = await UserService.createUser({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        bitnob_wallet_id: bitnobWallet.id,
        kyc_status: 'not_started',
        is_active: true,
      });

      if (userError) {
        // Clean up auth user if profile creation fails
        await supabase.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { message: 'Failed to create user profile: ' + userError },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful',
        user: {
          id: user!.id,
          email: user!.email,
          name: `${user!.first_name} ${user!.last_name}`,
          phone: user!.phone,
          role: 'member',
          bitnobWalletId: user!.bitnob_wallet_id,
          kycStatus: user!.kyc_status,
          created_at: user!.created_at,
        },
      }, { status: 201 });

    } catch (bitnobError) {
      // If Bitnob wallet creation fails, still create user but without wallet
      console.error('Bitnob wallet creation failed:', bitnobError);
      
      const { data: user, error: userError } = await UserService.createUser({
        id: authData.user.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone,
        kyc_status: 'not_started',
        is_active: true,
      });

      if (userError) {
        await supabase.auth.admin.deleteUser(authData.user.id);
        return NextResponse.json(
          { message: 'Failed to create user profile: ' + userError },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Registration successful (Bitcoin wallet will be created later)',
        user: {
          id: user!.id,
          email: user!.email,
          name: `${user!.first_name} ${user!.last_name}`,
          phone: user!.phone,
          role: 'member',
          bitnobWalletId: null,
          kycStatus: user!.kyc_status,
          created_at: user!.created_at,
        },
      }, { status: 201 });
    }

  } catch (error) {
    console.error('Registration error:', error);
    
    // Handle specific network timeout errors
    if (error instanceof TypeError && error.message === 'fetch failed') {
      return NextResponse.json(
        { message: 'Network connection timeout. Please check your internet connection and try again.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
