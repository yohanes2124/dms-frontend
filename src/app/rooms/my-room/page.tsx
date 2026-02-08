'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { roomsAPI } from '@/lib/api';

interface Roommate {
  id: string;
  name: string;
  email: string;
}

interface RoomAllocation {
  assignment_id: string;
  room_number: string;
  block: string;
  room_type: string;
  capacity: number;
  current_occupancy: number;
  check_in_date: string;
  check_out_date: string | null;
  status: string;
  roommates: Roommate[];
  facilities: string[];
  description: string;
}

export default function MyRoomPage() {
  const router = useRouter();
  const [user, setUser] = useState(authService.getCurrentUser());
  const [roomAllocation, setRoomAllocation] = useState<RoomAllocation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    
    if (currentUser && currentUser.user_type === 'student') {
      fetchRoomAllocation();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchRoomAllocation = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await roomsAPI.getMyRoom();
      
      if (response.data.success && response.data.data) {
        setRoomAllocation(response.data.data);
      } else {
        setRoomAllocation(null);
      }
    } catch (err: any) {
      console.error('Error fetching room allocation:', err);
      setError(err.response?.data?.message || 'Failed to fetch room allocation');
      setRoomAllocation(null);
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRoomChange = () => {
    // Navigate to room change request page
    window.location.href = '/change-requests/new';
  };

  const handleDownloadDetails = () => {
    // Generate and download room details as PDF or text file
    const roomDetails = `
ROOM ALLOCATION DETAILS
=======================

Student: ${user?.name || 'N/A'}
Email: ${user?.email || 'N/A'}

Room Information:
- Room Number: ${roomAllocation?.room_number}
- Block: ${roomAllocation?.block}
- Room Type: ${roomAllocation?.room_type}
- Capacity: ${roomAllocation?.capacity}
- Current Occupancy: ${roomAllocation?.current_occupancy}
- Check-in Date: ${roomAllocation?.check_in_date}
- Check-out Date: ${roomAllocation?.check_out_date || 'Not set'}
- Status: ${roomAllocation?.status}

Roommates:
${roomAllocation?.roommates.map(mate => `- ${mate.name} (${mate.email})`).join('\n') || '- No roommates assigned'}

Facilities:
${roomAllocation?.facilities.map(facility => `- ${facility}`).join('\n') || '- No facilities listed'}

Generated on: ${new Date().toLocaleDateString()}
    `;

    // Create and download the file
    const blob = new Blob([roomDetails], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `room-allocation-${roomAllocation?.room_number || 'details'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  // Check if user is a student
  const isStudent = user && user.user_type === 'student';

  if (!isStudent) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can view room allocations.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading room information...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={fetchRoomAllocation}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  if (!roomAllocation) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Room Allocated</h1>
          <p className="text-gray-600 mb-6">
            You don't have a room allocation yet. Please check your application status or contact the administration.
          </p>
          <button 
            onClick={() => window.location.href = '/applications/new'}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm font-medium"
          >
            Apply for Dormitory
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Room Allocation</h1>
          <div className="flex space-x-3">
            <button 
              onClick={handleRequestRoomChange}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Request Room Change
            </button>
            <button 
              onClick={handleDownloadDetails}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Download Details
            </button>
          </div>
        </div>

        {/* Room Information Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h2 className="text-xl font-semibold text-blue-900">Room {roomAllocation.room_number}</h2>
            <p className="text-blue-700">{roomAllocation.block} • {roomAllocation.room_type}-bed room</p>
          </div>
          
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Room Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Room Type:</span>
                    <span className="font-medium">{roomAllocation.room_type}-bed</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacity:</span>
                    <span className="font-medium">{roomAllocation.capacity} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Occupancy:</span>
                    <span className="font-medium">{roomAllocation.current_occupancy}/{roomAllocation.capacity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Check-in Date:</span>
                    <span className="font-medium">{new Date(roomAllocation.check_in_date).toLocaleDateString()}</span>
                  </div>
                  {roomAllocation.check_out_date && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Check-out Date:</span>
                      <span className="font-medium">{new Date(roomAllocation.check_out_date).toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className="font-medium capitalize">{roomAllocation.status}</span>
                  </div>
                </div>
              </div>

              {/* Roommates */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Roommates</h3>
                <div className="space-y-2">
                  {roomAllocation.roommates.map((roommate, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="h-8 w-8 rounded-full bg-blue-300 flex items-center justify-center">
                        <span className="text-sm font-medium text-white">
                          {roommate.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-gray-900 font-medium">{roommate.name}</p>
                        <p className="text-sm text-gray-500">{roommate.email}</p>
                      </div>
                    </div>
                  ))}
                  {roomAllocation.roommates.length === 0 && (
                    <p className="text-gray-500 italic">No roommates assigned yet</p>
                  )}
                </div>
              </div>
            </div>

            {/* Facilities */}
            {roomAllocation.facilities && roomAllocation.facilities.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Room Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {roomAllocation.facilities.map((facility, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <div className="h-2 w-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm text-gray-700">{facility}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            {roomAllocation.description && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 mb-2">Description</h3>
                <p className="text-gray-700">{roomAllocation.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div 
            onClick={handleRequestRoomChange}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🔄</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Request Room Change
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Submit a request to change your room
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => router.push('/issues/new')}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🛠️</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Report Issue
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Report maintenance or facility issues
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div 
            onClick={() => router.push('/rules')}
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer"
          >
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Room Rules
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    View dormitory rules and regulations
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Room Allocation Confirmed
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  Your room allocation is confirmed. Please ensure you check in by the specified date 
                  and follow all dormitory rules and regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}