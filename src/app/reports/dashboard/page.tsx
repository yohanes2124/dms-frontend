'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import api from '@/lib/api';

interface DashboardData {
  occupancy: {
    total_rooms: number;
    occupied_rooms: number;
    available_rooms: number;
    occupancy_rate: number;
  };
  applications: {
    total_applications: number;
    pending_applications: number;
    approved_applications: number;
    rejected_applications: number;
  };
  students: {
    total_students: number;
    housed_students: number;
    unhoused_students: number;
    housing_rate: number;
  };
  rooms: {
    total_rooms: number;
    available_rooms: number;
    occupied_rooms: number;
    maintenance_rooms: number;
  };
}

export default function ReportsDashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [occupancyRes, applicationsRes, studentsRes, roomsRes] = await Promise.all([
        api.get('/reports/occupancy'),
        api.get('/reports/applications'),
        api.get('/reports/students'),
        api.get('/reports/rooms')
      ]);

      if (occupancyRes.data.success && applicationsRes.data.success && 
          studentsRes.data.success && roomsRes.data.success) {
        setData({
          occupancy: occupancyRes.data.data.summary,
          applications: applicationsRes.data.data.summary,
          students: studentsRes.data.data.summary,
          rooms: roomsRes.data.data.summary
        });
      } else {
        setError('Failed to fetch dashboard data');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => window.history.back()}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Reports
            </button>
            <h1 className="text-3xl font-bold text-gray-900">📊 Reports Dashboard</h1>
          </div>
          <div className="flex space-x-2 no-print">
            <button
              onClick={() => window.print()}
              className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
            >
              Print Dashboard
            </button>
            <button
              onClick={fetchDashboardData}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        {data && (
          <>
            {/* Dashboard Timestamp */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-blue-700">
                    Dashboard updated on {new Date().toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Key Metrics Overview */}
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">🏠</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Occupancy Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {data.occupancy.occupancy_rate}%
                        </dd>
                        <dd className="text-sm text-gray-500">
                          {data.occupancy.occupied_rooms}/{data.occupancy.total_rooms} rooms
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">📋</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Pending Applications
                        </dt>
                        <dd className="text-lg font-medium text-yellow-600">
                          {data.applications.pending_applications}
                        </dd>
                        <dd className="text-sm text-gray-500">
                          of {data.applications.total_applications} total
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">👥</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Housing Rate
                        </dt>
                        <dd className="text-lg font-medium text-gray-900">
                          {data.students.housing_rate}%
                        </dd>
                        <dd className="text-sm text-gray-500">
                          {data.students.housed_students}/{data.students.total_students} students
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <div className="text-2xl">🔧</div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Maintenance Rooms
                        </dt>
                        <dd className="text-lg font-medium text-red-600">
                          {data.rooms.maintenance_rooms}
                        </dd>
                        <dd className="text-sm text-gray-500">
                          need attention
                        </dd>
                      </dl>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Reports Grid */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Occupancy Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      🏠 Room Occupancy
                    </h3>
                    <a
                      href="/reports/occupancy"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Rooms</span>
                      <span className="text-sm font-medium">{data.occupancy.total_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Occupied</span>
                      <span className="text-sm font-medium text-blue-600">{data.occupancy.occupied_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="text-sm font-medium text-green-600">{data.occupancy.available_rooms}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Occupancy Rate</span>
                        <span>{data.occupancy.occupancy_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${data.occupancy.occupancy_rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Applications Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      📋 Applications Status
                    </h3>
                    <a
                      href="/reports/applications"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Applications</span>
                      <span className="text-sm font-medium">{data.applications.total_applications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Pending</span>
                      <span className="text-sm font-medium text-yellow-600">{data.applications.pending_applications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Approved</span>
                      <span className="text-sm font-medium text-green-600">{data.applications.approved_applications}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Rejected</span>
                      <span className="text-sm font-medium text-red-600">{data.applications.rejected_applications}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Students Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      👥 Student Housing
                    </h3>
                    <a
                      href="/reports/students"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Students</span>
                      <span className="text-sm font-medium">{data.students.total_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Housed</span>
                      <span className="text-sm font-medium text-green-600">{data.students.housed_students}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Unhoused</span>
                      <span className="text-sm font-medium text-orange-600">{data.students.unhoused_students}</span>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Housing Rate</span>
                        <span>{data.students.housing_rate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${data.students.housing_rate}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rooms Summary */}
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      🔧 Room Management
                    </h3>
                    <a
                      href="/reports/rooms"
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      View Details →
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Total Rooms</span>
                      <span className="text-sm font-medium">{data.rooms.total_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Available</span>
                      <span className="text-sm font-medium text-green-600">{data.rooms.available_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Occupied</span>
                      <span className="text-sm font-medium text-blue-600">{data.rooms.occupied_rooms}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Maintenance</span>
                      <span className="text-sm font-medium text-red-600">{data.rooms.maintenance_rooms}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                  Quick Actions
                </h3>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <a
                    href="/reports/occupancy"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🏠 Occupancy Report
                  </a>
                  <a
                    href="/reports/applications"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    📋 Applications Report
                  </a>
                  <a
                    href="/reports/students"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    👥 Students Report
                  </a>
                  <a
                    href="/reports/rooms"
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    🔧 Rooms Report
                  </a>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-break {
            page-break-before: always;
          }
          body {
            font-size: 12px;
          }
          .shadow {
            box-shadow: none !important;
          }
        }
      `}</style>
    </Layout>
  );
}