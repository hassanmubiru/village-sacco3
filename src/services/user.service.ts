import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types';

type User = Database['public']['Tables']['users']['Row'];
type UserInsert = Database['public']['Tables']['users']['Insert'];
type UserUpdate = Database['public']['Tables']['users']['Update'];

export class UserService {
  // Create a new user
  static async createUser(userData: UserInsert): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert(userData)
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

  // Get user by ID
  static async getUserById(id: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
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

  // Get user by email
  static async getUserByEmail(email: string): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Update user
  static async updateUser(id: string, updates: UserUpdate): Promise<{ data: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({ ...updates, updated_at: new Date().toISOString() })
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

  // Update Bitnob wallet ID
  static async updateBitnobWalletId(userId: string, walletId: string): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(userId, { bitnob_wallet_id: walletId });
  }

  // Update KYC status
  static async updateKycStatus(userId: string, status: User['kyc_status']): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(userId, { kyc_status: status });
  }

  // Get users with pending KYC
  static async getUsersWithPendingKyc(): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('kyc_status', 'pending')
        .eq('is_active', true);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Search users by name or email
  static async searchUsers(query: string): Promise<{ data: User[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
        .eq('is_active', true)
        .limit(20);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Deactivate user
  static async deactivateUser(id: string): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(id, { is_active: false });
  }

  // Reactivate user
  static async reactivateUser(id: string): Promise<{ data: User | null; error: string | null }> {
    return this.updateUser(id, { is_active: true });
  }
}
