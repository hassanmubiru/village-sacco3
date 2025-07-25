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

interface WalletBalanceProps {
  walletId?: string;
}

export const WalletBalance: React.FC<WalletBalanceProps> = ({ walletId }) => {
  const dispatch = useAppDispatch();
  const { balance, loading, error } = useAppSelector((state) => state.wallet);
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (walletId || user?.bitnobWalletId) {
      dispatch(fetchWalletBalance(walletId || user!.bitnobWalletId!));
    }
  }, [dispatch, walletId, user]);

  const handleRefreshBalance = () => {
    if (walletId || user?.bitnobWalletId) {
      dispatch(fetchWalletBalance(walletId || user!.bitnobWalletId!));
      toast.success('Balance refreshed');
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
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg shadow-md p-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">Bitcoin Wallet</h3>
        <button
          onClick={handleRefreshBalance}
          className="p-2 hover:bg-blue-500 rounded-full transition-colors"
          title="Refresh Balance"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
      
      <div className="space-y-2">
        <div>
          <p className="text-blue-100 text-sm">Bitcoin Balance</p>
          <p className="text-2xl font-bold">
            {balance ? formatBTC(balance.btc, 6) : '₿ 0.000000'}
          </p>
        </div>
        <div>
          <p className="text-blue-100 text-sm">Fiat Value ({balance?.currency || 'UGX'})</p>
          <p className="text-lg">
            {balance ? formatCurrency(balance.fiat, balance.currency) : formatCurrency(0, 'UGX')}
          </p>
        </div>
        <p className="text-blue-200 text-xs">
          Last updated: {balance ? formatTimeAgo(new Date(balance.lastUpdated)) : 'Never'}
        </p>
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
