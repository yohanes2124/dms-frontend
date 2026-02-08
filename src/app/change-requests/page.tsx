'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { changeRequestsAPI } from '@/lib/api';
import { authService, User } from '@/lib/auth';
import Link from 'next/link';

interface ChangeRequest {
  id: number;
  reason: string;
  status: string;
  requested_room_id?: number;
  created_at: string;
  updated_at: string;
}

export default function ChangeRequestsPage() {
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchChangeRequests();
  }, []);

  const fetchChangeRequests = async () => {
    try {
      const response = await changeRequestsAPI.getAll();
      console.log('Change requests response:', response.data); // Debug log
      
      // Ensure we have an array
      if (response.data.success && Array.isArray(response.data.data)) {
        setRequests(response.data.data);
      } else {
        console.warn('API response is not an array:', response.data);
        setRequests([]); // Set empty array as fallback
      }
    } catch (err: any) {
      console.error('Failed to fetch change requests:', err);
      setError('Unable to load change requests from server. Showing demo data.');
      
      // Set demo data for display based on user role
      const currentUser = authService.getCurrentUser();
      if (currentUser?.user_type === 'student') {
        setRequests([
          {
            id: 1,
            reason: 'Current room is too noisy, requesting quieter environment for studies',
            status: 'pending',
            requested_room_id: 101,
            created_at: '2026-01-20T10:30:00Z',
            updated_at: '2026-01-20T10:30:00Z'
          },
          {
            id: 2,
            reason: 'Medical condition requires ground floor accommodation',
            status: 'approved',
            requested_room_id: 205,
            created_at: '2026-01-18T14:15:00Z',
            updated_at: '2026-01-19T09:20:00Z'
          }
        ]);
      } else {
        // For supervisors and admins, show all requests
        setRequests([
          {
            id: 1,
            reason: 'Current room is too noisy, requesting quieter environment for studies',
            status: 'pending',
            requested_room_id: 101,
            created_at: '2026-01-20T10:30:00Z',
            updated_at: '2026-01-20T10:30:00Z'
          },
          {
            id: 2,
            reason: 'Medical condition requires ground floor accommodation',
            status: 'approved',
            requested_room_id: 205,
            created_at: '2026-01-18T14:15:00Z',
            updated_at: '2026-01-19T09:20:00Z'
          },
          {
            id: 3,
            reason: 'Roommate conflict, need six-person room',
            status: 'rejected',
            requested_room_id: 302,
            created_at: '2026-01-15T16:45:00Z',
            updated_at: '2026-01-16T11:30:00Z'
          },
          {
            id: 4,
            reason: 'Need room closer to library for research work',
            status: 'pending',
            requested_room_id: 150,
            created_at: '2026-01-22T08:15:00Z',
            updated_at: '2026-01-22T08:15:00Z'
          }
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: number) => {
    try {
      // API call would go here
      console.log('Approving request:', requestId);
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'approved' } : req
      ));
    } catch (err) {
      console.error('Failed to approve request:', err);
    }
  };

  const handleReject = async (requestId: number) => {
    try {
      // API call would go here
      console.log('Rejecting request:', requestId);
      // Update local state
      setRequests(prev => prev.map(req => 
        req.id === requestId ? { ...req, status: 'rejected' } : req
      ));
    } catch (err) {
      console.error('Failed to reject request:', err);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading change requests...</div>
        </div>
      </Layout>
    );
  }

  // Role-based content rendering
  const renderPageHeader = () => {
    if (user?.user_type === 'student') {
      return (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Room Change Requests</h1>
          <Link
            href="/change-requests/new"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            New Request
          </Link>
        </div>
      );
    } else {
      return (
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">
            {user?.user_type === 'supervisor' ? 'Review Change Requests' : 'Manage Change Requests'}
          </h1>
          <div className="text-sm text-gray-600">
            Total Requests: {requests.length}
          </div>
        </div>
      );
    }
  };

  const renderEmptyState = () => {
    if (user?.user_type === 'student') {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
          <p className="text-gray-500 mb-4">You haven't submitted any room change requests yet.</p>
          <Link
            href="/change-requests/new"
            className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 font-medium"
          >
            Submit Your First Request
          </Link>
        </div>
      );
    } else {
      return (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Change Requests</h3>
          <p className="text-gray-500 mb-4">
            {user?.user_type === 'supervisor' 
              ? 'No change requests are currently pending your review.' 
              : 'No change requests have been submitted yet.'}
          </p>
        </div>
      );
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading change requests...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {renderPageHeader()}

        {error && (
          <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <span className="text-blue-500">ℹ️</span>
              </div>
              <div className="ml-3">
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {Array.isArray(requests) && requests.map((request) => (
              <li key={request.id}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-medium text-gray-900">
                          Request #{request.id}
                        </p>
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : request.status === 'approved'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {request.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {request.reason}
                      </p>
                      {request.requested_room_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Requested Room: #{request.requested_room_id}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mt-2">
                        Submitted: {new Date(request.created_at).toLocaleDateString()}
                        {request.updated_at !== request.created_at && (
                          <span className="ml-2">
                            • Updated: {new Date(request.updated_at).toLocaleDateString()}
                          </span>
                        )}
                      </p>
                    </div>
                    
                    {/* Action buttons for supervisors and admins */}
                    {(user?.user_type === 'supervisor' || user?.user_type === 'admin') && request.status === 'pending' && (
                      <div className="ml-4 flex space-x-2">
                        <button
                          onClick={() => handleApprove(request.id)}
                          className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(request.id)}
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium"
                        >
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {(!Array.isArray(requests) || requests.length === 0) && !loading && renderEmptyState()}
      </div>
    </Layout>
  );
}