import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { userId, groupId } = await request.json();

    if (!userId || !groupId) {
      return NextResponse.json(
        { error: 'User ID and Group ID are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    // Check if user is an approved member of the group
    const { data: membership } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', groupId)
      .eq('user_id', userId)
      .eq('status', 'approved')
      .single();

    if (!membership) {
      return NextResponse.json(
        { error: 'You must be an approved member to get a virtual card' },
        { status: 403 }
      );
    }

    // Check if user already has a virtual card for this group
    const { data: existingCard } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('sacco_group_id', groupId)
      .eq('status', 'active')
      .single();

    if (existingCard) {
      return NextResponse.json({
        success: true,
        card: existingCard,
        message: 'You already have an active virtual card for this group'
      });
    }

    // TODO: Integrate with Bitnob API to create actual virtual card
    // For now, we'll create a mock virtual card
    
    const mockCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      user_id: userId,
      sacco_group_id: groupId,
      card_number: `4532 **** **** ${Math.floor(1000 + Math.random() * 9000)}`,
      card_holder_name: membership.user_name || 'Card Holder',
      expiry_month: Math.floor(Math.random() * 12) + 1,
      expiry_year: new Date().getFullYear() + 3,
      cvv: Math.floor(100 + Math.random() * 900),
      status: 'active',
      balance: 0,
      spending_limit: 500000, // UGX 500,000
      created_at: new Date().toISOString(),
      bitnob_card_id: `btn_card_${Date.now()}`
    };

    // Store the virtual card in our database
    const { data: virtualCard, error: cardError } = await supabase
      .from('virtual_cards')
      .insert(mockCard)
      .select()
      .single();

    if (cardError) {
      console.error('Error creating virtual card:', cardError);
      return NextResponse.json(
        { error: 'Failed to create virtual card' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: virtualCard,
      message: 'Virtual card created successfully! You can now spend borderlessly.'
    });

  } catch (error) {
    console.error('Error in virtual card API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get user's virtual cards
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const groupId = searchParams.get('groupId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', userId);

    if (groupId) {
      query = query.eq('sacco_group_id', groupId);
    }

    const { data: cards, error } = await query.order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching virtual cards:', error);
      return NextResponse.json(
        { error: 'Failed to fetch virtual cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cards: cards || []
    });

  } catch (error) {
    console.error('Error in get virtual cards API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
