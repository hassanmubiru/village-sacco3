import { NextRequest, NextResponse } from 'next/server';
import { SaccoGroupService } from '../../../../services/sacco.service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const { searchParams } = new URL(request.url);
    const includeMembers = searchParams.get('includeMembers') === 'true';
    const includeStats = searchParams.get('includeStats') === 'true';

    const { data: group, error } = await SaccoGroupService.getSaccoGroupById(resolvedParams.id);
    if (error) {
      return NextResponse.json({ message: error }, { status: 404 });
    }

    const result: any = { group };

    if (includeMembers) {
      const { data: members } = await SaccoGroupService.getGroupMembers(resolvedParams.id);
      result.members = members;
    }

    if (includeStats) {
      const { data: stats } = await SaccoGroupService.getGroupStatistics(resolvedParams.id);
      result.statistics = stats;
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('SACCO group GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const resolvedParams = await params;
  try {
    const updates = await request.json();

    const { data, error } = await SaccoGroupService.updateSaccoGroup(resolvedParams.id, updates);
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'SACCO group updated successfully',
      data,
    });
  } catch (error) {
    console.error('SACCO group update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
