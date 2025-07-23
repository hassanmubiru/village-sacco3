'use client';

import React from 'react';
import { useAppSelector } from '../../../store/hooks';

export default function SaccoGroupsPage() {
  const { user } = useAppSelector((state) => state.auth);

  const mockGroups = [
    {
      id: '1',
      name: 'Village Women Cooperative',
      description: 'Supporting women entrepreneurs in our village',
      members: 15,
      totalSavings: 150000,
      monthlyContribution: 5000,
      status: 'Active',
    },
    {
      id: '2',
      name: 'Youth Development SACCO',
      description: 'Empowering young people through financial literacy',
      members: 28,
      totalSavings: 280000,
      monthlyContribution: 10000,
      status: 'Active',
    },
    {
      id: '3',
      name: 'Farmers Cooperative',
      description: 'Supporting agricultural development in our community',
      members: 42,
      totalSavings: 420000,
      monthlyContribution: 7500,
      status: 'Active',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SACCO Groups</h1>
        <p className="text-gray-600 mt-2">
          Manage your savings and loan groups
        </p>
      </div>

      <div className="mb-6">
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium">
          Create New Group
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockGroups.map((group) => (
          <div key={group.id} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">{group.name}</h3>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  {group.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{group.description}</p>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Members:</span>
                  <span className="text-sm font-medium">{group.members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Total Savings:</span>
                  <span className="text-sm font-medium">UGX {group.totalSavings.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">Monthly Contribution:</span>
                  <span className="text-sm font-medium">UGX {group.monthlyContribution.toLocaleString()}</span>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 bg-gray-50 flex space-x-2">
              <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded text-sm font-medium">
                View Details
              </button>
              <button className="flex-1 border border-gray-300 hover:bg-gray-50 text-gray-700 py-2 px-3 rounded text-sm font-medium">
                Contribute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
