export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          phone?: string
          first_name: string
          last_name: string
          bitnob_wallet_id?: string
          kyc_status: 'pending' | 'approved' | 'rejected' | 'not_started'
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          phone?: string
          first_name: string
          last_name: string
          bitnob_wallet_id?: string
          kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_started'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          phone?: string
          first_name?: string
          last_name?: string
          bitnob_wallet_id?: string
          kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_started'
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      sacco_groups: {
        Row: {
          id: string
          name: string
          description?: string
          contribution_amount: number
          contribution_frequency: 'weekly' | 'monthly' | 'quarterly'
          interest_rate: number
          max_members: number
          current_members: number
          group_wallet_address?: string
          is_active: boolean
          created_by: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string
          contribution_amount: number
          contribution_frequency: 'weekly' | 'monthly' | 'quarterly'
          interest_rate: number
          max_members: number
          current_members?: number
          group_wallet_address?: string
          is_active?: boolean
          created_by: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          contribution_amount?: number
          contribution_frequency?: 'weekly' | 'monthly' | 'quarterly'
          interest_rate?: number
          max_members?: number
          current_members?: number
          group_wallet_address?: string
          is_active?: boolean
          created_by?: string
          created_at?: string
          updated_at?: string
        }
      }
      sacco_memberships: {
        Row: {
          id: string
          user_id: string
          sacco_group_id: string
          role: 'member' | 'admin' | 'treasurer'
          joined_at: string
          is_active: boolean
          total_contributions: number
          last_contribution_date?: string
        }
        Insert: {
          id?: string
          user_id: string
          sacco_group_id: string
          role?: 'member' | 'admin' | 'treasurer'
          joined_at?: string
          is_active?: boolean
          total_contributions?: number
          last_contribution_date?: string
        }
        Update: {
          id?: string
          user_id?: string
          sacco_group_id?: string
          role?: 'member' | 'admin' | 'treasurer'
          joined_at?: string
          is_active?: boolean
          total_contributions?: number
          last_contribution_date?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          sacco_group_id?: string
          bitnob_transaction_id?: string
          type: 'deposit' | 'withdrawal' | 'contribution' | 'loan' | 'interest' | 'transfer'
          amount: number
          currency: string
          btc_amount?: number
          fee: number
          status: 'pending' | 'completed' | 'failed' | 'cancelled'
          description?: string
          blockchain_tx_hash?: string
          payment_method: 'lightning' | 'onchain' | 'bank_transfer' | 'mobile_money'
          recipient_id?: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sacco_group_id?: string
          bitnob_transaction_id?: string
          type: 'deposit' | 'withdrawal' | 'contribution' | 'loan' | 'interest' | 'transfer'
          amount: number
          currency: string
          btc_amount?: number
          fee?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          description?: string
          blockchain_tx_hash?: string
          payment_method: 'lightning' | 'onchain' | 'bank_transfer' | 'mobile_money'
          recipient_id?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sacco_group_id?: string
          bitnob_transaction_id?: string
          type?: 'deposit' | 'withdrawal' | 'contribution' | 'loan' | 'interest' | 'transfer'
          amount?: number
          currency?: string
          btc_amount?: number
          fee?: number
          status?: 'pending' | 'completed' | 'failed' | 'cancelled'
          description?: string
          blockchain_tx_hash?: string
          payment_method?: 'lightning' | 'onchain' | 'bank_transfer' | 'mobile_money'
          recipient_id?: string
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          borrower_id: string
          sacco_group_id: string
          amount: number
          interest_rate: number
          duration_months: number
          monthly_payment: number
          status: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          purpose?: string
          collateral_description?: string
          approved_by?: string
          approved_at?: string
          disbursed_at?: string
          due_date: string
          total_paid: number
          remaining_balance: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          borrower_id: string
          sacco_group_id: string
          amount: number
          interest_rate: number
          duration_months: number
          monthly_payment: number
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          purpose?: string
          collateral_description?: string
          approved_by?: string
          approved_at?: string
          disbursed_at?: string
          due_date: string
          total_paid?: number
          remaining_balance?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          borrower_id?: string
          sacco_group_id?: string
          amount?: number
          interest_rate?: number
          duration_months?: number
          monthly_payment?: number
          status?: 'pending' | 'approved' | 'active' | 'completed' | 'defaulted'
          purpose?: string
          collateral_description?: string
          approved_by?: string
          approved_at?: string
          disbursed_at?: string
          due_date?: string
          total_paid?: number
          remaining_balance?: number
          created_at?: string
          updated_at?: string
        }
      }
      savings_accounts: {
        Row: {
          id: string
          user_id: string
          sacco_group_id?: string
          account_type: 'individual' | 'group' | 'fixed_deposit'
          balance: number
          btc_balance?: number
          interest_rate: number
          target_amount?: number
          target_date?: string
          is_locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sacco_group_id?: string
          account_type: 'individual' | 'group' | 'fixed_deposit'
          balance?: number
          btc_balance?: number
          interest_rate: number
          target_amount?: number
          target_date?: string
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sacco_group_id?: string
          account_type?: 'individual' | 'group' | 'fixed_deposit'
          balance?: number
          btc_balance?: number
          interest_rate?: number
          target_amount?: number
          target_date?: string
          is_locked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
