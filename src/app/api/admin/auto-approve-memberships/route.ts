/**
 * Test Helper: Auto-approve all pending SACCO memberships
 * This can be run during development to automatically approve memberships for testing
 */

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    // Get all pending memberships
    const { data: pendingMemberships, error: fetchError } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('status', 'pending');

    if (fetchError) {
      console.error('Error fetching pending memberships:', fetchError);
      return NextResponse.json(
        { error: 'Failed to fetch pending memberships' },
        { status: 500 }
      );
    }

    if (!pendingMemberships || pendingMemberships.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No pending memberships to approve',
        approved: 0
      });
    }

    // Auto-approve all pending memberships
    const { data: approvedMemberships, error: updateError } = await supabase
      .from('sacco_memberships')
      .update({
        status: 'approved',
        is_active: true,
        approved_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      })
      .eq('status', 'pending')
      .select();

    if (updateError) {
      console.error('Error auto-approving memberships:', updateError);
      return NextResponse.json(
        { error: 'Failed to auto-approve memberships' },
        { status: 500 }
      );
    }

    console.log(`Auto-approved ${approvedMemberships?.length || 0} memberships`);

    return NextResponse.json({
      success: true,
      message: `Successfully auto-approved ${approvedMemberships?.length || 0} memberships`,
      approved: approvedMemberships?.length || 0,
      memberships: approvedMemberships
    });

  } catch (error) {
    console.error('Error in auto-approve API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
