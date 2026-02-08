'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function MyIssuesPage() {
  const router = useRouter();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchMyIssues();
  }, []);

  const fetchMyIssues = async () => {
    try {
      const token = authService.getToken();
      const user = authService.getCurrentUser();
      
      // Students fetch their own issues, admins/supervisors fetch all issues
      const endpoint = user?.user_type === 'student' ? '/issues/my-issues' : '/issues';
      
      const response = await axios.get(`${API_URL}${endpoint}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setIssues(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch issues');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'plumbing': return '🚰';
      case 'electrical': return '⚡';
      case 'furniture': return '🪑';
      case 'cleaning': return '🧹';
      case 'other': return '📦';
      default: return '📋';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {user?.user_type === 'student' ? '🛠️ My Issue Reports' : '🛠️ All Issue Reports'}
            </h1>
            <p className="text-gray-600 mt-2">
              {user?.user_type === 'student' ? 'Track your reported issues' : 'Manage all reported issues'}
            </p>
          </div>
          {user?.user_type === 'student' && (
            <button
              onClick={() => router.push('/issues/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              ➕ Report New Issue
            </button>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {issues.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🛠️</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Issues Reported</h3>
            <p className="text-gray-600 mb-6">You haven't reported any issues yet</p>
            <button
              onClick={() => router.push('/issues/new')}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-medium"
            >
              Report Your First Issue
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {issues.map((issue) => (
              <div key={issue.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-2xl">{getCategoryIcon(issue.category)}</span>
                      <h3 className="text-xl font-semibold text-gray-900">{issue.title}</h3>
                    </div>
                    <p className="text-gray-600 mb-3">{issue.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(issue.status)}`}>
                        {issue.status.replace('_', ' ').toUpperCase()}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(issue.priority)}`}>
                        {issue.priority.toUpperCase()}
                      </span>
                      <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                        {issue.category.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4 mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">Room</p>
                      <p className="font-medium">{issue.room?.room_number || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Reported</p>
                      <p className="font-medium">{new Date(issue.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Assigned To</p>
                      <p className="font-medium">{issue.assigned_to ? issue.assigned_to.name : 'Not assigned'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Resolved</p>
                      <p className="font-medium">
                        {issue.resolved_at ? new Date(issue.resolved_at).toLocaleDateString() : '-'}
                      </p>
                    </div>
                  </div>
                  
                  {issue.resolution_notes && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">Resolution Notes:</p>
                      <p className="text-sm text-green-700">{issue.resolution_notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
