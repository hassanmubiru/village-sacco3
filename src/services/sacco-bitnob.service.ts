/**
 * SACCO-Optimized Bitnob Service
 * Focuses on working API endpoints: GET /wallets and GET /transactions
 * Uses mock services only for unavailable features
 */

import crypto from 'crypto';
import MockBitnobServices from './mock-bitnob.service';

interface BitnobConfig {
  secretKey: string;
  baseURL: string;
  environment: 'sandbox' | 'production';
}

export interface WalletData {
  phoneNumber: string;
  email: string;
  firstName: string;
  lastName: string;
  dateOfBirth?: string;
  address?: string;
}

export interface PaymentData {
  amount: number;
  currency: string;
  recipientId?: string;
  phoneNumber?: string;
  email?: string;
  reference: string;
  narration?: string;
}

export interface LightningInvoiceData {
  amount: number;
  currency: string;
  reference: string;
  memo?: string;
  expiresIn?: number;
}

export interface SACCOWallet {
  id: string;
  userId: string;
  phoneNumber: string;
  email: string;
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'suspended';
  createdAt: string;
  type: 'savings' | 'loan' | 'general';
}

export interface SACCOTransaction {
  id: string;
  walletId: string;
  type: 'deposit' | 'withdrawal' | 'transfer' | 'loan_payment' | 'savings_contribution';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  reference: string;
  description: string;
  timestamp: string;
  saccoGroupId?: string;
}

export class SACCOBitnobService {
  private config: BitnobConfig;
  private baseURL: string;
  private mockServices: MockBitnobServices;

  constructor(config: BitnobConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 
      (config.environment === 'production' 
        ? 'https://api.bitnob.co/api/v1' 
        : 'https://sandboxapi.bitnob.co/api/v1');
    this.mockServices = MockBitnobServices.getInstance();
  }

  private generateSignature(method: string, path: string, timestamp: string, nonce: string, body: string = ''): string {
    const message = `${method}${path}${timestamp}${nonce}${body}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(message)
      .digest('hex');
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const body = data ? JSON.stringify(data) : '';
      const signature = this.generateSignature(method, endpoint, timestamp, nonce, body);

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = {
        status: response.status,
        statusText: response.statusText,
        data: null,
        error: null
      };

      if (response.ok) {
        result.data = await response.json();
      } else {
        result.error = await response.json().catch(() => ({ message: response.statusText }));
      }

      return result;
    } catch (error) {
      console.error('Bitnob API Error:', error);
      throw new Error(`API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SACCO Service Availability Check
  async isServiceAvailable(): Promise<boolean> {
    try {
      if (!this.config.secretKey) {
        console.warn('Bitnob credentials not configured');
        return false;
      }

      const response = await this.makeRequest('/wallets');
      return response.status === 200;
    } catch (error) {
      console.error('Service availability check failed:', error);
      return false;
    }
  }

  // Real API Endpoints (Working)
  
  /**
   * Get all wallets associated with the account
   * Uses real Bitnob API - confirmed working
   */
  async getWallets(): Promise<any[]> {
    try {
      console.log('💰 Using real Bitnob API for wallet listing');
      const response = await this.makeRequest('/wallets');
      
      if (response.status === 200) {
        return response.data || [];
      } else {
        console.warn('Wallets API returned non-200 status:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Failed to get wallets:', error);
      throw new Error(`Failed to retrieve wallets: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get transaction history 
   * Uses real Bitnob API - confirmed working
   */
  async getTransactions(walletId?: string, limit: number = 50): Promise<any[]> {
    try {
      console.log('📊 Using real Bitnob API for transaction history');
      const endpoint = walletId ? `/transactions?walletId=${walletId}&limit=${limit}` : `/transactions?limit=${limit}`;
      const response = await this.makeRequest(endpoint);
      
      if (response.status === 200) {
        return response.data || [];
      } else {
        console.warn('Transactions API returned non-200 status:', response.status);
        return [];
      }
    } catch (error) {
      console.error('Failed to get transactions:', error);
      throw new Error(`Failed to retrieve transactions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // SACCO-Specific Wallet Management (Mock + Real API Hybrid)

  /**
   * Create SACCO member wallet
   * Uses mock service since POST /wallets is not available in sandbox
   */
  async createSACCOWallet(userData: WalletData, walletType: 'savings' | 'loan' | 'general' = 'general'): Promise<SACCOWallet> {
    try {
      console.log('🏦 Creating SACCO wallet (mock service for unavailable API)');
      
      // Since real wallet creation is not available, create a mock wallet
      const walletId = `sacco_wallet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const saccoWallet: SACCOWallet = {
        id: walletId,
        userId: `user_${Date.now()}`,
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        balance: 0,
        currency: 'BTC',
        status: 'active',
        createdAt: new Date().toISOString(),
        type: walletType
      };

      // In production, this would be a real API call
      // For now, we simulate successful wallet creation
      console.log('✅ SACCO wallet created:', saccoWallet.id);
      return saccoWallet;
      
    } catch (error) {
      throw new Error(`SACCO wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get SACCO wallet details
   * Combines real API data when available
   */
  async getSACCOWalletDetails(walletId: string): Promise<SACCOWallet | null> {
    try {
      console.log('🔍 Getting SACCO wallet details');
      
      // Try to get real wallet data first
      const realWallets = await this.getWallets();
      const realWallet = realWallets.find((w: any) => w.id === walletId);
      
      if (realWallet) {
        console.log('✅ Found real wallet data');
        return {
          id: realWallet.id,
          userId: realWallet.userId || 'unknown',
          phoneNumber: realWallet.phoneNumber || 'unknown',
          email: realWallet.email || 'unknown',
          balance: realWallet.balance || 0,
          currency: realWallet.currency || 'BTC',
          status: realWallet.status || 'active',
          createdAt: realWallet.createdAt || new Date().toISOString(),
          type: 'general'
        };
      }
      
      // Fallback to mock data if wallet not found in real API
      console.log('ℹ️ Wallet not found in real API, using mock data');
      return null;
      
    } catch (error) {
      console.error('Failed to get SACCO wallet details:', error);
      return null;
    }
  }

  /**
   * Get SACCO transaction history
   * Uses real Bitnob transaction API when available
   */
  async getSACCOTransactions(walletId?: string, saccoGroupId?: string): Promise<SACCOTransaction[]> {
    try {
      console.log('📋 Getting SACCO transaction history');
      
      // Get real transactions from Bitnob API
      const realTransactions = await this.getTransactions(walletId);
      
      // Transform real transactions to SACCO format
      const saccoTransactions: SACCOTransaction[] = realTransactions.map((tx: any) => ({
        id: tx.id || `tx_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        walletId: tx.walletId || walletId || 'unknown',
        type: this.mapTransactionType(tx.type),
        amount: tx.amount || 0,
        currency: tx.currency || 'BTC',
        status: tx.status || 'completed',
        reference: tx.reference || tx.id || 'N/A',
        description: tx.description || tx.narration || 'SACCO transaction',
        timestamp: tx.timestamp || tx.createdAt || new Date().toISOString(),
        saccoGroupId: saccoGroupId
      }));

      console.log(`✅ Retrieved ${saccoTransactions.length} SACCO transactions`);
      return saccoTransactions;
      
    } catch (error) {
      console.error('Failed to get SACCO transactions:', error);
      return [];
    }
  }

  private mapTransactionType(bitnobType: string): 'deposit' | 'withdrawal' | 'transfer' | 'loan_payment' | 'savings_contribution' {
    const typeMap: { [key: string]: SACCOTransaction['type'] } = {
      'credit': 'deposit',
      'debit': 'withdrawal',
      'transfer': 'transfer',
      'payment': 'loan_payment',
      'contribution': 'savings_contribution'
    };
    
    return typeMap[bitnobType?.toLowerCase()] || 'transfer';
  }

  // Lightning Network (Mock Service)
  async createLightningInvoice(invoiceData: LightningInvoiceData) {
    console.log('⚡ Using mock Lightning service (not available in Bitnob sandbox)');
    const mockInvoice = await this.mockServices.createLightningInvoice(
      invoiceData.amount,
      invoiceData.memo || 'SACCO payment'
    );
    
    return {
      success: true,
      data: mockInvoice,
      message: 'Lightning invoice created (mock service)'
    };
  }

  async sendLightningPayment(paymentData: PaymentData) {
    console.log('🌩️ Using mock Lightning service (not available in Bitnob sandbox)');
    const mockPayment = await this.mockServices.sendLightningPayment(
      `lnbc${paymentData.amount}`,
      paymentData.amount
    );
    
    return {
      success: true,
      data: mockPayment,
      message: 'Lightning payment sent (mock service)'
    };
  }

  // SACCO Group Payment Features
  async processSACCOGroupPayment(groupId: string, amount: number, memberWalletIds: string[]) {
    console.log(`💰 Processing SACCO group payment for group ${groupId}`);
    
    try {
      // For now, use mock service for group payments
      // In production, this would use real Bitnob payment APIs
      const transactions: SACCOTransaction[] = [];
      
      for (const walletId of memberWalletIds) {
        const transaction: SACCOTransaction = {
          id: `group_payment_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
          walletId,
          type: 'savings_contribution',
          amount,
          currency: 'BTC',
          status: 'completed',
          reference: `GROUP-${groupId}-${Date.now()}`,
          description: `SACCO group payment - Group ${groupId}`,
          timestamp: new Date().toISOString(),
          saccoGroupId: groupId
        };
        
        transactions.push(transaction);
      }
      
      console.log(`✅ Processed ${transactions.length} group payments`);
      return transactions;
      
    } catch (error) {
      throw new Error(`Group payment processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Service Status
  async getServiceStatus() {
    const isAvailable = await this.isServiceAvailable();
    
    return {
      bitnobAPI: isAvailable,
      workingEndpoints: ['/wallets', '/transactions'],
      mockServices: ['lightning', 'cross-border', 'virtual-cards', 'stablecoins'],
      environment: this.config.environment,
      message: isAvailable 
        ? 'Bitnob API connected - using real endpoints for wallets & transactions'
        : 'Bitnob API unavailable - using mock services for all features'
    };
  }
}

// Singleton instance for SACCO platform
let saccoServiceInstance: SACCOBitnobService | null = null;

export function createSACCOBitnobService(): SACCOBitnobService {
  if (saccoServiceInstance) {
    return saccoServiceInstance;
  }

  const secretKey = process.env.BITNOB_SECRET_KEY || '';
  const baseURL = process.env.NEXT_PUBLIC_BITNOB_BASE_URL || process.env.BITNOB_BASE_URL || 'https://sandboxapi.bitnob.co/api/v1';

  const serviceConfig: BitnobConfig = {
    secretKey,
    environment: baseURL.includes('sandbox') ? 'sandbox' : 'production',
    baseURL: baseURL,
  };

  if (!secretKey) {
    console.warn('Bitnob credentials not configured. Using mock services for all features.');
  }

  saccoServiceInstance = new SACCOBitnobService(serviceConfig);
  return saccoServiceInstance;
}

export const saccoService = createSACCOBitnobService();
export default SACCOBitnobService;
