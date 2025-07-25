import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Deposit API received:', body);
    
    const { groupId, saccoGroupId, amount, userId } = body;
    
    // Accept either groupId or saccoGroupId (frontend compatibility)
    const actualGroupId = groupId || saccoGroupId;

    if (!actualGroupId || !amount || !userId) {
      console.log('Missing required fields:', { actualGroupId, amount, userId });
      return NextResponse.json(
        { error: 'Group ID, amount, and user ID are required' },
        { status: 400 }
      );
    }

    // Validate minimum deposit amount
    if (amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum deposit amount is UGX 1,000' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if user is a member of the group
    const { data: membership } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', actualGroupId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    if (!membership) {
      console.log('User not found or not approved in group:', { userId, actualGroupId });
      return NextResponse.json(
        { error: 'You must be an approved member to make deposits' },
        { status: 403 }
      );
    }

    // TODO: Integrate with Bitnob API for actual payment processing
    // For now, we'll simulate the deposit process
    
    // Create a mock Bitnob payment request
    const bitnobPayment = {
      id: `btn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount: amount,
      currency: 'UGX',
      status: 'pending',
      payment_url: `https://checkout.bitnob.com/pay/${Date.now()}`,
      reference: `sacco_${actualGroupId}_${userId}_${Date.now()}`,
      created_at: new Date().toISOString()
    };

    // Store the transaction in our database
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sacco_group_id: actualGroupId,
        type: 'deposit',
        amount: amount,
        status: 'pending',
        reference: bitnobPayment.reference,
        bitnob_payment_id: bitnobPayment.id,
        created_at: bitnobPayment.created_at
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      transaction,
      payment_url: bitnobPayment.payment_url,
      reference: bitnobPayment.reference,
      message: 'Deposit initiated. You will be redirected to complete payment.'
    });

  } catch (error) {
    console.error('Error in deposit API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Check deposit status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Transaction reference is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) {
      console.error('Error fetching transaction:', error);
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // TODO: Check actual status with Bitnob API
    // For now, we'll return the stored status
    
    return NextResponse.json({
      success: true,
      transaction
    });

  } catch (error) {
    console.error('Error in deposit status API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
