/**
 * Bitnob Service - Blockchain integration for SACCO platform
 * Handles Bitcoin Lightning Network payments, wallet operations, and KYC
 */

export interface BitnobConfig {
  apiKey: string;
  environment: 'sandbox' | 'production';
  baseURL?: string;
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

export class BitnobService {
  private config: BitnobConfig;
  private baseURL: string;

  constructor(config: BitnobConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 
      (config.environment === 'production' 
        ? 'https://api.bitnob.com' 
        : 'https://sandboxapi.bitnob.com');
  }

  private async makeRequest(endpoint: string, method: string = 'GET', data?: any) {
    try {
      // Create timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Accept': 'application/json',
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
      // Try a simple ping/health check
      await this.makeRequest('/api/v1/ping');
      return true;
    } catch (error) {
      console.warn('Bitnob service unavailable:', error);
      return false;
    }
  }

  // Authentication and User Management
  async createWallet(userData: WalletData) {
    try {
      // First check if service is available
      const isAvailable = await this.isServiceAvailable();
      if (!isAvailable) {
        throw new Error('Bitnob service is currently unavailable');
      }

      const response = await this.makeRequest('/api/v1/wallets/create', 'POST', {
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
      const response = await this.makeRequest(`/api/v1/wallets/${walletId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get wallet details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getWalletBalance(walletId: string) {
    try {
      const response = await this.makeRequest(`/api/v1/wallets/${walletId}/balance`);
      return response.data;
    } catch (error) {
      throw new Error(`Balance inquiry failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Lightning Network Operations
  async sendLightningPayment(paymentData: PaymentData) {
    try {
      const response = await this.makeRequest('/api/v1/lightning/send', 'POST', {
        amount: paymentData.amount,
        currency: paymentData.currency,
        recipientId: paymentData.recipientId,
        phoneNumber: paymentData.phoneNumber,
        email: paymentData.email,
        reference: paymentData.reference,
        narration: paymentData.narration || 'SACCO Platform Payment',
      });
      return response.data;
    } catch (error) {
      throw new Error(`Lightning payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createLightningInvoice(invoiceData: LightningInvoiceData) {
    try {
      const response = await this.makeRequest('/api/v1/lightning/invoice', 'POST', {
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
      const response = await this.makeRequest('/api/v1/lightning/pay', 'POST', {
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
      const response = await this.makeRequest('/api/v1/bitcoin/send', 'POST', {
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
      const response = await this.makeRequest(`/api/v1/bitcoin/address/${walletId}`, 'POST');
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

      const response = await fetch(`${this.baseURL}/api/v1/kyc/submit`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
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
      const response = await this.makeRequest(`/api/v1/kyc/status/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`KYC status check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Currency Conversion
  async convertBTCToFiat(conversionData: ConversionData) {
    try {
      const response = await this.makeRequest('/api/v1/convert', 'POST', {
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
      const response = await this.makeRequest(`/api/v1/rates?base=${baseCurrency}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get exchange rates: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Transaction History
  async getTransactionHistory(walletId: string, limit: number = 50, offset: number = 0) {
    try {
      const response = await this.makeRequest(
        `/api/v1/transactions?walletId=${walletId}&limit=${limit}&offset=${offset}`
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get transaction history: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getTransactionDetails(transactionId: string) {
    try {
      const response = await this.makeRequest(`/api/v1/transactions/${transactionId}`);
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

  // Health check
  async healthCheck() {
    try {
      const response = await this.makeRequest('/api/v1/health');
      return response;
    } catch (error) {
      throw new Error(`Health check failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Singleton instance for frontend use
let bitnobServiceInstance: BitnobService | null = null;

export function createBitnobService(config?: BitnobConfig): BitnobService {
  if (!bitnobServiceInstance || config) {
    const serviceConfig = config || {
      apiKey: process.env.NEXT_PUBLIC_BITNOB_API_KEY || '',
      environment: (process.env.NEXT_PUBLIC_BITNOB_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox',
      baseURL: process.env.NEXT_PUBLIC_BITNOB_BASE_URL,
    };

    bitnobServiceInstance = new BitnobService(serviceConfig);
  }

  return bitnobServiceInstance;
}

// Default export for convenience
export const bitnobService = createBitnobService();
