'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { roomsAPI } from '@/lib/api';
import {
  BuildingOfficeIcon,
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

export default function RoomOccupancyPage() {
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    total_rooms: 60,
    occupied_rooms: 35,
    available_rooms: 23,
    occupancy_rate: 58,
  });
  const [dataSource, setDataSource] = useState<'demo' | 'api'>('demo');

  useEffect(() => {
    // Don't automatically fetch data on load to avoid console errors
    // User can click "Refresh Data" when backend is ready
  }, []);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const response = await roomsAPI.getStats();
      if (response.data.success) {
        setStats(response.data.data);
        setDataSource('api');
      }
    } catch (error) {
      console.warn('Backend API not available, using demo data');
      // Keep demo data, don't change anything
      setDataSource('demo');
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <Layout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Room Occupancy Monitoring</h1>
              <p className="text-gray-600">Monitor dormitory room occupancy and availability</p>
            </div>
            <button
              onClick={fetchData}
              disabled={refreshing}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center"
            >
              {refreshing ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Refreshing...
                </>
              ) : (
                'Refresh Data'
              )}
            </button>
          </div>
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-700">
              📊 {dataSource === 'demo' 
                ? 'Displaying sample occupancy data for demonstration purposes. Click "Refresh Data" to load real data from backend.' 
                : 'Displaying real-time data from backend database.'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total_rooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Available Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.available_rooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-yellow-100">
                <UserGroupIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupied Rooms</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.occupied_rooms}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100">
                <ChartBarIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Occupancy Rate</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.occupancy_rate}%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">Occupancy Overview</h2>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                dataSource === 'api' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {dataSource === 'api' ? 'Live Data' : 'Demo Data'}
              </span>
            </div>
          </div>
          <div className="p-6">
            <div className="text-center">
              <ChartBarIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Room Occupancy Statistics</h3>
              <p className="text-gray-600 mb-4">
                Current occupancy rate: <span className="font-semibold text-purple-600">{stats.occupancy_rate}%</span>
              </p>
              <div className="max-w-md mx-auto">
                <div className="bg-gray-200 rounded-full h-4 mb-2">
                  <div 
                    className="bg-purple-600 h-4 rounded-full transition-all duration-300" 
                    style={{ width: `${stats.occupancy_rate}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}