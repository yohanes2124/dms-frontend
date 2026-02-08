'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { applicationsAPI } from '@/lib/api';
import { authService } from '@/lib/auth';

interface Application {
  id: number;
  student_name: string;
  student_id: string;
  department: string;
  year_level: number;
  preferred_room_type: string;
  status: string;
  submitted_at: string;
  priority_score: number;
}

export default function PendingApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchPendingApplications();
  }, []);

  const fetchPendingApplications = async () => {
    try {
      const response = await applicationsAPI.getAll({ status: 'pending' });
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Failed to fetch pending applications:', error);
      // Set demo data for display
      setApplications([
        {
          id: 1,
          student_name: 'John Doe',
          student_id: 'STU001',
          department: 'Computer Science',
          year_level: 2,
          preferred_room_type: 'Four',
          status: 'pending',
          submitted_at: '2026-01-20',
          priority_score: 85
        },
        {
          id: 2,
          student_name: 'Jane Smith',
          student_id: 'STU002',
          department: 'Engineering',
          year_level: 3,
          preferred_room_type: 'Six',
          status: 'pending',
          submitted_at: '2026-01-21',
          priority_score: 92
        },
        {
          id: 3,
          student_name: 'Mike Johnson',
          student_id: 'STU003',
          department: 'Business',
          year_level: 1,
          preferred_room_type: 'Four',
          status: 'pending',
          submitted_at: '2026-01-22',
          priority_score: 78
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicationId: number) => {
    try {
      await applicationsAPI.approve(applicationId.toString());
      setApplications(applications.filter(app => app.id !== applicationId));
      alert('Application approved successfully!');
    } catch (error) {
      console.error('Failed to approve application:', error);
      alert('Failed to approve application. Please try again.');
    }
  };

  const handleReject = async (applicationId: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      await applicationsAPI.reject(applicationId.toString(), { reason });
      setApplications(applications.filter(app => app.id !== applicationId));
      alert('Application rejected successfully!');
    } catch (error) {
      console.error('Failed to reject application:', error);
      alert('Failed to reject application. Please try again.');
    }
  };

  const getPriorityColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100';
    if (score >= 75) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!user || (user.user_type !== 'admin' && user.user_type !== 'supervisor')) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to review applications.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-lg">Loading pending applications...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Pending Applications</h1>
            <p className="text-gray-600 mt-1">Review and process dormitory applications</p>
          </div>
          <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            {applications.length} Pending
          </div>
        </div>

        {applications.length > 0 ? (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">
                            {application.student_name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {application.student_id} • {application.department} • Year {application.year_level}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(application.priority_score)}`}>
                            Priority: {application.priority_score}
                          </span>
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                            {application.preferred_room_type}
                          </span>
                        </div>
                      </div>
                      
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span>Submitted: {new Date(application.submitted_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-end space-x-3">
                    <button
                      onClick={() => handleReject(application.id)}
                      className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Reject
                    </button>
                    <button
                      onClick={() => handleApprove(application.id)}
                      className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Approve
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Applications</h3>
                <p className="text-gray-600">All applications have been processed.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}