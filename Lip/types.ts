export interface CheckInRecord {
  _id: string;
  userIdNumber: string;
  position: string;
  fullName?: string;
  purpose?: string;
  checkInTime: Date;
  checkOutTime?: Date;
  location: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Position {
  _id: string;
  name: string;
  type: 'Student' | 'Staff' | 'Visitor';
  isActive: boolean;
}

export interface CheckInRequest {
  userIdNumber: string;
  position: string;
  fullName?: string;
  purpose?: string;
  location?: string;
}

export interface ReportFilter {
  startDate?: string;
  endDate?: string;
  positionType?: string;
  userIdNumber?: string;
}

export interface DashboardStats {
  totalCheckInsToday: number;
  currentOnCampus: number;
  checkInsByPosition: Record<string, number>;
}