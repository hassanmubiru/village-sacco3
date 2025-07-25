'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { VirtualCard } from './VirtualCard';
import Link from 'next/link';

interface SavingsData {
  balance: number;
  totalContributions: number;
  groupCount: number;
  lastContribution?: string;
}

interface VirtualCardData {
  id: string;
  cardNumber: string;
  holderName: string;
  expiryDate: string;
  cvv: string;
  balance: number;
  status: 'active' | 'blocked' | 'pending';
}

export const SimplifiedWalletDashboard: React.FC = () => {
  const { user } = useAppSelector((state) => state.auth);
  const [savingsData, setSavingsData] = useState<SavingsData>({
    balance: 0,
    totalContributions: 0,
    groupCount: 0
  });
  const [virtualCard, setVirtualCard] = useState<VirtualCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id) {
      fetchSavingsData();
      fetchVirtualCard();
    }
  }, [user]);

  const fetchSavingsData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get user's total savings across all groups
      const response = await fetch(`/api/dashboard/summary?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch savings data');
      }

      const data = await response.json();
      
      if (data.success) {
        setSavingsData({
          balance: data.summary.totalSavings,
          totalContributions: data.summary.totalSavings, // For now, use same value
          groupCount: data.summary.userMemberships,
          lastContribution: data.summary.recentTransactions?.[0]?.date
        });
      } else {
        setError(data.error || 'Failed to load savings data');
      }
    } catch (err) {
      console.error('Error fetching savings data:', err);
      setError('Failed to load savings data');
    } finally {
      setLoading(false);
    }
  };

  const fetchVirtualCard = async () => {
    try {
      const response = await fetch(`/api/virtual-cards?userId=${user?.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch virtual card');
      }

      const data = await response.json();
      
      if (data.success && data.cards.length > 0) {
        const card = data.cards[0];
        setVirtualCard({
          id: card.id,
          cardNumber: card.card_number,
          holderName: card.holder_name,
          expiryDate: card.expiry_date,
          cvv: card.cvv,
          balance: card.balance,
          status: card.status
        });
      }
    } catch (err) {
      console.error('Error fetching virtual card:', err);
    }
  };

  const createVirtualCard = async () => {
    try {
      const holderName = `${user?.first_name || ''} ${user?.last_name || ''}`.trim() || user?.name || 'SACCO Member';
      
      const response = await fetch('/api/virtual-cards', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          holderName: holderName
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create virtual card');
      }

      const data = await response.json();
      
      if (data.success) {
        const card = data.card;
        setVirtualCard({
          id: card.id,
          cardNumber: card.card_number,
          holderName: card.holder_name,
          expiryDate: card.expiry_date,
          cvv: card.cvv,
          balance: card.balance,
          status: card.status
        });
      }
    } catch (err) {
      console.error('Error creating virtual card:', err);
      setError('Failed to create virtual card');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-UG', {
      style: 'currency',
      currency: 'UGX',
      minimumFractionDigits: 0
    }).format(amount).replace('UGX', 'UGX ');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Balance Card */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 rounded-lg shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-green-100">Total Savings Balance</h2>
            <p className="text-3xl font-bold mt-1">{formatCurrency(savingsData.balance)}</p>
            <p className="text-green-100 text-sm mt-1">
              Across {savingsData.groupCount} SACCO group{savingsData.groupCount !== 1 ? 's' : ''}
            </p>
          </div>
          <div className="text-right">
            <button
              onClick={fetchSavingsData}
              className="bg-green-500 hover:bg-green-400 text-white px-4 py-2 rounded-lg transition-colors text-sm"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
          <button 
            onClick={fetchSavingsData}
            className="mt-2 text-sm text-red-700 hover:text-red-900 underline"
          >
            Try again
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Contributions</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(savingsData.totalContributions)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">SACCO Groups</p>
              <p className="text-xl font-bold text-gray-900">{savingsData.groupCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Last Activity</p>
              <p className="text-xl font-bold text-gray-900">
                {savingsData.lastContribution 
                  ? new Date(savingsData.lastContribution).toLocaleDateString()
                  : 'No activity'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Virtual Card Section */}
      <VirtualCard 
        card={virtualCard || undefined}
        onCreateCard={createVirtualCard}
      />

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/sacco"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <svg className="w-8 h-8 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="text-sm font-medium text-gray-900">Add Savings</span>
            <span className="text-xs text-gray-500 mt-1">Contribute to your SACCO</span>
          </Link>

          <Link
            href="/transactions"
            className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <svg className="w-8 h-8 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <span className="text-sm font-medium text-gray-900">View Transactions</span>
            <span className="text-xs text-gray-500 mt-1">Check your history</span>
          </Link>

          <div className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg opacity-50">
            <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-sm font-medium text-gray-500">Bitcoin Wallet</span>
            <span className="text-xs text-gray-400 mt-1">Coming soon</span>
          </div>
        </div>
      </div>
    </div>
  );
};
