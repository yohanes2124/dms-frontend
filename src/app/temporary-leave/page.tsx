'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { temporaryLeaveAPI } from '@/lib/api';

interface LeaveRequest {
  id?: number;
  leave_type: 'weekend' | 'holiday' | 'emergency' | 'medical' | 'family_visit' | 'other';
  start_date: string;
  end_date: string;
  return_date: string;
  destination: string;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  reason: string;
  supervisor_approval: 'pending' | 'approved' | 'rejected';
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'completed';
}

export default function TemporaryLeavePage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const [formData, setFormData] = useState<LeaveRequest>({
    leave_type: 'weekend',
    start_date: '',
    end_date: '',
    return_date: '',
    destination: '',
    emergency_contact_name: '',
    emergency_contact_phone: '',
    reason: '',
    supervisor_approval: 'pending',
    status: 'draft'
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    // Fetch real data from API
    const fetchLeaveRequests = async () => {
      try {
        const response = await temporaryLeaveAPI.getAll();
        console.log('API Response:', response.data);
        
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
      } catch (error) {
        console.error('Failed to fetch leave requests:', error);
        // Fallback to empty array
        setLeaveRequests([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchLeaveRequests();
    } else {
      setLoading(false);
    }
  }, []);

  const handleInputChange = (field: keyof LeaveRequest, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      // Validate dates
      const startDate = new Date(formData.start_date);
      const endDate = new Date(formData.end_date);
      const returnDate = new Date(formData.return_date);

      if (startDate >= endDate) {
        throw new Error('End date must be after start date');
      }

      if (returnDate < endDate) {
        throw new Error('Return date must be on or after end date');
      }

      // Calculate duration
      const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (durationDays > 30) {
        throw new Error('Temporary leave cannot exceed 30 days. For longer periods, please use the regular clearance process.');
      }

      // Submit the request
      console.log('Submitting leave request with data:', formData);
      const response = await temporaryLeaveAPI.create(formData);
      console.log('Response:', response);
      
      // Refresh the list
      const updatedResponse = await temporaryLeaveAPI.getAll();
      console.log('Updated response:', updatedResponse.data);
      
      // Handle different response structures for refresh
      let requests = [];
      if (updatedResponse.data.success && updatedResponse.data.data) {
        if (updatedResponse.data.data.data) {
          requests = updatedResponse.data.data.data;
        } else if (Array.isArray(updatedResponse.data.data)) {
          requests = updatedResponse.data.data;
        }
      } else if (Array.isArray(updatedResponse.data)) {
        requests = updatedResponse.data;
      }
      
      setLeaveRequests(Array.isArray(requests) ? requests : []);
      
      setShowForm(false);
      setFormData({
        leave_type: 'weekend',
        start_date: '',
        end_date: '',
        return_date: '',
        destination: '',
        emergency_contact_name: '',
        emergency_contact_phone: '',
        reason: '',
        supervisor_approval: 'pending',
        status: 'draft'
      });

      // Show success message
      alert('Leave request submitted successfully! Your supervisor will be notified for approval.');

    } catch (err: any) {
      if (err.response?.data?.errors) {
        // Validation errors
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat().join(', ');
        setError(`Validation failed: ${errorMessages}`);
      } else if (err.response?.data?.message) {
        // Server error message
        setError(err.response.data.message);
      } else {
        // Generic error
        setError(err.message || 'Failed to submit leave request');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
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

  if (!user || user.user_type !== 'student') {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can request temporary leave.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Temporary Leave Requests</h1>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Request Leave
          </button>
        </div>

        {/* Information Card */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Temporary Leave Guidelines</h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Maximum leave duration: 30 days</li>
                  <li>Supervisor approval required for all requests</li>
                  <li>Emergency contact information mandatory</li>
                  <li>Room will be secured during your absence</li>
                  <li>Return within specified date to avoid penalties</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Leave Request Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Request Temporary Leave</h3>
                  <button
                    onClick={() => setShowForm(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Leave Type *
                      </label>
                      <select
                        value={formData.leave_type}
                        onChange={(e) => handleInputChange('leave_type', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="weekend">Weekend Leave</option>
                        <option value="holiday">Holiday Leave</option>
                        <option value="emergency">Emergency Leave</option>
                        <option value="medical">Medical Leave</option>
                        <option value="family_visit">Family Visit</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Destination *
                      </label>
                      <input
                        type="text"
                        value={formData.destination}
                        onChange={(e) => handleInputChange('destination', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Where are you going?"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        value={formData.start_date}
                        onChange={(e) => handleInputChange('start_date', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Date *
                      </label>
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => handleInputChange('end_date', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={formData.start_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Expected Return Date *
                      </label>
                      <input
                        type="date"
                        value={formData.return_date}
                        onChange={(e) => handleInputChange('return_date', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        min={formData.end_date || formData.start_date || new Date().toISOString().split('T')[0]}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Name *
                      </label>
                      <input
                        type="text"
                        value={formData.emergency_contact_name}
                        onChange={(e) => handleInputChange('emergency_contact_name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Contact person name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={formData.emergency_contact_phone}
                        onChange={(e) => handleInputChange('emergency_contact_phone', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="+251911000000"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reason for Leave *
                    </label>
                    <textarea
                      value={formData.reason}
                      onChange={(e) => handleInputChange('reason', e.target.value)}
                      rows={3}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Please explain the reason for your temporary leave..."
                      required
                    />
                  </div>

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Leave Requests List */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Your Leave Requests</h3>
          </div>
          
          {loading ? (
            <div className="p-6 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading requests...</p>
            </div>
          ) : Array.isArray(leaveRequests) && leaveRequests.length === 0 ? (
            <div className="p-6 text-center">
              <div className="text-4xl mb-4">📝</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Leave Requests</h3>
              <p className="text-gray-600">You haven't submitted any temporary leave requests yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {Array.isArray(leaveRequests) && leaveRequests.map((request) => (
                <div key={request.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="text-lg font-medium text-gray-900">
                          {getLeaveTypeDisplay(request.leave_type)}
                        </h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status)}`}>
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
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
                      <div className="mt-2 text-sm text-gray-600">
                        <span className="font-medium">Reason:</span> {request.reason}
                      </div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        View Details
                      </button>
                      {request.status === 'draft' && (
                        <button className="text-red-600 hover:text-red-800 text-sm font-medium">
                          Cancel
                        </button>
                      )}
                    </div>
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
                <div className="text-3xl mr-4">📞</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Contact Supervisor</h3>
                  <p className="text-sm text-gray-600 mt-1">Get in touch with your block supervisor</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Leave Guidelines</h3>
                  <p className="text-sm text-gray-600 mt-1">View complete leave policy</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🏠</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Room Security</h3>
                  <p className="text-sm text-gray-600 mt-1">Learn about room security during leave</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}