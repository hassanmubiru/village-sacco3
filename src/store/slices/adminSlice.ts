import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface AdminUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  role: 'member' | 'admin' | 'super_admin';
  kyc_status: 'not_started' | 'pending' | 'approved' | 'rejected';
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bitnob_wallet_id?: string;
}

export interface AdminSaccoGroup {
  id: string;
  name: string;
  description?: string;
  contribution_amount: number;
  contribution_frequency: 'weekly' | 'monthly' | 'quarterly';
  interest_rate: number;
  max_members: number;
  current_members: number;
  group_wallet_address?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface AdminTransaction {
  id: string;
  user_id: string;
  sacco_group_id?: string;
  bitnob_transaction_id?: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'loan' | 'interest' | 'transfer';
  amount: number;
  currency: string;
  btc_amount?: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  payment_method: 'lightning' | 'onchain' | 'bank_transfer' | 'mobile_money';
  recipient_id?: string;
  created_at: string;
  updated_at: string;
}

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  totalSaccoGroups: number;
  activeSaccoGroups: number;
  totalTransactions: number;
  totalVolume: number;
  pendingKycCount: number;
}

interface AdminState {
  users: AdminUser[];
  saccoGroups: AdminSaccoGroup[];
  transactions: AdminTransaction[];
  stats: AdminStats | null;
  loading: boolean;
  error: string | null;
  selectedUser: AdminUser | null;
  selectedSaccoGroup: AdminSaccoGroup | null;
}

const initialState: AdminState = {
  users: [],
  saccoGroups: [],
  transactions: [],
  stats: null,
  loading: false,
  error: null,
  selectedUser: null,
  selectedSaccoGroup: null,
};

// Async thunks
export const fetchAllUsers = createAsyncThunk(
  'admin/fetchAllUsers',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminUser[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllSaccoGroups = createAsyncThunk(
  'admin/fetchAllSaccoGroups',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as AdminSaccoGroup[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAllTransactions = createAsyncThunk(
  'admin/fetchAllTransactions',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100); // Limit for performance

      if (error) throw error;
      return data as AdminTransaction[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAdminStats = createAsyncThunk(
  'admin/fetchAdminStats',
  async (_, { rejectWithValue }) => {
    try {
      // Fetch total and active users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true });

      const { count: activeUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch total and active SACCO groups
      const { count: totalSaccoGroups } = await supabase
        .from('sacco_groups')
        .select('*', { count: 'exact', head: true });

      const { count: activeSaccoGroups } = await supabase
        .from('sacco_groups')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      // Fetch transaction stats
      const { count: totalTransactions } = await supabase
        .from('transactions')
        .select('*', { count: 'exact', head: true });

      const { data: volumeData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed');

      const totalVolume = volumeData?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;

      // Fetch pending KYC count
      const { count: pendingKycCount } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('kyc_status', 'pending');

      return {
        totalUsers: totalUsers || 0,
        activeUsers: activeUsers || 0,
        totalSaccoGroups: totalSaccoGroups || 0,
        activeSaccoGroups: activeSaccoGroups || 0,
        totalTransactions: totalTransactions || 0,
        totalVolume,
        pendingKycCount: pendingKycCount || 0,
      } as AdminStats;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateUserStatus = createAsyncThunk(
  'admin/updateUserStatus',
  async ({ userId, updates }: { userId: string; updates: Partial<AdminUser> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as AdminUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateSaccoGroupStatus = createAsyncThunk(
  'admin/updateSaccoGroupStatus',
  async ({ groupId, updates }: { groupId: string; updates: Partial<AdminSaccoGroup> }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('sacco_groups')
        .update(updates)
        .eq('id', groupId)
        .select()
        .single();

      if (error) throw error;
      return data as AdminSaccoGroup;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const approveKyc = createAsyncThunk(
  'admin/approveKyc',
  async ({ userId, approved }: { userId: string; approved: boolean }, { rejectWithValue }) => {
    try {
      const status = approved ? 'approved' : 'rejected';
      const { data, error } = await supabase
        .from('users')
        .update({ kyc_status: status })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as AdminUser;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedUser: (state, action: PayloadAction<AdminUser | null>) => {
      state.selectedUser = action.payload;
    },
    setSelectedSaccoGroup: (state, action: PayloadAction<AdminSaccoGroup | null>) => {
      state.selectedSaccoGroup = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearSelectedSaccoGroup: (state) => {
      state.selectedSaccoGroup = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all users
      .addCase(fetchAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload;
      })
      .addCase(fetchAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all SACCO groups
      .addCase(fetchAllSaccoGroups.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllSaccoGroups.fulfilled, (state, action) => {
        state.loading = false;
        state.saccoGroups = action.payload;
      })
      .addCase(fetchAllSaccoGroups.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch all transactions
      .addCase(fetchAllTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.transactions = action.payload;
      })
      .addCase(fetchAllTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch admin stats
      .addCase(fetchAdminStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchAdminStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update user status
      .addCase(updateUserStatus.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      // Update SACCO group status
      .addCase(updateSaccoGroupStatus.fulfilled, (state, action) => {
        const index = state.saccoGroups.findIndex(group => group.id === action.payload.id);
        if (index !== -1) {
          state.saccoGroups[index] = action.payload;
        }
        if (state.selectedSaccoGroup?.id === action.payload.id) {
          state.selectedSaccoGroup = action.payload;
        }
      })
      // Approve KYC
      .addCase(approveKyc.fulfilled, (state, action) => {
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      });
  },
});

export const {
  clearError,
  setSelectedUser,
  setSelectedSaccoGroup,
  clearSelectedUser,
  clearSelectedSaccoGroup,
} = adminSlice.actions;

export default adminSlice.reducer;
