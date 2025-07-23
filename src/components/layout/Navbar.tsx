'use client';

import React from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '../../store/hooks';
import { logoutUser } from '../../store/slices/authSlice';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push('/login');
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className="bg-blue-600 text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/dashboard" className="text-xl font-bold">
              Village SACCO
            </Link>
            <div className="hidden md:flex space-x-6">
              <Link href="/dashboard" className="hover:text-blue-200 transition-colors">
                Dashboard
              </Link>
              <Link href="/sacco" className="hover:text-blue-200 transition-colors">
                SACCO Groups
              </Link>
              <Link href="/transactions" className="hover:text-blue-200 transition-colors">
                Transactions
              </Link>
              <Link href="/wallet" className="hover:text-blue-200 transition-colors">
                Wallet
              </Link>
              {(user?.role === 'admin' || user?.role === 'super_admin') && (
                <Link href="/admin" className="hover:text-blue-200 transition-colors bg-blue-700 px-3 py-1 rounded">
                  Admin
                </Link>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm">
              Welcome, {user?.name}
            </span>
            <button
              onClick={handleLogout}
              className="bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded text-sm transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
