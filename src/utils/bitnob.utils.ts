/**
 * Bitnob utility functions for SACCO platform
 * Handles Bitcoin/Lightning Network specific operations
 */

export interface BitcoinAmount {
  btc: number;
  satoshis: number;
  fiat: number;
  currency: string;
}

export interface ExchangeRates {
  [currency: string]: number;
}

/**
 * Convert satoshis to Bitcoin
 */
export function satoshisToBTC(satoshis: number): number {
  return satoshis / 100000000; // 1 BTC = 100,000,000 satoshis
}

/**
 * Convert Bitcoin to satoshis
 */
export function btcToSatoshis(btc: number): number {
  return Math.round(btc * 100000000);
}

/**
 * Format Bitcoin amount for display
 */
export function formatBTC(amount: number, precision: number = 8): string {
  return `₿ ${amount.toFixed(precision)}`;
}

/**
 * Format satoshis for display
 */
export function formatSatoshis(satoshis: number): string {
  return `${satoshis.toLocaleString()} sats`;
}

/**
 * Convert Bitcoin to fiat currency
 */
export function btcToFiat(btcAmount: number, exchangeRate: number): number {
  return btcAmount * exchangeRate;
}

/**
 * Convert fiat to Bitcoin
 */
export function fiatToBTC(fiatAmount: number, exchangeRate: number): number {
  return fiatAmount / exchangeRate;
}

/**
 * Format currency amount with proper locale
 */
export function formatCurrency(amount: number, currency: string = 'UGX', locale: string = 'en-UG'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Generate a unique reference for transactions
 */
export function generateTransactionReference(prefix: string = 'SACCO'): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}_${timestamp}_${random}`;
}

/**
 * Validate Bitcoin address format
 */
export function isValidBitcoinAddress(address: string): boolean {
  // Basic validation for Bitcoin addresses
  const btcRegex = /^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$/; // Legacy
  const bech32Regex = /^bc1[a-z0-9]{39,59}$/; // Bech32
  
  return btcRegex.test(address) || bech32Regex.test(address);
}

/**
 * Validate Lightning Network invoice
 */
export function isValidLightningInvoice(invoice: string): boolean {
  // Lightning invoices start with 'ln' followed by network identifier
  const lnRegex = /^(ln(bc|tb|bcrt))[a-z0-9]+$/i;
  return lnRegex.test(invoice);
}

/**
 * Calculate transaction fees (placeholder - actual fees would come from Bitnob API)
 */
export function calculateTransactionFee(amount: number, feeRate: number = 0.001): number {
  return amount * feeRate;
}

/**
 * Format transaction status for display
 */
export function formatTransactionStatus(status: string): {
  label: string;
  color: string;
  icon: string;
} {
  const statusMap: Record<string, { label: string; color: string; icon: string }> = {
    pending: { label: 'Pending', color: 'yellow', icon: '⏳' },
    processing: { label: 'Processing', color: 'blue', icon: '🔄' },
    completed: { label: 'Completed', color: 'green', icon: '✅' },
    failed: { label: 'Failed', color: 'red', icon: '❌' },
    cancelled: { label: 'Cancelled', color: 'gray', icon: '⭕' },
  };

  return statusMap[status.toLowerCase()] || { label: status, color: 'gray', icon: '❓' };
}

/**
 * Calculate SACCO interest based on amount and rate
 */
export function calculateSavingsInterest(
  principal: number,
  annualRate: number,
  months: number
): {
  interest: number;
  total: number;
  monthlyAccrual: number;
} {
  const monthlyRate = annualRate / 12;
  const monthlyAccrual = principal * monthlyRate;
  const interest = monthlyAccrual * months;
  const total = principal + interest;

  return {
    interest,
    total,
    monthlyAccrual,
  };
}

/**
 * Calculate loan repayment schedule
 */
export function calculateLoanRepayment(
  principal: number,
  annualRate: number,
  months: number
): {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
  schedule: Array<{
    month: number;
    payment: number;
    principal: number;
    interest: number;
    balance: number;
  }>;
} {
  const monthlyRate = annualRate / 12;
  const monthlyPayment = (principal * monthlyRate * Math.pow(1 + monthlyRate, months)) / 
                        (Math.pow(1 + monthlyRate, months) - 1);
  
  const totalPayment = monthlyPayment * months;
  const totalInterest = totalPayment - principal;
  
  const schedule = [];
  let remainingBalance = principal;
  
  for (let month = 1; month <= months; month++) {
    const interestPayment = remainingBalance * monthlyRate;
    const principalPayment = monthlyPayment - interestPayment;
    remainingBalance -= principalPayment;
    
    schedule.push({
      month,
      payment: monthlyPayment,
      principal: principalPayment,
      interest: interestPayment,
      balance: Math.max(0, remainingBalance),
    });
  }
  
  return {
    monthlyPayment,
    totalPayment,
    totalInterest,
    schedule,
  };
}

/**
 * Validate phone number format (Uganda focus)
 */
export function validatePhoneNumber(phone: string): boolean {
  // Uganda phone number format: +256 followed by 9 digits
  const ugandaRegex = /^\+256[0-9]{9}$/;
  // Also accept format without country code
  const localRegex = /^0[0-9]{9}$/;
  
  return ugandaRegex.test(phone) || localRegex.test(phone);
}

/**
 * Normalize phone number to international format
 */
export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle Uganda phone numbers
  if (digits.startsWith('256')) {
    return `+${digits}`;
  } else if (digits.startsWith('0')) {
    return `+256${digits.substring(1)}`;
  } else if (digits.length === 9) {
    return `+256${digits}`;
  }
  
  return phone; // Return original if format not recognized
}

/**
 * Convert amount between currencies using exchange rates
 */
export function convertCurrency(
  amount: number,
  fromCurrency: string,
  toCurrency: string,
  rates: ExchangeRates
): number {
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to BTC first if not already
  const btcAmount = fromCurrency === 'BTC' ? amount : amount / rates[fromCurrency];
  
  // Convert from BTC to target currency
  return toCurrency === 'BTC' ? btcAmount : btcAmount * rates[toCurrency];
}

/**
 * Format wallet balance with multiple currencies
 */
export function formatWalletBalance(balance: BitcoinAmount): string {
  return `${formatBTC(balance.btc, 6)} (${formatCurrency(balance.fiat, balance.currency)})`;
}

/**
 * Generate QR code data for Bitcoin address or Lightning invoice
 */
export function generateQRCodeData(addressOrInvoice: string): string {
  if (isValidBitcoinAddress(addressOrInvoice)) {
    return `bitcoin:${addressOrInvoice}`;
  } else if (isValidLightningInvoice(addressOrInvoice)) {
    return addressOrInvoice.toUpperCase();
  }
  return addressOrInvoice;
}

/**
 * Truncate long addresses/hashes for display
 */
export function truncateHash(hash: string, startChars: number = 6, endChars: number = 4): string {
  if (hash.length <= startChars + endChars) return hash;
  return `${hash.substring(0, startChars)}...${hash.substring(hash.length - endChars)}`;
}

/**
 * Calculate group savings statistics
 */
export function calculateGroupStats(members: Array<{ savings: number }>) {
  const totalSavings = members.reduce((sum, member) => sum + member.savings, 0);
  const averageSavings = totalSavings / members.length;
  const maxSavings = Math.max(...members.map(m => m.savings));
  const minSavings = Math.min(...members.map(m => m.savings));
  
  return {
    totalSavings,
    averageSavings,
    maxSavings,
    minSavings,
    memberCount: members.length,
  };
}

/**
 * Time formatting utilities
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  
  return date.toLocaleDateString();
}

/**
 * Error handling utilities for Bitnob API responses
 */
export function handleBitnobError(error: any): string {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'An unexpected error occurred';
}

/**
 * Retry mechanism for API calls
 */
export async function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }
  
  throw lastError;
}
