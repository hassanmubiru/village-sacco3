import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    const { email, password } = await request.json();

    // Here you would typically validate the user credentials and authenticate
    // For example, using Supabase or another authentication service

    // Mock response for demonstration purposes
    if (email === 'test@example.com' && password === 'password') {
        return NextResponse.json({ message: 'Login successful' }, { status: 200 });
    } else {
        return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
    }
}

export async function GET(request: Request) {
    // Handle GET requests for authentication, if needed
    return NextResponse.json({ message: 'Authentication route' }, { status: 200 });
}