'use client';

import React, { useState } from 'react';
import { useAppSelector } from '../../../store/hooks';

export default function TransactionsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [filterType, setFilterType] = useState('all');

  const mockTransactions = [
    {
      id: '1',
      type: 'deposit',
      amount: 5000,
      description: 'Monthly savings contribution',
      date: '2024-01-15',
      status: 'completed',
      group: 'Village Women Cooperative',
    },
    {
      id: '2',
      type: 'withdrawal',
      amount: 15000,
      description: 'Emergency loan disbursement',
      date: '2024-01-12',
      status: 'completed',
      group: 'Youth Development SACCO',
    },
    {
      id: '3',
      type: 'transfer',
      amount: 2500,
      description: 'Transfer to group emergency fund',
      date: '2024-01-10',
      status: 'completed',
      group: 'Farmers Cooperative',
    },
    {
      id: '4',
      type: 'deposit',
      amount: 7500,
      description: 'Loan repayment',
      date: '2024-01-08',
      status: 'completed',
      group: 'Village Women Cooperative',
    },
    {
      id: '5',
      type: 'withdrawal',
      amount: 3000,
      description: 'Partial loan disbursement',
      date: '2024-01-05',
      status: 'pending',
      group: 'Youth Development SACCO',
    },
  ];

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return (
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
        );
      case 'withdrawal':
        return (
          <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          </div>
        );
      case 'transfer':
        return (
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      default:
        return null;
    }
  };

  const getAmountColor = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'text-green-600';
      case 'withdrawal':
        return 'text-red-600';
      case 'transfer':
        return 'text-blue-600';
      default:
        return 'text-gray-600';
    }
  };

  const getAmountPrefix = (type: string) => {
    return type === 'deposit' ? '+' : type === 'withdrawal' ? '-' : '';
  };

  const filteredTransactions = filterType === 'all' 
    ? mockTransactions 
    : mockTransactions.filter(t => t.type === filterType);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transaction History</h1>
        <p className="text-gray-600 mt-2">
          View all your SACCO transactions and activities
        </p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterType('all')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterType === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Transactions
          </button>
          <button
            onClick={() => setFilterType('deposit')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterType === 'deposit'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Deposits
          </button>
          <button
            onClick={() => setFilterType('withdrawal')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterType === 'withdrawal'
                ? 'bg-red-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Withdrawals
          </button>
          <button
            onClick={() => setFilterType('transfer')}
            className={`px-4 py-2 rounded-lg font-medium ${
              filterType === 'transfer'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Transfers
          </button>
        </div>

        <div className="space-y-4">
          {filteredTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-4">
                {getTypeIcon(transaction.type)}
                <div>
                  <p className="font-medium text-gray-900">{transaction.description}</p>
                  <p className="text-sm text-gray-500">{transaction.group}</p>
                  <p className="text-xs text-gray-400">{new Date(transaction.date).toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="text-right">
                <p className={`font-semibold ${getAmountColor(transaction.type)}`}>
                  {getAmountPrefix(transaction.type)}UGX {transaction.amount.toLocaleString()}
                </p>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  transaction.status === 'completed'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {transaction.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        {filteredTransactions.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found for the selected filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
