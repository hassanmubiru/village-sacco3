'use client';

import { useState, useEffect } from 'react';

export default function SavingsTestPage() {
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const addTestResult = (test: string, result: any, success: boolean) => {
    setTestResults(prev => [...prev, { test, result, success, timestamp: new Date().toISOString() }]);
  };

  const runSavingsTests = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Auto-approve pending memberships
      addTestResult('Auto-approving memberships', 'Starting...', true);
      const approveResponse = await fetch('/api/admin/auto-approve-memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const approveResult = await approveResponse.json();
      addTestResult('Auto-approve memberships', approveResult, approveResponse.ok);

      // Test 2: Try to add savings with a test user
      addTestResult('Testing savings addition', 'Starting...', true);
      
      // First, let's see what groups exist
      const groupsResponse = await fetch('/api/sacco-groups');
      const groupsResult = await groupsResponse.json();
      addTestResult('Fetch SACCO groups', groupsResult, groupsResponse.ok);

      if (groupsResult.success && groupsResult.data && groupsResult.data.length > 0) {
        const testGroup = groupsResult.data[0];
        
        // Test adding savings
        const savingsResponse = await fetch('/api/savings/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'test-user-123',
            groupId: testGroup.id,
            amount: 5000,
            description: 'Test savings deposit'
          })
        });
        const savingsResult = await savingsResponse.json();
        addTestResult('Add test savings', savingsResult, savingsResponse.ok);
      } else {
        addTestResult('Add test savings', 'No SACCO groups found to test with', false);
      }

      // Test 3: Check current database state
      const membershipsResponse = await fetch('/api/admin/approve-membership');
      const membershipsResult = await membershipsResponse.json();
      addTestResult('Check pending memberships', membershipsResult, membershipsResponse.ok);

    } catch (error) {
      addTestResult('Test execution', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  const createTestData = async () => {
    setLoading(true);
    try {
      // Create a test SACCO group
      const groupResponse = await fetch('/api/sacco-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Savings Group',
          description: 'A test group for savings functionality',
          contributionAmount: 5000,
          contributionFrequency: 'monthly',
          interestRate: 2.5,
          maxMembers: 10,
          createdBy: 'test-admin-123'
        })
      });
      const groupResult = await groupResponse.json();
      addTestResult('Create test group', groupResult, groupResponse.ok);

      if (groupResult.success) {
        // Join the group
        const joinResponse = await fetch(`/api/sacco-groups/${groupResult.data.id}/membership`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: 'test-user-123',
            action: 'join'
          })
        });
        const joinResult = await joinResponse.json();
        addTestResult('Join test group', joinResult, joinResponse.ok);
      }
    } catch (error) {
      addTestResult('Create test data', `Error: ${error}`, false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            💰 SACCO Savings Functionality Test
          </h1>
          
          <div className="mb-6">
            <p className="text-gray-600 mb-4">
              This page helps test the fixed savings functionality. The original error was caused by 
              the API trying to use non-existent database tables (<code>personal_savings</code> and 
              <code>savings_transactions</code>). This has been fixed to use the correct schema.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-blue-800 mb-2">✅ What was fixed:</h3>
              <ul className="text-blue-700 space-y-1">
                <li>• Updated API to use <code>savings_accounts</code> instead of <code>personal_savings</code></li>
                <li>• Updated API to use <code>transactions</code> instead of <code>savings_transactions</code></li>
                <li>• Added proper membership validation</li>
                <li>• Added better error handling and debugging</li>
                <li>• Created admin endpoints for membership approval</li>
              </ul>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={createTestData}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? 'Creating...' : '🏗️ Create Test Data (Group + Membership)'}
            </button>

            <button
              onClick={runSavingsTests}
              disabled={loading}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400"
            >
              {loading ? 'Testing...' : '🧪 Run Savings Tests'}
            </button>
          </div>

          {testResults.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold mb-4">Test Results:</h2>
              <div className="space-y-3">
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      result.success 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className={`font-semibold ${
                        result.success ? 'text-green-800' : 'text-red-800'
                      }`}>
                        {result.success ? '✅' : '❌'} {result.test}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {new Date(result.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className={`text-sm overflow-auto ${
                      result.success ? 'text-green-700' : 'text-red-700'
                    }`}>
                      {JSON.stringify(result.result, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">How to test manually:</h3>
            <ol className="text-gray-700 space-y-1">
              <li>1. Click "Create Test Data" to set up a test group and membership</li>
              <li>2. Click "Run Savings Tests" to auto-approve and test savings</li>
              <li>3. Go to the main SACCO page and try adding savings to see the UI</li>
              <li>4. Check the browser console for detailed API logs</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
