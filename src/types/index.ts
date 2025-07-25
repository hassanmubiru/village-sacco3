// This file exports TypeScript types and interfaces used in the application to ensure type safety.

// Database types
export * from './database.types';
export * from './bitnob.types';

export interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    bitnob_wallet_id?: string;
    kyc_status: 'pending' | 'approved' | 'rejected' | 'not_started';
    is_active: boolean;
    created_at: string;
    updated_at: string;
    name?: string; // Keep for backward compatibility
}

export interface AuthResponse {
    user: User;
    accessToken: string;
}

export interface ApiError {
    message: string;
    statusCode: number;
}

export interface ButtonProps {
    label: string;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}