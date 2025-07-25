'use client';

import React, { useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import toast from 'react-hot-toast';

// USDT/Stablecoin Component
export const USDTTransferForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    targetNetwork: 'ethereum' as 'ethereum' | 'tron' | 'polygon',
    recipientAddress: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.recipientAddress) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement USDT transfer via Bitnob service
      toast.success('USDT transfer initiated successfully!');
      onClose();
    } catch (error) {
      toast.error('USDT transfer failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Send USDT</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount (USDT)
            </label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0.00"
              step="0.01"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Network
            </label>
            <select
              name="targetNetwork"
              value={formData.targetNetwork}
              onChange={(e) => setFormData(prev => ({ ...prev, targetNetwork: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="ethereum">Ethereum (ERC-20)</option>
              <option value="tron">Tron (TRC-20)</option>
              <option value="polygon">Polygon (MATIC)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Address
            </label>
            <input
              type="text"
              name="recipientAddress"
              value={formData.recipientAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientAddress: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="0x..."
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Payment description..."
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send USDT'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Cross-border Payment Component
export const CrossBorderPaymentForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    amount: '',
    recipientCountry: '',
    recipientPhone: '',
    recipientBank: '',
    sourceCurrency: 'UGX',
    targetCurrency: 'KES',
    description: '',
  });
  const [loading, setLoading] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  const countries = [
    { code: 'KE', name: 'Kenya', currency: 'KES' },
    { code: 'TZ', name: 'Tanzania', currency: 'TZS' },
    { code: 'RW', name: 'Rwanda', currency: 'RWF' },
    { code: 'NG', name: 'Nigeria', currency: 'NGN' },
    { code: 'GH', name: 'Ghana', currency: 'GHS' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.recipientCountry) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement cross-border payment via Bitnob service
      toast.success('Cross-border payment initiated successfully!');
      onClose();
    } catch (error) {
      toast.error('Cross-border payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Cross-border Payment</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="0.00"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                From Currency
              </label>
              <select
                name="sourceCurrency"
                value={formData.sourceCurrency}
                onChange={(e) => setFormData(prev => ({ ...prev, sourceCurrency: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="UGX">UGX</option>
                <option value="BTC">BTC</option>
                <option value="USDT">USDT</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="">Select Country</option>
              {countries.map(country => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.currency})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Recipient Phone
            </label>
            <input
              type="tel"
              name="recipientPhone"
              value={formData.recipientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientPhone: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="+254700000000"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bank Account (Optional)
            </label>
            <input
              type="text"
              name="recipientBank"
              value={formData.recipientBank}
              onChange={(e) => setFormData(prev => ({ ...prev, recipientBank: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Bank account number"
            />
          </div>

          {exchangeRate && (
            <div className="bg-blue-50 p-3 rounded-lg">
              <p className="text-sm text-blue-800">
                Exchange Rate: 1 {formData.sourceCurrency} = {exchangeRate} {formData.targetCurrency}
              </p>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Sending...' : 'Send Payment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Virtual Card Management Component
export const VirtualCardManager: React.FC = () => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const handleCreateCard = async (cardData: any) => {
    setLoading(true);
    try {
      // TODO: Implement virtual card creation via Bitnob service
      toast.success('Virtual card created successfully!');
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
        <h3 className="text-lg font-semibold text-gray-900">Virtual Cards</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Create New Card
        </button>
      </div>

      {cards.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <div className="text-gray-400 mb-2">💳</div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No Virtual Cards</h4>
          <p className="text-gray-600 mb-4">Create your first virtual card to start spending globally</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Create Virtual Card
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {cards.map((card) => (
            <div key={card.id} className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-indigo-100 text-sm">Virtual Card</p>
                  <p className="font-medium">{card.cardHolderName}</p>
                </div>
                <div className="text-right">
                  <p className="text-indigo-100 text-sm">Balance</p>
                  <p className="font-bold text-lg">{card.currency} {card.balance.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="font-mono text-lg tracking-wider mb-4">
                {card.cardNumber}
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-indigo-100 text-xs">Valid Thru</p>
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
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900">Create Virtual Card</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Holder Name
            </label>
            <input
              type="text"
              value={formData.cardHolderName}
              onChange={(e) => setFormData(prev => ({ ...prev, cardHolderName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Spending Limit
            </label>
            <input
              type="number"
              value={formData.spendingLimit}
              onChange={(e) => setFormData(prev => ({ ...prev, spendingLimit: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="500000"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              value={formData.currency}
              onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="UGX">UGX</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Card Type
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="virtual">Virtual Card</option>
              <option value="physical">Physical Card</option>
            </select>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Creating...' : 'Create Card'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
