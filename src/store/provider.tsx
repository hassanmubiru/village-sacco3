'use client';

import React, { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from './index';
import { checkAuthStatus } from './slices/authSlice';

function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Check authentication status on app load
    store.dispatch(checkAuthStatus());
  }, []);

  // Prevent hydration issues by only rendering auth-dependent content after mount
  if (!isMounted) {
    return <>{children}</>;
  }

  return <>{children}</>;
}

export function ReduxProvider({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </Provider>
  );
}
