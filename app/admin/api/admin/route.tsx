import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0';
import dbConnect from '@/lib/db';
import CheckInRecord from '@/models/CheckInRecord';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'dashboard-stats':
        return await getDashboardStats();
      case 'current-on-campus':
        return await getCurrentOnCampus();
      case 'attendance-report':
        return await getAttendanceReport(searchParams);
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function getDashboardStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const totalToday = await CheckInRecord.countDocuments({
    checkInTime: { $gte: today }
  });

  const currentOnCampus = await CheckInRecord.countDocuments({
    checkOutTime: { $exists: false }
  });

  const todayByPosition = await CheckInRecord.aggregate([
    {
      $match: {
        checkInTime: { $gte: today }
      }
    },
    {
      $group: {
        _id: '$position',
        count: { $sum: 1 }
      }
    }
  ]);

  const checkInsByPosition = todayByPosition.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    totalCheckInsToday: totalToday,
    currentOnCampus,
    checkInsByPosition
  });
}

async function getCurrentOnCampus() {
  const currentVisitors = await CheckInRecord.find({
    checkOutTime: { $exists: false }
  }).sort({ checkInTime: -1 });

  return NextResponse.json(currentVisitors);
}

async function getAttendanceReport(searchParams: URLSearchParams) {
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');
  const positionType = searchParams.get('positionType');
  const userIdNumber = searchParams.get('userIdNumber');

  let query: any = {};

  if (startDate) {
    query.checkInTime = { ...query.checkInTime, $gte: new Date(startDate) };
  }

  if (endDate) {
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    query.checkInTime = { ...query.checkInTime, $lt: end };
  }

  if (positionType && positionType !== 'All') {
    query.position = positionType;
  }

  if (userIdNumber) {
    query.userIdNumber = { $regex: userIdNumber, $options: 'i' };
  }

  const records = await CheckInRecord.find(query).sort({ checkInTime: -1 });

  const report = {
    records,
    totalCheckIns: records.length,
    currentOnCampus: records.filter((r: any) => !r.checkOutTime).length,
    checkInsByPosition: records.reduce((acc: Record<string, number>, record: any) => {
      acc[record.position] = (acc[record.position] || 0) + 1;
      return acc;
    }, {})
  };

  return NextResponse.json(report);
}