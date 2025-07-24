'use client';

import { useAppSelector } from '@/store/hooks';
import { useRouter } from 'next/navigation';

export default function AuthTestPage() {
  const auth = useAppSelector((state) => state.auth);
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-6">Auth Test Page</h1>
        
        <div className="space-y-4">
          <div>
            <strong>Is Authenticated:</strong> {auth.isAuthenticated ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>Loading:</strong> {auth.loading ? 'Yes' : 'No'}
          </div>
          
          <div>
            <strong>User:</strong>
            <pre className="bg-gray-100 p-2 mt-2 rounded text-sm">
              {JSON.stringify(auth.user, null, 2)}
            </pre>
          </div>
          
          <div>
            <strong>Token:</strong> {auth.token ? 'Present' : 'Not present'}
          </div>
          
          <div>
            <strong>Error:</strong> {auth.error || 'None'}
          </div>
        </div>
        
        <div className="mt-6 space-x-4">
          <button 
            onClick={() => router.push('/dashboard')}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Go to Dashboard
          </button>
          
          <button 
            onClick={() => router.push('/admin')}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Go to Admin
          </button>
          
          <button 
            onClick={() => router.push('/login')}
            className="bg-gray-600 text-white px-4 py-2 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    </div>
  );
}
