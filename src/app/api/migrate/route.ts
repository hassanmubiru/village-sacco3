import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    
    // Apply membership status columns
    const { error: membershipError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE sacco_memberships 
        ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'pending',
        ADD COLUMN IF NOT EXISTS applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE,
        ADD COLUMN IF NOT EXISTS user_name TEXT,
        ADD COLUMN IF NOT EXISTS user_email TEXT;
      `
    });

    if (membershipError && !membershipError.message?.includes('already exists')) {
      console.error('Membership migration error:', membershipError);
    }

    // Create virtual_cards table
    const { error: virtualCardsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS virtual_cards (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
            card_number TEXT NOT NULL,
            card_holder_name TEXT NOT NULL,
            expiry_month INTEGER NOT NULL,
            expiry_year INTEGER NOT NULL,
            cvv TEXT NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            balance DECIMAL(15,2) DEFAULT 0,
            spending_limit DECIMAL(15,2) DEFAULT 500000,
            bitnob_card_id TEXT UNIQUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (virtualCardsError && !virtualCardsError.message?.includes('already exists')) {
      console.error('Virtual cards migration error:', virtualCardsError);
    }

    // Create transactions table
    const { error: transactionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS transactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID NOT NULL,
            sacco_group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
            virtual_card_id UUID REFERENCES virtual_cards(id) ON DELETE SET NULL,
            type VARCHAR(50) NOT NULL,
            amount DECIMAL(15,2) NOT NULL,
            status VARCHAR(50) DEFAULT 'pending',
            reference TEXT UNIQUE NOT NULL,
            bitnob_payment_id TEXT,
            description TEXT,
            metadata JSONB,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    });

    if (transactionsError && !transactionsError.message?.includes('already exists')) {
      console.error('Transactions migration error:', transactionsError);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration applied successfully',
      errors: {
        membership: membershipError?.message || null,
        virtualCards: virtualCardsError?.message || null,
        transactions: transactionsError?.message || null
      }
    });

  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Failed to apply migration', details: error },
      { status: 500 }
    );
  }
}
