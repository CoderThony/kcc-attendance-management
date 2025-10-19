'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';
import { useRouter } from 'next/navigation';
import AdminSidebar from '@/components/AdminSidebar';
import StatsCard from '@/components/ui/StatsCard';

interface DashboardStats {
  totalCheckInsToday: number;
  currentOnCampus: number;
  checkInsByPosition: Record<string, number>;
}

export default function AdminDashboard() {
  const { user, isLoading } = useUser();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/api/auth/login');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      const response = await fetch('/api/admin?action=dashboard-stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <AdminSidebar />
      
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user.name}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatsCard
            title="Total Check-ins Today"
            value={stats?.totalCheckInsToday || 0}
            icon="users"
            color="blue"
          />
          <StatsCard
            title="Currently On Campus"
            value={stats?.currentOnCampus || 0}
            icon="user-check"
            color="green"
          />
          <StatsCard
            title="Active Positions"
            value={Object.keys(stats?.checkInsByPosition || {}).length}
            icon="layers"
            color="purple"
          />
        </div>

        {/* Position Breakdown */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Check-ins by Position
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {stats?.checkInsByPosition && Object.entries(stats.checkInsByPosition).map(([position, count]) => (
              <div key={position} className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-700">{position}</span>
                  <span className="text-2xl font-bold text-blue-600">{count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}