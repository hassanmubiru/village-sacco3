import { supabase, handleSupabaseError } from '../lib/supabase';
import { Database } from '../types';

type SaccoGroup = Database['public']['Tables']['sacco_groups']['Row'];
type SaccoGroupInsert = Database['public']['Tables']['sacco_groups']['Insert'];
type SaccoGroupUpdate = Database['public']['Tables']['sacco_groups']['Update'];
type SaccoMembership = Database['public']['Tables']['sacco_memberships']['Row'];

export class SaccoGroupService {
  // Create a new SACCO group
  static async createSaccoGroup(groupData: SaccoGroupInsert): Promise<{ data: SaccoGroup | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .insert(groupData)
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

  // Get SACCO group by ID
  static async getSaccoGroupById(id: string): Promise<{ data: SaccoGroup | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
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

  // Get all active SACCO groups
  static async getAllSaccoGroups(): Promise<{ data: SaccoGroup[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get SACCO groups created by a user
  static async getSaccoGroupsByCreator(creatorId: string): Promise<{ data: SaccoGroup[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .select('*')
        .eq('created_by', creatorId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get SACCO groups a user is a member of
  static async getUserSaccoGroups(userId: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_memberships')
        .select(`
          *,
          sacco_groups (
            id,
            name,
            description,
            contribution_amount,
            contribution_frequency,
            interest_rate,
            max_members,
            current_members,
            is_active,
            created_at
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Update SACCO group
  static async updateSaccoGroup(id: string, updates: SaccoGroupUpdate): Promise<{ data: SaccoGroup | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
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

  // Join SACCO group
  static async joinSaccoGroup(userId: string, saccoGroupId: string): Promise<{ data: SaccoMembership | null; error: string | null }> {
    try {
      // First check if group exists and has space
      const { data: group } = await this.getSaccoGroupById(saccoGroupId);
      if (!group) {
        return { data: null, error: 'SACCO group not found' };
      }

      if (group.current_members >= group.max_members) {
        return { data: null, error: 'SACCO group is full' };
      }

      // Check if user is already a member
      const { data: existingMembership } = await supabase
        .from('sacco_memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('sacco_group_id', saccoGroupId)
        .single();

      if (existingMembership) {
        return { data: null, error: 'User is already a member of this group' };
      }

      // Add membership
      const { data: membership, error: membershipError } = await supabase
        .from('sacco_memberships')
        .insert({
          user_id: userId,
          sacco_group_id: saccoGroupId,
          role: 'member',
        })
        .select()
        .single();

      if (membershipError) {
        return { data: null, error: handleSupabaseError(membershipError) };
      }

      // Update group member count
      await this.updateSaccoGroup(saccoGroupId, {
        current_members: group.current_members + 1,
      });

      return { data: membership, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Leave SACCO group
  static async leaveSaccoGroup(userId: string, saccoGroupId: string): Promise<{ error: string | null }> {
    try {
      // Deactivate membership
      const { error: membershipError } = await supabase
        .from('sacco_memberships')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('sacco_group_id', saccoGroupId);

      if (membershipError) {
        return { error: handleSupabaseError(membershipError) };
      }

      // Update group member count
      const { data: group } = await this.getSaccoGroupById(saccoGroupId);
      if (group) {
        await this.updateSaccoGroup(saccoGroupId, {
          current_members: Math.max(0, group.current_members - 1),
        });
      }

      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Get group members
  static async getGroupMembers(saccoGroupId: string): Promise<{ data: any[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_memberships')
        .select(`
          *,
          users (
            id,
            first_name,
            last_name,
            email,
            phone,
            created_at
          )
        `)
        .eq('sacco_group_id', saccoGroupId)
        .eq('is_active', true)
        .order('joined_at', { ascending: true });

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Update member role
  static async updateMemberRole(userId: string, saccoGroupId: string, role: SaccoMembership['role']): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('sacco_memberships')
        .update({ role })
        .eq('user_id', userId)
        .eq('sacco_group_id', saccoGroupId);

      if (error) {
        return { error: handleSupabaseError(error) };
      }

      return { error: null };
    } catch (error) {
      return { error: handleSupabaseError(error) };
    }
  }

  // Search SACCO groups
  static async searchSaccoGroups(query: string): Promise<{ data: SaccoGroup[] | null; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .select('*')
        .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) {
        return { data: null, error: handleSupabaseError(error) };
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }

  // Get group statistics
  static async getGroupStatistics(saccoGroupId: string): Promise<{ data: any | null; error: string | null }> {
    try {
      const { data: group } = await this.getSaccoGroupById(saccoGroupId);
      if (!group) {
        return { data: null, error: 'Group not found' };
      }

      // Get total contributions
      const { data: contributions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('sacco_group_id', saccoGroupId)
        .eq('type', 'contribution')
        .eq('status', 'completed');

      const totalContributions = contributions?.reduce((sum, t) => sum + t.amount, 0) || 0;

      // Get active loans
      const { data: activeLoans } = await supabase
        .from('loans')
        .select('amount, remaining_balance')
        .eq('sacco_group_id', saccoGroupId)
        .eq('status', 'active');

      const totalLoansAmount = activeLoans?.reduce((sum, l) => sum + l.amount, 0) || 0;
      const totalOutstanding = activeLoans?.reduce((sum, l) => sum + l.remaining_balance, 0) || 0;

      return {
        data: {
          group,
          totalContributions,
          totalLoansAmount,
          totalOutstanding,
          activeLoansCount: activeLoans?.length || 0,
        },
        error: null,
      };
    } catch (error) {
      return { data: null, error: handleSupabaseError(error) };
    }
  }
}
