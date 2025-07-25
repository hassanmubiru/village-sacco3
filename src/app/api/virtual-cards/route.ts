import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// Mock card generation function
function generateMockCard(userId: string, holderName: string) {
  // Generate a realistic-looking card number (not a real one)
  const cardNumber = '4532' + Math.random().toString().slice(2, 14);
  
  // Generate expiry date (2 years from now)
  const expiryDate = new Date();
  expiryDate.setFullYear(expiryDate.getFullYear() + 2);
  const month = (expiryDate.getMonth() + 1).toString().padStart(2, '0');
  const year = expiryDate.getFullYear().toString().slice(-2);
  
  // Generate CVV
  const cvv = Math.floor(100 + Math.random() * 900).toString();
  
  return {
    id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId,
    card_number: cardNumber,
    holder_name: holderName,
    expiry_date: `${month}/${year}`,
    cvv: cvv,
    balance: 0,
    status: 'active' as const,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Get user's virtual cards
    const { data: cards, error } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching virtual cards:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch virtual cards' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      cards: cards || []
    });

  } catch (error) {
    console.error('Error in virtual cards API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, holderName } = body;

    if (!userId || !holderName) {
      return NextResponse.json(
        { success: false, error: 'User ID and holder name are required' },
        { status: 400 }
      );
    }

    // Check if user already has an active card
    const { data: existingCards } = await supabase
      .from('virtual_cards')
      .select('id')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (existingCards && existingCards.length > 0) {
      return NextResponse.json(
        { success: false, error: 'User already has an active virtual card' },
        { status: 400 }
      );
    }

    // Generate mock card data
    const cardData = generateMockCard(userId, holderName);

    // In a real implementation, you would integrate with a card provider API here
    // For now, we'll store the mock data in our database

    const { data: newCard, error } = await supabase
      .from('virtual_cards')
      .insert([cardData])
      .select()
      .single();

    if (error) {
      console.error('Error creating virtual card:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to create virtual card' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: newCard,
      message: 'Virtual card created successfully'
    });

  } catch (error) {
    console.error('Error in virtual card creation:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { cardId, action } = body;

    if (!cardId || !action) {
      return NextResponse.json(
        { success: false, error: 'Card ID and action are required' },
        { status: 400 }
      );
    }

    let updateData: any = { updated_at: new Date().toISOString() };

    switch (action) {
      case 'block':
        updateData.status = 'blocked';
        break;
      case 'unblock':
        updateData.status = 'active';
        break;
      case 'topup':
        const { amount } = body;
        if (!amount || amount <= 0) {
          return NextResponse.json(
            { success: false, error: 'Valid amount is required for top-up' },
            { status: 400 }
          );
        }
        // In a real implementation, you would process the payment here
        // For now, we'll just update the balance
        const { data: currentCard } = await supabase
          .from('virtual_cards')
          .select('balance')
          .eq('id', cardId)
          .single();
        
        if (currentCard) {
          updateData.balance = currentCard.balance + amount;
        }
        break;
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

    const { data: updatedCard, error } = await supabase
      .from('virtual_cards')
      .update(updateData)
      .eq('id', cardId)
      .select()
      .single();

    if (error) {
      console.error('Error updating virtual card:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to update virtual card' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: updatedCard,
      message: `Card ${action} successful`
    });

  } catch (error) {
    console.error('Error in virtual card update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
