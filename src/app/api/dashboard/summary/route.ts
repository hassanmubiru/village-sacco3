import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Get user's active memberships
    const { data: memberships, error: membershipError } = await supabase
      .from('sacco_memberships')
      .select(`
        *,
        sacco_groups!inner(id, name, current_members)
      `)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .eq('is_active', true);

    if (membershipError) {
      console.error('Error fetching memberships:', membershipError);
      return NextResponse.json(
        { error: 'Failed to fetch user memberships' },
        { status: 500 }
      );
    }

    // Get user's savings accounts and calculate total savings
    const { data: savingsAccounts, error: savingsError } = await supabase
      .from('savings_accounts')
      .select('balance, btc_balance, sacco_group_id')
      .eq('user_id', userId);

    if (savingsError) {
      console.error('Error fetching savings:', savingsError);
    }

    // Calculate total savings across all groups
    const totalSavings = savingsAccounts?.reduce((total, account) => total + (account.balance || 0), 0) || 0;

    // Get user's active loans
    const { data: loans, error: loansError } = await supabase
      .from('loans')
      .select('remaining_balance')
      .eq('borrower_id', userId)
      .eq('status', 'active');

    if (loansError) {
      console.error('Error fetching loans:', loansError);
    }

    const activeLoans = loans?.reduce((total, loan) => total + (loan.remaining_balance || 0), 0) || 0;

    // Get recent transactions (last 10)
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select(`
        id,
        type,
        amount,
        description,
        created_at,
        sacco_group_id
      `)
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

    // Calculate this month's contributions
    const currentMonth = new Date();
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    
    const thisMonthContributions = transactions?.filter(t => 
      new Date(t.created_at) >= startOfMonth && 
      (t.type === 'deposit' || t.type === 'contribution')
    ).reduce((total, t) => total + t.amount, 0) || 0;

    // Calculate total group members across all user's groups
    const totalGroupMembers = memberships?.reduce((total, membership) => {
      return total + (membership.sacco_groups?.current_members || 0);
    }, 0) || 0;

    // Format recent transactions
    const recentTransactions = transactions?.map(t => ({
      id: t.id,
      type: t.type,
      amount: t.amount,
      date: t.created_at,
      description: t.description || `${t.type.charAt(0).toUpperCase() + t.type.slice(1)} transaction`
    })) || [];

    const summary = {
      totalSavings,
      activeLoans,
      groupMembers: totalGroupMembers,
      thisMonthContributions,
      recentTransactions,
      userMemberships: memberships?.length || 0
    };

    return NextResponse.json({
      success: true,
      summary
    });

  } catch (error) {
    console.error('Error in dashboard summary API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
