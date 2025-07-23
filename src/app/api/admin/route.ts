import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      }
    }
  );

  try {
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'stats':
        return await getAdminStats(supabase);
      case 'users':
        return await getAllUsers(supabase);
      case 'groups':
        return await getAllSaccoGroups(supabase);
      case 'transactions':
        return await getAllTransactions(supabase);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const cookieStore = cookies();
  
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookieStore.set(name, value, options);
        },
        remove(name: string, options: any) {
          cookieStore.delete(name);
        },
      }
    }
  );

  try {
    // Check if user is authenticated and is admin
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile to check role
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError || !profile || (profile.role !== 'admin' && profile.role !== 'super_admin')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'update_user':
        return await updateUser(supabase, data);
      case 'update_group':
        return await updateSaccoGroup(supabase, data);
      case 'approve_kyc':
        return await approveKyc(supabase, data);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getAdminStats(supabase: any) {
  try {
    // Get total and active users
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get total and active SACCO groups
    const { count: totalSaccoGroups } = await supabase
      .from('sacco_groups')
      .select('*', { count: 'exact', head: true });

    const { count: activeSaccoGroups } = await supabase
      .from('sacco_groups')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get transaction stats
    const { count: totalTransactions } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true });

    const { data: volumeData } = await supabase
      .from('transactions')
      .select('amount')
      .eq('status', 'completed');

    const totalVolume = volumeData?.reduce((sum: number, tx: any) => sum + tx.amount, 0) || 0;

    // Get pending KYC count
    const { count: pendingKycCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('kyc_status', 'pending');

    const stats = {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalSaccoGroups: totalSaccoGroups || 0,
      activeSaccoGroups: activeSaccoGroups || 0,
      totalTransactions: totalTransactions || 0,
      totalVolume,
      pendingKycCount: pendingKycCount || 0,
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

async function getAllUsers(supabase: any) {
  try {
    const { data: users, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

async function getAllSaccoGroups(supabase: any) {
  try {
    const { data: groups, error } = await supabase
      .from('sacco_groups')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ groups });
  } catch (error) {
    console.error('Error fetching SACCO groups:', error);
    return NextResponse.json({ error: 'Failed to fetch SACCO groups' }, { status: 500 });
  }
}

async function getAllTransactions(supabase: any) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

async function updateUser(supabase: any, data: any) {
  try {
    const { userId, updates } = data;
    
    const { data: user, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

async function updateSaccoGroup(supabase: any, data: any) {
  try {
    const { groupId, updates } = data;
    
    const { data: group, error } = await supabase
      .from('sacco_groups')
      .update(updates)
      .eq('id', groupId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ group });
  } catch (error) {
    console.error('Error updating SACCO group:', error);
    return NextResponse.json({ error: 'Failed to update SACCO group' }, { status: 500 });
  }
}

async function approveKyc(supabase: any, data: any) {
  try {
    const { userId, approved } = data;
    const status = approved ? 'approved' : 'rejected';
    
    const { data: user, error } = await supabase
      .from('users')
      .update({ kyc_status: status })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating KYC status:', error);
    return NextResponse.json({ error: 'Failed to update KYC status' }, { status: 500 });
  }
}
