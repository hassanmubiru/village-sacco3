'use client';

import React, { useState } from 'react';
import { WalletBalance, SendPaymentForm, ReceivePaymentForm } from './WalletComponents';
import { USDTTransferForm, CrossBorderPaymentForm, VirtualCardManager } from './BitnobServicesComponents';

export const WalletDashboard: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  const bitnobServices = [
    {
      id: 'savings',
      title: 'SACCO Savings',
      description: 'Save with Bitcoin & Lightning for growth',
      icon: '🏦',
      color: 'from-green-400 to-green-600',
      features: ['Auto-save Bitcoin', 'Daily interest', 'Secure custody'],
      action: 'Save Money'
    },
    {
      id: 'deposits',
      title: 'Instant Deposits',
      description: 'Deposit USDT/Stablecoins to your SACCO',
      icon: '💰',
      color: 'from-green-500 to-green-700',
      features: ['Stable deposits', 'Instant credit', 'Multiple networks'],
      action: 'Deposit Funds'
    },
    {
      id: 'cross-border',
      title: 'Cross-border Spending',
      description: 'Send money across Africa seamlessly',
      icon: '🌍',
      color: 'from-green-600 to-green-800',
      features: ['Africa-wide reach', 'Real-time rates', 'Direct transfers'],
      action: 'Send Money'
    },
    {
      id: 'virtual-card',
      title: 'Virtual Card Spending',
      description: 'Spend globally with virtual cards',
      icon: '💳',
      color: 'from-green-700 to-green-900',
      features: ['Global spending', 'Instant cards', 'Real-time controls'],
      action: 'Get Card'
    }
  ];

  const renderServiceModal = () => {
    switch (activeService) {
      case 'lightning':
        return <SendPaymentForm onClose={() => setActiveService(null)} />;
      case 'usdt':
        return <USDTTransferForm onClose={() => setActiveService(null)} />;
      case 'cross-border':
        return <CrossBorderPaymentForm onClose={() => setActiveService(null)} />;
      case 'receive':
        return <ReceivePaymentForm onClose={() => setActiveService(null)} />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8">
      {/* Wallet Balance */}
      <WalletBalance />

      {/* SACCO Financial Services - Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveService('savings')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-black p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md border border-green-300"
        >
          <div className="text-2xl mb-2">🏦</div>
          <div className="font-medium text-black">Save Money</div>
          <div className="text-xs text-gray-800">Bitcoin savings</div>
        </button>

        <button
          onClick={() => setActiveService('deposits')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-black p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md border border-green-300"
        >
          <div className="text-2xl mb-2">�</div>
          <div className="font-medium text-black">Deposit Funds</div>
          <div className="text-xs text-gray-800">USDT deposits</div>
        </button>

        <button
          onClick={() => setActiveService('cross-border')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-black p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md border border-green-300"
        >
          <div className="text-2xl mb-2">🌍</div>
          <div className="font-medium text-black">Send Money</div>
          <div className="text-xs text-gray-800">Cross-border</div>
        </button>

        <button
          onClick={() => setActiveService('virtual-card')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-black p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md border border-green-300"
        >
          <div className="text-2xl mb-2">💳</div>
          <div className="font-medium text-black">Virtual Card</div>
          <div className="text-xs text-gray-800">Global spending</div>
        </button>
      </div>

      {/* SACCO Bitnob Services Overview */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
        <h2 className="text-2xl font-bold text-black mb-6">SACCO Financial Services</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {bitnobServices.map((service) => (
            <div
              key={service.id}
              className={`bg-gradient-to-r ${service.color} rounded-lg p-6 cursor-pointer hover:scale-105 transition-transform duration-200 border border-green-300`}
              onClick={() => setActiveService(service.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{service.icon}</div>
                <button className="text-black hover:text-gray-800 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-2 text-black">{service.title}</h3>
              <p className="text-sm text-gray-800 mb-4">{service.description}</p>
              
              <div className="space-y-1 mb-4">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs text-gray-800">
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
              
              <button className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition-colors text-sm font-medium">
                {service.action}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Card Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6 border border-green-200">
        <VirtualCardManager />
      </div>

      {/* SACCO Service Benefits */}
      <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-lg p-6 border border-green-200">
        <h3 className="text-xl font-bold text-black mb-4">Why Choose Bitnob for Your SACCO?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-300">
              <span className="text-green-600 text-xl">🚀</span>
            </div>
            <h4 className="font-semibold text-black mb-2">Lightning Fast</h4>
            <p className="text-sm text-gray-800">
              Process SACCO savings and payments in seconds with Bitcoin Lightning
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-300">
              <span className="text-green-600 text-xl">💎</span>
            </div>
            <h4 className="font-semibold text-black mb-2">Low Fees</h4>
            <p className="text-sm text-gray-800">
              Minimal transaction costs for SACCO members compared to traditional banking
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border border-green-300">
              <span className="text-green-600 text-xl">🔒</span>
            </div>
            <h4 className="font-semibold text-black mb-2">Secure SACCO</h4>
            <p className="text-sm text-gray-800">
              Bank-grade security with blockchain transparency for your SACCO funds
            </p>
          </div>
        </div>
      </div>

      {/* SACCO Status Notice */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              SACCO Bitnob Integration Active
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Your SACCO is now integrated with Bitnob services for savings, deposits, cross-border payments, and virtual card spending. 
                All transactions are secured and optimized for SACCO members.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Render Service Modals */}
      {renderServiceModal()}
    </div>
  );
};
