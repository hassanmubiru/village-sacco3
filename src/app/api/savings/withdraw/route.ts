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

    // Get personal savings record
    const { data: savings, error: savingsError } = await supabase
      .from('personal_savings')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .single();

    if (savingsError || !savings) {
      return NextResponse.json(
        { error: 'Savings account not found' },
        { status: 404 }
      );
    }

    // Check if user has sufficient balance
    if (savings.balance < amount) {
      return NextResponse.json(
        { error: `Insufficient balance. Available: UGX ${savings.balance.toLocaleString()}` },
        { status: 400 }
      );
    }

    // Create withdrawal transaction record
    const transactionReference = `withdrawal_${groupId}_${userId}_${Date.now()}`;
    
    const { data: transaction, error: transactionError } = await supabase
      .from('savings_transactions')
      .insert({
        user_id: userId,
        sacco_group_id: groupId,
        amount: amount,
        type: 'withdrawal',
        status: 'completed', // In real implementation, this might be 'pending' for approval
        description: description || `Savings withdrawal of UGX ${amount.toLocaleString()}`,
        reference: transactionReference
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

    // Update savings balance
    const { data: updatedSavings, error: updateError } = await supabase
      .from('personal_savings')
      .update({
        balance: savings.balance - amount
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
