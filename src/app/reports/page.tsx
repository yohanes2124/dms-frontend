'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';

export default function ReportsPage() {
  const [user, setUser] = useState(authService.getCurrentUser());

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const reports = [
    {
      title: 'Reports Dashboard',
      description: 'Comprehensive overview of all reports and key metrics',
      icon: '📊',
      href: '/reports/dashboard',
      available: true,
    },
    {
      title: 'Allocation Reports',
      description: 'View detailed allocation statistics, occupancy rates, and export data',
      icon: '🎯',
      href: '/reports/allocations',
      available: true,
      adminOnly: true,
    },
    {
      title: 'Occupancy Report',
      description: 'View current room occupancy rates and availability statistics',
      icon: '🏠',
      href: '/reports/occupancy',
      available: true,
    },
    {
      title: 'Applications Report',
      description: 'Track dormitory application statistics and trends',
      icon: '📋',
      href: '/reports/applications',
      available: true,
    },
    {
      title: 'Students Report',
      description: 'View student enrollment and housing assignment data',
      icon: '👥',
      href: '/reports/students',
      available: true,
    },
    {
      title: 'Rooms Report',
      description: 'Comprehensive room utilization and maintenance reports',
      icon: '🔧',
      href: '/reports/rooms',
      available: true,
    },
  ];

  // Check if user has permission to view reports
  const canViewReports = user && (user.user_type === 'admin' || user.user_type === 'supervisor');

  if (!canViewReports) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view reports.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Reports</h1>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
          {reports
            .filter(report => !report.adminOnly || user?.user_type === 'admin')
            .map((report) => (
            <div
              key={report.title}
              className={`bg-white overflow-hidden shadow rounded-lg ${
                report.available
                  ? 'hover:shadow-md transition-shadow cursor-pointer'
                  : 'opacity-50 cursor-not-allowed'
              }`}
              onClick={() => {
                if (report.available) {
                  window.location.href = report.href;
                }
              }}
            >
              <div className="p-6">
                <div className="flex items-center">
                  <div className="text-3xl mr-4">{report.icon}</div>
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-gray-900">
                      {report.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {report.description}
                    </p>
                  </div>
                </div>
                {!report.available && (
                  <div className="mt-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      Coming Soon
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Report Information
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Reports are generated in real-time based on current system data. 
                  Click on any available report to view detailed analytics and insights.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}