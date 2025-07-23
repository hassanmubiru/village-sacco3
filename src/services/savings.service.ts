import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types';

type SavingsAccount = Database['public']['Tables']['savings_accounts']['Row'];
type SavingsAccountInsert = Database['public']['Tables']['savings_accounts']['Insert'];
type SavingsAccountUpdate = Database['public']['Tables']['savings_accounts']['Update'];

export class SavingsService {
  // Create a new savings account
  static async createSavingsAccount(accountData: SavingsAccountInsert): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .insert(accountData)
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

  // Get savings account by ID
  static async getSavingsAccountById(id: string): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
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

  // Get user's savings accounts
  static async getUserSavingsAccounts(userId: string): Promise<{ data: SavingsAccount[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get SACCO group savings accounts
  static async getSaccoGroupSavingsAccounts(saccoGroupId: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email
          )
        `)
        .eq('sacco_group_id', saccoGroupId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Update savings account balance
  static async updateSavingsBalance(
    accountId: string,
    newBalance: number,
    btcBalance?: number
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const updates: SavingsAccountUpdate = {
        balance: newBalance,
        updated_at: new Date().toISOString(),
      };

      if (btcBalance !== undefined) {
        updates.btc_balance = btcBalance;
      }

      const { data, error } = await supabase
        .from('savings_accounts')
        .update(updates)
        .eq('id', accountId)
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

  // Add to savings account
  static async addToSavings(
    accountId: string,
    amount: number,
    btcAmount?: number
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      // Get current balance
      const { data: account } = await this.getSavingsAccountById(accountId);
      if (!account) {
        return { data: null, error: 'Savings account not found' };
      }

      const newBalance = account.balance + amount;
      const newBtcBalance = account.btc_balance ? account.btc_balance + (btcAmount || 0) : (btcAmount || 0);

      return await this.updateSavingsBalance(accountId, newBalance, newBtcBalance);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Withdraw from savings account
  static async withdrawFromSavings(
    accountId: string,
    amount: number,
    btcAmount?: number
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      // Get current balance
      const { data: account } = await this.getSavingsAccountById(accountId);
      if (!account) {
        return { data: null, error: 'Savings account not found' };
      }

      if (account.balance < amount) {
        return { data: null, error: 'Insufficient balance' };
      }

      if (account.is_locked) {
        return { data: null, error: 'Account is locked' };
      }

      const newBalance = account.balance - amount;
      const newBtcBalance = account.btc_balance ? Math.max(0, account.btc_balance - (btcAmount || 0)) : 0;

      return await this.updateSavingsBalance(accountId, newBalance, newBtcBalance);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Calculate interest for savings account
  static async calculateInterest(accountId: string): Promise<{ data: number | null; error: string | null }> {
    try {
      const { data: account } = await this.getSavingsAccountById(accountId);
      if (!account) {
        return { data: null, error: 'Savings account not found' };
      }

      // Simple interest calculation (monthly)
      const monthlyInterestRate = account.interest_rate / 100 / 12;
      const interestAmount = account.balance * monthlyInterestRate;

      return { data: interestAmount, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Apply interest to savings account
  static async applyInterest(accountId: string): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data: interestAmount, error: interestError } = await this.calculateInterest(accountId);
      if (interestError || !interestAmount) {
        return { data: null, error: interestError || 'Failed to calculate interest' };
      }

      return await this.addToSavings(accountId, interestAmount);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get savings account by user and SACCO group
  static async getUserSaccoSavingsAccount(
    userId: string,
    saccoGroupId: string
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .eq('user_id', userId)
        .eq('sacco_group_id', saccoGroupId)
        .eq('account_type', 'group')
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Create individual savings account
  static async createIndividualSavingsAccount(
    userId: string,
    interestRate: number,
    targetAmount?: number,
    targetDate?: string
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const accountData: SavingsAccountInsert = {
        user_id: userId,
        account_type: 'individual',
        balance: 0,
        interest_rate: interestRate,
        target_amount: targetAmount,
        target_date: targetDate,
        is_locked: false,
      };

      return await this.createSavingsAccount(accountData);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Create group savings account
  static async createGroupSavingsAccount(
    userId: string,
    saccoGroupId: string,
    interestRate: number
  ): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const accountData: SavingsAccountInsert = {
        user_id: userId,
        sacco_group_id: saccoGroupId,
        account_type: 'group',
        balance: 0,
        interest_rate: interestRate,
        is_locked: false,
      };

      return await this.createSavingsAccount(accountData);
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Lock savings account
  static async lockSavingsAccount(accountId: string): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .update({ 
          is_locked: true, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', accountId)
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

  // Unlock savings account
  static async unlockSavingsAccount(accountId: string): Promise<{ data: SavingsAccount | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('savings_accounts')
        .update({ 
          is_locked: false, 
          updated_at: new Date().toISOString() 
        })
        .eq('id', accountId)
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

  // Get savings statistics for user
  static async getUserSavingsStatistics(userId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: accounts } = await this.getUserSavingsAccounts(userId);
      
      if (!accounts) {
        return { data: null, error: 'No savings accounts found' };
      }

      const stats = {
        totalAccounts: accounts.length,
        totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
        totalBtcBalance: accounts.reduce((sum, acc) => sum + (acc.btc_balance || 0), 0),
        individualAccounts: accounts.filter(acc => acc.account_type === 'individual').length,
        groupAccounts: accounts.filter(acc => acc.account_type === 'group').length,
        fixedDepositAccounts: accounts.filter(acc => acc.account_type === 'fixed_deposit').length,
        lockedAccounts: accounts.filter(acc => acc.is_locked).length,
        averageInterestRate: accounts.length > 0 
          ? accounts.reduce((sum, acc) => sum + acc.interest_rate, 0) / accounts.length 
          : 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get savings goal progress
  static async getSavingsGoalProgress(accountId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: account } = await this.getSavingsAccountById(accountId);
      if (!account) {
        return { data: null, error: 'Savings account not found' };
      }

      if (!account.target_amount) {
        return { data: null, error: 'No savings goal set' };
      }

      const progress = {
        currentAmount: account.balance,
        targetAmount: account.target_amount,
        progressPercentage: (account.balance / account.target_amount) * 100,
        remainingAmount: Math.max(0, account.target_amount - account.balance),
        targetDate: account.target_date,
        isGoalMet: account.balance >= account.target_amount,
      };

      return { data: progress, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get all savings accounts due for interest calculation
  static async getAccountsForInterestCalculation(): Promise<{ data: SavingsAccount[] | null; error: string | null }> {
    try {
      // Get accounts that haven't been updated in the last month
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);

      const { data, error } = await supabase
        .from('savings_accounts')
        .select('*')
        .lt('updated_at', lastMonth.toISOString())
        .gt('balance', 0);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }
}
