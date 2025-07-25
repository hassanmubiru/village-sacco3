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
    usdt: number; // USDT/Stablecoin balance
    fiat: number;
    currency: string;
  };
  addresses: {
    bitcoin: string;
    lightning?: string;
    usdt?: string; // USDT address
  };
  status: 'active' | 'suspended' | 'closed';
  crossBorderEnabled: boolean; // Cross-border payment capability
  virtualCardEnabled: boolean; // Virtual card issuing capability
  createdAt: string;
}

export interface BitnobTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'send' | 'receive' | 'cross_border' | 'stablecoin_transfer' | 'card_payment';
  method: 'lightning' | 'onchain' | 'internal' | 'usdt' | 'cross_border' | 'virtual_card';
  amount: number;
  currency: string;
  fiatAmount?: number;
  fiatCurrency?: string;
  usdtAmount?: number; // USDT amount for stablecoin transactions
  fee: number;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  reference: string;
  description?: string;
  recipientAddress?: string;
  recipientCountry?: string; // For cross-border payments
  senderAddress?: string;
  blockchainTxHash?: string;
  lightningInvoice?: string;
  virtualCardId?: string; // For card payments
  crossBorderReference?: string; // Cross-border payment reference
  createdAt: string;
  confirmedAt?: string;
}

// Bitnob Virtual Card Types
export interface VirtualCard {
  id: string;
  userId: string;
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  cvv: string;
  balance: number;
  currency: string;
  spendingLimit: number;
  status: 'active' | 'suspended' | 'expired' | 'blocked';
  type: 'virtual' | 'physical';
  bitnobCardId: string;
  createdAt: string;
  lastUsedAt?: string;
}

// Cross-border Payment Types
export interface CrossBorderPayment {
  id: string;
  senderId: string;
  recipientId: string;
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  exchangeRate: number;
  fee: number;
  recipientCountry: string;
  recipientPhoneNumber?: string;
  recipientBankAccount?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  bitnobReference: string;
  createdAt: string;
  completedAt?: string;
}

// USDT/Stablecoin Types
export interface StablecoinTransaction {
  id: string;
  walletId: string;
  type: 'mint' | 'burn' | 'transfer';
  amount: number;
  usdtAmount: number;
  exchangeRate: number;
  fee: number;
  recipientAddress?: string;
  blockchainNetwork: 'ethereum' | 'tron' | 'polygon';
  txHash?: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  reference: string;
  createdAt: string;
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
