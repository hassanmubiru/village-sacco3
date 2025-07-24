import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET - Get user's personal savings and transactions
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

    // Get or create personal savings record
    let { data: savings, error: savingsError } = await supabase
      .from('personal_savings')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .single();

    if (savingsError && savingsError.code === 'PGRST116') {
      // Create new savings record if it doesn't exist
      const { data: newSavings, error: createError } = await supabase
        .from('personal_savings')
        .insert({
          user_id: userId,
          sacco_group_id: groupId,
          balance: 0,
          total_contributions: 0,
          interest_earned: 0
        })
        .select()
        .single();

      if (createError) {
        console.error('Error creating savings record:', createError);
        return NextResponse.json(
          { error: 'Failed to create savings record' },
          { status: 500 }
        );
      }
      savings = newSavings;
    } else if (savingsError) {
      console.error('Error fetching savings:', savingsError);
      return NextResponse.json(
        { error: 'Failed to fetch savings' },
        { status: 500 }
      );
    }

    // Get savings transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('savings_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    }

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
