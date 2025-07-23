/**
 * TypeScript types for SACCO platform with Bitnob integration
 */

// User and Authentication Types
export interface User {
  id: string;
  phone: string;
  email?: string;
  name: string;
  firstName?: string;
  lastName?: string;
  role: 'admin' | 'member' | 'group_admin';
  kycLevel: 1 | 2 | 3;
  isVerified: boolean;
  bitnobWalletId?: string;
  bitnobUserId?: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

// Bitnob Integration Types
export interface BitnobWallet {
  id: string;
  userId: string;
  balance: {
    btc: number;
    satoshis: number;
    fiat: number;
    currency: string;
  };
  addresses: {
    bitcoin: string;
    lightning?: string;
  };
  status: 'active' | 'suspended' | 'closed';
  createdAt: string;
}

export interface BitnobTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive';
  method: 'lightning' | 'onchain' | 'internal';
  amount: number;
  currency: string;
  fiatAmount?: number;
  fiatCurrency?: string;
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description?: string;
  recipientAddress?: string;
  senderAddress?: string;
  blockchainTxHash?: string;
  lightningInvoice?: string;
  createdAt: string;
  confirmedAt?: string;
}

// SACCO Group Types
export interface SaccoGroup {
  id: string;
  name: string;
  description?: string;
  groupCode: string;
  maxMembers: number;
  currentMembers: number;
  minimumSavings: number;
  savingsInterestRate: number;
  loanInterestRate: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  createdBy: string;
  admins: string[];
  rules: GroupRules;
  statistics: GroupStatistics;
  createdAt: string;
  updatedAt: string;
}

export interface GroupRules {
  minimumContribution: number;
  maximumLoanAmount: number;
  loanDuration: number; // in months
  gracePeriod: number; // in days
  penaltyRate: number; // percentage
  votingQuorum: number; // percentage
  autoApprovalLimit: number; // amount below which loans are auto-approved
}

export interface GroupStatistics {
  totalSavings: number;
  totalLoans: number;
  activeLoans: number;
  averageSavings: number;
  monthlyGrowth: number;
  loanDefaultRate: number;
}

// Wallet and Payment Types
export interface WalletBalance {
  btc: number;
  satoshis: number;
  fiat: number;
  currency: string;
  lastUpdated: string;
}

// Transaction Types
export interface SaccoTransaction {
  id: string;
  groupId: string;
  userId: string;
  type: 'savings_deposit' | 'savings_withdrawal' | 'loan_disbursement' | 'loan_repayment' | 'transfer' | 'penalty';
  amount: number;
  currency: string;
  btcAmount?: number;
  fiatAmount?: number;
  description: string;
  reference: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  bitnobTransactionId?: string;
  blockchainTxHash?: string;
  recipientId?: string;
  approvedBy?: string;
  createdAt: string;
  processedAt?: string;
  confirmedAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Form Types
export interface LoginForm {
  phone: string;
  password: string;
}

export interface RegisterForm {
  name: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  password: string;
  confirmPassword: string;
}

// Redux State Types
export interface RootState {
  auth: AuthState;
  sacco: SaccoState;
  wallet: WalletState;
  transactions: TransactionState;
}

export interface SaccoState {
  groups: SaccoGroup[];
  currentGroup: SaccoGroup | null;
  loading: boolean;
  error: string | null;
}

export interface WalletState {
  balance: WalletBalance | null;
  transactions: BitnobTransaction[];
  loading: boolean;
  error: string | null;
}

export interface TransactionState {
  transactions: SaccoTransaction[];
  loading: boolean;
  error: string | null;
}
