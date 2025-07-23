// This file exports TypeScript types and interfaces used in the application to ensure type safety.

// Database types
export * from './database.types';
export * from './bitnob.types';

export interface User {
    id: string;
    email: string;
    name?: string;
    createdAt: string;
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