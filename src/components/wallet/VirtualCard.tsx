'use client';

import React, { useState } from 'react';

interface VirtualCardProps {
  card?: {
    id: string;
    cardNumber: string;
    holderName: string;
    expiryDate: string;
    cvv: string;
    balance: number;
    status: 'active' | 'blocked' | 'pending';
  };
  onCreateCard: () => void;
}

export const VirtualCard: React.FC<VirtualCardProps> = ({ card, onCreateCard }) => {
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateCard = async () => {
    setIsCreating(true);
    try {
      await onCreateCard();
    } finally {
      setIsCreating(false);
    }
  };

  const maskCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 **** **** $4');
  };

  const formatCardNumber = (cardNumber: string) => {
    if (!cardNumber) return '';
    return cardNumber.replace(/(\d{4})(\d{4})(\d{4})(\d{4})/, '$1 $2 $3 $4');
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount).replace('UGX', 'UGX ');
  };

  if (!card) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Virtual Card</h3>
        <div className="text-center py-8">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <p className="text-gray-600 mb-4">No virtual card found</p>
          <p className="text-sm text-gray-500 mb-6">Create a virtual card to make online payments and transactions</p>
          <button
            onClick={handleCreateCard}
            disabled={isCreating}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isCreating ? 'Creating...' : 'Create Virtual Card'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Virtual Card</h3>
        <span className={`px-2 py-1 text-xs rounded-full ${
          card.status === 'active' ? 'bg-green-100 text-green-800' :
          card.status === 'blocked' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {card.status.charAt(0).toUpperCase() + card.status.slice(1)}
        </span>
      </div>

      {/* Virtual Card Display */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-blue-100 text-sm">SACCO Card</p>
              <p className="text-xs text-blue-100">Virtual</p>
            </div>
            <div className="flex space-x-2">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full"></div>
              <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full -ml-4"></div>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-xl font-mono tracking-wider">
              {showCardDetails ? formatCardNumber(card.cardNumber) : maskCardNumber(card.cardNumber)}
            </p>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <p className="text-blue-100 text-xs">CARD HOLDER</p>
              <p className="font-semibold">{card.holderName}</p>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs">EXPIRES</p>
              <p className="font-semibold">{card.expiryDate}</p>
            </div>
          </div>
        </div>

        {/* Card Balance */}
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Available Balance</span>
            <span className="font-semibold text-lg">{formatCurrency(card.balance)}</span>
          </div>
        </div>
      </div>

      {/* Card Actions */}
      <div className="mt-6 space-y-3">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCardDetails(!showCardDetails)}
            className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showCardDetails ? 'Hide Details' : 'Show Details'}
          </button>
          <button className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
            Top Up
          </button>
        </div>

        {showCardDetails && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">Card Number</p>
                <p className="font-mono">{formatCardNumber(card.cardNumber)}</p>
              </div>
              <div>
                <p className="text-gray-600">CVV</p>
                <p className="font-mono">{card.cvv}</p>
              </div>
              <div>
                <p className="text-gray-600">Expiry Date</p>
                <p>{card.expiryDate}</p>
              </div>
              <div>
                <p className="text-gray-600">Card ID</p>
                <p className="font-mono text-xs">{card.id}</p>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          <button className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span className="text-xs text-gray-600">Block</span>
          </button>
          <button className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span className="text-xs text-gray-600">Statement</span>
          </button>
          <button className="flex flex-col items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
            <svg className="w-5 h-5 text-gray-600 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-xs text-gray-600">Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
