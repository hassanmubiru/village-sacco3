import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { membershipId, userId, groupId } = await request.json();

    if (!membershipId && (!userId || !groupId)) {
      return NextResponse.json(
        { error: 'Either membershipId or (userId and groupId) are required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    let whereClause: any = {};
    if (membershipId) {
      whereClause.id = membershipId;
    } else {
      whereClause.user_id = userId;
      whereClause.sacco_group_id = groupId;
    }

    // Update membership status to approved
    const { data: updatedMembership, error: updateError } = await supabase
      .from('sacco_memberships')
      .update({
        status: 'approved',
        is_active: true,
        approved_at: new Date().toISOString(),
        joined_at: new Date().toISOString()
      })
      .match(whereClause)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving membership:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve membership', details: updateError.message },
        { status: 500 }
      );
    }

    if (!updatedMembership) {
      return NextResponse.json(
        { error: 'Membership not found' },
        { status: 404 }
      );
    }

    // Update group member count
    const { error: groupUpdateError } = await supabase.rpc('increment_group_members', {
      group_id: updatedMembership.sacco_group_id
    });

    if (groupUpdateError) {
      console.warn('Warning: Could not update group member count:', groupUpdateError);
      // Don't fail the request for this
    }

    return NextResponse.json({
      success: true,
      message: 'Membership approved successfully',
      membership: updatedMembership
    });

  } catch (error) {
    console.error('Error in approve membership API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - List pending memberships for approval
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    const supabase = createServerSupabaseClient();

    let query = supabase
      .from('sacco_memberships')
      .select(`
        *,
        users (
          id,
          first_name,
          last_name,
          email,
          phone
        ),
        sacco_groups (
          id,
          name
        )
      `)
      .eq('status', 'pending');

    if (groupId) {
      query = query.eq('sacco_group_id', groupId);
    }

    const { data: memberships, error } = await query.order('applied_at', { ascending: false });

    if (error) {
      console.error('Error fetching pending memberships:', error);
      return NextResponse.json(
        { error: 'Failed to fetch pending memberships' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      memberships
    });

  } catch (error) {
    console.error('Error in GET approve membership API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
