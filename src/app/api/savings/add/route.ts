import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, groupId, amount, description } = await request.json();

    console.log('Add Savings Request:', { userId, groupId, amount, description });

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

    // First check if the SACCO group exists
    const { data: group, error: groupError } = await supabase
      .from('sacco_groups')
      .select('*')
      .eq('id', groupId)
      .single();

    if (groupError || !group) {
      console.error('SACCO group not found:', groupError);
      return NextResponse.json(
        { error: 'SACCO group not found' },
        { status: 404 }
      );
    }

    // Check if user is a member (any status)
    const { data: membership, error: membershipError } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', groupId)
      .eq('user_id', userId)
      .single();

    console.log('Membership check:', { membership, membershipError });

    if (membershipError || !membership) {
      return NextResponse.json(
        { error: 'You must be a member of this SACCO group to add savings. Please join the group first.' },
        { status: 403 }
      );
    }

    // Check if membership is approved
    if (membership.status !== 'approved') {
      return NextResponse.json(
        { 
          error: `Your membership is ${membership.status}. Only approved members can add savings.`,
          membershipStatus: membership.status 
        },
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
      console.log('Creating new savings account for user:', userId);
      const { data: newAccount, error: createError } = await supabase
        .from('savings_accounts')
        .insert({
          user_id: userId,
          sacco_group_id: groupId,
          account_type: 'group',
          balance: 0,
          btc_balance: 0,
          interest_rate: group.interest_rate || 2.5
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
    } else if (savingsError) {
      console.error('Error fetching savings account:', savingsError);
      return NextResponse.json(
        { error: 'Failed to access savings account' },
        { status: 500 }
      );
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
        total_contributions: (membership.total_contributions || 0) + amount,
        last_contribution_date: new Date().toISOString()
      })
      .eq('id', membership.id);

    if (membershipUpdateError) {
      console.error('Error updating membership:', membershipUpdateError);
      // Don't fail the request if membership update fails
    }

    console.log('Savings added successfully:', { 
      newBalance, 
      transactionId: transaction.id,
      totalContributions: (membership.total_contributions || 0) + amount
    });

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
