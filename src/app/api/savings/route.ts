import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Get user's savings account and transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');

    if (!userId || !groupId) {
      return NextResponse.json(
        { error: 'User ID and Group ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get or create savings account for this user and group
    let { data: savingsAccount, error: savingsError } = await supabase
      .from('savings_accounts')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .eq('account_type', 'group')
      .single();

    if (savingsError && savingsError.code === 'PGRST116') {
      // Create new savings account if it doesn't exist
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
    } else if (savingsError) {
      console.error('Error fetching savings account:', savingsError);
      return NextResponse.json(
        { error: 'Failed to fetch savings account' },
        { status: 500 }
      );
    }

    // Get user's membership details for total contributions
    const { data: membership, error: membershipError } = await supabase
      .from('sacco_memberships')
      .select('total_contributions, last_contribution_date')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .single();

    // Get savings transactions (deposits, withdrawals, interest)
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .in('type', ['deposit', 'withdrawal', 'interest'])
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    // Build savings object with unified structure
    const savings = {
      id: savingsAccount.id,
      user_id: savingsAccount.user_id,
      sacco_group_id: savingsAccount.sacco_group_id,
      balance: savingsAccount.balance,
      btc_balance: savingsAccount.btc_balance,
      interest_rate: savingsAccount.interest_rate,
      total_contributions: membership?.total_contributions || 0,
      last_contribution_date: membership?.last_contribution_date,
      interest_earned: 0, // TODO: Calculate from interest transactions
      created_at: savingsAccount.created_at,
      updated_at: savingsAccount.updated_at
    };

    return NextResponse.json({
      success: true,
      savings,
      transactions: transactions || []
    });

  } catch (error) {
    console.error('Error in savings GET API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
