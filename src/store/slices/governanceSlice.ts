import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../lib/supabase';

export interface GovernanceProposal {
  id: string;
  sacco_group_id: string;
  title: string;
  description: string;
  proposal_type: 'policy_change' | 'board_election' | 'member_admission' | 'loan_approval' | 'budget_allocation' | 'interest_rate_change';
  proposed_by: string;
  proposer_name?: string;
  voting_start_date: string;
  voting_end_date: string;
  required_quorum: number;
  required_majority: number;
  status: 'draft' | 'active' | 'completed' | 'cancelled';
  total_votes: number;
  votes_for: number;
  votes_against: number;
  votes_abstain: number;
  outcome?: 'passed' | 'rejected' | 'insufficient_quorum';
  blockchain_tx_hash?: string;
  ipfs_hash?: string;
  created_at: string;
  updated_at: string;
}

export interface GovernanceVote {
  id: string;
  proposal_id: string;
  voter_id: string;
  vote: 'for' | 'against' | 'abstain';
  voting_weight: number;
  blockchain_tx_hash?: string;
  voted_at: string;
}

export interface LoanDefault {
  id: string;
  loan_id: string;
  days_overdue: number;
  amount_overdue: number;
  penalty_amount: number;
  status: 'flagged' | 'notified' | 'collections' | 'written_off';
  flagged_at: string;
  last_notification_sent?: string;
  resolution_notes?: string;
  resolved_at?: string;
  loan?: {
    borrower_id: string;
    amount: number;
    borrower_name?: string;
  };
}

export interface TransactionHistory {
  id: string;
  user_id: string;
  sacco_group_id?: string;
  sacco_group_name?: string;
  type: 'deposit' | 'withdrawal' | 'contribution' | 'loan' | 'interest' | 'transfer';
  amount: number;
  currency: string;
  btc_amount?: number;
  fee: number;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  description?: string;
  blockchain_tx_hash?: string;
  payment_method: 'lightning' | 'onchain' | 'bank_transfer' | 'mobile_money';
  created_at: string;
  running_balance: number;
}

export interface AuditLogEntry {
  id: string;
  table_name: string;
  record_id: string;
  action: 'INSERT' | 'UPDATE' | 'DELETE';
  old_values?: any;
  new_values?: any;
  user_id?: string;
  blockchain_tx_hash?: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
}

interface GovernanceState {
  proposals: GovernanceProposal[];
  userVotes: GovernanceVote[];
  loanDefaults: LoanDefault[];
  transactionHistory: TransactionHistory[];
  auditLog: AuditLogEntry[];
  loading: boolean;
  error: string | null;
  selectedProposal: GovernanceProposal | null;
}

const initialState: GovernanceState = {
  proposals: [],
  userVotes: [],
  loanDefaults: [],
  transactionHistory: [],
  auditLog: [],
  loading: false,
  error: null,
  selectedProposal: null,
};

// Async thunks
export const fetchProposals = createAsyncThunk(
  'governance/fetchProposals',
  async (saccoGroupId: string | undefined, { rejectWithValue }) => {
    try {
      let query = supabase
        .from('governance_proposals')
        .select(`
          *,
          users!governance_proposals_proposed_by_fkey(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (saccoGroupId) {
        query = query.eq('sacco_group_id', saccoGroupId);
      }

      const { data, error } = await query;
      if (error) throw error;

      const proposals = data.map((proposal: any) => ({
        ...proposal,
        proposer_name: proposal.users ? 
          `${proposal.users.first_name} ${proposal.users.last_name}` : 
          'Unknown'
      }));

      return proposals as GovernanceProposal[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createProposal = createAsyncThunk(
  'governance/createProposal',
  async (proposalData: Partial<GovernanceProposal>, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('governance_proposals')
        .insert(proposalData)
        .select()
        .single();

      if (error) throw error;
      return data as GovernanceProposal;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const castVote = createAsyncThunk(
  'governance/castVote',
  async (voteData: { proposal_id: string; vote: 'for' | 'against' | 'abstain'; voting_weight?: number }, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .insert({
          ...voteData,
          voting_weight: voteData.voting_weight || 1
        })
        .select()
        .single();

      if (error) throw error;

      // Update proposal vote counts
      const { error: updateError } = await supabase.rpc('update_proposal_votes', {
        proposal_id: voteData.proposal_id
      });

      if (updateError) throw updateError;

      return data as GovernanceVote;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchUserVotes = createAsyncThunk(
  'governance/fetchUserVotes',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('governance_votes')
        .select('*')
        .order('voted_at', { ascending: false });

      if (error) throw error;
      return data as GovernanceVote[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchLoanDefaults = createAsyncThunk(
  'governance/fetchLoanDefaults',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('loan_defaults')
        .select(`
          *,
          loans!loan_defaults_loan_id_fkey(
            borrower_id,
            amount,
            users!loans_borrower_id_fkey(first_name, last_name)
          )
        `)
        .order('flagged_at', { ascending: false });

      if (error) throw error;

      const defaults = data.map((defaultRecord: any) => ({
        ...defaultRecord,
        loan: defaultRecord.loans ? {
          ...defaultRecord.loans,
          borrower_name: defaultRecord.loans.users ? 
            `${defaultRecord.loans.users.first_name} ${defaultRecord.loans.users.last_name}` : 
            'Unknown'
        } : null
      }));

      return defaults as LoanDefault[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchTransactionHistory = createAsyncThunk(
  'governance/fetchTransactionHistory',
  async (_, { rejectWithValue }) => {
    try {
      const { data, error } = await supabase
        .from('member_transaction_history')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TransactionHistory[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchAuditLog = createAsyncThunk(
  'governance/fetchAuditLog',
  async (filters: { table_name?: string; user_id?: string } | undefined, { rejectWithValue }) => {
    try {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(100);

      if (filters?.table_name) {
        query = query.eq('table_name', filters.table_name);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updateLoanDefaultStatus = createAsyncThunk(
  'governance/updateLoanDefaultStatus',
  async ({ defaultId, status, notes }: { defaultId: string; status: string; notes?: string }, { rejectWithValue }) => {
    try {
      const updates: any = { status };
      if (notes) updates.resolution_notes = notes;
      if (status === 'written_off') updates.resolved_at = new Date().toISOString();

      const { data, error } = await supabase
        .from('loan_defaults')
        .update(updates)
        .eq('id', defaultId)
        .select()
        .single();

      if (error) throw error;
      return data as LoanDefault;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const governanceSlice = createSlice({
  name: 'governance',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelectedProposal: (state, action: PayloadAction<GovernanceProposal | null>) => {
      state.selectedProposal = action.payload;
    },
    clearSelectedProposal: (state) => {
      state.selectedProposal = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch proposals
      .addCase(fetchProposals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProposals.fulfilled, (state, action) => {
        state.loading = false;
        state.proposals = action.payload;
      })
      .addCase(fetchProposals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create proposal
      .addCase(createProposal.fulfilled, (state, action) => {
        state.proposals.unshift(action.payload);
      })
      // Cast vote
      .addCase(castVote.fulfilled, (state, action) => {
        state.userVotes.unshift(action.payload);
      })
      // Fetch user votes
      .addCase(fetchUserVotes.fulfilled, (state, action) => {
        state.userVotes = action.payload;
      })
      // Fetch loan defaults
      .addCase(fetchLoanDefaults.fulfilled, (state, action) => {
        state.loanDefaults = action.payload;
      })
      // Fetch transaction history
      .addCase(fetchTransactionHistory.fulfilled, (state, action) => {
        state.transactionHistory = action.payload;
      })
      // Fetch audit log
      .addCase(fetchAuditLog.fulfilled, (state, action) => {
        state.auditLog = action.payload;
      })
      // Update loan default status
      .addCase(updateLoanDefaultStatus.fulfilled, (state, action) => {
        const index = state.loanDefaults.findIndex(def => def.id === action.payload.id);
        if (index !== -1) {
          state.loanDefaults[index] = action.payload;
        }
      });
  },
});

export const {
  clearError,
  setSelectedProposal,
  clearSelectedProposal,
} = governanceSlice.actions;

export default governanceSlice.reducer;
