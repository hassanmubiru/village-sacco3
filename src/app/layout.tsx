import React from 'react';
import './globals.css';
import { ReduxProvider } from '@/store/provider';
import ClientToaster from '@/components/ClientToaster';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <ReduxProvider>
          {children}
          <ClientToaster />
        </ReduxProvider>
      </body>
    </html>
  );
}