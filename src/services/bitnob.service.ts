/**
 * Bitnob Service - Blockchain integration for SACCO platform
 * Handles Bitcoin Lightning Network payments, wallet operations, and KYC
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
  expiresIn?: number; // seconds
}

export interface KYCData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phoneNumber: string;
  email: string;
  address: string;
  idType: 'nin' | 'passport' | 'drivers_license';
  idNumber: string;
  idDocument?: File;
  proofOfAddress?: File;
}

export interface ConversionData {
  amount: number;
  fromCurrency: string;
  toCurrency: string;
  reference: string;
}

// New Bitnob Service Types
export interface StablecoinData {
  amount: number;
  currency: string;
  targetNetwork: 'ethereum' | 'tron' | 'polygon';
  recipientAddress?: string;
  reference: string;
}

export interface CrossBorderPaymentData {
  amount: number;
  sourceCurrency: string;
  targetCurrency: string;
  recipientCountry: string;
  recipientPhoneNumber?: string;
  recipientBankAccount?: string;
  reference: string;
  description?: string;
}

export interface VirtualCardData {
  userId: string;
  cardHolderName: string;
  spendingLimit: number;
  currency: string;
  type: 'virtual' | 'physical';
}

export class BitnobService {
  private config: BitnobConfig;
  private baseURL: string;
  private mockServices: MockBitnobServices;

  constructor(config: BitnobConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 
      (config.environment === 'production' 
        ? 'https://api.bitnob.com/api/v1' 
        : 'https://sandboxapi.bitnob.com/api/v1');
    this.mockServices = MockBitnobServices.getInstance();
  }

  private generateSignature(method: string, path: string, timestamp: string, nonce: string, body: string = ''): string {
    const crypto = require('crypto');
    const message = `${method}${path}${timestamp}${nonce}${body}`;
    return crypto
      .createHmac('sha256', this.config.secretKey)
      .update(message)
      .digest('hex');
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      const crypto = require('crypto');
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const body = data ? JSON.stringify(data) : '';
      const signature = this.generateSignature(method, endpoint, timestamp, nonce, body);

      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

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
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Bitnob API Error: ${response.status} - ${errorData.message || response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Bitnob Service Error:', error);
      
      // Handle specific network errors
      if (error instanceof Error) {
        if (error.message.includes('getaddrinfo ENOTFOUND') || error.message.includes('fetch failed')) {
          throw new Error('Bitnob service is currently unavailable. Please try again later.');
        }
        if (error.name === 'AbortError') {
          throw new Error('Bitnob service request timed out. Please try again.');
        }
      }
      
      throw error;
    }
  }

  // Check if Bitnob service is available
  async isServiceAvailable(): Promise<boolean> {
    try {
      // Check if credentials are configured
      if (!this.config.secretKey) {
        console.warn('Bitnob credentials not configured');
        return false;
      }

      // Test with wallets endpoint (confirmed working)
      const response = await this.makeRequest('/wallets');
      return response && (response.statusCode === 200 || response.status === 'success');
    } catch (error) {
      console.error('Bitnob service availability check failed:', error);
      // If it's a 401/403, credentials are wrong but service is available
      if (error instanceof Error && (error.message.includes('401') || error.message.includes('403'))) {
        console.warn('Bitnob credentials may be invalid, but service is available');
        return true; // Service is available, just auth issue
      }
      return false;
    }
  }

  // Get available features in current Bitnob environment
  async getAvailableFeatures() {
    return {
      wallets: true,           // ✅ /wallets endpoint available
      transactions: true,      // ✅ /transactions endpoint available  
      lightning: false,        // ❌ Lightning endpoints not available in sandbox
      crossBorder: false,      // ❌ Cross-border endpoints not found
      virtualCards: false,     // ❌ Virtual card endpoints not found
      stablecoins: false,      // ❌ Stablecoin endpoints not found
      message: 'Bitnob sandbox currently supports wallet management and transaction history only. Lightning and other advanced features may be available in production.'
    };
  }

  // Test available endpoints
  async testEndpoints(): Promise<{ [key: string]: boolean }> {
    const endpoints = [
      '/health',
      '/ping', 
      '/wallets',
      '/lightning/invoice',
      '/lightning/send',
      '/bitcoin/send',
      '/rates'
    ];

    const results: { [key: string]: boolean } = {};

    for (const endpoint of endpoints) {
      try {
        const crypto = require('crypto');
        const timestamp = Date.now().toString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const signature = this.generateSignature('GET', endpoint, timestamp, nonce);

        const response = await fetch(`${this.baseURL}${endpoint}`, {
          method: 'GET',
          headers: {
            'x-auth-timestamp': timestamp,
            'x-auth-nonce': nonce,
            'x-auth-signature': signature,
            'Content-Type': 'application/json',
          },
        });
        results[endpoint] = response.status !== 404;
      } catch (error) {
        results[endpoint] = false;
      }
    }

    return results;
  }

  // Authentication and User Management
  async createWallet(userData: WalletData) {
    try {
      // Use the available /wallets endpoint for wallet operations
      const response = await this.makeRequest('/wallets', 'POST', {
        phoneNumber: userData.phoneNumber,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        dateOfBirth: userData.dateOfBirth,
        address: userData.address,
      });
      return response.data;
    } catch (error) {
      console.error('Bitnob wallet creation error:', error);
      throw new Error(`Wallet creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWalletDetails(walletId: string) {
    try {
      const response = await this.makeRequest(`/wallets/${walletId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get wallet details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWalletBalance(walletId: string) {
    try {
      const response = await this.makeRequest(`/wallets/${walletId}/balance`);
      return response.data;
    } catch (error) {
      throw new Error(`Balance inquiry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Lightning Network Operations (Enhanced with Mock Services)
  async sendLightningPayment(paymentData: PaymentData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🌩️ Using mock Lightning service in sandbox mode');
        const mockPayment = await this.mockServices.sendLightningPayment(
          `lnbc${paymentData.amount}`, 
          paymentData.amount
        );
        return {
          success: true,
          data: mockPayment,
          message: 'Lightning payment initiated (mock service)'
        };
      }

      // Production Lightning payment
      const response = await this.makeRequest('/lightning/send', 'POST', paymentData);
      return response.data;
    } catch (error) {
      console.error('Lightning payment error:', error);
      throw error;
    }
  }

  async createLightningInvoice(invoiceData: LightningInvoiceData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('⚡ Using mock Lightning invoice service in sandbox mode');
        const mockInvoice = await this.mockServices.createLightningInvoice(
          invoiceData.amount,
          invoiceData.memo || 'SACCO Platform Payment'
        );
        return {
          success: true,
          data: mockInvoice,
          message: 'Lightning invoice created (mock service)'
        };
      }

      // Production Lightning invoice
      const response = await this.makeRequest('/lightning/invoice', 'POST', {
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        reference: invoiceData.reference,
        memo: invoiceData.memo || 'SACCO Platform Payment',
        expiresIn: invoiceData.expiresIn || 3600, // 1 hour default
      });
      return response.data;
    } catch (error) {
      throw new Error(`Invoice creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async payLightningInvoice(invoice: string, walletId: string) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('💰 Using mock Lightning payment service in sandbox mode');
        const mockPayment = await this.mockServices.sendLightningPayment(invoice, 0);
        return {
          success: true,
          data: mockPayment,
          message: 'Lightning invoice paid (mock service)'
        };
      }

      // Production Lightning payment
      const response = await this.makeRequest('/lightning/pay', 'POST', {
        invoice,
        walletId,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Invoice payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Bitcoin On-Chain Operations
  async sendBitcoin(paymentData: PaymentData & { address: string }) {
    try {
      const response = await this.makeRequest('/bitcoin/send', 'POST', {
        amount: paymentData.amount,
        address: paymentData.address,
        reference: paymentData.reference,
        narration: paymentData.narration || 'SACCO Platform Payment',
      });
      return response.data;
    } catch (error) {
      throw new Error(`Bitcoin transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async generateBitcoinAddress(walletId: string) {
    try {
      const response = await this.makeRequest(`/bitcoin/address/${walletId}`, 'POST');
      return response.data;
    } catch (error) {
      throw new Error(`Address generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // KYC Operations
  async submitKYC(kycData: KYCData) {
    try {
      // Note: File uploads would need FormData instead of JSON
      const formData = new FormData();
      Object.entries(kycData).forEach(([key, value]) => {
        if (value instanceof File) {
          formData.append(key, value);
        } else if (value) {
          formData.append(key, value.toString());
        }
      });

      const crypto = require('crypto');
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      const signature = this.generateSignature('POST', '/kyc/submit', timestamp, nonce);

      const response = await fetch(`${this.baseURL}/kyc/submit`, {
        method: 'POST',
        headers: {
          'x-auth-timestamp': timestamp,
          'x-auth-nonce': nonce,
          'x-auth-signature': signature,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`KYC submission failed: ${errorData.message || response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      throw new Error(`KYC submission failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getKYCStatus(userId: string) {
    try {
      const response = await this.makeRequest(`/kyc/status/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`KYC status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Currency Conversion
  async convertBTCToFiat(conversionData: ConversionData) {
    try {
      const response = await this.makeRequest('/convert', 'POST', {
        amount: conversionData.amount,
        fromCurrency: conversionData.fromCurrency,
        toCurrency: conversionData.toCurrency,
        reference: conversionData.reference,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getExchangeRates(baseCurrency: string = 'BTC') {
    try {
      const response = await this.makeRequest(`/rates?base=${baseCurrency}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Transaction History
  async getTransactionHistory(walletId: string, limit: number = 50, offset: number = 0) {
    try {
      const response = await this.makeRequest(
        `/transactions?walletId=${walletId}&limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactionDetails(transactionId: string) {
    try {
      const response = await this.makeRequest(`/transactions/${transactionId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transaction details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Webhook verification (for backend use)
  verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
    // Implementation would depend on Bitnob's webhook signature method
    // This is a placeholder for the actual verification logic
    try {
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(payload)
        .digest('hex');
      
      return crypto.timingSafeEqual(
        Buffer.from(signature, 'hex'),
        Buffer.from(expectedSignature, 'hex')
      );
    } catch (error) {
      console.error('Webhook signature verification failed:', error);
      return false;
    }
  }

  // USDT/Stablecoin Operations
  async sendUSDT(stablecoinData: StablecoinData) {
    try {
      const response = await this.makeRequest('/stablecoins/usdt/send', 'POST', {
        amount: stablecoinData.amount,
        currency: stablecoinData.currency,
        targetNetwork: stablecoinData.targetNetwork,
        recipientAddress: stablecoinData.recipientAddress,
        reference: stablecoinData.reference,
      });
      return response.data;
    } catch (error) {
      throw new Error(`USDT transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async convertToUSDT(conversionData: ConversionData) {
    try {
      const response = await this.makeRequest('/stablecoins/convert', 'POST', {
        amount: conversionData.amount,
        fromCurrency: conversionData.fromCurrency,
        toCurrency: 'USDT',
        reference: conversionData.reference,
      });
      return response.data;
    } catch (error) {
      throw new Error(`USDT conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCrossBorderRates(sourceCurrency: string, targetCurrency: string, recipientCountry: string) {
    try {
      const response = await this.makeRequest(
        `/cross-border/rates?source=${sourceCurrency}&target=${targetCurrency}&country=${recipientCountry}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cross-border rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async updateCardLimit(cardId: string, newLimit: number) {
    try {
      const response = await this.makeRequest(`/virtual-cards/${cardId}/limit`, 'PUT', {
        spendingLimit: newLimit,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to update card limit: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Cross-Border Payment Operations (Enhanced with Mock Services)
  async sendCrossBorderPayment(paymentData: CrossBorderPaymentData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🌍 Using mock cross-border service in sandbox mode');
        const mockTransfer = await this.mockServices.initiateCrossBorderTransfer(
          paymentData.amount,
          paymentData.targetCurrency,
          paymentData.recipientCountry
        );
        return {
          success: true,
          data: mockTransfer,
          message: 'Cross-border payment initiated (mock service)'
        };
      }

      // Production cross-border payment
      const response = await this.makeRequest('/cross-border/send', 'POST', paymentData);
      return response.data;
    } catch (error) {
      throw new Error(`Cross-border payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getCrossBorderTransfers() {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('📋 Using mock cross-border history in sandbox mode');
        const mockTransfers = await this.mockServices.getCrossBorderTransfers();
        return {
          success: true,
          data: mockTransfers,
          message: 'Cross-border transfers retrieved (mock service)'
        };
      }

      // Production cross-border history
      const response = await this.makeRequest('/cross-border/transfers');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get cross-border transfers: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Virtual Card Operations (Enhanced with Mock Services)
  async createVirtualCard(cardData: VirtualCardData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('💳 Using mock virtual card service in sandbox mode');
        const mockCard = await this.mockServices.createVirtualCard('visa');
        return {
          success: true,
          data: mockCard,
          message: 'Virtual card created (mock service)'
        };
      }

      // Production virtual card creation
      const response = await this.makeRequest('/virtual-cards', 'POST', cardData);
      return response.data;
    } catch (error) {
      throw new Error(`Virtual card creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVirtualCards(userId?: string) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🗂️ Using mock virtual card list in sandbox mode');
        const mockCards = await this.mockServices.getVirtualCards();
        return {
          success: true,
          data: mockCards,
          message: 'Virtual cards retrieved (mock service)'
        };
      }

      // Production virtual cards
      const endpoint = userId ? `/virtual-cards/user/${userId}` : '/virtual-cards';
      const response = await this.makeRequest(endpoint);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get virtual cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async fundVirtualCard(cardId: string, amount: number) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('💰 Using mock card funding in sandbox mode');
        const success = await this.mockServices.fundVirtualCard(cardId, amount);
        return {
          success,
          message: `Virtual card ${success ? 'funded' : 'funding failed'} (mock service)`
        };
      }

      // Production card funding
      const response = await this.makeRequest(`/virtual-cards/${cardId}/fund`, 'POST', { amount });
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fund card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async freezeCard(cardId: string) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🧊 Using mock card freeze in sandbox mode');
        const success = await this.mockServices.freezeVirtualCard(cardId);
        return {
          success,
          message: `Virtual card ${success ? 'frozen' : 'freeze failed'} (mock service)`
        };
      }

      // Production card freeze
      const response = await this.makeRequest(`/virtual-cards/${cardId}/freeze`, 'POST');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to freeze card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unfreezeCard(cardId: string) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🔥 Mock card unfreeze not implemented - using production endpoint');
      }

      // Production card unfreeze
      const response = await this.makeRequest(`/virtual-cards/${cardId}/unfreeze`, 'POST');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unfreeze card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // USDT/Stablecoin Operations
  async buyStablecoin(stablecoinData: StablecoinData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🪙 Using mock USDT buy service in sandbox mode');
        const mockOperation = await this.mockServices.buyUSDT(stablecoinData.amount);
        return {
          success: true,
          data: mockOperation,
          message: 'USDT purchased (mock service)'
        };
      }

      // Production stablecoin purchase
      const response = await this.makeRequest('/stablecoins/buy', 'POST', stablecoinData);
      return response.data;
    } catch (error) {
      throw new Error(`Stablecoin purchase failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async sellStablecoin(stablecoinData: StablecoinData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('💱 Using mock USDT sell service in sandbox mode');
        const mockOperation = await this.mockServices.sellUSDT(stablecoinData.amount);
        return {
          success: true,
          data: mockOperation,
          message: 'USDT sold (mock service)'
        };
      }

      // Production stablecoin sale
      const response = await this.makeRequest('/stablecoins/sell', 'POST', stablecoinData);
      return response.data;
    } catch (error) {
      throw new Error(`Stablecoin sale failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async transferStablecoin(stablecoinData: StablecoinData) {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('🔄 Using mock USDT transfer service in sandbox mode');
        const mockOperation = await this.mockServices.transferUSDT(
          stablecoinData.amount, 
          stablecoinData.recipientAddress || 'mock-recipient'
        );
        return {
          success: true,
          data: mockOperation,
          message: 'USDT transferred (mock service)'
        };
      }

      // Production stablecoin transfer
      const response = await this.makeRequest('/stablecoins/transfer', 'POST', stablecoinData);
      return response.data;
    } catch (error) {
      throw new Error(`Stablecoin transfer failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getStablecoinOperations() {
    try {
      // Use mock service in sandbox environment
      if (this.config.environment === 'sandbox') {
        console.log('📊 Using mock USDT operations in sandbox mode');
        const mockOperations = await this.mockServices.getUSDTOperations();
        return {
          success: true,
          data: mockOperations,
          message: 'USDT operations retrieved (mock service)'
        };
      }

      // Production stablecoin operations
      const response = await this.makeRequest('/stablecoins/operations');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get stablecoin operations: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Health check
  async healthCheck() {
    try {
      const response = await this.makeRequest('/health');
      return response;
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance for frontend use
let bitnobServiceInstance: BitnobService | null = null;

export function createBitnobService(): BitnobService {
  if (bitnobServiceInstance) {
    return bitnobServiceInstance;
  }

  // Get configuration from environment variables
  const secretKey = process.env.BITNOB_SECRET_KEY || '';
  const baseURL = process.env.NEXT_PUBLIC_BITNOB_BASE_URL || process.env.BITNOB_BASE_URL || 'https://sandboxapi.bitnob.com/api/v1';

  const serviceConfig: BitnobConfig = {
    secretKey,
    environment: baseURL.includes('sandbox') ? 'sandbox' : 'production',
    baseURL: baseURL,
  };

  // Warn if credentials are missing
  if (!secretKey) {
    console.warn('Bitnob credentials not configured. Bitcoin wallet features will be disabled.');
  }

  bitnobServiceInstance = new BitnobService(serviceConfig);

  return bitnobServiceInstance;
}

// Default export for convenience
export const bitnobService = createBitnobService();
