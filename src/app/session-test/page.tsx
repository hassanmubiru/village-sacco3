'use client';

import { useAppSelector } from '@/store/hooks';
import { supabase } from '@/lib/supabase';
import { useState, useEffect } from 'react';

export default function SessionTestPage() {
  const auth = useAppSelector((state) => state.auth);
  const [supabaseSession, setSupabaseSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Supabase session:', session);
      setSupabaseSession(session);
      setLoading(false);
    };

    checkSession();
  }, []);

  const testDashboard = () => {
    window.location.href = '/dashboard';
  };

  if (loading) {
    return <div className="p-8">Loading session info...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Session Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Redux Auth State</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Is Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}</div>
              <div><strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}</div>
              <div><strong>Error:</strong> {auth.error || 'None'}</div>
              <div><strong>User ID:</strong> {auth.user?.id || 'None'}</div>
              <div><strong>User Role:</strong> {auth.user?.role || 'None'}</div>
              <div><strong>Token Present:</strong> {auth.token ? 'Yes' : 'No'}</div>
            </div>
          </div>
          
          <div>
            <h2 className="text-lg font-semibold mb-4">Supabase Session</h2>
            <div className="space-y-2 text-sm">
              <div><strong>Session Exists:</strong> {supabaseSession ? 'Yes' : 'No'}</div>
              {supabaseSession && (
                <>
                  <div><strong>User ID:</strong> {supabaseSession.user?.id}</div>
                  <div><strong>Email:</strong> {supabaseSession.user?.email}</div>
                  <div><strong>Access Token:</strong> {supabaseSession.access_token ? 'Present' : 'None'}</div>
                  <div><strong>Expires At:</strong> {supabaseSession.expires_at ? new Date(supabaseSession.expires_at * 1000).toLocaleString() : 'None'}</div>
                </>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Full Redux User Object</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(auth.user, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-4">Full Supabase Session</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto">
            {JSON.stringify(supabaseSession, null, 2)}
          </pre>
        </div>
        
        <div className="mt-6 space-x-4">
          <button 
            onClick={testDashboard}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Test Dashboard Access
          </button>
          
          <button 
            onClick={() => window.location.href = '/login'}
            className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
