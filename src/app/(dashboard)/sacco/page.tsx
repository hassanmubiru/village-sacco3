'use client';

import React, { useState, useEffect } from 'react';
import { useAppSelector } from '@/store/hooks';
import toast from 'react-hot-toast';

interface SaccoGroup {
  id: string;
  name: string;
  description: string;
  contribution_amount: number;
  contribution_frequency: string;
  interest_rate: number;
  max_members: number;
  current_members: number;
  created_at: string;
}

interface MembershipApplication {
  id: string;
  user_id: string;
  sacco_group_id: string;
  status: 'pending' | 'approved' | 'rejected';
  applied_at: string;
  user_name?: string;
  user_email?: string;
}

interface PersonalSavings {
  id: string;
  user_id: string;
  sacco_group_id: string;
  balance: number;
  total_contributions: number;
  last_contribution_date: string;
  interest_earned: number;
  created_at: string;
}

interface SavingsTransaction {
  id: string;
  user_id: string;
  sacco_group_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'interest';
  status: 'pending' | 'completed' | 'failed';
  description: string;
  created_at: string;
}

export default function SaccoGroupsPage() {
  const { user } = useAppSelector((state) => state.auth);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showSavingsModal, setShowSavingsModal] = useState(false);
  const [showAddSavingsModal, setShowAddSavingsModal] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<SaccoGroup | null>(null);
  const [membershipApplications, setMembershipApplications] = useState<MembershipApplication[]>([]);
  const [personalSavings, setPersonalSavings] = useState<PersonalSavings | null>(null);
  const [savingsTransactions, setSavingsTransactions] = useState<SavingsTransaction[]>([]);
  const [depositAmount, setDepositAmount] = useState('');
  const [savingsAmount, setSavingsAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [groups, setGroups] = useState<SaccoGroup[]>([]);
  const [allGroups, setAllGroups] = useState<SaccoGroup[]>([]);
  const [activeTab, setActiveTab] = useState<'my-groups' | 'discover'>('my-groups');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contributionAmount: '',
    contributionFrequency: 'monthly',
    interestRate: '',
    maxMembers: '',
  });

  // Load user's SACCO groups and all available groups
  useEffect(() => {
    loadUserGroups(); // This will also load all groups
  }, [user]);

  const loadUserGroups = async () => {
    if (!user?.id) {
      console.log('No user ID available');
      return;
    }
    
    console.log('Loading groups for user:', user.id);
    
    try {
      // Get groups created by the user
      const response = await fetch(`/api/sacco-groups?creatorId=${user.id}`);
      console.log('Response status:', response.status);
      
      const result = await response.json();
      console.log('API response:', result);
      
      if (result.success) {
        console.log('Groups loaded:', result.data);
        setGroups(result.data || []);
        // Load all groups after user groups are loaded
        loadAllGroups(result.data || []);
      } else {
        console.error('Error loading groups:', result.message);
        toast.error('Failed to load SACCO groups');
      }
    } catch (error) {
      console.error('Error loading groups:', error);
      toast.error('Failed to load SACCO groups');
    }
  };

  const loadAllGroups = async (userGroups: SaccoGroup[] = []) => {
    try {
      // Get all public SACCO groups
      const response = await fetch('/api/sacco-groups');
      const result = await response.json();
      
      if (result.success) {
        // Filter out groups created by current user to avoid duplicates
        const publicGroups = result.data?.filter((group: SaccoGroup) => 
          !userGroups.some(userGroup => userGroup.id === group.id)
        ) || [];
        setAllGroups(publicGroups);
      } else {
        console.error('Error loading all groups:', result.message);
      }
    } catch (error) {
      console.error('Error loading all groups:', error);
    }
  };

  // Filter groups based on search query
  const filteredGroups = (groupList: SaccoGroup[]) => {
    if (!searchQuery.trim()) return groupList;
    
    return groupList.filter(group =>
      group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      group.description?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast.error('User not authenticated');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/sacco-groups', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          contributionAmount: parseFloat(formData.contributionAmount),
          contributionFrequency: formData.contributionFrequency,
          interestRate: parseFloat(formData.interestRate),
          maxMembers: parseInt(formData.maxMembers),
          createdBy: user.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('SACCO group created successfully!');
        setShowCreateForm(false);
        setFormData({
          name: '',
          description: '',
          contributionAmount: '',
          contributionFrequency: 'monthly',
          interestRate: '',
          maxMembers: '',
        });
        // Reload both user groups and all groups after creation
        loadUserGroups(); // This will also reload all groups
      } else {
        toast.error(result.message || 'Failed to create SACCO group');
      }
    } catch (error) {
      console.error('Error creating SACCO group:', error);
      toast.error('Failed to create SACCO group');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (group: SaccoGroup) => {
    setSelectedGroup(group);
    setShowDetailsModal(true);
  };

  const handleJoinGroup = async (group: SaccoGroup) => {
    if (!user?.id) {
      toast.error('Please log in to join a SACCO group');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/sacco-groups/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          groupId: group.id,
          userId: user.id,
          userName: (user as any).user_metadata?.full_name || user.email?.split('@')[0] || 'Unknown User',
          userEmail: user.email,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Membership application submitted! Waiting for admin approval.');
        setShowJoinModal(false);
      } else {
        toast.error(result.error || 'Failed to apply for membership');
      }
    } catch (error) {
      console.error('Error applying for membership:', error);
      toast.error('Failed to apply for membership');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!selectedGroup || !depositAmount || !user?.id) {
      toast.error('Please enter a valid deposit amount');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bitnob/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          saccoGroupId: selectedGroup.id,
          amount: parseFloat(depositAmount),
          currency: 'UGX',
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Deposit successful! Transaction is being processed via Bitnob.');
        setDepositAmount('');
        setShowDepositModal(false);
      } else {
        toast.error(result.message || 'Deposit failed');
      }
    } catch (error) {
      console.error('Error processing deposit:', error);
      toast.error('Deposit failed');
    } finally {
      setLoading(false);
    }
  };

  const loadMembershipApplications = async (groupId: string) => {
    try {
      const response = await fetch(`/api/sacco-groups/join?groupId=${groupId}`);
      const result = await response.json();
      if (result.success) {
        setMembershipApplications(result.applications || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
  };

  const handleApproveApplication = async (applicationId: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/sacco-groups/approve-membership', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ applicationId, approvedBy: user?.id }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Membership approved successfully!');
        if (selectedGroup) {
          loadMembershipApplications(selectedGroup.id);
        }
      } else {
        toast.error(result.message || 'Failed to approve membership');
      }
    } catch (error) {
      console.error('Error approving membership:', error);
      toast.error('Failed to approve membership');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateVirtualCard = async () => {
    if (!selectedGroup || !user?.id) {
      toast.error('Please select a SACCO group');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/bitnob/virtual-card', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          saccoGroupId: selectedGroup.id,
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Virtual card created successfully! You can now spend borderlessly.');
      } else {
        toast.error(result.message || 'Failed to create virtual card');
      }
    } catch (error) {
      console.error('Error creating virtual card:', error);
      toast.error('Failed to create virtual card');
    } finally {
      setLoading(false);
    }
  };

  // Savings Management Functions
  const loadPersonalSavings = async (groupId: string) => {
    if (!user?.id) return;

    try {
      const response = await fetch(`/api/savings?userId=${user.id}&groupId=${groupId}`);
      const result = await response.json();
      
      if (result.success) {
        setPersonalSavings(result.savings);
        setSavingsTransactions(result.transactions || []);
      }
    } catch (error) {
      console.error('Error loading personal savings:', error);
    }
  };

  const handleAddSavings = async () => {
    if (!selectedGroup || !user?.id || !savingsAmount) {
      toast.error('Please enter a valid amount');
      return;
    }

    const amount = parseFloat(savingsAmount);
    if (amount < 1000) {
      toast.error('Minimum savings amount is UGX 1,000');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/savings/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          groupId: selectedGroup.id,
          amount: amount,
          description: `Personal savings contribution of UGX ${amount.toLocaleString()}`
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Savings added successfully!');
        setSavingsAmount('');
        setShowAddSavingsModal(false);
        // Reload savings data
        loadPersonalSavings(selectedGroup.id);
      } else {
        toast.error(result.message || 'Failed to add savings');
      }
    } catch (error) {
      console.error('Error adding savings:', error);
      toast.error('Failed to add savings');
    } finally {
      setLoading(false);
    }
  };

  const handleWithdrawSavings = async (amount: number) => {
    if (!selectedGroup || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch('/api/savings/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          groupId: selectedGroup.id,
          amount: amount,
          description: `Savings withdrawal of UGX ${amount.toLocaleString()}`
        }),
      });

      const result = await response.json();
      if (result.success) {
        toast.success('Withdrawal processed successfully!');
        // Reload savings data
        loadPersonalSavings(selectedGroup.id);
      } else {
        toast.error(result.message || 'Failed to process withdrawal');
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast.error('Failed to process withdrawal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">SACCO Groups</h1>
        <p className="text-gray-600 mt-2">
          Manage your savings and loan groups or discover new ones to join
        </p>
      </div>

      {/* Tabs and Search Section */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('my-groups')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'my-groups'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              My Groups ({groups.length})
            </button>
            <button
              onClick={() => setActiveTab('discover')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'discover'
                  ? 'bg-white text-green-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Discover Groups ({allGroups.length})
            </button>
          </div>

          {/* Search and Create Button */}
          <div className="flex gap-3">
            <div className="relative">
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
              <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button 
              onClick={() => setShowCreateForm(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium whitespace-nowrap"
            >
              Create New Group
            </button>
          </div>
        </div>
      </div>

      {/* Create Group Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4">Create New SACCO Group</h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Group Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter group name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe your SACCO group"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monthly Contribution Amount (UGX) *
                </label>
                <input
                  type="number"
                  name="contributionAmount"
                  value={formData.contributionAmount}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Contribution Frequency *
                </label>
                <select
                  name="contributionFrequency"
                  value={formData.contributionFrequency}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Interest Rate (%) *
                </label>
                <input
                  type="number"
                  name="interestRate"
                  value={formData.interestRate}
                  onChange={handleInputChange}
                  required
                  min="0"
                  max="100"
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 5.0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Members *
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleInputChange}
                  required
                  min="5"
                  max="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 50"
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                    loading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {loading ? 'Creating...' : 'Create Group'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SACCO Group Details Modal */}
      {showDetailsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedGroup.name}</h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Group Name:</span>
                    <span className="text-gray-900">{selectedGroup.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Description:</span>
                    <span className="text-gray-900 text-right max-w-xs">
                      {selectedGroup.description || 'No description provided'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Created:</span>
                    <span className="text-gray-900">
                      {new Date(selectedGroup.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Group ID:</span>
                    <span className="text-gray-500 text-sm font-mono">
                      {selectedGroup.id.slice(0, 8)}...
                    </span>
                  </div>
                </div>
              </div>

              {/* Financial Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Details</h3>
                <div className="bg-blue-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Contribution Amount:</span>
                    <span className="font-bold text-blue-600">
                      UGX {selectedGroup.contribution_amount?.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Frequency:</span>
                    <span className="text-gray-900 capitalize">
                      {selectedGroup.contribution_frequency}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Interest Rate:</span>
                    <span className="font-bold text-green-600">
                      {selectedGroup.interest_rate}% per annum
                    </span>
                  </div>
                </div>
              </div>

              {/* Membership Details */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Membership</h3>
                <div className="bg-green-50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Current Members:</span>
                    <span className="font-bold text-green-600">
                      {selectedGroup.current_members}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Maximum Members:</span>
                    <span className="text-gray-900">{selectedGroup.max_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Available Slots:</span>
                    <span className="text-gray-900">
                      {selectedGroup.max_members - selectedGroup.current_members}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{
                        width: `${(selectedGroup.current_members / selectedGroup.max_members) * 100}%`
                      }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600">
                    {Math.round((selectedGroup.current_members / selectedGroup.max_members) * 100)}% full
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="flex-1 min-w-[120px] px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  className="flex-1 min-w-[120px] px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  onClick={() => {
                    setShowJoinModal(true);
                  }}
                >
                  Join Group
                </button>
                <button
                  className="flex-1 min-w-[120px] px-4 py-2 bg-green-700 text-white rounded-md hover:bg-green-800"
                  onClick={() => {
                    setShowDepositModal(true);
                  }}
                >
                  Deposit Money
                </button>
                <button
                  className="flex-1 min-w-[120px] px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
                  onClick={() => {
                    loadMembershipApplications(selectedGroup.id);
                    setShowMembersModal(true);
                  }}
                >
                  Manage Members
                </button>
                <button
                  className="flex-1 min-w-[120px] px-4 py-2 bg-green-800 text-white rounded-md hover:bg-green-900"
                  onClick={handleCreateVirtualCard}
                  disabled={loading}
                >
                  {loading ? 'Creating...' : 'Get Virtual Card'}
                </button>
                <button
                  className="flex-1 min-w-[120px] px-4 py-2 bg-green-400 text-white rounded-md hover:bg-green-500"
                  onClick={() => {
                    loadPersonalSavings(selectedGroup.id);
                    setShowSavingsModal(true);
                  }}
                >
                  My Savings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Join Group Modal */}
      {showJoinModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Join {selectedGroup.name}</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Membership Benefits</h3>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>• Monthly contribution: UGX {selectedGroup.contribution_amount?.toLocaleString()}</li>
                  <li>• Interest rate: {selectedGroup.interest_rate}% per annum</li>
                  <li>• Access to loans and savings</li>
                  <li>• Bitnob virtual card for borderless spending</li>
                  <li>• Bitcoin-backed financial services</li>
                </ul>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg">
                <p className="text-sm text-yellow-700">
                  📋 Your application will be reviewed by the group admin. You'll be notified once approved.
                </p>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => setShowJoinModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinGroup(selectedGroup)}
                disabled={loading}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                  loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Applying...' : 'Apply to Join'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deposit Money Modal */}
      {showDepositModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Deposit to {selectedGroup.name}</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">💳 Bitnob Integration</h3>
                <p className="text-sm text-green-700">
                  Secure deposits powered by Bitnob's Bitcoin infrastructure. 
                  Your funds are instantly converted and secured.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Deposit Amount (UGX) *
                </label>
                <input
                  type="number"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(e.target.value)}
                  min="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount to deposit"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum deposit: UGX 1,000
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Payment Methods</h4>
                <div className="flex space-x-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Mobile Money</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Bank Transfer</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Bitcoin</span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => setShowDepositModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeposit}
                disabled={loading || !depositAmount}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                  loading || !depositAmount 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : 'Deposit Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manage Members Modal */}
      {showMembersModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Manage Members - {selectedGroup.name}</h2>
              <button
                onClick={() => setShowMembersModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Pending Applications */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Pending Applications</h3>
                {membershipApplications.length > 0 ? (
                  <div className="space-y-3">
                    {membershipApplications
                      .filter(app => app.status === 'pending')
                      .map((application) => (
                        <div key={application.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                {application.user_name || 'Unknown User'}
                              </h4>
                              <p className="text-sm text-gray-500">{application.user_email}</p>
                              <p className="text-xs text-gray-400">
                                Applied: {new Date(application.applied_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleApproveApplication(application.id)}
                                disabled={loading}
                                className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:bg-gray-400"
                              >
                                Approve
                              </button>
                              <button
                                className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                                onClick={() => {
                                  // TODO: Implement reject functionality
                                  toast('Reject functionality coming soon!');
                                }}
                              >
                                Reject
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No pending applications</p>
                  </div>
                )}
              </div>

              {/* Current Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Current Members</h3>
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-green-800">
                      {selectedGroup.current_members} / {selectedGroup.max_members} members
                    </span>
                    <span className="text-sm text-green-600">
                      {selectedGroup.max_members - selectedGroup.current_members} slots available
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={() => setShowMembersModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Personal Savings Modal */}
      {showSavingsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">My Savings - {selectedGroup.name}</h2>
              <button
                onClick={() => setShowSavingsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-6">
              {/* Savings Overview */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">💰 Savings Overview</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      UGX {personalSavings?.balance?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">Current Balance</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">
                      UGX {personalSavings?.total_contributions?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">Total Saved</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      UGX {personalSavings?.interest_earned?.toLocaleString() || '0'}
                    </p>
                    <p className="text-sm text-gray-600">Interest Earned</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-purple-600">
                      {selectedGroup.interest_rate}%
                    </p>
                    <p className="text-sm text-gray-600">Interest Rate</p>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowAddSavingsModal(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  <span>Add Savings</span>
                </button>
                <button
                  onClick={() => {
                    const amount = prompt('Enter withdrawal amount (UGX):');
                    if (amount && !isNaN(Number(amount))) {
                      handleWithdrawSavings(Number(amount));
                    }
                  }}
                  disabled={!personalSavings?.balance || personalSavings.balance <= 0}
                  className={`flex-1 px-4 py-3 rounded-lg font-medium flex items-center justify-center space-x-2 ${
                    !personalSavings?.balance || personalSavings.balance <= 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-600 hover:bg-orange-700 text-white'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                  </svg>
                  <span>Withdraw</span>
                </button>
              </div>

              {/* Recent Transactions */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Recent Transactions</h3>
                {savingsTransactions.length > 0 ? (
                  <div className="space-y-3 max-h-60 overflow-y-auto">
                    {savingsTransactions.slice(0, 10).map((transaction) => (
                      <div key={transaction.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            transaction.type === 'deposit' ? 'bg-green-100 text-green-600' :
                            transaction.type === 'withdrawal' ? 'bg-orange-100 text-orange-600' :
                            'bg-yellow-100 text-yellow-600'
                          }`}>
                            {transaction.type === 'deposit' ? '↗️' : 
                             transaction.type === 'withdrawal' ? '↙️' : '💰'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 capitalize">{transaction.type}</p>
                            <p className="text-sm text-gray-500">{transaction.description}</p>
                            <p className="text-xs text-gray-400">
                              {new Date(transaction.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${
                            transaction.type === 'deposit' || transaction.type === 'interest' 
                              ? 'text-green-600' : 'text-orange-600'
                          }`}>
                            {transaction.type === 'withdrawal' ? '-' : '+'}UGX {transaction.amount.toLocaleString()}
                          </p>
                          <p className={`text-xs px-2 py-1 rounded-full ${
                            transaction.status === 'completed' ? 'bg-green-100 text-green-600' :
                            transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                            'bg-red-100 text-red-600'
                          }`}>
                            {transaction.status}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No transactions yet. Start saving today!</p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={() => setShowSavingsModal(false)}
                className="px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Savings Modal */}
      {showAddSavingsModal && selectedGroup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Add to Savings</h2>
            
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold text-green-800 mb-2">Personal Savings Account</h3>
                <p className="text-sm text-green-700">
                  Build your personal savings within {selectedGroup.name}. 
                  Earn {selectedGroup.interest_rate}% annual interest on your balance.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Savings Amount (UGX) *
                </label>
                <input
                  type="number"
                  value={savingsAmount}
                  onChange={(e) => setSavingsAmount(e.target.value)}
                  min="1000"
                  step="1000"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                  placeholder="Enter amount to save"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Minimum savings: UGX 1,000
                </p>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">💳 Payment via Bitnob</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Secure payment powered by Bitnob's Bitcoin infrastructure
                </p>
                <div className="flex space-x-2 text-xs">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Mobile Money</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Bank Transfer</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">Bitcoin</span>
                </div>
              </div>

              {personalSavings && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium text-gray-800 mb-2">Current Savings</h4>
                  <p className="text-sm text-gray-600">
                    Balance: <span className="font-bold text-green-600">UGX {personalSavings.balance.toLocaleString()}</span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Interest Earned: <span className="font-bold text-yellow-600">UGX {personalSavings.interest_earned.toLocaleString()}</span>
                  </p>
                </div>
              )}
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                onClick={() => setShowAddSavingsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddSavings}
                disabled={loading || !savingsAmount}
                className={`flex-1 px-4 py-2 rounded-md text-white font-medium ${
                  loading || !savingsAmount 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {loading ? 'Processing...' : 'Add Savings'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Groups List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {activeTab === 'my-groups' ? (
          // My Groups Tab
          filteredGroups(groups).length > 0 ? (
            filteredGroups(groups).map((group) => (
              <div key={group.id} className="bg-white p-6 rounded-lg shadow border">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    Owner
                  </span>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  {group.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members:</span>
                    <span className="font-medium">{group.current_members}/{group.max_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contribution:</span>
                    <span className="font-medium">UGX {group.contribution_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium capitalize">{group.contribution_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span className="font-medium">{group.interest_rate}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <button 
                    onClick={() => handleViewDetails(group)}
                    className="text-green-600 hover:text-green-700 text-sm font-medium"
                  >
                    Manage Group
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM9 9a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No groups match your search' : 'No SACCO groups yet'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery ? 'Try a different search term.' : 'Create your first SACCO group to start saving together.'}
              </p>
              {!searchQuery && (
                <button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
                >
                  Create Your First Group
                </button>
              )}
            </div>
          )
        ) : (
          // Discover Groups Tab
          filteredGroups(allGroups).length > 0 ? (
            filteredGroups(allGroups).map((group) => (
              <div key={group.id} className="bg-white p-6 rounded-lg shadow border hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    {group.max_members - group.current_members > 0 ? (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                        {group.max_members - group.current_members} slots left
                      </span>
                    ) : (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                        Full
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-gray-600 mb-4 text-sm">
                  {group.description}
                </p>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Members:</span>
                    <span className="font-medium">{group.current_members}/{group.max_members}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Contribution:</span>
                    <span className="font-medium">UGX {group.contribution_amount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Frequency:</span>
                    <span className="font-medium capitalize">{group.contribution_frequency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Interest Rate:</span>
                    <span className="font-medium">{group.interest_rate}%</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t flex space-x-3">
                  <button 
                    onClick={() => handleViewDetails(group)}
                    className="flex-1 text-green-600 hover:text-green-700 text-sm font-medium border border-green-200 hover:border-green-300 py-2 px-3 rounded-md text-center transition-colors"
                  >
                    View Details
                  </button>
                  {group.max_members - group.current_members > 0 && (
                    <button 
                      onClick={() => {
                        setSelectedGroup(group);
                        setShowJoinModal(true);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm font-medium py-2 px-3 rounded-md text-center transition-colors"
                    >
                      Join Group
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'No groups match your search' : 'No groups available to join'}
              </h3>
              <p className="text-gray-600 mb-4">
                {searchQuery 
                  ? 'Try a different search term or create a new group.' 
                  : 'Be the first to create a SACCO group in your community!'}
              </p>
              <button 
                onClick={() => setShowCreateForm(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium"
              >
                Create New Group
              </button>
            </div>
          )
        )}
      </div>
    </div>
  );
}
