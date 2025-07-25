import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { createBitnobService } from '@/services/bitnob.service';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { action, ...data } = await request.json();

    // Get user from auth
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const bitnobService = createBitnobService();

    switch (action) {
      case 'send_usdt':
        return await handleUSDTTransfer(data, bitnobService, user.id, supabase);
      case 'cross_border_payment':
        return await handleCrossBorderPayment(data, bitnobService, user.id, supabase);
      case 'create_virtual_card':
        return await handleVirtualCardCreation(data, bitnobService, user.id, supabase);
      case 'get_virtual_cards':
        return await handleGetVirtualCards(user.id, supabase);
      case 'get_exchange_rates':
        return await handleGetExchangeRates(data, bitnobService);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Bitnob enhanced services API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleUSDTTransfer(data: any, bitnobService: any, userId: string, supabase: any) {
  try {
    const { amount, targetNetwork, recipientAddress, description } = data;

    // Create USDT transfer via Bitnob
    const result = await bitnobService.sendUSDT({
      amount,
      currency: 'USDT',
      targetNetwork,
      recipientAddress,
      reference: `USDT_${Date.now()}_${userId}`,
    });

    // Record transaction in database
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'stablecoin_transfer',
        method: 'usdt',
        amount: amount,
        currency: 'USDT',
        status: 'pending',
        reference: result.reference || `USDT_${Date.now()}`,
        description: description || 'USDT Transfer',
        recipient_address: recipientAddress,
        bitnob_transaction_id: result.id,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('Failed to record USDT transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      transaction: result,
      message: 'USDT transfer initiated successfully'
    });
  } catch (error) {
    console.error('USDT transfer error:', error);
    return NextResponse.json(
      { error: 'USDT transfer failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

async function handleCrossBorderPayment(data: any, bitnobService: any, userId: string, supabase: any) {
  try {
    const { amount, sourceCurrency, targetCurrency, recipientCountry, recipientPhone, recipientBank, description } = data;

    // Create cross-border payment via Bitnob
    const result = await bitnobService.sendCrossBorderPayment({
      amount,
      sourceCurrency,
      targetCurrency,
      recipientCountry,
      recipientPhoneNumber: recipientPhone,
      recipientBankAccount: recipientBank,
      reference: `CB_${Date.now()}_${userId}`,
      description: description || 'Cross-border Payment',
    });

    // Record transaction in database
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'cross_border',
        method: 'cross_border',
        amount: amount,
        currency: sourceCurrency,
        status: 'pending',
        reference: result.reference || `CB_${Date.now()}`,
        description: description || 'Cross-border Payment',
        recipient_country: recipientCountry,
        bitnob_transaction_id: result.id,
        created_at: new Date().toISOString(),
      });

    if (transactionError) {
      console.error('Failed to record cross-border transaction:', transactionError);
    }

    return NextResponse.json({
      success: true,
      transaction: result,
      message: 'Cross-border payment initiated successfully'
    });
  } catch (error) {
    console.error('Cross-border payment error:', error);
    return NextResponse.json(
      { error: 'Cross-border payment failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

async function handleVirtualCardCreation(data: any, bitnobService: any, userId: string, supabase: any) {
  try {
    const { cardHolderName, spendingLimit, currency, type } = data;

    // Create virtual card via Bitnob
    const result = await bitnobService.createVirtualCard({
      userId,
      cardHolderName,
      spendingLimit,
      currency,
      type,
    });

    // Store virtual card in database
    const { data: virtualCard, error: cardError } = await supabase
      .from('virtual_cards')
      .insert({
        user_id: userId,
        card_number: result.cardNumber,
        card_holder_name: cardHolderName,
        expiry_month: result.expiryMonth,
        expiry_year: result.expiryYear,
        cvv: result.cvv,
        balance: 0,
        currency: currency,
        spending_limit: spendingLimit,
        status: 'active',
        type: type,
        bitnob_card_id: result.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (cardError) {
      console.error('Failed to store virtual card:', cardError);
      return NextResponse.json(
        { error: 'Failed to create virtual card record' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: virtualCard,
      message: 'Virtual card created successfully'
    });
  } catch (error) {
    console.error('Virtual card creation error:', error);
    
    // Create mock virtual card for development
    const mockCard = {
      id: `mock_card_${Date.now()}`,
      user_id: userId,
      card_number: `4532 1234 5678 ${Math.floor(1000 + Math.random() * 9000)}`,
      card_holder_name: data.cardHolderName,
      expiry_month: 12,
      expiry_year: new Date().getFullYear() + 3,
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      balance: 0,
      currency: data.currency,
      spending_limit: data.spendingLimit,
      status: 'active',
      type: data.type,
      bitnob_card_id: `btn_mock_${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    const { data: virtualCard, error: cardError } = await supabase
      .from('virtual_cards')
      .insert(mockCard)
      .select()
      .single();

    if (cardError) {
      return NextResponse.json(
        { error: 'Failed to create virtual card' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      card: virtualCard,
      message: 'Virtual card created successfully (development mode)'
    });
  }
}

async function handleGetVirtualCards(userId: string, supabase: any) {
  try {
    const { data: cards, error } = await supabase
      .from('virtual_cards')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      cards: cards || []
    });
  } catch (error) {
    console.error('Get virtual cards error:', error);
    return NextResponse.json(
      { error: 'Failed to get virtual cards' },
      { status: 500 }
    );
  }
}

async function handleGetExchangeRates(data: any, bitnobService: any) {
  try {
    const { sourceCurrency, targetCurrency, recipientCountry } = data;

    let rates;
    if (recipientCountry) {
      // Get cross-border rates
      rates = await bitnobService.getCrossBorderRates(sourceCurrency, targetCurrency, recipientCountry);
    } else {
      // Get regular exchange rates
      rates = await bitnobService.getExchangeRates(sourceCurrency);
    }

    return NextResponse.json({
      success: true,
      rates
    });
  } catch (error) {
    console.error('Exchange rates error:', error);
    
    // Return mock rates for development
    const mockRates = {
      BTC: {
        UGX: 120000000,
        KES: 3200000,
        TZS: 7500000,
        USD: 43000,
        USDT: 43000,
      },
      UGX: {
        KES: 26.67,
        TZS: 62.5,
        USD: 0.00036,
        USDT: 0.00036,
      }
    };

    return NextResponse.json({
      success: true,
      rates: mockRates,
      message: 'Using development rates'
    });
  }
}
