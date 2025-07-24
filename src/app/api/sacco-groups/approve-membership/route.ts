import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { applicationId } = await request.json();

    if (!applicationId) {
      return NextResponse.json(
        { error: 'Application ID is required' },
        { status: 400 }
      );
    }

    // Update the membership status to approved
    const { data: membership, error: updateError } = await supabase
      .from('sacco_memberships')
      .update({ 
        status: 'approved',
        approved_at: new Date().toISOString()
      })
      .eq('id', applicationId)
      .select()
      .single();

    if (updateError) {
      console.error('Error approving membership:', updateError);
      return NextResponse.json(
        { error: 'Failed to approve membership' },
        { status: 500 }
      );
    }

    // Update the group's current member count
    const { data: currentGroup } = await supabase
      .from('sacco_groups')
      .select('current_members')
      .eq('id', membership.sacco_group_id)
      .single();

    if (currentGroup) {
      const { error: groupUpdateError } = await supabase
        .from('sacco_groups')
        .update({ 
          current_members: currentGroup.current_members + 1
        })
        .eq('id', membership.sacco_group_id);

      if (groupUpdateError) {
        console.error('Error updating group member count:', groupUpdateError);
        // Still return success since membership was approved
      }
    }

    return NextResponse.json({
      success: true,
      membership
    });

  } catch (error) {
    console.error('Error in approve membership API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
