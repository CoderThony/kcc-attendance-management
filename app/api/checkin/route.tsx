import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CheckInRecord from '@/models/CheckInRecord';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();

    const body = await request.json();
    const { userIdNumber, position, fullName, purpose, location = 'Main Entrance' } = body;

    // Validate required fields
    if (!userIdNumber || !position) {
      return NextResponse.json(
        { error: 'ID number and position are required' },
        { status: 400 }
      );
    }

    // Validate purpose for Students and Visitors
    if ((position === 'Student' || position === 'Visitor') && !purpose) {
      return NextResponse.json(
        { error: 'Purpose is required for Students and Visitors' },
        { status: 400 }
      );
    }

    // Check if user is already checked in
    const existingCheckIn = await CheckInRecord.findOne({
      userIdNumber,
      checkOutTime: { $exists: false }
    });

    if (existingCheckIn) {
      return NextResponse.json(
        { error: `User ${userIdNumber} is already checked in since ${existingCheckIn.checkInTime}` },
        { status: 400 }
      );
    }

    // Create new check-in record
    const checkInRecord = new CheckInRecord({
      userIdNumber,
      position,
      fullName,
      purpose,
      location,
      checkInTime: new Date(),
    });

    await checkInRecord.save();

    return NextResponse.json({
      message: 'Check-in successful',
      record: {
        id: checkInRecord._id,
        userIdNumber: checkInRecord.userIdNumber,
        position: checkInRecord.position,
        checkInTime: checkInRecord.checkInTime,
      }
    });

  } catch (error) {
    console.error('Check-in error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}