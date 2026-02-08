'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import api from '@/lib/api';

export default function AllocationsPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [allocations, setAllocations] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [allocating, setAllocating] = useState(false);
  const [reallocating, setReallocating] = useState(false);
  const [selectedAction, setSelectedAction] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchStats();
    fetchAllocations();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await api.get('/allocations/stats');
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error: any) {
      console.error('Failed to fetch stats:', error.response?.data || error.message);
    }
  };

  const fetchAllocations = async () => {
    try {
      const response = await api.get('/allocations');
      if (response.data.success) {
        setAllocations(response.data.data.data || []);
      }
    } catch (error: any) {
      console.error('Failed to fetch allocations:', error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAutoAllocate = async () => {
    setAllocating(true);
    try {
      const response = await api.post('/allocations/auto');
      setResult(response.data);
      
      if (response.data.success) {
        // Refresh stats and allocations
        await fetchStats();
        await fetchAllocations();
      }
    } catch (error: any) {
      console.error('Auto allocation failed:', error.response?.data || error.message);
      setResult({
        success: false,
        message: 'Auto allocation failed: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setAllocating(false);
    }
  };

  const handleReallocation = async () => {
    setReallocating(true);
    try {
      const response = await api.post('/allocations/reallocate');
      setResult(response.data);
      
      if (response.data.success) {
        // Refresh stats and allocations
        await fetchStats();
        await fetchAllocations();
      }
    } catch (error: any) {
      console.error('Re-allocation failed:', error.response?.data || error.message);
      setResult({
        success: false,
        message: 'Re-allocation failed: ' + (error.response?.data?.message || error.message)
      });
    } finally {
      setReallocating(false);
    }
  };

  const handleAllocationAction = (action: string) => {
    setSelectedAction(action);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAction(null);
    setResult(null);
  };

  const renderResultModal = () => {
    if (!result) return null;

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className={`text-lg font-medium ${result.success ? 'text-green-900' : 'text-red-900'}`}>
              {result.success ? '✅ Allocation Complete' : '❌ Allocation Failed'}
            </h3>
            <button
              onClick={closeModal}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>

          <div className={`mb-6 p-4 rounded-lg ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-sm ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.message}
            </p>

            {result.success && result.data && (
              <div className="mt-4 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Total Applications</p>
                    <p className="text-2xl font-bold text-blue-600">{result.data.total_applications}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Successfully Allocated</p>
                    <p className="text-2xl font-bold text-green-600">{result.data.allocated}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Failed</p>
                    <p className="text-2xl font-bold text-red-600">{result.data.failed}</p>
                  </div>
                  <div className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600">Notifications Sent</p>
                    <p className="text-2xl font-bold text-purple-600">{result.data.notifications_sent}</p>
                  </div>
                </div>

                {result.data.allocations && result.data.allocations.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Allocated Students (Sample)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.data.allocations.slice(0, 5).map((alloc: any, idx: number) => (
                        <div key={idx} className="bg-white p-2 rounded text-sm border border-green-200">
                          <p className="font-medium">{alloc.student_name}</p>
                          <p className="text-gray-600">Room {alloc.room_number} (Block {alloc.block})</p>
                        </div>
                      ))}
                      {result.data.allocations.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{result.data.allocations.length - 5} more students allocated
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {result.data.failures && result.data.failures.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Failed Allocations (Sample)</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {result.data.failures.slice(0, 5).map((failure: any, idx: number) => (
                        <div key={idx} className="bg-white p-2 rounded text-sm border border-red-200">
                          <p className="font-medium">{failure.student_name}</p>
                          <p className="text-red-600 text-xs">{failure.reason}</p>
                        </div>
                      ))}
                      {result.data.failures.length > 5 && (
                        <p className="text-xs text-gray-500 text-center">
                          +{result.data.failures.length - 5} more failures
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Check if user has permission to manage allocations
  const canManageAllocations = user && user.user_type === 'admin';

  if (!canManageAllocations) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage room allocations.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Room Allocation</h1>
        </div>

        {/* Statistics */}
        {stats && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <p className="text-sm text-gray-600">Pending Applications</p>
              <p className="text-3xl font-bold text-blue-600">{stats.pending_applications}</p>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <p className="text-sm text-gray-600">Approved Applications</p>
              <p className="text-3xl font-bold text-green-600">{stats.approved_applications}</p>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <p className="text-sm text-gray-600">Available Rooms</p>
              <p className="text-3xl font-bold text-purple-600">{stats.available_rooms}</p>
            </div>
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <p className="text-sm text-gray-600">Occupancy Rate</p>
              <p className="text-3xl font-bold text-orange-600">{stats.occupancy_rate}%</p>
            </div>
          </div>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleAllocationAction('auto')}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🤖</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Auto Allocation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Automatically allocate all pending applications
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => handleAllocationAction('reallocate')}
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🔄</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Re-allocation
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Process approved room change requests
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg p-6">
            <div className="flex items-center">
              <div className="text-3xl mr-4">📊</div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  View Allocations
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  {allocations.length} students allocated
                </p>
              </div>
            </div>
          </div>

          <div 
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer p-6"
            onClick={() => window.location.href = '/reports/allocations'}
          >
            <div className="flex items-center">
              <div className="text-3xl mr-4">📈</div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-gray-900">
                  Allocation Reports
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  View detailed allocation statistics
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Auto Allocation Process
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Processes all pending applications in priority order</li>
                  <li>Matches students to gender-appropriate blocks</li>
                  <li>Respects room type preferences (4-bed or 6-bed)</li>
                  <li>Sends notifications to allocated students</li>
                  <li>Prevents duplicate allocations</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Allocations List */}
        {allocations.length > 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Allocations</h3>
              <div className="space-y-3">
                {allocations.slice(0, 5).map((alloc: any) => (
                  <div key={alloc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div>
                      <p className="font-medium text-gray-900">{alloc.student?.name}</p>
                      <p className="text-sm text-gray-600">Room {alloc.room?.room_number} - Block {alloc.room?.block}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      alloc.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {alloc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Auto Allocation Modal */}
      {showModal && selectedAction === 'auto' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Auto Allocation</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This will automatically allocate all pending applications to available rooms based on:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>✓ Student preferences and priority scores</li>
                <li>✓ Gender-appropriate block assignments</li>
                <li>✓ Room type preferences (4-bed or 6-bed)</li>
                <li>✓ Room availability and capacity</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Each allocated student will receive a notification with their room details.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={allocating}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAutoAllocate}
                disabled={allocating}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {allocating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Allocating...
                  </>
                ) : (
                  'Start Auto Allocation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Re-allocation Modal */}
      {showModal && selectedAction === 'reallocate' && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">Re-allocation</h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                This will process all approved room change requests and reallocate students based on:
              </p>
              <ul className="space-y-2 text-sm text-gray-700 mb-4">
                <li>✓ Approved change requests only</li>
                <li>✓ Gender-appropriate block assignments</li>
                <li>✓ Room type preferences</li>
                <li>✓ Available rooms and capacity</li>
              </ul>
              <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> Students will be notified of their new room assignments.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={closeModal}
                disabled={reallocating}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleReallocation}
                disabled={reallocating}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50 flex items-center"
              >
                {reallocating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Re-allocating...
                  </>
                ) : (
                  'Start Re-allocation'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Result Modal */}
      {renderResultModal()}
    </Layout>
  );
}
