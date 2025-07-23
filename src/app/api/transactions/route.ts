import { NextRequest, NextResponse } from 'next/server';
import { TransactionService } from '../../../services/transaction.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const saccoGroupId = searchParams.get('saccoGroupId');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search');

    if (!userId) {
      return NextResponse.json(
        { message: 'User ID is required' },
        { status: 400 }
      );
    }

    if (search) {
      const { data, error } = await TransactionService.searchTransactions(userId, search, limit);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (saccoGroupId) {
      const { data, error } = await TransactionService.getSaccoGroupTransactions(saccoGroupId, limit);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (type) {
      const { data, error } = await TransactionService.getTransactionsByType(
        userId,
        type as any,
        limit
      );
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    const { data, error } = await TransactionService.getUserTransactions(userId, limit);
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Transactions GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const transactionData = await request.json();

    // Validation
    const requiredFields = ['user_id', 'type', 'amount', 'currency', 'payment_method'];
    for (const field of requiredFields) {
      if (!transactionData[field]) {
        return NextResponse.json(
          { message: `${field} is required` },
          { status: 400 }
        );
      }
    }

    const { data, error } = await TransactionService.createTransaction(transactionData);
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Transaction created successfully',
      data,
    }, { status: 201 });
  } catch (error) {
    console.error('Transaction creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
