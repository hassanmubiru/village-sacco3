// Mock services for features not available in Bitnob Sandbox

interface MockLightningPayment {
  id: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  invoice?: string;
  timestamp: string;
}

interface MockCrossBorderTransfer {
  id: string;
  amount: number;
  currency: string;
  recipientCountry: string;
  status: 'processing' | 'completed' | 'failed';
  exchangeRate: number;
  timestamp: string;
}

interface MockVirtualCard {
  id: string;
  cardNumber: string;
  expiryDate: string;
  status: 'active' | 'blocked' | 'expired';
  balance: number;
  type: 'visa' | 'mastercard';
}

interface MockUSDTOperation {
  id: string;
  amount: number;
  type: 'buy' | 'sell' | 'transfer';
  status: 'pending' | 'completed' | 'failed';
  rate: number;
  timestamp: string;
}

/**
 * Mock Services for features not available in Bitnob Sandbox
 * These provide realistic simulations for development and testing
 */
export class MockBitnobServices {
  private static instance: MockBitnobServices;
  private lightningPayments: MockLightningPayment[] = [];
  private crossBorderTransfers: MockCrossBorderTransfer[] = [];
  private virtualCards: MockVirtualCard[] = [];
  private usdtOperations: MockUSDTOperation[] = [];

  private constructor() {}

  static getInstance(): MockBitnobServices {
    if (!MockBitnobServices.instance) {
      MockBitnobServices.instance = new MockBitnobServices();
    }
    return MockBitnobServices.instance;
  }

  // Lightning Network Mock Services
  async createLightningInvoice(amount: number, description: string): Promise<MockLightningPayment> {
    const invoice: MockLightningPayment = {
      id: `ln_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      status: 'pending',
      invoice: `lnbc${amount}n1p${Math.random().toString(36).substr(2, 20)}`,
      timestamp: new Date().toISOString()
    };
    
    this.lightningPayments.push(invoice);
    
    // Simulate processing after 2 seconds
    setTimeout(() => {
      invoice.status = Math.random() > 0.1 ? 'completed' : 'failed';
    }, 2000);
    
    return invoice;
  }

  async sendLightningPayment(invoice: string, amount: number): Promise<MockLightningPayment> {
    const payment: MockLightningPayment = {
      id: `ln_pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      status: 'pending',
      timestamp: new Date().toISOString()
    };
    
    this.lightningPayments.push(payment);
    
    // Simulate processing
    setTimeout(() => {
      payment.status = Math.random() > 0.15 ? 'completed' : 'failed';
    }, 3000);
    
    return payment;
  }

  async getLightningPayments(): Promise<MockLightningPayment[]> {
    return this.lightningPayments;
  }

  // Cross-Border Transfer Mock Services
  async initiateCrossBorderTransfer(
    amount: number, 
    currency: string, 
    recipientCountry: string
  ): Promise<MockCrossBorderTransfer> {
    const exchangeRates: Record<string, number> = {
      'USD': 1.0,
      'NGN': 750,
      'KES': 130,
      'GHS': 12,
      'EUR': 0.85,
      'GBP': 0.75
    };

    const transfer: MockCrossBorderTransfer = {
      id: `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      recipientCountry,
      status: 'processing',
      exchangeRate: exchangeRates[currency] || 1.0,
      timestamp: new Date().toISOString()
    };
    
    this.crossBorderTransfers.push(transfer);
    
    // Simulate processing time (5-10 seconds for cross-border)
    setTimeout(() => {
      transfer.status = Math.random() > 0.05 ? 'completed' : 'failed';
    }, Math.random() * 5000 + 5000);
    
    return transfer;
  }

  async getCrossBorderTransfers(): Promise<MockCrossBorderTransfer[]> {
    return this.crossBorderTransfers;
  }

  // Virtual Card Mock Services
  async createVirtualCard(type: 'visa' | 'mastercard' = 'visa'): Promise<MockVirtualCard> {
    const card: MockVirtualCard = {
      id: `card_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      cardNumber: this.generateCardNumber(type),
      expiryDate: this.generateExpiryDate(),
      status: 'active',
      balance: 0,
      type
    };
    
    this.virtualCards.push(card);
    return card;
  }

  async fundVirtualCard(cardId: string, amount: number): Promise<boolean> {
    const card = this.virtualCards.find(c => c.id === cardId);
    if (card) {
      card.balance += amount;
      return true;
    }
    return false;
  }

  async getVirtualCards(): Promise<MockVirtualCard[]> {
    return this.virtualCards;
  }

  async freezeVirtualCard(cardId: string): Promise<boolean> {
    const card = this.virtualCards.find(c => c.id === cardId);
    if (card) {
      card.status = 'blocked';
      return true;
    }
    return false;
  }

  // USDT/Stablecoin Mock Services
  async buyUSDT(amount: number): Promise<MockUSDTOperation> {
    const operation: MockUSDTOperation = {
      id: `usdt_buy_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'buy',
      status: 'pending',
      rate: 1.0 + (Math.random() - 0.5) * 0.02, // Simulate slight rate fluctuation
      timestamp: new Date().toISOString()
    };
    
    this.usdtOperations.push(operation);
    
    setTimeout(() => {
      operation.status = Math.random() > 0.05 ? 'completed' : 'failed';
    }, 2000);
    
    return operation;
  }

  async sellUSDT(amount: number): Promise<MockUSDTOperation> {
    const operation: MockUSDTOperation = {
      id: `usdt_sell_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'sell',
      status: 'pending',
      rate: 1.0 + (Math.random() - 0.5) * 0.02,
      timestamp: new Date().toISOString()
    };
    
    this.usdtOperations.push(operation);
    
    setTimeout(() => {
      operation.status = Math.random() > 0.05 ? 'completed' : 'failed';
    }, 2000);
    
    return operation;
  }

  async transferUSDT(amount: number, recipient: string): Promise<MockUSDTOperation> {
    const operation: MockUSDTOperation = {
      id: `usdt_transfer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      type: 'transfer',
      status: 'pending',
      rate: 1.0,
      timestamp: new Date().toISOString()
    };
    
    this.usdtOperations.push(operation);
    
    setTimeout(() => {
      operation.status = Math.random() > 0.1 ? 'completed' : 'failed';
    }, 1500);
    
    return operation;
  }

  async getUSDTOperations(): Promise<MockUSDTOperation[]> {
    return this.usdtOperations;
  }

  // Helper methods
  private generateCardNumber(type: 'visa' | 'mastercard'): string {
    const prefix = type === 'visa' ? '4' : '5';
    let cardNumber = prefix;
    
    for (let i = 1; i < 16; i++) {
      cardNumber += Math.floor(Math.random() * 10);
    }
    
    return cardNumber.replace(/(.{4})/g, '$1 ').trim();
  }

  private generateExpiryDate(): string {
    const currentDate = new Date();
    const expiryDate = new Date(currentDate.getFullYear() + 3, currentDate.getMonth() + Math.floor(Math.random() * 12));
    return `${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear().toString().substr(2)}`;
  }

  // Development utilities
  async clearAllMockData(): Promise<void> {
    this.lightningPayments = [];
    this.crossBorderTransfers = [];
    this.virtualCards = [];
    this.usdtOperations = [];
  }

  async generateTestData(): Promise<void> {
    // Generate some test Lightning payments
    await this.createLightningInvoice(50000, 'Test Invoice 1');
    await this.createLightningInvoice(25000, 'Test Invoice 2');
    
    // Generate test cross-border transfers
    await this.initiateCrossBorderTransfer(100, 'NGN', 'Nigeria');
    await this.initiateCrossBorderTransfer(50, 'KES', 'Kenya');
    
    // Generate test virtual cards
    await this.createVirtualCard('visa');
    await this.createVirtualCard('mastercard');
    
    // Generate test USDT operations
    await this.buyUSDT(100);
    await this.sellUSDT(50);
  }
}

export default MockBitnobServices;
