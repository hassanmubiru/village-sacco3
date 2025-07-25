'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import toast from 'react-hot-toast';

// SACCO Deposit Funds Component (formerly USDT Transfer)
export const USDTTransferForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    targetNetwork: 'ethereum' as 'ethereum' | 'tron' | 'polygon',
    depositType: 'savings' as 'savings' | 'shares' | 'emergency',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount) {
      toast.error('Please enter the deposit amount');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement SACCO deposit via Bitnob USDT service
      toast.success(`Successfully deposited $${formData.amount} USDT to your SACCO ${formData.depositType} account!`);
      onClose();
    } catch (error) {
      toast.error('Deposit failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">💰 Deposit Funds to SACCO</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Deposit Amount (USDT)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              SACCO Account Type
            </label>
            <select
              name="depositType"
              value={formData.depositType}
              onChange={(e) => setFormData(prev => ({ ...prev, depositType: e.target.value as any }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="savings">💰 Savings Account</option>
              <option value="shares">📈 Shares Account</option>
              <option value="emergency">🚨 Emergency Fund</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Network
            </label>
            <select
              name="targetNetwork"
              value={formData.targetNetwork}
              onChange={(e) => setFormData(prev => ({ ...prev, targetNetwork: e.target.value as any }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="ethereum">Ethereum (ERC-20)</option>
              <option value="tron">Tron (TRC-20)</option>
              <option value="polygon">Polygon (MATIC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Purpose (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              rows={3}
              placeholder="Purpose of this deposit..."
            />
          </div>

          <div className="bg-green-50 p-4 rounded-md border border-green-200">
            <h4 className="text-sm font-medium text-black mb-2">💡 Deposit Benefits</h4>
            <ul className="text-xs text-gray-800 space-y-1">
              <li>• Stable value with USDT backing</li>
              <li>• Instant credit to your SACCO account</li>
              <li>• Earn interest on savings deposits</li>
              <li>• Secure blockchain technology</li>
            </ul>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Processing...' : 'Deposit to SACCO'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cross-border Payment Component - SACCO Money Transfer
export const CrossBorderPaymentForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    recipientCountry: '',
    recipientPhone: '',
    recipientName: '',
    recipientBank: '',
    sourceCurrency: 'UGX',
    targetCurrency: 'KES',
    transferPurpose: 'family_support' as 'family_support' | 'business' | 'education' | 'emergency',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const countries = [
    { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS', flag: '🇹🇿' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF', flag: '🇷🇼' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬' },
    { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭' },
  ];

  const transferPurposes = [
    { value: 'family_support', label: '👨‍👩‍👧‍👦 Family Support' },
    { value: 'business', label: '💼 Business Transaction' },
    { value: 'education', label: '🎓 Education Fees' },
    { value: 'emergency', label: '🚨 Emergency Support' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.recipientCountry || !formData.recipientName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement SACCO cross-border payment via Bitnob service
      const selectedCountry = countries.find(c => c.code === formData.recipientCountry);
      toast.success(`Successfully sent ${formData.amount} ${formData.sourceCurrency} to ${selectedCountry?.name}!`);
      onClose();
    } catch (error) {
      toast.error('Cross-border payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 border border-green-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">🌍 Send Money Across Africa</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Amount (UGX)
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">
                Purpose
              </label>
              <select
                name="transferPurpose"
                value={formData.transferPurpose}
                onChange={(e) => setFormData(prev => ({ ...prev, transferPurpose: e.target.value as any }))}
                className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {transferPurposes.map(purpose => (
                  <option key={purpose.value} value={purpose.value}>{purpose.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Payment Currency
            </label>
            <select
              name="sourceCurrency"
              value={formData.sourceCurrency}
              onChange={(e) => setFormData(prev => ({ ...prev, sourceCurrency: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="USDT">USDT - Tether</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Recipient Country
            </label>
            <select
              name="recipientCountry"
              value={formData.recipientCountry}
              onChange={(e) => {
                const country = countries.find(c => c.code === e.target.value);
                setFormData(prev => ({ 
                  ...prev, 
                  recipientCountry: e.target.value,
                  targetCurrency: country?.currency || 'KES'
                }));
              }}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              required
            >
              <option value="">Select African Country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Recipient Phone Number
            </label>
            <input
              type="tel"
              name="recipientPhone"
              value={formData.recipientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="+254700000000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Bank Account (Optional)
            </label>
            <input
              type="text"
              name="recipientBank"
              value={formData.recipientBank}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientBank: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Bank account number"
            />
          </div>

          {exchangeRate && (
            <div className="bg-green-50 p-3 rounded-lg border border-green-200">
              <p className="text-sm text-black">
                💱 Exchange Rate: 1 {formData.sourceCurrency} = {exchangeRate} {formData.targetCurrency}
              </p>
              <p className="text-xs text-green-700 mt-1">
                Real-time rate through SACCO network
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending Money...' : 'Send Money'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Virtual Card Management Component for SACCO
export const VirtualCardManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateCard = async (cardData: any) => {
    setLoading(true);
    try {
      // TODO: Implement virtual card creation via Bitnob service
      toast.success('SACCO virtual card created successfully!');
      setShowCreateForm(false);
      // Refresh cards list
    } catch (error) {
      toast.error('Failed to create virtual card');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-black">SACCO Virtual Cards</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
        >
          Create New Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-8 bg-green-50 rounded-lg border border-green-200">
          <div className="text-green-600 mb-2 text-4xl">💳</div>
          <p className="text-black font-medium">No virtual cards yet</p>
          <p className="text-green-700 text-sm mt-1">
            Create your first SACCO virtual card for cross-border spending
          </p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            Create SACCO Virtual Card
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-green-100 text-sm">SACCO Virtual Card</p>
                  <p className="font-medium">{card.cardHolderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-green-100 text-sm">Balance</p>
                  <p className="font-bold text-lg">{card.currency} {card.balance.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="font-mono text-lg tracking-wider mb-4">
                {card.cardNumber}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-green-100 text-xs">Valid Thru</p>
                  <p className="font-medium">{card.expiryMonth.toString().padStart(2, '0')}/{card.expiryYear}</p>
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors">
                    Freeze
                  </button>
                  <button className="px-3 py-1 bg-white bg-opacity-20 rounded text-sm hover:bg-opacity-30 transition-colors">
                    Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showCreateForm && (
        <VirtualCardCreateForm
          onClose={() => setShowCreateForm(false)}
          onSubmit={handleCreateCard}
          loading={loading}
        />
      )}
    </div>
  );
};

// Virtual Card Creation Form
const VirtualCardCreateForm: React.FC<{
  onClose: () => void;
  onSubmit: (data: any) => void;
  loading: boolean;
}> = ({ onClose, onSubmit, loading }) => {
  const [formData, setFormData] = useState({
    cardHolderName: '',
    spendingLimit: '',
    currency: 'UGX',
    type: 'virtual' as 'virtual' | 'physical',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cardHolderName || !formData.spendingLimit) {
      toast.error('Please fill in all required fields');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-black">Create SACCO Virtual Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Card Holder Name
            </label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => setFormData(prev => ({ ...prev, cardHolderName: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter your full name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Monthly Spending Limit
            </label>
            <input
              type="number"
              value={formData.spendingLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, spendingLimit: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="500000"
              required
            />
            <p className="text-xs text-green-700 mt-1">Set your monthly spending limit for security</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Card Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="UGX">UGX - Ugandan Shilling</option>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Card Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="virtual">Virtual Card (Instant)</option>
              <option value="physical">Physical Card (7-14 days delivery)</option>
            </select>
          </div>

          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <p className="text-sm text-black font-medium">💡 SACCO Benefits:</p>
            <ul className="text-xs text-green-700 mt-1 space-y-1">
              <li>• Use worldwide for online and in-store purchases</li>
              <li>• Low fees for cross-border transactions</li>
              <li>• Real-time spending notifications</li>
              <li>• Freeze/unfreeze instantly through app</li>
            </ul>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-black bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating Card...' : 'Create SACCO Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
