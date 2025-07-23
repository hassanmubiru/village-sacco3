import { NextRequest, NextResponse } from 'next/server';
import { SaccoGroupService } from '../../../services/sacco.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const creatorId = searchParams.get('creatorId');
    const search = searchParams.get('search');

    if (userId) {
      // Get SACCO groups for a specific user
      const { data, error } = await SaccoGroupService.getUserSaccoGroups(userId);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (creatorId) {
      // Get SACCO groups created by a specific user
      const { data, error } = await SaccoGroupService.getSaccoGroupsByCreator(creatorId);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    if (search) {
      // Search SACCO groups
      const { data, error } = await SaccoGroupService.searchSaccoGroups(search);
      if (error) {
        return NextResponse.json({ message: error }, { status: 400 });
      }
      return NextResponse.json({ success: true, data });
    }

    // Get all SACCO groups
    const { data, error } = await SaccoGroupService.getAllSaccoGroups();
    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('SACCO groups GET error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      description,
      contributionAmount,
      contributionFrequency,
      interestRate,
      maxMembers,
      createdBy,
    } = await request.json();

    // Validation
    if (!name || !contributionAmount || !contributionFrequency || !interestRate || !maxMembers || !createdBy) {
      return NextResponse.json(
        { message: 'All required fields must be provided' },
        { status: 400 }
      );
    }

    const { data, error } = await SaccoGroupService.createSaccoGroup({
      name,
      description,
      contribution_amount: contributionAmount,
      contribution_frequency: contributionFrequency,
      interest_rate: interestRate,
      max_members: maxMembers,
      created_by: createdBy,
      current_members: 1, // Creator is the first member
    });

    if (error) {
      return NextResponse.json({ message: error }, { status: 400 });
    }

    // Automatically add creator as admin member
    await SaccoGroupService.joinSaccoGroup(createdBy, data!.id);
    await SaccoGroupService.updateMemberRole(createdBy, data!.id, 'admin');

    return NextResponse.json({
      success: true,
      message: 'SACCO group created successfully',
      data,
    }, { status: 201 });
  } catch (error) {
    console.error('SACCO group creation error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
