'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { roomsAPI } from '@/lib/api';

interface Room {
  id: number;
  room_number: string;
  block: string;
  capacity: number;
  current_occupancy: number;
  room_type: string;
  status: string;
  facilities: string[];
}

export default function AvailableRoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAvailableRooms();
  }, []);

  const fetchAvailableRooms = async () => {
    try {
      const response = await roomsAPI.getAvailable();
      console.log('Available Rooms API Response:', response.data); // Debug log
      
      // Handle different response structures
      if (response.data.success && response.data.data) {
        setRooms(response.data.data);
        
        // Show debug info if available
        if (response.data.debug_info) {
          console.log('Gender filtering debug:', response.data.debug_info);
        }
      } else if (Array.isArray(response.data)) {
        setRooms(response.data);
      } else {
        setRooms([]);
        setError('Invalid response format from server');
      }
    } catch (err: any) {
      console.error('Fetch available rooms error:', err); // Debug log
      
      // More detailed error handling
      if (err.response?.status === 401) {
        setError('Authentication required. Please log in again.');
      } else if (err.response?.status === 422) {
        setError('Gender information required. Please update your profile to continue.');
      } else if (err.response?.status === 500) {
        setError('Server error. Please try again later.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to fetch available rooms');
      }
      setRooms([]); // Ensure rooms is always an array
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading available rooms...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Available Rooms</h1>
          <p className="mt-2 text-sm text-gray-600">
            Browse available dormitory rooms. To apply, go to "Apply for Dormitory" page.
          </p>
          <div className="mt-2 p-2 bg-green-50 rounded text-xs text-green-800">
            ✅ Gender-filtered: Only showing rooms from blocks matching your gender
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rooms && rooms.length > 0 ? (
            rooms.map((room) => (
              <div key={room.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Room {room.room_number}
                    </h3>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Available
                    </span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Block:</span>
                      <span className="text-sm font-medium text-gray-900">{room.block}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-gray-500">No available rooms at the moment.</p>
              <p className="text-sm text-gray-400 mt-1">Please check back later or contact administration.</p>
            </div>
          )}
        </div>

        {error && !loading && (
          <div className="text-center py-12">
            <p className="text-red-500">Error: {error}</p>
            <button 
              onClick={fetchAvailableRooms}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Retry
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}