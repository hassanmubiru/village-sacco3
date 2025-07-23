'use client';

import React, { useEffect, useState } from 'react';
import { useAppSelector } from '../store/hooks';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Small delay to ensure Redux store is hydrated
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (isAuthenticated) {
        router.push('/dashboard');
      } else {
        router.push('/login');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Village SACCO</h1>
          <p className="text-gray-600">Your community financial platform</p>
          <div className="mt-8 animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return null;
}