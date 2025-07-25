/**
 * Bitnob Service - Blockchain integration for SACCO platform
 * Handles Bitcoin Lightning Network payments, wallet operations, and KYC
 */

export interface BitnobConfig {
  clientId: string;
  secretKey: string;
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

  constructor(config: BitnobConfig) {
    this.config = config;
    this.baseURL = config.baseURL || 
      (config.environment === 'production' 
        ? 'https://api.bitnob.com/api/v1' 
        : 'https://sandboxapi.bitnob.com/api/v1');
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
          'x-auth-client': this.config.clientId,
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
      if (!this.config.clientId || !this.config.secretKey) {
        console.warn('Bitnob credentials not configured');
        return false;
      }

      // Test with health endpoint
      const response = await this.makeRequest('/health');
      return response && response.status === 'ok';
    } catch (error) {
      console.error('Bitnob service availability check failed:', error);
      return false;
    }
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
            'x-auth-client': this.config.clientId,
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
      // First check if service is available
      const isAvailable = await this.isServiceAvailable();
      if (!isAvailable) {
        throw new Error('Bitnob service is currently unavailable');
      }

      const response = await this.makeRequest('/wallets/create', 'POST', {
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

  // Lightning Network Operations
  async sendLightningPayment(paymentData: PaymentData) {
    try {
      // Check if service is available first
      const isAvailable = await this.isServiceAvailable();
      if (!isAvailable) {
        throw new Error('Bitnob service is currently unavailable. Please try again later.');
      }

      const response = await this.makeRequest('/lightning/send', 'POST', {
        amount: paymentData.amount,
        reference: paymentData.reference,
        narration: paymentData.narration || 'SACCO Platform Payment',
      });
      return response.data;
    } catch (error) {
      console.error('Lightning payment error:', error);
      if (error instanceof Error && error.message.includes('404')) {
        throw new Error('Lightning payment service is temporarily unavailable. The API endpoint may have changed. Please contact support.');
      }
      throw new Error(`Lightning payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async createLightningInvoice(invoiceData: LightningInvoiceData) {
    try {
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
          'x-auth-client': this.config.clientId,
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

  // Cross-border Payment Operations
  async sendCrossBorderPayment(paymentData: CrossBorderPaymentData) {
    try {
      const response = await this.makeRequest('/cross-border/send', 'POST', {
        amount: paymentData.amount,
        sourceCurrency: paymentData.sourceCurrency,
        targetCurrency: paymentData.targetCurrency,
        recipientCountry: paymentData.recipientCountry,
        recipientPhoneNumber: paymentData.recipientPhoneNumber,
        recipientBankAccount: paymentData.recipientBankAccount,
        reference: paymentData.reference,
        description: paymentData.description || 'SACCO Cross-border Payment',
      });
      return response.data;
    } catch (error) {
      throw new Error(`Cross-border payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  // Virtual Card Operations
  async createVirtualCard(cardData: VirtualCardData) {
    try {
      const response = await this.makeRequest('/virtual-cards/create', 'POST', {
        userId: cardData.userId,
        cardHolderName: cardData.cardHolderName,
        spendingLimit: cardData.spendingLimit,
        currency: cardData.currency,
        type: cardData.type,
      });
      return response.data;
    } catch (error) {
      throw new Error(`Virtual card creation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getVirtualCards(userId: string) {
    try {
      const response = await this.makeRequest(`/virtual-cards/user/${userId}`);
      return response.data;
    } catch (error) {
      throw new Error(`Failed to get virtual cards: ${error instanceof Error ? error.message : 'Unknown error'}`);
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

  async freezeCard(cardId: string) {
    try {
      const response = await this.makeRequest(`/virtual-cards/${cardId}/freeze`, 'POST');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to freeze card: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async unfreezeCard(cardId: string) {
    try {
      const response = await this.makeRequest(`/virtual-cards/${cardId}/unfreeze`, 'POST');
      return response.data;
    } catch (error) {
      throw new Error(`Failed to unfreeze card: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
  const clientId = process.env.NEXT_PUBLIC_BITNOB_CLIENT_ID || process.env.BITNOB_CLIENT_ID || '';
  const secretKey = process.env.BITNOB_SECRET_KEY || '';
  const baseURL = process.env.NEXT_PUBLIC_BITNOB_BASE_URL || process.env.BITNOB_BASE_URL || 'https://sandboxapi.bitnob.com/api/v1';

  const serviceConfig: BitnobConfig = {
    clientId,
    secretKey,
    environment: baseURL.includes('sandbox') ? 'sandbox' : 'production',
    baseURL: baseURL,
  };

  // Warn if credentials are missing
  if (!clientId || !secretKey) {
    console.warn('Bitnob credentials not configured. Bitcoin wallet features will be disabled.');
  }

  bitnobServiceInstance = new BitnobService(serviceConfig);

  return bitnobServiceInstance;
}

// Default export for convenience
export const bitnobService = createBitnobService();
