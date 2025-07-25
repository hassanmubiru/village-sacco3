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

    if (amount < 1000) {
      return NextResponse.json(
        { error: 'Minimum savings amount is UGX 1,000' },
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
        { error: 'You must be an approved member to add savings' },
        { status: 403 }
      );
    }

    // Get or create savings account for this user and group
    let { data: savingsAccount, error: savingsError } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .eq('account_type', 'group')
      .single();

    if (savingsError && savingsError.code === 'PGRST116') {
      // Create new savings account
      const { data: newAccount, error: createError } = await supabase
        .from('savings_accounts')
        .insert({
          user_id: userId,
          sacco_group_id: groupId,
          account_type: 'group',
          balance: 0,
          btc_balance: 0,
          interest_rate: 2.5 // Default interest rate
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating savings account:', createError);
        return NextResponse.json(
          { error: 'Failed to create savings account' },
          { status: 500 }
        );
      }
      savingsAccount = newAccount;
    }

    // Create transaction record in the transactions table
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        sacco_group_id: groupId,
        type: 'deposit',
        amount: amount,
        currency: 'UGX',
        status: 'completed', // In real implementation, this would be 'pending' until payment is confirmed
        description: description || `Savings deposit of UGX ${amount.toLocaleString()}`,
        payment_method: 'mobile_money' // Default payment method
      })
      .select()
      .single();

    if (transactionError) {
      console.error('Error creating transaction:', transactionError);
      return NextResponse.json(
        { error: 'Failed to create transaction' },
        { status: 500 }
      );
    }

    // Update savings account balance
    const newBalance = savingsAccount.balance + amount;
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

    // Update membership total contributions
    const { error: membershipUpdateError } = await supabase
      .from('sacco_memberships')
      .update({
        total_contributions: membership.total_contributions + amount,
        last_contribution_date: new Date().toISOString()
      })
      .eq('id', membership.id);

    if (membershipUpdateError) {
      console.error('Error updating membership:', membershipUpdateError);
      // Don't fail the request if membership update fails
    }

    return NextResponse.json({
      success: true,
      savings: updatedSavings,
      transaction,
      message: `Successfully added UGX ${amount.toLocaleString()} to your savings!`
    });

  } catch (error) {
    console.error('Error in add savings API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
