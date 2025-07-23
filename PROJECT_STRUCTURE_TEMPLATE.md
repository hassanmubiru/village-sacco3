# Blockchain SACCO Platform - Project Structure Template

## Recommended Folder Structure

```
bitnob-sacco-platform/
├── README.md
├── docker-compose.yml
├── .env.example
├── docs/
│   ├── api/
│   ├── architecture/
│   ├── deployment/
│   └── user-guides/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── loans/
│   │   │   ├── transactions/
│   │   │   └── common/
│   │   ├── services/
│   │   ├── store/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── models/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── types/
│   ├── tests/
│   ├── package.json
│   └── tsconfig.json
├── blockchain/
│   ├── contracts/
│   ├── scripts/
│   ├── tests/
│   └── hardhat.config.js
├── mobile/
│   ├── android/
│   ├── ios/
│   ├── src/
│   └── package.json
└── infrastructure/
    ├── terraform/
    ├── kubernetes/
    └── monitoring/
```

## Quick Start Commands

### 1. Frontend Setup (React + Tailwind + Supabase)
```bash
# Create React app with TypeScript
npx create-react-app frontend --template typescript
cd frontend

# Install additional dependencies
npm install @reduxjs/toolkit react-redux
npm install react-router-dom
npm install react-hook-form @hookform/resolvers zod
npm install @headlessui/react @heroicons/react
npm install axios
npm install react-i18next i18next

# Install Supabase client
npm install @supabase/supabase-js

# Install Bitnob SDK (if available) or HTTP client for API
npm install bitnob
# Alternative: npm install axios (for direct API calls)

# Install Tailwind CSS
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

### 2. Backend Setup (Node.js + Express + Supabase)
```bash
# Initialize backend
mkdir backend && cd backend
npm init -y

# Install core dependencies
npm install express cors helmet morgan
npm install jsonwebtoken bcryptjs
npm install axios dotenv
npm install winston

# Install Supabase client
npm install @supabase/supabase-js

# Install Bitnob SDK
npm install bitnob

# Install TypeScript dev dependencies
npm install -D typescript @types/node @types/express
npm install -D nodemon ts-node
npm install -D jest @types/jest supertest @types/supertest
```

### 3. Environment Variables Setup
```bash
# Copy example environment file
cp .env.example .env

# Configure required variables:
# Bitnob Configuration
# BITNOB_API_KEY=your_bitnob_api_key
# BITNOB_ENVIRONMENT=sandbox
# BITNOB_BASE_URL=https://sandboxapi.bitnob.com

# Supabase Configuration
# SUPABASE_URL=https://your-project.supabase.co
# SUPABASE_ANON_KEY=your_supabase_anon_key
# SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
# JWT_SECRET=your_jwt_secret
```

## Development Workflow

### 1. Start Development Environment
```bash
# Start all services with Docker Compose
docker-compose up -d

# Or start individually:
# Frontend
cd frontend && npm start

# Backend
cd backend && npm run dev

# For local Supabase development (optional)
npx supabase start

# Alternative: Use Supabase cloud instance directly
```

### 2. Code Quality Setup
```bash
# Install ESLint and Prettier
npm install -D eslint prettier
npm install -D @typescript-eslint/parser @typescript-eslint/eslint-plugin
npm install -D eslint-config-prettier eslint-plugin-prettier

# Install Husky for git hooks
npm install -D husky lint-staged
npx husky install
```

### 3. Testing Setup
```bash
# Frontend testing
npm install -D @testing-library/react @testing-library/jest-dom
npm install -D @testing-library/user-event

# Backend testing
npm install -D jest @types/jest supertest
npm install -D @types/supertest

# E2E testing
npm install -D cypress
```

## Key Integration Points

### Bitnob SDK Integration
```typescript
// src/services/bitnob.service.ts
import { BitnobClient } from 'bitnob';

export interface BitnobConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseURL?: string;
}

export class BitnobService {
  private client: BitnobClient;
  private config: BitnobConfig;
  
  constructor(config: BitnobConfig) {
    this.config = config;
    this.client = new BitnobClient({
      apiKey: config.apiKey,
      environment: config.environment,
      baseURL: config.baseURL
    });
  }
  
  // Wallet operations
  async createWallet(userData: any) {
    try {
      const response = await this.client.auth.register(userData);
      return response.data;
    } catch (error) {
      throw new Error(`Wallet creation failed: ${error.message}`);
    }
  }

  async getWalletBalance(walletId: string) {
    try {
      const response = await this.client.wallets.getBalance(walletId);
      return response.data;
    } catch (error) {
      throw new Error(`Balance inquiry failed: ${error.message}`);
    }
  }

  // Lightning Network operations
  async sendLightningPayment(paymentData: any) {
    try {
      const response = await this.client.lightning.sendPayment(paymentData);
      return response.data;
    } catch (error) {
      throw new Error(`Lightning payment failed: ${error.message}`);
    }
  }

  async createLightningInvoice(amount: number, memo?: string) {
    try {
      const response = await this.client.lightning.createInvoice({
        amount,
        memo: memo || 'SACCO Platform Payment'
      });
      return response.data;
    } catch (error) {
      throw new Error(`Invoice creation failed: ${error.message}`);
    }
  }

  // Bitcoin operations
  async sendBitcoin(paymentData: any) {
    try {
      const response = await this.client.bitcoin.send(paymentData);
      return response.data;
    } catch (error) {
      throw new Error(`Bitcoin transaction failed: ${error.message}`);
    }
  }

  // KYC operations
  async submitKYC(kycData: any) {
    try {
      const response = await this.client.kyc.submit(kycData);
      return response.data;
    } catch (error) {
      throw new Error(`KYC submission failed: ${error.message}`);
    }
  }

  // Conversion operations
  async convertBTCToFiat(amount: number, currency: string) {
    try {
      const response = await this.client.convert.btcToFiat({
        amount,
        currency
      });
      return response.data;
    } catch (error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
  }
}

// Singleton instance
export const bitnobService = new BitnobService({
  apiKey: process.env.BITNOB_API_KEY!,
  environment: (process.env.BITNOB_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
  baseURL: process.env.BITNOB_BASE_URL
});
```

### Supabase Database Integration
```typescript
// src/services/supabase.service.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL!;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database service class
export class SupabaseService {
  // User operations
  async createUser(userData: any) {
    const { data, error } = await supabase
      .from('users')
      .insert(userData)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Real-time subscriptions
  subscribeToGroupUpdates(groupId: string, callback: (payload: any) => void) {
    return supabase
      .channel(`group-${groupId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'group_members',
        filter: `group_id=eq.${groupId}`
      }, callback)
      .subscribe();
  }
}
```

### Supabase Database Schema
```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core tables for SACCO platform with RLS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  kyc_level INTEGER DEFAULT 1,
  bitnob_wallet_id VARCHAR(255),
  bitnob_user_id VARCHAR(255),
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sacco_groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  group_code VARCHAR(20) UNIQUE NOT NULL,
  max_members INTEGER DEFAULT 50,
  minimum_savings DECIMAL(15,8),
  loan_interest_rate DECIMAL(5,4),
  savings_interest_rate DECIMAL(5,4),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES sacco_groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member',
  joined_at TIMESTAMP DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  savings_balance DECIMAL(15,8) DEFAULT 0,
  UNIQUE(group_id, user_id)
);

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id),
  group_id UUID REFERENCES sacco_groups(id),
  type VARCHAR(20) NOT NULL, -- 'deposit', 'withdrawal', 'loan', 'repayment'
  amount DECIMAL(15,8) NOT NULL,
  currency VARCHAR(10) DEFAULT 'BTC',
  bitnob_tx_id VARCHAR(255),
  blockchain_tx_hash VARCHAR(255),
  status VARCHAR(20) DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP
);

CREATE TABLE loans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  borrower_id UUID REFERENCES users(id),
  group_id UUID REFERENCES sacco_groups(id),
  principal_amount DECIMAL(15,8) NOT NULL,
  interest_rate DECIMAL(5,4),
  duration_months INTEGER,
  status VARCHAR(20) DEFAULT 'pending',
  applied_at TIMESTAMP DEFAULT NOW(),
  disbursed_at TIMESTAMP,
  due_date TIMESTAMP,
  repaid_amount DECIMAL(15,8) DEFAULT 0
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE sacco_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE loans ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Members can view their groups" ON sacco_groups
  FOR SELECT USING (
    id IN (
      SELECT group_id FROM group_members 
      WHERE user_id = auth.uid()::text
    )
  );
```

### React Component Examples with Supabase
```typescript
// src/components/dashboard/SavingsOverview.tsx
import React, { useEffect, useState } from 'react';
import { supabase } from '../../services/supabase.service';

interface SavingsOverviewProps {
  groupId: string;
  userId: string;
}

interface SavingsData {
  btc: number;
  fiat: number;
  currency: string;
}

export const SavingsOverview: React.FC<SavingsOverviewProps> = ({ groupId, userId }) => {
  const [savings, setSavings] = useState<SavingsData>({ btc: 0, fiat: 0, currency: 'KSH' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSavings = async () => {
      try {
        const { data, error } = await supabase
          .from('group_members')
          .select('savings_balance')
          .eq('group_id', groupId)
          .eq('user_id', userId)
          .single();

        if (error) throw error;

        setSavings({
          btc: data.savings_balance,
          fiat: data.savings_balance * 3000000, // Convert BTC to KSH (example rate)
          currency: 'KSH'
        });
      } catch (error) {
        console.error('Error fetching savings:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSavings();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`savings-${userId}`)
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'group_members',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        setSavings(prev => ({
          ...prev,
          btc: payload.new.savings_balance,
          fiat: payload.new.savings_balance * 3000000
        }));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [groupId, userId]);

  const handleDeposit = async () => {
    // Implement deposit functionality with Bitnob
    console.log('Initiating deposit...');
  };
  
  if (loading) {
    return <div className="animate-pulse bg-gray-200 rounded-lg h-48"></div>;
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        My Savings
      </h3>
      <div className="space-y-4">
        <div>
          <p className="text-sm text-gray-600">Total Balance</p>
          <p className="text-2xl font-bold text-green-600">
            ₿ {savings.btc.toFixed(8)}
          </p>
          <p className="text-sm text-gray-500">
            ≈ {savings.currency} {savings.fiat.toLocaleString()}
          </p>
        </div>
        <button 
          onClick={handleDeposit}
          className="w-full bg-primary-600 text-white py-2 rounded-md hover:bg-primary-700 transition-colors"
        >
          Make Deposit
        </button>
      </div>
    </div>
  );
};
```

## Deployment Instructions

### Production Deployment
```bash
# Build frontend
cd frontend && npm run build

# Build backend
cd backend && npm run build

# Deploy with Docker
docker build -t sacco-frontend ./frontend
docker build -t sacco-backend ./backend

# Or use docker-compose for production
docker-compose -f docker-compose.prod.yml up -d
```

### CI/CD Pipeline (GitHub Actions)
```yaml
# .github/workflows/deploy.yml
name: Deploy SACCO Platform

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test
      
  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to production
        run: |
          # Add deployment commands here
```

## Monitoring & Maintenance

### Health Checks
```typescript
// Backend health check endpoint
import { bitnobService } from '../services/bitnob.service';
import { supabase } from '../services/supabase.service';

app.get('/health', async (req, res) => {
  const health = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      supabase: await checkSupabase(),
      bitnob: await checkBitnobAPI(),
      application: 'OK'
    }
  };
  
  res.json(health);
});

async function checkSupabase() {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    return error ? 'ERROR' : 'OK';
  } catch (error) {
    return 'ERROR';
  }
}

async function checkBitnobAPI() {
  try {
    // Test Bitnob connection with a simple API call
    await bitnobService.getWalletBalance('test');
    return 'OK';
  } catch (error) {
    // Expected to fail with test wallet, but connection should work
    return error.message.includes('not found') ? 'OK' : 'ERROR';
  }
}
```

### Logging Setup
```typescript
// winston logger configuration
import winston from 'winston';

export const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});
```

This project structure template provides a solid foundation for implementing the blockchain-powered SACCO platform described in the detailed development prompt.
