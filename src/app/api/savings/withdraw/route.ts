import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, groupId, amount, description } = await request.json();

    if (!userId || !groupId || !amount) {
      return NextResponse.json(
        { error: 'User ID, Group ID, and amount are required' },
        { status: 400 }
      );
    }

    if (amount <= 0) {
      return NextResponse.json(
        { error: 'Withdrawal amount must be greater than 0' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if user is an approved member
    const { data: membership } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be an approved member to withdraw savings' },
        { status: 403 }
      );
    }

    // Get savings account
    const { data: savingsAccount, error: savingsError } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .eq('account_type', 'group')
      .single();

    if (savingsError || !savingsAccount) {
      return NextResponse.json(
        { error: 'Savings account not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (savingsAccount.balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: UGX ${savingsAccount.balance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Create withdrawal transaction record
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sacco_group_id: groupId,
        type: 'withdrawal',
        amount: amount,
        currency: 'UGX',
        status: 'completed', // In real implementation, this might be 'pending' for approval
        description: description || `Savings withdrawal of UGX ${amount.toLocaleString()}`,
        payment_method: 'mobile_money' // Default payment method
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating withdrawal transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create withdrawal transaction' },
        { status: 500 }
      );
    }

    // Update savings account balance
    const newBalance = savingsAccount.balance - amount;
    const { data: updatedSavings, error: updateError } = await supabase
      .from('savings_accounts')
      .update({
        balance: newBalance,
        updated_at: new Date().toISOString()
      })
      .eq('id', savingsAccount.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating savings account:', updateError);
      return NextResponse.json(
        { error: 'Failed to update savings account' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      savings: updatedSavings,
      transaction,
      message: `Successfully withdrew UGX ${amount.toLocaleString()} from your savings!`
    });

  } catch (error) {
    console.error('Error in withdraw savings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
