# Blockchain-Powered SACCO Platform Development Prompt

## Project Overview: Village Community SACCO Platform

**Vision**: Create a transparent, secure, and accessible digital savings and credit cooperative (SACCO) platform that empowers rural communities through blockchain technology, enabling collaborative financial management with Bitcoin/Lightning Network integration via Bitnob.

---

## Step 1: Project Goals & Vision

### Primary Objectives
- **Financial Inclusion**: Provide underbanked rural communities with access to digital financial services
- **Transparency**: Leverage blockchain immutability for complete transaction transparency
- **Community Empowerment**: Enable self-governed savings and lending groups
- **Security**: Protect community funds through cryptographic security
- **Accessibility**: Mobile-first design for low-bandwidth environments

### Key Outcomes
1. Reduce dependency on traditional banking infrastructure
2. Increase financial literacy through guided interfaces
3. Enable peer-to-peer lending with automated governance
4. Create auditable financial records for community accountability
5. Facilitate Bitcoin adoption in rural areas through Bitnob integration

---

## Step 2: System Requirements & Core Modules

### 2.1 User Registration & Authentication Module
**Features:**
- Progressive KYC (Know Your Customer) process
- Phone number verification via SMS
- Biometric authentication support (fingerprint/face)
- Offline capability for initial registration
- Multi-language support (Swahili, English, French, local dialects)

**Technical Requirements:**
```typescript
// Authentication flow with Supabase integration
interface AuthFlow {
  phoneVerification: string;
  biometricSetup: string;
  kycLevel: string;
  bitnobIntegration: string;
  supabaseAuth: string;
  realtimeSync: string;
}

const authFlow: AuthFlow = {
  phoneVerification: 'SMS OTP via Supabase Auth',
  biometricSetup: 'Optional fingerprint/face ID',
  kycLevel: 'Progressive (Basic → Intermediate → Advanced)',
  bitnobIntegration: 'Wallet creation via Bitnob API',
  supabaseAuth: 'Supabase user management with RLS',
  realtimeSync: 'Real-time profile updates across devices'
} as const;
```

### 2.2 Group Account & Membership Management
**Features:**
- SACCO group creation with customizable rules
- Member invitation system via phone contacts
- Role-based permissions (Admin, Treasurer, Member)
- Group voting mechanisms for major decisions
- Member contribution tracking

**Blockchain Integration:**
- Smart contract for group governance rules
- Multi-signature wallet for group funds
- Transparent member contribution records

### 2.3 Savings & Investment Module
**Features:**
- Individual and group savings accounts
- Automated recurring deposits
- Interest calculation and distribution
- Savings goals and tracking
- Emergency withdrawal protocols

**Bitnob API Integration:**
```typescript
// Savings deposit flow with Supabase
interface SavingsDepositFlow {
  endpoint: string;
  method: string;
  payload: {
    amount: string;
    groupId: string;
    memberId: string;
    recurringSchedule?: string;
  };
  supabaseSync: string;
  realtimeUpdates: string;
}

const savingsDeposit: SavingsDepositFlow = {
  endpoint: '/api/bitnob/deposit',
  method: 'POST',
  payload: {
    amount: 'USD/Local Currency',
    groupId: 'SACCO Group Identifier',
    memberId: 'User Identifier',
    recurringSchedule: 'Optional automation'
  },
  supabaseSync: 'Update balances in Supabase with RLS',
  realtimeUpdates: 'Notify group members via Supabase Real-time'
} as const;
```

### 2.4 Lending & Credit Management
**Features:**
- Loan application with peer review
- Credit scoring based on savings history
- Automated approval workflows
- Flexible repayment schedules
- Collateral management (digital assets)
- Default resolution mechanisms

**Smart Contract Logic:**
- Automated loan disbursement upon approval
- Interest calculation and compounding
- Penalty enforcement for late payments
- Insurance fund contributions

### 2.5 Payment & Settlement System
**Bitnob Lightning Network Integration:**
- Instant micro-payments for daily transactions
- Low-fee cross-border remittances
- Bitcoin savings with fiat gateway
- Merchant payment acceptance

### 2.6 Governance & Voting Module
**Features:**
- Proposal creation and voting
- Quorum requirements
- Transparent decision history
- Emergency governance protocols
- Dispute resolution workflows

---

## Step 3: Technology Stack Architecture

### Frontend Layer
```typescript
// Technology Stack
interface FrontendStack {
  framework: string;
  styling: string;
  stateManagement: string;
  routing: string;
  forms: string;
  ui: string;
  database: string;
  realtime: string;
  auth: string;
  pwa: string;
  i18n: string;
  testing: string;
}

const frontendStack: FrontendStack = {
  framework: 'React 18+ with TypeScript',
  styling: 'Tailwind CSS 3.x',
  stateManagement: 'Redux Toolkit + RTK Query',
  routing: 'React Router v6',
  forms: 'React Hook Form + Zod validation',
  ui: 'Headless UI + Custom components',
  database: 'Supabase Client for database operations',
  realtime: 'Supabase Real-time subscriptions',
  auth: 'Supabase Auth with custom providers',
  pwa: 'Workbox for offline functionality',
  i18n: 'react-i18next',
  testing: 'Jest + React Testing Library'
} as const;
```

### Backend & Blockchain Layer
```typescript
interface BackendStack {
  api: string;
  database: string;
  realtime: string;
  authentication: string;
  blockchain: string;
  encryption: string;
  messaging: string;
  storage: string;
  monitoring: string;
}

const backendStack: BackendStack = {
  api: 'Node.js + Express/Fastify',
  database: 'Supabase (PostgreSQL + Real-time + Auth)',
  realtime: 'Supabase Real-time subscriptions',
  authentication: 'Supabase Auth + Custom JWT for Bitnob',
  blockchain: 'Bitcoin Lightning Network via Bitnob',
  encryption: 'AES-256 + RSA key pairs + Supabase RLS',
  messaging: 'Supabase Real-time for live updates',
  storage: 'Supabase Storage + IPFS for documents',
  monitoring: 'Winston + DataDog + Supabase Analytics'
} as const;
```

### Bitnob API Integration Points
```typescript
interface BitnobEndpoints {
  authentication: string;
  walletCreation: string;
  lightningPayments: string;
  onchainTransactions: string;
  balanceInquiry: string;
  transactionHistory: string;
  kycVerification: string;
  fiatConversion: string;
}

interface SupabaseIntegration {
  database: string;
  realtime: string;
  auth: string;
  storage: string;
  functions: string;
}

const bitnobEndpoints: BitnobEndpoints = {
  authentication: '/auth/login',
  walletCreation: '/wallet/create',
  lightningPayments: '/lightning/pay',
  onchainTransactions: '/bitcoin/send',
  balanceInquiry: '/wallet/balance',
  transactionHistory: '/transactions',
  kycVerification: '/kyc/verify',
  fiatConversion: '/convert/btc-to-fiat'
} as const;

const supabaseServices: SupabaseIntegration = {
  database: 'PostgreSQL with Row Level Security (RLS)',
  realtime: 'Real-time subscriptions for live updates',
  auth: 'Built-in authentication with social providers',
  storage: 'File storage for documents and images',
  functions: 'Edge functions for serverless operations'
} as const;
```

---

## Step 4: UI/UX Design Requirements

### 4.1 Design Principles
- **Mobile-First**: Optimized for smartphones with 4" to 6" screens
- **Low-Bandwidth**: Minimize data usage, progressive image loading
- **Accessibility**: WCAG 2.1 AA compliance, screen reader support
- **Intuitive Navigation**: Maximum 3 taps to reach any feature
- **Cultural Sensitivity**: Appropriate colors, symbols, and layouts

### 4.2 Core React Components Structure
```typescript
// Component hierarchy
src/
├── components/
│   ├── auth/
│   │   ├── RegistrationForm.tsx
│   │   ├── LoginForm.tsx
│   │   └── KYCWizard.tsx
│   ├── dashboard/
│   │   ├── GroupDashboard.tsx
│   │   ├── SavingsOverview.tsx
│   │   └── LoanStatus.tsx
│   ├── transactions/
│   │   ├── DepositForm.tsx
│   │   ├── WithdrawalForm.tsx
│   │   └── TransactionHistory.tsx
│   ├── loans/
│   │   ├── LoanApplication.tsx
│   │   ├── LoanApproval.tsx
│   │   └── RepaymentSchedule.tsx
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Modal.tsx
│   │   └── LoadingSpinner.tsx
│   └── types/
│       ├── auth.types.ts
│       ├── group.types.ts
│       ├── transaction.types.ts
│       └── loan.types.ts
```

### 4.3 TypeScript Type Definitions
```typescript
// types/auth.types.ts
export interface User {
  id: string;
  phoneNumber: string;
  fullName: string;
  email?: string;
  kycLevel: 1 | 2 | 3;
  isVerified: boolean;
  bitnobWalletId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginRequest {
  phoneNumber: string;
  password: string;
}

export interface RegistrationRequest {
  phoneNumber: string;
  fullName: string;
  email?: string;
  password: string;
  countryCode?: string;
}

// types/group.types.ts
export interface SACCOGroup {
  id: string;
  name: string;
  description: string;
  groupCode: string;
  maxMembers: number;
  currentMembers: number;
  minimumSavingsAmount: number;
  loanInterestRate: number;
  savingsInterestRate: number;
  meetingFrequency: 'weekly' | 'monthly' | 'quarterly';
  status: 'active' | 'inactive' | 'suspended';
  createdBy: string;
  location?: {
    latitude: number;
    longitude: number;
    address: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: 'admin' | 'treasurer' | 'member';
  position?: string;
  joinedAt: string;
  isActive: boolean;
  savingsBalance: number;
  totalContributed: number;
}

// types/transaction.types.ts
export interface Transaction {
  id: string;
  userId: string;
  groupId: string;
  type: 'deposit' | 'withdrawal' | 'loan' | 'repayment' | 'interest';
  subtype?: string;
  amount: number;
  currency: 'BTC' | 'USD' | 'KES' | 'NGN';
  fiatAmount?: number;
  fiatCurrency?: string;
  exchangeRate?: number;
  description: string;
  referenceId?: string;
  bitnobTransactionId?: string;
  blockchainTxHash?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  metadata?: Record<string, any>;
  createdAt: string;
  processedAt?: string;
  confirmedAt?: string;
}

// types/loan.types.ts
export interface Loan {
  id: string;
  borrowerId: string;
  groupId: string;
  applicationId: string;
  principalAmount: number;
  interestRate: number;
  durationMonths: number;
  monthlyPayment: number;
  totalAmount: number;
  purpose: string;
  collateralDescription?: string;
  guarantors?: string[];
  status: 'pending' | 'approved' | 'disbursed' | 'active' | 'completed' | 'defaulted' | 'rejected';
  appliedAt: string;
  approvedAt?: string;
  disbursedAt?: string;
  dueDate?: string;
  repaidAmount: number;
  lateFees: number;
  isFullyPaid: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### 4.4 Tailwind CSS Design System
```css
/* Custom Tailwind configuration */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1'
        },
        accent: {
          500: '#10b981',
          600: '#059669'
        },
        warning: {
          500: '#f59e0b',
          600: '#d97706'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem'
      }
    }
  }
}
```

### 4.5 Key Screen Designs

#### Registration Screen
```tsx
// RegistrationForm.tsx
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

// Type definitions
interface RegistrationFormData {
  phoneNumber: string;
  fullName: string;
  email: string;
  password: string;
}

const registrationSchema = z.object({
  phoneNumber: z.string().regex(/^\+\d{10,15}$/, 'Please enter a valid phone number'),
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
});

const RegistrationForm: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isValid }
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationSchema),
    mode: 'onChange'
  });

  const onSubmit = async (data: RegistrationFormData): Promise<void> => {
    setIsLoading(true);
    try {
      // Submit registration data
      console.log('Registration data:', data);
    } catch (error) {
      console.error('Registration failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-4">
      <div className="max-w-md mx-auto pt-8">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Join Your Community SACCO
          </h1>
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              <input 
                type="tel"
                {...register('phoneNumber')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                placeholder="+254 7XX XXX XXX"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.phoneNumber.message}</p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input 
                type="text"
                {...register('fullName')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
              )}
            </div>
            
            <button 
              type="submit"
              disabled={!isValid || isLoading}
              className="w-full bg-primary-600 text-white py-3 rounded-md font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;
```

#### Group Dashboard
```tsx
// GroupDashboard.tsx
import React from 'react';
import { WalletIcon, CreditCardIcon, UsersIcon } from '@heroicons/react/24/outline';

// Type definitions
interface SACCOGroup {
  id: string;
  name: string;
  totalSavings: {
    btc: number;
    fiat: number;
    currency: string;
  };
  activeLoans: {
    count: number;
    totalAmount: number;
  };
  members: {
    total: number;
    pending: number;
  };
}

interface GroupDashboardProps {
  group: SACCOGroup;
}

const GroupDashboard: React.FC<GroupDashboardProps> = ({ group }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-gray-900">
            {group.name}
          </h1>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <WalletIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Savings</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₿ {group.totalSavings.btc.toFixed(6)}
                </p>
                <p className="text-sm text-gray-500">
                  ≈ {group.totalSavings.currency} {group.totalSavings.fiat.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <CreditCardIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Loans</p>
                <p className="text-2xl font-bold text-gray-900">{group.activeLoans.count}</p>
                <p className="text-sm text-gray-500">
                  ₿ {group.activeLoans.totalAmount.toFixed(6)} total
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-6 shadow">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <UsersIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Members</p>
                <p className="text-2xl font-bold text-gray-900">{group.members.total}</p>
                <p className="text-sm text-gray-500">{group.members.pending} pending</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GroupDashboard;
```

---

## Step 5: Blockchain Integration & Bitnob API Implementation

### 5.1 Transaction Flow Architecture
```typescript
// Transaction processing workflow with Supabase
interface TransactionFlow {
  userAction: string;
  validation: string;
  supabaseRecord: string;
  bitnobAPI: string;
  blockchainRecord: string;
  realtimeNotification: string;
  reconciliation: string;
}

const transactionFlow: TransactionFlow = {
  userAction: 'Deposit/Withdraw/Loan/Repayment',
  validation: 'Client-side + Server-side + Supabase RLS validation',
  supabaseRecord: 'Create pending transaction in Supabase',
  bitnobAPI: 'Payment processing via Lightning/On-chain',
  blockchainRecord: 'Immutable transaction logging',
  realtimeNotification: 'Real-time updates via Supabase channels',
  reconciliation: 'Balance updates across Supabase and external systems'
} as const;
```

### 5.2 Supabase Database Integration
```typescript
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey?: string;
}

interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<User>;
      };
      sacco_groups: {
        Row: SACCOGroup;
        Insert: Omit<SACCOGroup, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<SACCOGroup>;
      };
      transactions: {
        Row: Transaction;
        Insert: Omit<Transaction, 'id' | 'createdAt'>;
        Update: Partial<Transaction>;
      };
      loans: {
        Row: Loan;
        Insert: Omit<Loan, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Loan>;
      };
    };
  };
}

class SupabaseService {
  private supabase;

  constructor(config: SupabaseConfig) {
    this.supabase = createClient<Database>(config.url, config.anonKey);
  }

  // User operations
  async createUser(userData: Database['public']['Tables']['users']['Insert']) {
    const { data, error } = await this.supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getUserByPhone(phoneNumber: string) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('phone_number', phoneNumber)
      .single();
    
    if (error && error.code !== 'PGRST116') throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToGroupUpdates(groupId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`group-${groupId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'group_members',
          filter: `group_id=eq.${groupId}`
        },
        callback
      )
      .subscribe();
  }

  subscribeToTransactions(userId: string, callback: (payload: any) => void) {
    return this.supabase
      .channel(`user-transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        callback
      )
      .subscribe();
  }

  // Group operations with RLS
  async createGroup(groupData: Database['public']['Tables']['sacco_groups']['Insert']) {
    const { data, error } = await this.supabase
      .from('sacco_groups')
      .insert(groupData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async joinGroup(groupId: string, userId: string, role: string = 'member') {
    const { data, error } = await this.supabase
      .from('group_members')
      .insert({
        group_id: groupId,
        user_id: userId,
        role
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Transaction operations
  async createTransaction(txData: Database['public']['Tables']['transactions']['Insert']) {
    const { data, error } = await this.supabase
      .from('transactions')
      .insert(txData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async getGroupTransactions(groupId: string) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        users:user_id (
          full_name,
          phone_number
        )
      `)
      .eq('group_id', groupId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  // Authentication integration
  async signUp(email: string, password: string, metadata?: any) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });
    
    if (error) throw error;
    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  // Get current user session
  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser();
    if (error) throw error;
    return user;
  }

  // File storage operations
  async uploadDocument(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file);
    
    if (error) throw error;
    return data;
  }

  async getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}

export { SupabaseService, type SupabaseConfig, type Database };
```

### 5.3 Bitnob Integration Service
```typescript
// BitnobService.ts
interface BitnobConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseURL: string;
}

interface CreateWalletRequest {
  userId: string;
  currency?: string;
  type?: 'lightning' | 'onchain';
}

interface CreateWalletResponse {
  success: boolean;
  data: {
    walletId: string;
    address: string;
    lightningAddress?: string;
  };
}

interface PaymentRequest {
  amount: number; // Amount in satoshis
  recipientId: string;
  groupId: string;
  purpose: string;
}

interface PaymentResponse {
  success: boolean;
  data: {
    paymentHash: string;
    txId: string;
    amount: number;
    fee: number;
    status: 'pending' | 'completed' | 'failed';
  };
}

interface TransactionRecord {
  txId: string;
  amount: number;
  groupId: string;
  purpose: string;
  timestamp: number;
}

class BitnobService {
  private apiKey: string;
  private baseURL: string;
  private environment: 'sandbox' | 'production';

  constructor(config: BitnobConfig) {
    this.apiKey = config.apiKey;
    this.baseURL = config.baseURL;
    this.environment = config.environment;
  }
  
  async createWallet(request: CreateWalletRequest): Promise<CreateWalletResponse> {
    try {
      const response = await fetch(`${this.baseURL}/wallet/create`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: request.userId,
          currency: request.currency || 'BTC',
          type: request.type || 'lightning'
        })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Wallet creation failed:', error);
      throw new Error('Failed to create wallet');
    }
  }
  
  async processPayment(paymentData: PaymentRequest): Promise<PaymentResponse> {
    const { amount, recipientId, groupId, purpose } = paymentData;
    
    try {
      // Lightning payment for instant settlement
      const response = await fetch(`${this.baseURL}/lightning/pay`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          amount: amount * 100000000, // Convert to satoshis
          recipient: recipientId,
          memo: `SACCO ${purpose} - Group: ${groupId}`
        })
      });
      
      if (!response.ok) {
        throw new Error(`Payment failed: ${response.status}`);
      }
      
      const result: PaymentResponse = await response.json();
      
      // Record on blockchain for transparency
      await this.recordTransaction({
        txId: result.data.paymentHash,
        amount,
        groupId,
        purpose,
        timestamp: Date.now()
      });
      
      return result;
    } catch (error) {
      console.error('Payment processing failed:', error);
      throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async recordTransaction(txData: TransactionRecord): Promise<void> {
    try {
      // Store transaction metadata on IPFS
      // Update group ledger on blockchain
      // Trigger smart contract events
      console.log('Recording transaction:', txData);
    } catch (error) {
      console.error('Transaction recording failed:', error);
      throw new Error('Failed to record transaction');
    }
  }

  async getWalletBalance(walletId: string): Promise<{ btc: number; fiat: number; currency: string }> {
    try {
      const response = await fetch(`${this.baseURL}/wallet/${walletId}/balance`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        }
      });
      
      if (!response.ok) {
        throw new Error(`Balance inquiry failed: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Balance inquiry failed:', error);
      throw new Error('Failed to get wallet balance');
    }
  }
}

export { BitnobService, type BitnobConfig, type PaymentRequest, type PaymentResponse };
```

### 5.3 Smart Contract Logic (Pseudocode)
```solidity
// SACCO Group Contract (Conceptual)
contract SACCOGroup {
    struct Member {
        address walletAddress;
        uint256 totalSavings;
        uint256 activeLoans;
        bool isActive;
        uint256 joinDate;
    }
    
    struct Loan {
        address borrower;
        uint256 amount;
        uint256 interestRate;
        uint256 duration;
        uint256 disbursementDate;
        bool isActive;
    }
    
    mapping(address => Member) public members;
    mapping(uint256 => Loan) public loans;
    
    event DepositMade(address member, uint256 amount);
    event LoanRequested(address borrower, uint256 amount);
    event LoanApproved(uint256 loanId, address borrower);
    
    function depositSavings(uint256 amount) external {
        // Validate member
        // Update savings balance
        // Emit deposit event
    }
    
    function requestLoan(uint256 amount, uint256 duration) external {
        // Check eligibility
        // Create loan request
        // Trigger approval workflow
    }
}
```

---

## Step 6: Security, Compliance & Risk Management

### 6.1 Security Measures
```typescript
// Security protocols configuration
interface SecurityConfig {
  authentication: {
    multiFactorAuth: string;
    sessionManagement: string;
    bruteForceProtection: string;
  };
  dataProtection: {
    encryption: string;
    transmission: string;
    keyManagement: string;
  };
  walletSecurity: {
    multiSignature: string;
    coldStorage: string;
    emergencyFreeze: string;
  };
}

const securityProtocols: SecurityConfig = {
  authentication: {
    multiFactorAuth: 'SMS + Biometric',
    sessionManagement: 'JWT with short expiry + refresh tokens',
    bruteForceProtection: 'Rate limiting + account lockouts'
  },
  dataProtection: {
    encryption: 'AES-256 for data at rest',
    transmission: 'TLS 1.3 for data in transit',
    keyManagement: 'Hardware Security Modules (HSM)'
  },
  walletSecurity: {
    multiSignature: 'Require multiple approvals for large transactions',
    coldStorage: 'Majority funds in offline wallets',
    emergencyFreeze: 'Circuit breakers for suspicious activity'
  }
} as const;
```

### 6.2 KYC/AML Compliance
```typescript
// KYC Implementation
interface KYCLevel {
  requirements: string[];
  limits: {
    daily: number;
    monthly: number;
  };
  features: string[];
}

interface KYCLevels {
  basic: KYCLevel;
  intermediate: KYCLevel;
  advanced: KYCLevel;
}

const kycLevels: KYCLevels = {
  basic: {
    requirements: ['Phone verification', 'Name', 'Location'],
    limits: { daily: 100, monthly: 1000 }, // USD
    features: ['Savings', 'Small loans']
  },
  intermediate: {
    requirements: ['Government ID', 'Address proof', 'Selfie verification'],
    limits: { daily: 500, monthly: 5000 },
    features: ['All basic + Larger loans', 'Group admin']
  },
  advanced: {
    requirements: ['Bank statement', 'Income proof', 'Reference contacts'],
    limits: { daily: 2000, monthly: 20000 },
    features: ['All intermediate + Cross-border', 'Merchant services']
  }
} as const;
```

### 6.3 Risk Management
- **Credit Risk**: Implement peer-review loan approval system
- **Liquidity Risk**: Maintain emergency reserves (20% of total deposits)
- **Operational Risk**: Multi-signature controls, backup systems
- **Market Risk**: Bitcoin volatility protection through fiat gateways
- **Regulatory Risk**: Compliance monitoring and reporting tools

---

## Step 7: Implementation Roadmap

### Phase 1: Foundation (Weeks 1-4)
```typescript
const phase1Tasks: string[] = [
  'Setup development environment with TypeScript',
  'Configure Supabase project with database schema and RLS policies',
  'Implement Supabase Auth integration with phone verification',
  'Create core React components with TypeScript and Supabase client',
  'Integrate Bitnob sandbox API with proper typing',
  'Setup Supabase real-time subscriptions for live updates',
  'Build user registration flow with Supabase Auth and form validation'
];
```

### Phase 2: Core Features (Weeks 5-8)
```typescript
const phase2Tasks: string[] = [
  'Implement group creation and management with Supabase RLS',
  'Build savings deposit/withdrawal system with real-time updates',
  'Create loan application workflow with Supabase triggers',
  'Develop admin dashboard with Supabase analytics',
  'Add real-time notifications using Supabase channels',
  'Implement basic reporting with Supabase queries and views'
];
```

### Phase 3: Advanced Features (Weeks 9-12)
```typescript
const phase3Tasks: string[] = [
  'Add governance and voting mechanisms with type safety',
  'Implement automated loan approvals with business logic typing',
  'Build comprehensive analytics with typed metrics',
  'Add multi-language support with i18next typing',
  'Integrate advanced security features with proper interfaces',
  'Conduct security audits and penetration testing'
];
```

### Phase 4: Deployment & Optimization (Weeks 13-16)
```typescript
const phase4Tasks: string[] = [
  'Production deployment setup with environment typing',
  'Performance optimization and bundle analysis',
  'User training materials and documentation',
  'Pilot testing with target communities',
  'Bug fixes and refinements based on feedback',
  'Go-live preparation and monitoring setup'
];
```

---

## Step 8: Development Team Instructions

### For Frontend Developers:
1. **Setup React Environment**: Initialize with TypeScript, configure Tailwind CSS, setup PWA capabilities
2. **Component Development**: Follow atomic design principles, ensure mobile-first responsive design
3. **State Management**: Implement Redux Toolkit for global state, use React Query for server state
4. **Accessibility**: Ensure WCAG 2.1 AA compliance, test with screen readers
5. **Performance**: Implement code splitting, lazy loading, and optimize bundle size

### For Backend Developers:
1. **API Design**: Create RESTful APIs with OpenAPI documentation
2. **Database Design**: Implement normalized schema with proper indexing
3. **Bitnob Integration**: Build robust error handling and retry mechanisms
4. **Security**: Implement comprehensive input validation and rate limiting
5. **Monitoring**: Setup logging, metrics, and alerting systems

### For Blockchain Developers:
1. **Smart Contracts**: Design upgradeable contracts with proper governance
2. **Integration**: Build reliable bridges between traditional and blockchain systems
3. **Testing**: Comprehensive unit and integration testing on testnets
4. **Security**: Conduct thorough security audits and penetration testing

---

## Step 9: Testing & Quality Assurance

### Testing Strategy
```typescript
interface TestingConfig {
  unit: string;
  integration: string;
  api: string;
  performance: string;
  security: string;
  usability: string;
  blockchain: string;
}

const testingApproach: TestingConfig = {
  unit: 'Jest + React Testing Library for TypeScript components',
  integration: 'Cypress with TypeScript for end-to-end user workflows',
  api: 'Postman/Newman with TypeScript schemas for API testing',
  performance: 'Lighthouse + WebPageTest for optimization metrics',
  security: 'OWASP ZAP + manual penetration testing',
  usability: 'User testing with target demographic',
  blockchain: 'Testnet deployment and transaction testing'
} as const;
```

### Test Scenarios
1. **User Registration & KYC**: Complete onboarding flow
2. **Group Formation**: Create and manage SACCO groups
3. **Financial Transactions**: Deposits, withdrawals, loans, repayments
4. **Governance**: Voting on proposals and member decisions
5. **Emergency Scenarios**: Account recovery, dispute resolution
6. **Performance Under Load**: High transaction volume testing

---

## Step 10: Deployment & Monitoring

### Infrastructure Requirements
```yaml
# Docker Compose Configuration with Supabase
version: '3.8'
services:
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=https://api.sacco.platform
      - REACT_APP_BITNOB_ENV=production
      - REACT_APP_SUPABASE_URL=${SUPABASE_URL}
      - REACT_APP_SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
  
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - SUPABASE_URL=${SUPABASE_URL}
      - SUPABASE_SERVICE_ROLE_KEY=${SUPABASE_SERVICE_ROLE_KEY}
      - BITNOB_API_KEY=${BITNOB_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
  
  # Optional: Local Supabase for development
  supabase-db:
    image: supabase/postgres:15.1.0.147
    environment:
      - POSTGRES_PASSWORD=your-super-secret-and-long-postgres-password
      - POSTGRES_DB=postgres
    volumes:
      - supabase_db_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  supabase-studio:
    image: supabase/studio:20240326-5e5586d
    environment:
      - SUPABASE_URL=http://localhost:8000
      - SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
    ports:
      - "3001:3000"
    depends_on:
      - supabase-db

volumes:
  supabase_db_data:
```

### Environment Variables for Supabase
```bash
# Supabase Configuration
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# For local development
SUPABASE_LOCAL_URL=http://localhost:8000
SUPABASE_LOCAL_ANON_KEY=your-local-anon-key
```

### Monitoring & Analytics
```typescript
interface MonitoringTools {
  applicationPerformance: string;
  errorTracking: string;
  userAnalytics: string;
  businessMetrics: string;
  uptimeMonitoring: string;
  logAggregation: string;
}

const monitoringTools: MonitoringTools = {
  applicationPerformance: 'New Relic / DataDog with TypeScript APM',
  errorTracking: 'Sentry for real-time error monitoring with source maps',
  userAnalytics: 'Mixpanel for user behavior tracking with typed events',
  businessMetrics: 'Custom dashboard for SACCO KPIs with TypeScript',
  uptimeMonitoring: 'Pingdom / UptimeRobot for service availability',
  logAggregation: 'ELK Stack (Elasticsearch, Logstash, Kibana) with structured logging'
} as const;
```

---

## Final Design Blueprint

### System Architecture Overview
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Mobile App    │    │   Web Frontend  │    │  Admin Portal   │
│   (React PWA)   │    │   (React SPA)   │    │   (React App)   │
│  + Supabase JS  │    │  + Supabase JS  │    │  + Supabase JS  │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                         ┌───────┴───────┐
                         │   API Gateway │
                         │  (Rate Limit,  │
                         │   Auth, etc.)  │
                         └───────┬───────┘
                                 │
              ┌──────────────────┼──────────────────┐
              │                  │                  │
      ┌───────┴───────┐  ┌───────┴───────┐  ┌───────┴───────┐
      │   User API    │  │  Payments API │  │  Analytics    │
      │   Service     │  │   Service     │  │   Service     │
      └───────┬───────┘  └───────┬───────┘  └───────┬───────┘
              │                  │                  │
              │          ┌───────┴───────┐          │
              │          │  Bitnob API   │          │
              │          │  Integration  │          │
              │          └───────────────┘          │
              │                                     │
      ┌───────┴─────────────────────────────────────┴───────┐
      │                Supabase Layer                       │
      │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
      │  │ PostgreSQL  │  │  Real-time  │  │   Storage   │ │
      │  │ Database +  │  │ Channels +  │  │ + Edge      │ │
      │  │    Auth     │  │ Functions   │  │ Functions   │ │
      │  └─────────────┘  └─────────────┘  └─────────────┘ │
      └─────────────────────────────────────────────────────┘
                                 │
                         ┌───────┴───────┐
                         │   Blockchain  │
                         │   & IPFS      │
                         │   Storage     │
                         └───────────────┘
```

### Key API Flows
```typescript
// API Flow interfaces
interface APIFlow {
  [key: string]: string;
}

// User Registration Flow with Supabase
const registrationFlow: APIFlow = {
  step1: 'POST /auth/register → Create Supabase user with phone verification',
  step2: 'POST /auth/verify-otp → Confirm OTP via Supabase Auth',
  step3: 'POST /bitnob/wallet/create → Create Bitcoin wallet',
  step4: 'INSERT into Supabase users table → Complete profile with RLS',
  step5: 'GET /groups/nearby → Show available SACCOs via Supabase query'
};

// Loan Application Flow with Supabase Real-time
const loanFlow: APIFlow = {
  step1: 'INSERT into loans table → Submit application via Supabase',
  step2: 'Supabase function → Check credit score and eligibility',
  step3: 'INSERT into governance_proposals → Create approval proposal',
  step4: 'Real-time subscription → Members vote via Supabase channels',
  step5: 'POST /bitnob/lightning/pay → Disburse funds upon approval',
  step6: 'UPDATE loan status → Record completion in Supabase with RLS'
};

// Savings Deposit Flow with Real-time Updates
const savingsFlow: APIFlow = {
  step1: 'INSERT into transactions → Initiate deposit in Supabase',
  step2: 'POST /bitnob/lightning/invoice → Generate payment invoice',
  step3: 'UPDATE transaction status → Confirm payment in Supabase',
  step4: 'Supabase trigger → Auto-update group balance',
  step5: 'Real-time channel → Notify all group members instantly'
};
```

### Deployment Checklist
- [ ] Domain setup and SSL certificates
- [ ] Supabase project setup and configuration
- [ ] Database schema deployment with migrations
- [ ] Row Level Security (RLS) policies configuration
- [ ] Supabase Auth providers setup (phone, email, social)
- [ ] Environment variables configuration (Supabase keys)
- [ ] Bitnob API keys and webhook setup
- [ ] CDN configuration for static assets
- [ ] Supabase Edge Functions deployment
- [ ] Real-time channel setup and testing
- [ ] Monitoring and alerting setup (Supabase + external)
- [ ] Backup and disaster recovery procedures
- [ ] Security scanning and penetration testing
- [ ] User acceptance testing with pilot groups
- [ ] Documentation and training materials
- [ ] Legal compliance verification
- [ ] Launch communication strategy

### Supabase-Specific Configuration

#### Row Level Security (RLS) Policies
```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- Users can only see their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

-- Group members can see their group's data
CREATE POLICY "Members can view their groups" ON sacco_groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()::text
    )
  );

-- Transaction visibility based on group membership
CREATE POLICY "Members can view group transactions" ON transactions
  FOR SELECT USING (
    group_id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()::text
    )
  );
```

#### Real-time Channel Setup
```typescript
// Group activity channel
supabase
  .channel('group-activity')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'transactions'
  }, (payload) => {
    // Handle real-time transaction updates
    updateGroupBalance(payload.new);
  })
  .subscribe();

// Loan approval channel
supabase
  .channel('loan-approvals')
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'loans',
    filter: 'status=eq.approved'
  }, (payload) => {
    // Handle loan approval notifications
    notifyBorrower(payload.new);
  })
  .subscribe();
```

---

## Success Metrics & KPIs

### Technical Metrics
- **Uptime**: 99.9% availability target
- **Response Time**: <2 seconds for all API calls
- **Transaction Success Rate**: >99.5%
- **Mobile Performance**: Lighthouse score >90

### Business Metrics
- **User Adoption**: 1000+ registered users in first 6 months
- **Transaction Volume**: $100k+ processed monthly
- **Group Formation**: 50+ active SACCO groups
- **Loan Performance**: <5% default rate

### Community Impact
- **Financial Inclusion**: Track users' first-time access to formal financial services
- **Savings Growth**: Monitor increase in community savings rates
- **Education**: Measure completion of financial literacy modules
- **Economic Activity**: Track business loans and their impact on local economy

---

## Risk Mitigation Strategies

1. **Technical Risks**: Comprehensive testing, redundant systems, gradual rollout
2. **Regulatory Risks**: Legal compliance review, government partnerships
3. **Adoption Risks**: Community education, local champion programs
4. **Financial Risks**: Insurance coverage, reserve funds, conservative loan-to-deposit ratios
5. **Security Risks**: Regular audits, bug bounty programs, incident response plans

This comprehensive prompt provides a detailed roadmap for developing a blockchain-powered SACCO platform that leverages Bitnob's infrastructure while prioritizing the needs of rural communities. The technical specifications, implementation guidelines, and success metrics ensure a practical and impactful solution.
