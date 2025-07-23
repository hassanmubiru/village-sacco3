import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types';

type Transaction = Database['public']['Tables']['transactions']['Row'];
type TransactionInsert = Database['public']['Tables']['transactions']['Insert'];
type TransactionUpdate = Database['public']['Tables']['transactions']['Update'];

export class TransactionService {
  // Create a new transaction
  static async createTransaction(transactionData: TransactionInsert): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert(transactionData)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get transaction by ID
  static async getTransactionById(id: string): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get user transactions
  static async getUserTransactions(userId: string, limit = 50): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get SACCO group transactions
  static async getSaccoGroupTransactions(saccoGroupId: string, limit = 100): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('sacco_group_id', saccoGroupId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get transactions by type
  static async getTransactionsByType(
    userId: string,
    type: Transaction['type'],
    limit = 50
  ): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Update transaction status
  static async updateTransactionStatus(
    id: string,
    status: Transaction['status'],
    blockchainTxHash?: string
  ): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const updates: TransactionUpdate = {
        status,
        updated_at: new Date().toISOString(),
      };

      if (blockchainTxHash) {
        updates.blockchain_tx_hash = blockchainTxHash;
      }

      const { data, error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get pending transactions
  static async getPendingTransactions(): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get transaction statistics for a user
  static async getUserTransactionStats(userId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: transactions } = await this.getUserTransactions(userId, 1000);
      
      if (!transactions) {
        return { data: null, error: 'No transactions found' };
      }

      const stats = {
        totalTransactions: transactions.length,
        totalDeposits: 0,
        totalWithdrawals: 0,
        totalContributions: 0,
        totalInterest: 0,
        completedTransactions: 0,
        pendingTransactions: 0,
        failedTransactions: 0,
      };

      transactions.forEach((tx) => {
        switch (tx.type) {
          case 'deposit':
            stats.totalDeposits += tx.amount;
            break;
          case 'withdrawal':
            stats.totalWithdrawals += tx.amount;
            break;
          case 'contribution':
            stats.totalContributions += tx.amount;
            break;
          case 'interest':
            stats.totalInterest += tx.amount;
            break;
        }

        switch (tx.status) {
          case 'completed':
            stats.completedTransactions++;
            break;
          case 'pending':
            stats.pendingTransactions++;
            break;
          case 'failed':
          case 'cancelled':
            stats.failedTransactions++;
            break;
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get monthly transaction summary
  static async getMonthlyTransactionSummary(
    userId: string,
    year: number,
    month: number
  ): Promise<{ data: any | null; error: string | null }> {
    try {
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .gte('created_at', startDate)
        .lte('created_at', endDate)
        .eq('status', 'completed');

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      const summary = {
        month,
        year,
        totalTransactions: data.length,
        totalAmount: data.reduce((sum, tx) => sum + tx.amount, 0),
        deposits: data.filter(tx => tx.type === 'deposit').reduce((sum, tx) => sum + tx.amount, 0),
        withdrawals: data.filter(tx => tx.type === 'withdrawal').reduce((sum, tx) => sum + tx.amount, 0),
        contributions: data.filter(tx => tx.type === 'contribution').reduce((sum, tx) => sum + tx.amount, 0),
        interest: data.filter(tx => tx.type === 'interest').reduce((sum, tx) => sum + tx.amount, 0),
      };

      return { data: summary, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Record contribution transaction
  static async recordContribution(
    userId: string,
    saccoGroupId: string,
    amount: number,
    paymentMethod: Transaction['payment_method'],
    bitnobTransactionId?: string
  ): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const contributionData: TransactionInsert = {
        user_id: userId,
        sacco_group_id: saccoGroupId,
        type: 'contribution',
        amount,
        currency: 'UGX',
        payment_method: paymentMethod,
        status: 'pending',
        description: 'SACCO group contribution',
        bitnob_transaction_id: bitnobTransactionId,
      };

      return await this.createTransaction(contributionData);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Record loan disbursement
  static async recordLoanDisbursement(
    borrowerId: string,
    saccoGroupId: string,
    amount: number,
    description: string
  ): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const loanData: TransactionInsert = {
        user_id: borrowerId,
        sacco_group_id: saccoGroupId,
        type: 'loan',
        amount,
        currency: 'UGX',
        payment_method: 'bank_transfer',
        status: 'completed',
        description,
      };

      return await this.createTransaction(loanData);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get transaction by Bitnob ID
  static async getTransactionByBitnobId(bitnobId: string): Promise<{ data: Transaction | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('bitnob_transaction_id', bitnobId)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Search transactions
  static async searchTransactions(
    userId: string,
    searchQuery: string,
    limit = 50
  ): Promise<{ data: Transaction[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .or(`description.ilike.%${searchQuery}%,blockchain_tx_hash.ilike.%${searchQuery}%`)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }
}
