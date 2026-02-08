'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { temporaryLeaveAPI } from '@/lib/api';

interface LeaveRequest {
  id: number;
  student: {
    id: number;
    name: string;
    email: string;
    student_id?: string;
  };
  leave_type: string;
  start_date: string;
  end_date: string;
  return_date: string;
  destination: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  reason: string;
  supervisor_approval: 'pending' | 'approved' | 'rejected';
  status: string;
  created_at: string;
}

export default function SupervisorDashboardPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser && currentUser.user_type === 'supervisor') {
      fetchLeaveRequests();
    } else {
      setLoading(false);
    }
  }, [filter]);

  const fetchLeaveRequests = async () => {
    try {
      const response = await temporaryLeaveAPI.getAll({ 
        approval_status: filter === 'all' ? undefined : filter 
      });
      
      console.log('Supervisor API Response:', response.data);
      
      // Handle different response structures
      let requests = [];
      if (response.data.success && response.data.data) {
        // Paginated response
        if (response.data.data.data) {
          requests = response.data.data.data;
        } else if (Array.isArray(response.data.data)) {
          requests = response.data.data;
        }
      } else if (Array.isArray(response.data)) {
        requests = response.data;
      }
      
      setLeaveRequests(Array.isArray(requests) ? requests : []);
    } catch (err: any) {
      console.error('Failed to fetch leave requests:', err);
      // Fallback to empty array instead of mock data
      setLeaveRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      await temporaryLeaveAPI.approve(id.toString(), {
        notes: 'Approved by supervisor'
      });
      fetchLeaveRequests(); // Refresh the list
      alert('Leave request approved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve request');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await temporaryLeaveAPI.reject(id.toString(), { reason });
      fetchLeaveRequests(); // Refresh the list
      alert('Leave request rejected.');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getLeaveTypeDisplay = (type: string) => {
    const types = {
      weekend: 'Weekend Leave',
      holiday: 'Holiday Leave',
      emergency: 'Emergency Leave',
      medical: 'Medical Leave',
      family_visit: 'Family Visit',
      other: 'Other'
    };
    return types[type as keyof typeof types] || type;
  };

  if (!user || user.user_type !== 'supervisor') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only supervisors can access this dashboard.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Supervisor Dashboard</h1>
            <p className="text-gray-600">Manage temporary leave requests for Block {user.assigned_block}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl">⏳</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Pending Requests</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(leaveRequests) ? leaveRequests.filter(r => r.supervisor_approval === 'pending').length : 0}
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
                  <div className="text-2xl">✅</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Approved Today</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(leaveRequests) ? leaveRequests.filter(r => 
                        r.supervisor_approval === 'approved' && 
                        new Date(r.created_at).toDateString() === new Date().toDateString()
                      ).length : 0}
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
                  <div className="text-2xl">🏠</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Currently Away</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(leaveRequests) ? leaveRequests.filter(r => 
                        r.supervisor_approval === 'approved' && 
                        new Date(r.start_date) <= new Date() && 
                        new Date(r.return_date) >= new Date()
                      ).length : 0}
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
                  <div className="text-2xl">⚠️</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Overdue Returns</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Array.isArray(leaveRequests) ? leaveRequests.filter(r => 
                        r.supervisor_approval === 'approved' && 
                        new Date(r.return_date) < new Date()
                      ).length : 0}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'pending', label: 'Pending Approval', count: Array.isArray(leaveRequests) ? leaveRequests.filter(r => r.supervisor_approval === 'pending').length : 0 },
              { key: 'approved', label: 'Approved', count: Array.isArray(leaveRequests) ? leaveRequests.filter(r => r.supervisor_approval === 'approved').length : 0 },
              { key: 'rejected', label: 'Rejected', count: Array.isArray(leaveRequests) ? leaveRequests.filter(r => r.supervisor_approval === 'rejected').length : 0 },
              { key: 'all', label: 'All Requests', count: Array.isArray(leaveRequests) ? leaveRequests.length : 0 }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`${
                  filter === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {/* Leave Requests List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              {filter === 'all' ? 'All Leave Requests' : 
               filter === 'pending' ? 'Pending Approval' :
               filter === 'approved' ? 'Approved Requests' : 'Rejected Requests'}
            </h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </div>
          ) : Array.isArray(leaveRequests) && leaveRequests.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Requests Found</h3>
              <p className="text-gray-600">No leave requests match the current filter.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Array.isArray(leaveRequests) && leaveRequests
                .filter(request => filter === 'all' || request.supervisor_approval === filter)
                .map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="text-lg font-medium text-gray-900">
                          {request.student.name}
                        </h4>
                        <span className="text-sm text-gray-500">
                          ({request.student.student_id})
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.supervisor_approval)}`}>
                          {request.supervisor_approval.charAt(0).toUpperCase() + request.supervisor_approval.slice(1)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                        <div>
                          <span className="font-medium">Type:</span> {getLeaveTypeDisplay(request.leave_type)}
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span> {request.start_date} to {request.end_date}
                        </div>
                        <div>
                          <span className="font-medium">Destination:</span> {request.destination}
                        </div>
                        <div>
                          <span className="font-medium">Return Date:</span> {request.return_date}
                        </div>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Emergency Contact:</span> {request.emergency_contact_name}
                        </div>
                        <div>
                          <span className="font-medium">Contact Phone:</span> {request.emergency_contact_phone}
                        </div>
                      </div>
                    </div>
                    
                    {request.supervisor_approval === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📊</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">View Reports</h3>
                  <p className="text-sm text-gray-600 mt-1">Generate leave request reports</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🔔</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
                  <p className="text-sm text-gray-600 mt-1">Manage notification settings</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Guidelines</h3>
                  <p className="text-sm text-gray-600 mt-1">View leave approval guidelines</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}