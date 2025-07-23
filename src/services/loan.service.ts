import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types';

type Loan = Database['public']['Tables']['loans']['Row'];
type LoanInsert = Database['public']['Tables']['loans']['Insert'];
type LoanUpdate = Database['public']['Tables']['loans']['Update'];

export class LoanService {
  // Create a new loan application
  static async createLoan(loanData: LoanInsert): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .insert({
          ...loanData,
          remaining_balance: loanData.amount,
          total_paid: 0,
        })
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

  // Get loan by ID
  static async getLoanById(id: string): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
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

  // Get user's loans
  static async getUserLoans(userId: string): Promise<{ data: Loan[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get SACCO group loans
  static async getSaccoGroupLoans(saccoGroupId: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select(`
          *,
          users!borrower_id (
            id,
            first_name,
            last_name,
            email,
            phone
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

  // Get pending loan applications
  static async getPendingLoans(saccoGroupId?: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      let query = supabase
        .from('loans')
        .select(`
          *,
          users!borrower_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          sacco_groups (
            id,
            name
          )
        `)
        .eq('status', 'pending');

      if (saccoGroupId) {
        query = query.eq('sacco_group_id', saccoGroupId);
      }

      const { data, error } = await query.order('created_at', { ascending: true });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Approve loan
  static async approveLoan(loanId: string, approverId: string): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'approved',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)
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

  // Reject loan
  static async rejectLoan(loanId: string, approverId: string): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'rejected',
          approved_by: approverId,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)
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

  // Disburse loan
  static async disburseLoan(loanId: string): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'active',
          disbursed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)
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

  // Record loan payment
  static async recordLoanPayment(loanId: string, paymentAmount: number): Promise<{ data: Loan | null; error: string | null }> {
    try {
      // First get the current loan details
      const { data: loan } = await this.getLoanById(loanId);
      if (!loan) {
        return { data: null, error: 'Loan not found' };
      }

      const newTotalPaid = loan.total_paid + paymentAmount;
      const newRemainingBalance = Math.max(0, loan.remaining_balance - paymentAmount);
      const status = newRemainingBalance === 0 ? 'completed' : loan.status;

      const { data, error } = await supabase
        .from('loans')
        .update({
          total_paid: newTotalPaid,
          remaining_balance: newRemainingBalance,
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)
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

  // Get active loans for a user
  static async getActiveUserLoans(userId: string): Promise<{ data: Loan[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('borrower_id', userId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get overdue loans
  static async getOverdueLoans(saccoGroupId?: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      let query = supabase
        .from('loans')
        .select(`
          *,
          users!borrower_id (
            id,
            first_name,
            last_name,
            email,
            phone
          ),
          sacco_groups (
            id,
            name
          )
        `)
        .eq('status', 'active')
        .lt('due_date', today);

      if (saccoGroupId) {
        query = query.eq('sacco_group_id', saccoGroupId);
      }

      const { data, error } = await query.order('due_date', { ascending: true });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Calculate loan eligibility
  static async calculateLoanEligibility(
    userId: string,
    saccoGroupId: string,
    requestedAmount: number
  ): Promise<{ data: any | null; error: string | null }> {
    try {
      // Get user's contribution history
      const { data: contributions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('user_id', userId)
        .eq('sacco_group_id', saccoGroupId)
        .eq('type', 'contribution')
        .eq('status', 'completed');

      const totalContributions = contributions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get user's active loans
      const { data: activeLoans } = await this.getActiveUserLoans(userId);
      const hasActiveLoans = activeLoans && activeLoans.length > 0;
      const totalActiveLoanBalance = activeLoans?.reduce((sum, l) => sum + l.remaining_balance, 0) || 0;

      // Simple eligibility rules
      const minimumContributions = 50000; // UGX 50,000
      const maxLoanMultiplier = 3; // Can borrow up to 3x contributions
      const maxEligibleAmount = totalContributions * maxLoanMultiplier;

      const eligibility = {
        isEligible: totalContributions >= minimumContributions && !hasActiveLoans,
        totalContributions,
        maxEligibleAmount,
        requestedAmount,
        hasActiveLoans,
        totalActiveLoanBalance,
        reasons: [] as string[],
      };

      if (totalContributions < minimumContributions) {
        eligibility.reasons.push(`Minimum contributions of UGX ${minimumContributions.toLocaleString()} required`);
      }

      if (hasActiveLoans) {
        eligibility.reasons.push('Cannot have active loans');
      }

      if (requestedAmount > maxEligibleAmount) {
        eligibility.reasons.push(`Maximum loan amount is UGX ${maxEligibleAmount.toLocaleString()}`);
      }

      return { data: eligibility, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get loan statistics for SACCO group
  static async getLoanStatistics(saccoGroupId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: loans } = await this.getSaccoGroupLoans(saccoGroupId);
      
      if (!loans) {
        return { data: null, error: 'No loans found' };
      }

      const stats = {
        totalLoans: loans.length,
        activeLoans: loans.filter(l => l.status === 'active').length,
        completedLoans: loans.filter(l => l.status === 'completed').length,
        defaultedLoans: loans.filter(l => l.status === 'defaulted').length,
        pendingLoans: loans.filter(l => l.status === 'pending').length,
        totalLoanAmount: loans.reduce((sum, l) => sum + l.amount, 0),
        totalOutstanding: loans.filter(l => l.status === 'active').reduce((sum, l) => sum + l.remaining_balance, 0),
        totalRepaid: loans.reduce((sum, l) => sum + l.total_paid, 0),
        averageLoanAmount: loans.length > 0 ? loans.reduce((sum, l) => sum + l.amount, 0) / loans.length : 0,
      };

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Mark loan as defaulted
  static async markLoanAsDefaulted(loanId: string): Promise<{ data: Loan | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('loans')
        .update({
          status: 'defaulted',
          updated_at: new Date().toISOString(),
        })
        .eq('id', loanId)
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
}
