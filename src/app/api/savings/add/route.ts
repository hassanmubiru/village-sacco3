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

    // Get or create personal savings record
    let { data: savings, error: savingsError } = await supabase
      .from('personal_savings')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .single();

    if (savingsError && savingsError.code === 'PGRST116') {
      // Create new savings record
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
    }

    // Create transaction record
    const transactionReference = `savings_${groupId}_${userId}_${Date.now()}`;
    
    const { data: transaction, error: transactionError } = await supabase
      .from('savings_transactions')
      .insert({
        user_id: userId,
        sacco_group_id: groupId,
        amount: amount,
        type: 'deposit',
        status: 'completed', // In real implementation, this would be 'pending' until payment is confirmed
        description: description || `Savings deposit of UGX ${amount.toLocaleString()}`,
        reference: transactionReference
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

    // Update savings balance and total contributions
    const { data: updatedSavings, error: updateError } = await supabase
      .from('personal_savings')
      .update({
        balance: savings.balance + amount,
        total_contributions: savings.total_contributions + amount,
        last_contribution_date: new Date().toISOString()
      })
      .eq('id', savings.id)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating savings:', updateError);
      return NextResponse.json(
        { error: 'Failed to update savings' },
        { status: 500 }
      );
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
