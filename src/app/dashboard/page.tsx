'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { applicationsAPI, roomsAPI } from '@/lib/api';
import {
  DocumentTextIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';

interface DashboardStats {
  applications?: {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  };
  rooms?: {
    total: number;
    available: number;
    occupied: number;
    occupancy_rate: number;
  };
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({});
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const newStats: DashboardStats = {};
      
      if (user?.user_type !== 'student') {
        try {
          const applicationsResponse = await applicationsAPI.getStats();
          if (applicationsResponse.data.success) {
            newStats.applications = applicationsResponse.data.data;
          }
        } catch (error) {
          console.warn('Failed to fetch application stats:', error);
          // Set default values if API fails
          newStats.applications = {
            total: 0,
            pending: 0,
            approved: 0,
            rejected: 0
          };
        }

        try {
          const roomsResponse = await roomsAPI.getStats();
          if (roomsResponse.data.success) {
            newStats.rooms = roomsResponse.data.data;
          }
        } catch (error) {
          console.warn('Failed to fetch room stats:', error);
          // Set default values if API fails
          newStats.rooms = {
            total: 0,
            available: 0,
            occupied: 0,
            occupancy_rate: 0
          };
        }
      }

      setStats(newStats);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      // Set empty stats on complete failure
      setStats({});
    } finally {
      setLoading(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getStudentStats = () => [
    {
      name: 'My Applications',
      value: 'View',
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/applications',
    },
    {
      name: 'Room Status',
      value: user?.assigned_block ? 'Assigned' : 'Not Assigned',
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      href: '/rooms',
    },
    {
      name: 'Change Requests',
      value: 'Manage',
      icon: ClipboardDocumentCheckIcon,
      color: 'bg-yellow-500',
      href: '/change-requests',
    },
  ];

  const getStaffStats = () => [
    {
      name: 'Total Applications',
      value: stats.applications?.total || 0,
      icon: DocumentTextIcon,
      color: 'bg-blue-500',
      href: '/applications',
    },
    {
      name: 'Pending Applications',
      value: stats.applications?.pending || 0,
      icon: DocumentTextIcon,
      color: 'bg-yellow-500',
      href: '/applications?status=pending',
    },
    {
      name: 'Total Rooms',
      value: stats.rooms?.total || 0,
      icon: BuildingOfficeIcon,
      color: 'bg-green-500',
      href: '/rooms',
    },
    {
      name: 'Occupancy Rate',
      value: `${stats.rooms?.occupancy_rate || 0}%`,
      icon: UserGroupIcon,
      color: 'bg-purple-500',
      href: '/rooms',
    },
  ];

  const statsToShow = user?.user_type === 'student' ? getStudentStats() : getStaffStats();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {getGreeting()}, {user?.name}!
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Welcome to the Dormitory Management System
          </p>
        </div>

        {/* Student Profile Card - Only for Students */}
        {user?.user_type === 'student' && (
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                👤 My Profile
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="border-l-4 border-blue-500 pl-4">
                  <p className="text-sm text-gray-500">Student ID</p>
                  <p className="text-base font-semibold text-gray-900">{user?.student_id || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-green-500 pl-4">
                  <p className="text-sm text-gray-500">Department</p>
                  <p className="text-base font-semibold text-gray-900">{user?.department || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-purple-500 pl-4">
                  <p className="text-sm text-gray-500">Gender</p>
                  <p className="text-base font-semibold text-gray-900">
                    {user?.gender ? (
                      <>
                        {user.gender === 'male' ? '👨 Male' : '👩 Female'}
                      </>
                    ) : (
                      <span className="text-orange-600">⚠️ Not Set</span>
                    )}
                  </p>
                </div>
                <div className="border-l-4 border-yellow-500 pl-4">
                  <p className="text-sm text-gray-500">Year Level</p>
                  <p className="text-base font-semibold text-gray-900">
                    {user?.year_level ? `Year ${user.year_level}` : 'N/A'}
                  </p>
                </div>
                <div className="border-l-4 border-red-500 pl-4">
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="text-base font-semibold text-gray-900 truncate">{user?.email || 'N/A'}</p>
                </div>
                <div className="border-l-4 border-indigo-500 pl-4">
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="text-base font-semibold text-gray-900">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user?.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user?.status || 'N/A'}
                    </span>
                  </p>
                </div>
              </div>
              {!user?.gender && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-sm text-orange-800">
                    ⚠️ <strong>Action Required:</strong> Please update your profile with gender information to apply for dormitory accommodation.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid - Mobile Optimized */}
        {loading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 bg-gray-300 rounded"></div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                      <div className="h-6 bg-gray-300 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statsToShow.map((item) => (
              <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                <div className="p-4 sm:p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className={`p-2 sm:p-3 rounded-md ${item.color}`}>
                        <item.icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                    </div>
                    <div className="ml-4 w-0 flex-1">
                      <dl>
                        <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">
                          {item.name}
                        </dt>
                        <dd className="text-lg sm:text-xl font-medium text-gray-900">
                          {item.value}
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Actions - Mobile Optimized */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {user?.user_type === 'student' ? (
                <>
                  <a
                    href="/applications/new"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <DocumentTextIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Apply for Dormitory
                    </span>
                  </a>
                  <a
                    href="/change-requests/new"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ClipboardDocumentCheckIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Request Room Change
                    </span>
                  </a>
                  <a
                    href="/rooms/available"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <BuildingOfficeIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Check Room Availability
                    </span>
                  </a>
                </>
              ) : user?.user_type === 'admin' ? (
                <>
                  <a
                    href="/applications?status=pending"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <DocumentTextIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Review Applications
                    </span>
                  </a>
                  <a
                    href="/admin/administrators/create"
                    className="relative block w-full border-2 border-blue-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors bg-blue-50"
                  >
                    <UserGroupIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    <span className="mt-2 block text-sm font-medium text-blue-900">
                      Create New Admin
                    </span>
                  </a>
                  <a
                    href="/admin/administrators"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <UserGroupIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Manage Administrators
                    </span>
                  </a>
                  <a
                    href="/rooms"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <BuildingOfficeIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Manage Rooms
                    </span>
                  </a>
                  <a
                    href="/reports"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <ClipboardDocumentCheckIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      View Reports
                    </span>
                  </a>
                </>
              ) : (
                <>
                  <a
                    href="/applications?status=pending"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <DocumentTextIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Review Applications
                    </span>
                  </a>
                  <a
                    href="/rooms"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <BuildingOfficeIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      Manage Rooms
                    </span>
                  </a>
                  <a
                    href="/reports"
                    className="relative block w-full border-2 border-gray-300 border-dashed rounded-lg p-4 sm:p-6 text-center hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <UserGroupIcon className="mx-auto h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-900">
                      View Reports
                    </span>
                  </a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Recent Activity
            </h3>
            <div className="text-sm text-gray-500">
              No recent activity to display.
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}