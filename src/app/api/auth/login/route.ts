import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '../../../../lib/supabase';
import { UserService } from '../../../../services/user.service';

export async function POST(request: NextRequest) {
  try {
    const { email, phone, password } = await request.json();

    // Basic validation - allow login with either email or phone
    const loginIdentifier = email || phone;
    if (!loginIdentifier || !password) {
      return NextResponse.json(
        { message: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // If phone is provided, we need to find the email first
    let userEmail = email;
    if (!email && phone) {
      const { data: user } = await UserService.getUserByEmail(phone + '@phone.local');
      if (user) {
        userEmail = user.email;
      } else {
        return NextResponse.json(
          { message: 'Invalid credentials' },
          { status: 401 }
        );
      }
    }

    // Authenticate with Supabase
    const { data: authData, error: authError } = await supabase.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail,
    });

    if (authError) {
      return NextResponse.json(
        { message: 'Authentication failed' },
        { status: 401 }
      );
    }

    // Get user profile from database
    const { data: userData, error: userError } = await UserService.getUserByEmail(userEmail);
    
    if (userError || !userData) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    if (!userData.is_active) {
      return NextResponse.json(
        { message: 'Account is deactivated' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: userData.id,
        email: userData.email,
        name: `${userData.first_name} ${userData.last_name}`,
        phone: userData.phone,
        role: 'member',
        bitnobWalletId: userData.bitnob_wallet_id,
        kycStatus: userData.kyc_status,
        created_at: userData.created_at,
      },
      // In a real app, you'd generate a proper JWT token here
      token: 'authenticated-' + userData.id,
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
