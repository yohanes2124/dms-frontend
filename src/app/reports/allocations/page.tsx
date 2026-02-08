'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { allocationsAPI } from '@/lib/api';

export default function AllocationReportsPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [activeTab, setActiveTab] = useState('summary');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchReport();
  }, []);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const response = await allocationsAPI.getReport();
      if (response.data.success) {
        setReport(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch allocation report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (format: 'csv' | 'json') => {
    try {
      setExporting(true);
      const response = await allocationsAPI.exportReport(format);
      
      // Create blob and download
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/json'
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `allocation-report-${new Date().toISOString().split('T')[0]}.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Failed to export report:', error);
      alert('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  if (!user || user.user_type !== 'admin') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to view allocation reports.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Allocation Reports</h1>
          <div className="flex gap-2">
            <button
              onClick={() => handleExport('csv')}
              disabled={exporting}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              📥 Export CSV
            </button>
            <button
              onClick={() => handleExport('json')}
              disabled={exporting}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              📥 Export JSON
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8" aria-label="Tabs">
            {[
              { id: 'summary', label: 'Summary' },
              { id: 'by_status', label: 'By Status' },
              { id: 'by_block', label: 'By Block' },
              { id: 'by_gender', label: 'By Gender' },
              { id: 'by_room_type', label: 'By Room Type' },
              { id: 'occupancy', label: 'Occupancy' },
              { id: 'timeline', label: 'Timeline' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Summary Tab */}
        {activeTab === 'summary' && report?.summary && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Applications Summary</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Applications</p>
                  <p className="text-3xl font-bold text-blue-600">{report.summary.applications.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Pending</p>
                  <p className="text-3xl font-bold text-yellow-600">{report.summary.applications.pending}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Approved</p>
                  <p className="text-3xl font-bold text-orange-600">{report.summary.applications.approved}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{report.summary.applications.completed}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Success Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{report.summary.applications.success_rate}%</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Rooms Summary</h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Rooms</p>
                  <p className="text-3xl font-bold text-blue-600">{report.summary.rooms.total}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Occupied</p>
                  <p className="text-3xl font-bold text-green-600">{report.summary.rooms.occupied}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Available</p>
                  <p className="text-3xl font-bold text-purple-600">{report.summary.rooms.available}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Total Capacity</p>
                  <p className="text-3xl font-bold text-orange-600">{report.summary.rooms.total_capacity}</p>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                  <p className="text-sm text-gray-600">Occupancy Rate</p>
                  <p className="text-3xl font-bold text-red-600">{report.summary.rooms.occupancy_rate}%</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* By Status Tab */}
        {activeTab === 'by_status' && report?.by_status && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Applications by Status</h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
              {Object.entries(report.by_status).map(([status, count]: [string, any]) => (
                <div key={status} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-600 capitalize">{status}</p>
                  <p className="text-3xl font-bold text-blue-600">{count}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* By Block Tab */}
        {activeTab === 'by_block' && report?.by_block && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Allocations by Block</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applications</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocations</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rooms</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {Object.entries(report.by_block).map(([block, data]: [string, any]) => (
                    <tr key={block} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">Block {block}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 capitalize">{data.gender}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.applications}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.allocations}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.rooms}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{data.occupancy}/{data.capacity}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          data.occupancy_rate >= 80 ? 'bg-red-100 text-red-800' :
                          data.occupancy_rate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {data.occupancy_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* By Gender Tab */}
        {activeTab === 'by_gender' && report?.by_gender && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Object.entries(report.by_gender).map(([gender, data]: [string, any]) => (
              <div key={gender} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">{gender} Students</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Applications</span>
                    <span className="font-bold text-gray-900">{data.applications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Allocations</span>
                    <span className="font-bold text-gray-900">{data.allocations}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Blocks</span>
                    <span className="font-bold text-gray-900">{data.blocks}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-bold text-gray-900">{data.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-bold text-gray-900">{data.occupancy}/{data.capacity}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-600 font-medium">Occupancy Rate</span>
                    <span className={`font-bold text-lg ${
                      data.occupancy_rate >= 80 ? 'text-red-600' :
                      data.occupancy_rate >= 60 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {data.occupancy_rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* By Room Type Tab */}
        {activeTab === 'by_room_type' && report?.by_room_type && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            {Object.entries(report.by_room_type).map(([type, data]: [string, any]) => (
              <div key={type} className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">{type} Rooms</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rooms</span>
                    <span className="font-bold text-gray-900">{data.rooms}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity</span>
                    <span className="font-bold text-gray-900">{data.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Occupancy</span>
                    <span className="font-bold text-gray-900">{data.occupancy}/{data.capacity}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200 flex justify-between">
                    <span className="text-gray-600 font-medium">Occupancy Rate</span>
                    <span className={`font-bold text-lg ${
                      data.occupancy_rate >= 80 ? 'text-red-600' :
                      data.occupancy_rate >= 60 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {data.occupancy_rate}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Occupancy Tab */}
        {activeTab === 'occupancy' && report?.occupancy_details && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Room Occupancy Details</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Block</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Capacity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupancy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Available</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.occupancy_details.slice(0, 50).map((room: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{room.room_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">Block {room.block}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room.room_type}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room.capacity}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room.occupancy}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{room.available_spaces}</td>
                      <td className="px-6 py-4 text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          room.occupancy_rate >= 100 ? 'bg-red-100 text-red-800' :
                          room.occupancy_rate >= 80 ? 'bg-orange-100 text-orange-800' :
                          room.occupancy_rate >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {room.occupancy_rate}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {report.occupancy_details.length > 50 && (
              <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
                Showing 50 of {report.occupancy_details.length} rooms
              </div>
            )}
          </div>
        )}

        {/* Timeline Tab */}
        {activeTab === 'timeline' && report?.allocation_timeline && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Recent Allocations</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {report.allocation_timeline.map((alloc: any, idx: number) => (
                <div key={idx} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{alloc.student_name}</p>
                      <p className="text-sm text-gray-600">Room {alloc.room_number} - Block {alloc.block}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">{new Date(alloc.assigned_at).toLocaleDateString()}</p>
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                        alloc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {alloc.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
