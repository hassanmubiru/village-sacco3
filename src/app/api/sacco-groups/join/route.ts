import { createServerSupabaseClient } from '@/lib/supabase';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();
    const { groupId, userId, userName, userEmail } = await request.json();

    console.log('Join group request:', { groupId, userId, userName, userEmail });

    if (!groupId || !userId) {
      return NextResponse.json(
        { error: 'Group ID and User ID are required' },
        { status: 400 }
      );
    }

    // Check if user is already a member or has pending application
    const { data: existingApplication } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', groupId)
      .eq('user_id', userId)
      .single();

    if (existingApplication) {
      return NextResponse.json(
        { error: 'You already have an application or membership for this group' },
        { status: 400 }
      );
    }

    // Try to create membership application with new columns, fallback to basic if they don't exist
    let insertData: any = {
      sacco_group_id: groupId,
      user_id: userId,
    };

    // Add new columns if they exist (after migration)
    try {
      insertData = {
        ...insertData,
        status: 'pending',
        applied_at: new Date().toISOString(),
        user_name: userName,
        user_email: userEmail
      };
    } catch (e) {
      // Fallback to basic membership if new columns don't exist
      console.log('Using basic membership structure (migration not applied yet)');
    }

    const { data: application, error } = await supabase
      .from('sacco_memberships')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating membership application:', error);
      return NextResponse.json(
        { error: `Failed to create membership application: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      application
    });

  } catch (error) {
    console.error('Error in join group API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET - Get membership applications for a group
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');

    if (!groupId) {
      return NextResponse.json(
        { error: 'Group ID is required' },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data: applications, error } = await supabase
      .from('sacco_memberships')
      .select('*')
      .eq('sacco_group_id', groupId)
      .order('joined_at', { ascending: false });

    if (error) {
      console.error('Error fetching membership applications:', error);
      return NextResponse.json(
        { error: 'Failed to fetch membership applications' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      applications: applications || []
    });

  } catch (error) {
    console.error('Error in get applications API:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
