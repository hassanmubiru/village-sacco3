'use client';

import React, { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../store/hooks';
import { fetchWalletBalance, fetchTransactionHistory } from '../../../store/slices/walletSlice';
import { WalletBalance, SendPaymentForm, ReceivePaymentForm } from '../../../components/wallet/WalletComponents';
import { formatBTC, formatCurrency, formatTimeAgo, formatTransactionStatus, truncateHash } from '../../../utils/bitnob.utils';

export default function WalletPage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { transactions, loading } = useAppSelector((state) => state.wallet);
  const [showSendForm, setShowSendForm] = useState(false);
  const [showReceiveForm, setShowReceiveForm] = useState(false);

  useEffect(() => {
    if (user?.bitnobWalletId) {
      dispatch(fetchTransactionHistory(user.bitnobWalletId));
    }
  }, [dispatch, user]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Bitcoin Wallet</h1>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowReceiveForm(true)}
            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span>Receive</span>
          </button>
          <button
            onClick={() => setShowSendForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span>Send</span>
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <WalletBalance walletId={user?.bitnobWalletId} />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={() => setShowSendForm(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Send Bitcoin</span>
          </button>
          
          <button 
            onClick={() => setShowReceiveForm(true)}
            className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Request Payment</span>
          </button>
          
          <button className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-8 h-8 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Exchange</span>
          </button>
        </div>
      </div>

      {/* Transaction History */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Transaction History</h2>
          <button 
            onClick={() => user?.bitnobWalletId && dispatch(fetchTransactionHistory(user.bitnobWalletId))}
            className="text-blue-600 hover:text-blue-800 transition-colors"
            disabled={loading}
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>

        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400">Your Bitcoin transactions will appear here</p>
            </div>
          ) : (
            transactions.map((tx) => {
              const statusInfo = formatTransactionStatus(tx.status);
              return (
                <div key={tx.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      tx.type === 'receive' || tx.type === 'deposit' ? 'bg-green-100' : 'bg-red-100'
                    }`}>
                      {tx.type === 'receive' || tx.type === 'deposit' ? (
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                      )}
                    </div>
                    
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900 capitalize">
                          {tx.type.replace('_', ' ')}
                        </p>
                        <span className={`px-2 py-1 text-xs rounded-full bg-${statusInfo.color}-100 text-${statusInfo.color}-800`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 space-y-1">
                        <p>{tx.description || 'Bitcoin transaction'}</p>
                        <p>Method: {tx.method}</p>
                        {tx.blockchainTxHash && (
                          <p>Hash: {truncateHash(tx.blockchainTxHash)}</p>
                        )}
                        <p>{formatTimeAgo(new Date(tx.createdAt))}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className={`font-semibold ${
                      tx.type === 'receive' || tx.type === 'deposit' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {tx.type === 'receive' || tx.type === 'deposit' ? '+' : '-'}
                      {formatBTC(tx.amount)}
                    </p>
                    {tx.fiatAmount && tx.fiatCurrency && (
                      <p className="text-sm text-gray-500">
                        {formatCurrency(tx.fiatAmount, tx.fiatCurrency)}
                      </p>
                    )}
                    {tx.fee > 0 && (
                      <p className="text-xs text-gray-400">
                        Fee: {formatBTC(tx.fee)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bitcoin Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">About Bitcoin Integration</h2>
        <div className="prose text-gray-600 space-y-3">
          <p>
            This wallet is powered by Bitnob, providing secure Bitcoin Lightning Network payments 
            for instant, low-cost transactions within your SACCO community.
          </p>
          <ul className="list-disc list-inside space-y-1">
            <li>Lightning Network for instant payments</li>
            <li>Low transaction fees</li>
            <li>Secure Bitcoin custody</li>
            <li>Real-time exchange rates</li>
            <li>24/7 availability</li>
          </ul>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
            <div className="flex">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-sm font-medium text-blue-900">Security Notice</p>
                <p className="text-sm text-blue-700 mt-1">
                  Your Bitcoin is secured by Bitnob's enterprise-grade custody solution. 
                  Always verify transaction details before confirming payments.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Forms */}
      {showSendForm && <SendPaymentForm onClose={() => setShowSendForm(false)} />}
      {showReceiveForm && <ReceivePaymentForm onClose={() => setShowReceiveForm(false)} />}
    </div>
  );
}
