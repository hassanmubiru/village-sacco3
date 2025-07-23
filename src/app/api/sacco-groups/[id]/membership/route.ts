import { NextRequest, NextResponse } from 'next/server';
import { SaccoGroupService } from '../../../../../services/sacco.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId, action } = await request.json();

    if (!userId || !action) {
      return NextResponse.json(
        { message: 'User ID and action are required' },
        { status: 400 }
      );
    }

    if (action === 'join') {
      const { data, error } = await SaccoGroupService.joinSaccoGroup(userId, params.id);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully joined SACCO group',
        data,
      });
    }

    if (action === 'leave') {
      const { error } = await SaccoGroupService.leaveSaccoGroup(userId, params.id);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        message: 'Successfully left SACCO group',
      });
    }

    return NextResponse.json(
      { message: 'Invalid action. Use "join" or "leave"' },
      { status: 400 }
    );
  } catch (error) {
    console.error('SACCO group membership error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
