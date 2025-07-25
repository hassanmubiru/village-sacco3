'use client';

import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { 
  fetchWalletBalance, 
  createLightningInvoice,
  sendLightningPayment,
  fetchTransactionHistory
} from '../../store/slices/walletSlice';
import { formatBTC, formatCurrency, formatTimeAgo, truncateHash } from '../../utils/bitnob.utils';
import toast from 'react-hot-toast';
import { USDTTransferForm, CrossBorderPaymentForm, VirtualCardManager } from './BitnobServicesComponents';
import { createSACCOBitnobService } from '../../services/sacco-bitnob.service';

interface WalletBalanceProps {
  walletId?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ walletId }) => {
  const dispatch = useAppDispatch();
  const { balance, loading, error } = useAppSelector((state) => state.wallet);
  const { user } = useAppSelector((state) => state.auth);
  const [saccoService] = useState(() => createSACCOBitnobService());
  const [realWallets, setRealWallets] = useState<any[]>([]);
  const [serviceStatus, setServiceStatus] = useState<any>(null);

  useEffect(() => {
    // Initialize SACCO service and get real wallet data
    const initializeSACCOWallet = async () => {
      try {
        // Get service status
        const status = await saccoService.getServiceStatus();
        setServiceStatus(status);
        
        // Get real wallets from Bitnob API
        if (status.bitnobAPI) {
          const wallets = await saccoService.getWallets();
          setRealWallets(wallets);
          console.log('✅ Real Bitnob wallets loaded:', wallets.length);
        }
      } catch (error) {
        console.error('Failed to initialize SACCO wallet:', error);
        toast.error('Failed to connect to wallet service');
      }
    };

    initializeSACCOWallet();
    
    // Also fetch balance using existing Redux logic
    if (walletId || user?.bitnobWalletId) {
      dispatch(fetchWalletBalance(walletId || user!.bitnobWalletId!));
    }
  }, [dispatch, walletId, user, saccoService]);

  const handleRefreshBalance = async () => {
    try {
      // Refresh both real API data and Redux state
      const wallets = await saccoService.getWallets();
      setRealWallets(wallets);
      
      if (walletId || user?.bitnobWalletId) {
        dispatch(fetchWalletBalance(walletId || user!.bitnobWalletId!));
      }
      
      toast.success('Balance refreshed from real Bitnob API');
    } catch (error) {
      console.error('Refresh failed:', error);
      toast.error('Failed to refresh balance');
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
        <div className="h-4 bg-gray-200 rounded w-28"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium text-red-900">Wallet Error</h3>
            <p className="text-red-700">{error}</p>
          </div>
          <button
            onClick={handleRefreshBalance}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* SACCO Service Status */}
      {serviceStatus && (
        <div className={`rounded-lg p-4 border ${serviceStatus.bitnobAPI 
          ? 'bg-green-50 border-green-200' 
          : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${serviceStatus.bitnobAPI ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
            <span className="text-sm font-medium">
              {serviceStatus.bitnobAPI ? '✅ Connected to Bitnob API' : '⚠️ Using Mock Services'}
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">{serviceStatus.message}</p>
        </div>
      )}

      {/* Real Wallet Information */}
      {realWallets.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <h4 className="font-medium text-blue-900 mb-2">Real Bitnob Wallets</h4>
          <p className="text-sm text-blue-700">Found {realWallets.length} wallet(s) in your Bitnob account</p>
          {realWallets.slice(0, 2).map((wallet, index) => (
            <div key={index} className="mt-2 p-2 bg-white rounded border text-xs">
              <p><strong>ID:</strong> {wallet.id || `wallet_${index + 1}`}</p>
              <p><strong>Status:</strong> {wallet.status || 'active'}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bitcoin Wallet Balance */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-md p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">SACCO Bitcoin Wallet</h3>
          <button
            onClick={handleRefreshBalance}
            className="p-2 hover:bg-green-500 rounded-full transition-colors"
            title="Refresh from Real API"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
        
        <div className="space-y-2">
          <div>
            <p className="text-green-100 text-sm">Bitcoin Balance</p>
            <p className="text-2xl font-bold">
              {balance ? formatBTC(balance.btc, 6) : '₿ 0.000000'}
            </p>
          </div>
          <div>
            <p className="text-green-100 text-sm">Fiat Value ({balance?.currency || 'UGX'})</p>
            <p className="text-lg">
              {balance ? formatCurrency(balance.fiat, balance.currency) : formatCurrency(0, 'UGX')}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-green-200 text-xs">
              Last updated: {balance ? formatTimeAgo(new Date(balance.lastUpdated)) : 'Never'}
            </p>
            <span className="text-xs bg-green-800 px-2 py-1 rounded">
              {serviceStatus?.bitnobAPI ? 'Real API' : 'Mock Data'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

interface SendPaymentFormProps {
  onClose: () => void;
}

export const SendPaymentForm: React.FC<SendPaymentFormProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.wallet);
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC',
    recipient: '',
    description: '',
    method: 'lightning' as 'lightning' | 'onchain',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.recipient) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const paymentData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        phoneNumber: formData.recipient.includes('@') ? undefined : formData.recipient,
        email: formData.recipient.includes('@') ? formData.recipient : undefined,
        reference: `PAYMENT_${Date.now()}`,
        narration: formData.description || 'SACCO Platform Payment',
      };

      await dispatch(sendLightningPayment(paymentData)).unwrap();
      toast.success('Payment sent successfully!');
      onClose();
    } catch (error) {
      toast.error('Payment failed. Please try again.');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Send Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
              Amount *
            </label>
            <div className="flex">
              <input
                type="number"
                id="amount"
                name="amount"
                value={formData.amount}
                onChange={handleChange}
                step="0.00000001"
                min="0"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="0.00000001"
                required
              />
              <select
                name="currency"
                value={formData.currency}
                onChange={handleChange}
                className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BTC">BTC</option>
                <option value="UGX">UGX</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="recipient" className="block text-sm font-medium text-gray-700 mb-1">
              Recipient *
            </label>
            <input
              type="text"
              id="recipient"
              name="recipient"
              value={formData.recipient}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Phone number or email"
              required
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional payment description"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Sending...' : 'Send Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface ReceivePaymentFormProps {
  onClose: () => void;
}

export const ReceivePaymentForm: React.FC<ReceivePaymentFormProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const { loading } = useAppSelector((state) => state.wallet);
  const [invoice, setInvoice] = useState<string>('');
  const [qrCodeData, setQrCodeData] = useState<string>('');
  const [formData, setFormData] = useState({
    amount: '',
    currency: 'BTC',
    description: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount) {
      toast.error('Please enter an amount');
      return;
    }

    try {
      const invoiceData = {
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        reference: `INVOICE_${Date.now()}`,
        memo: formData.description || 'SACCO Platform Payment Request',
        expiresIn: 3600, // 1 hour
      };

      const result = await dispatch(createLightningInvoice(invoiceData)).unwrap();
      setInvoice(result.invoice);
      setQrCodeData(result.invoice);
      toast.success('Payment request created!');
    } catch (error) {
      toast.error('Failed to create payment request');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(invoice);
    toast.success('Invoice copied to clipboard');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900">Request Payment</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!invoice ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount *
              </label>
              <div className="flex">
                <input
                  type="number"
                  id="amount"
                  name="amount"
                  value={formData.amount}
                  onChange={handleChange}
                  step="0.00000001"
                  min="0"
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0.00000001"
                  required
                />
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="BTC">BTC</option>
                  <option value="UGX">UGX</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="What is this payment for?"
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Request'}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-gray-100 p-4 rounded-lg mb-4">
                <p className="text-sm text-gray-600 mb-2">QR Code would appear here</p>
                <div className="w-48 h-48 bg-white border-2 border-dashed border-gray-300 mx-auto flex items-center justify-center">
                  <span className="text-gray-400">QR Code</span>
                </div>
              </div>
              
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-600 mb-1">Lightning Invoice</p>
                <p className="text-sm font-mono break-all">{truncateHash(invoice, 20, 20)}</p>
              </div>

              <button
                onClick={copyToClipboard}
                className="mt-3 w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
              >
                Copy Invoice
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// SACCO Transaction History Component
interface SACCOTransactionHistoryProps {
  walletId?: string;
  saccoGroupId?: string;
}

export const SACCOTransactionHistory: React.FC<SACCOTransactionHistoryProps> = ({ 
  walletId, 
  saccoGroupId 
}) => {
  const [saccoService] = useState(() => createSACCOBitnobService());
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTransactions = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log('📊 Loading SACCO transactions...');
        const saccoTransactions = await saccoService.getSACCOTransactions(walletId, saccoGroupId);
        setTransactions(saccoTransactions);
        console.log(`✅ Loaded ${saccoTransactions.length} SACCO transactions`);
      } catch (err) {
        console.error('Failed to load transactions:', err);
        setError(err instanceof Error ? err.message : 'Failed to load transactions');
      } finally {
        setLoading(false);
      }
    };

    loadTransactions();
  }, [walletId, saccoGroupId, saccoService]);

  const handleRefresh = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const saccoTransactions = await saccoService.getSACCOTransactions(walletId, saccoGroupId);
      setTransactions(saccoTransactions);
      toast.success('Transactions refreshed from real API');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh transactions');
      toast.error('Failed to refresh transactions');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'savings_contribution':
        return '💰';
      case 'loan_payment':
        return '🏦';
      case 'deposit':
        return '⬇️';
      case 'withdrawal':
        return '⬆️';
      case 'transfer':
        return '↔️';
      default:
        return '📄';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Transaction History</h3>
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse flex space-x-4">
              <div className="rounded-full bg-gray-200 h-10 w-10"></div>
              <div className="flex-1 space-y-2 py-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">SACCO Transaction History</h3>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          title="Refresh from Real API"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
          <div className="flex items-center">
            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-red-700 text-sm">{error}</span>
          </div>
        </div>
      )}

      {transactions.length === 0 ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500">No transactions found</p>
          <p className="text-gray-400 text-sm">Transactions will appear here when available from the Bitnob API</p>
        </div>
      ) : (
        <div className="space-y-3">
          {transactions.map(transaction => (
            <div key={transaction.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-lg">{getTransactionIcon(transaction.type)}</span>
                </div>
                <div>
                  <p className="font-medium text-gray-900">
                    {transaction.description || 'SACCO Transaction'}
                  </p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{formatTimeAgo(new Date(transaction.timestamp))}</span>
                    <span>•</span>
                    <span>{transaction.reference}</span>
                    {transaction.saccoGroupId && (
                      <>
                        <span>•</span>
                        <span className="text-green-600">Group: {transaction.saccoGroupId}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="font-medium text-gray-900">
                  {transaction.amount.toLocaleString()} {transaction.currency}
                </p>
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.status)}`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
          
          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              📊 Data from {transactions.length > 0 ? 'Real Bitnob API' : 'Mock Service'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
