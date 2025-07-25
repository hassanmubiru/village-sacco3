'use client';

import React, { useState } from 'react';
import { WalletBalance, SendPaymentForm, ReceivePaymentForm } from './WalletComponents';
import { USDTTransferForm, CrossBorderPaymentForm, VirtualCardManager } from './BitnobServicesComponents';

export const EnhancedWalletDashboard: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  const bitnobServices = [
    {
      id: 'lightning',
      title: 'Bitcoin & Lightning',
      description: 'Instant, low-fee payments at scale',
      icon: '⚡',
      color: 'from-yellow-400 to-orange-500',
      features: ['Instant payments', 'Low fees', 'Global reach']
    },
    {
      id: 'usdt',
      title: 'USDT/Stablecoins',
      description: 'Digital dollars for stable value transfers',
      icon: '💰',
      color: 'from-green-400 to-blue-500',
      features: ['Stable value', 'Multiple networks', 'Fast transfers']
    },
    {
      id: 'cross-border',
      title: 'Cross-border Payments',
      description: 'Seamless money movement across Africa',
      icon: '🌍',
      color: 'from-purple-400 to-pink-500',
      features: ['Africa-wide', 'Real-time rates', 'Direct deposits']
    },
    {
      id: 'virtual-card',
      title: 'Virtual Card Issuing',
      description: 'Programmatic card creation and management',
      icon: '💳',
      color: 'from-indigo-400 to-purple-600',
      features: ['Instant issuance', 'Global spending', 'Real-time controls']
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

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <button
          onClick={() => setActiveService('lightning')}
          className="bg-gradient-to-r from-blue-500 to-blue-600 text-white p-4 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-md"
        >
          <div className="text-2xl mb-2">⚡</div>
          <div className="font-medium">Send Bitcoin</div>
          <div className="text-xs opacity-90">Lightning fast</div>
        </button>

        <button
          onClick={() => setActiveService('receive')}
          className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-lg hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-md"
        >
          <div className="text-2xl mb-2">📥</div>
          <div className="font-medium">Receive</div>
          <div className="text-xs opacity-90">Generate invoice</div>
        </button>

        <button
          onClick={() => setActiveService('usdt')}
          className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white p-4 rounded-lg hover:from-emerald-600 hover:to-emerald-700 transition-all duration-200 shadow-md"
        >
          <div className="text-2xl mb-2">💰</div>
          <div className="font-medium">Send USDT</div>
          <div className="text-xs opacity-90">Stable value</div>
        </button>

        <button
          onClick={() => setActiveService('cross-border')}
          className="bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all duration-200 shadow-md"
        >
          <div className="text-2xl mb-2">🌍</div>
          <div className="font-medium">Cross-border</div>
          <div className="text-xs opacity-90">Africa-wide</div>
        </button>
      </div>

      {/* Bitnob Services Overview */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Bitnob Services</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {bitnobServices.map((service) => (
            <div
              key={service.id}
              className={`bg-gradient-to-r ${service.color} rounded-lg p-6 text-white cursor-pointer hover:scale-105 transition-transform duration-200`}
              onClick={() => setActiveService(service.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-3xl">{service.icon}</div>
                <button className="text-white hover:text-gray-200 transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              
              <h3 className="text-lg font-bold mb-2">{service.title}</h3>
              <p className="text-sm opacity-90 mb-4">{service.description}</p>
              
              <div className="space-y-1">
                {service.features.map((feature, index) => (
                  <div key={index} className="flex items-center text-xs opacity-80">
                    <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Virtual Card Management Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <VirtualCardManager />
      </div>

      {/* Service Benefits */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Why Choose Bitnob for Your SACCO?</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="bg-blue-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-blue-600 text-xl">🚀</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Lightning Fast</h4>
            <p className="text-sm text-gray-600">
              Process payments in seconds with Lightning Network technology
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-green-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-green-600 text-xl">💎</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Low Fees</h4>
            <p className="text-sm text-gray-600">
              Minimal transaction costs compared to traditional banking
            </p>
          </div>
          
          <div className="text-center">
            <div className="bg-purple-100 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-purple-600 text-xl">🔒</span>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Secure</h4>
            <p className="text-sm text-gray-600">
              Bank-grade security with blockchain transparency
            </p>
          </div>
        </div>
      </div>

      {/* API Status Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Development Mode
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>
                Bitcoin and Lightning Network features are currently in development mode. 
                Some services may not be fully functional until Bitnob API access is restored.
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
