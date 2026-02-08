'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';

interface Department {
  name: string;
  status: 'cleared' | 'pending' | 'rejected';
  clearedBy: string | null;
  clearedDate: string | null;
  remarks: string;
}

interface ClearanceStatus {
  overallStatus: 'cleared' | 'pending' | 'rejected';
  departments: Department[];
}

export default function ClearancePage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [clearanceStatus, setClearanceStatus] = useState<ClearanceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // TODO: Fetch clearance status from API
    // Mock data for now
    setClearanceStatus({
      overallStatus: 'pending',
      departments: [
        {
          name: 'Library',
          status: 'cleared',
          clearedBy: 'Ms. Johnson',
          clearedDate: '2024-01-18',
          remarks: 'All books returned'
        },
        {
          name: 'Finance Office',
          status: 'pending',
          clearedBy: null,
          clearedDate: null,
          remarks: 'Outstanding documents pending'
        },
        {
          name: 'Dormitory Office',
          status: 'cleared',
          clearedBy: 'Mr. Smith',
          clearedDate: '2024-01-19',
          remarks: 'Room inspection completed'
        },
        {
          name: 'Academic Office',
          status: 'pending',
          clearedBy: null,
          clearedDate: null,
          remarks: 'Transcript request pending'
        }
      ]
    });
    setLoading(false);
  }, []);

  // Check if user is a student
  const isStudent = user && user.user_type === 'student';

  if (!isStudent) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only students can view clearance status.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading clearance status...</p>
        </div>
      </Layout>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'cleared':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'cleared':
        return '✅';
      case 'pending':
        return '⏳';
      case 'rejected':
        return '❌';
      default:
        return '❓';
    }
  };

  const clearedCount = clearanceStatus?.departments.filter(dept => dept.status === 'cleared').length || 0;
  const totalCount = clearanceStatus?.departments.length || 0;
  const progressPercentage = totalCount > 0 ? (clearedCount / totalCount) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Clearance Status</h1>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
            Download Clearance Form
          </button>
        </div>

        {/* Overall Status Card */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">Overall Clearance Status</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                clearanceStatus?.overallStatus === 'cleared' 
                  ? 'bg-green-100 text-green-800'
                  : clearanceStatus?.overallStatus === 'pending'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {clearanceStatus?.overallStatus === 'cleared' ? 'Fully Cleared' : 
                 clearanceStatus?.overallStatus === 'pending' ? 'Pending' : 'Incomplete'}
              </span>
            </div>
          </div>
          
          <div className="p-6">
            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progress</span>
                <span>{clearedCount} of {totalCount} departments cleared</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            <div className="text-sm text-gray-600">
              {clearanceStatus?.overallStatus === 'cleared' ? (
                <p className="text-green-600 font-medium">
                  🎉 Congratulations! You have been cleared by all departments.
                </p>
              ) : (
                <p>
                  You need clearance from {totalCount - clearedCount} more department(s) to complete your clearance process.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Department Clearances */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Department Clearances</h3>
          </div>
          
          <div className="divide-y divide-gray-200">
            {clearanceStatus?.departments.map((department, index) => (
              <div key={index} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl">
                      {getStatusIcon(department.status)}
                    </div>
                    <div>
                      <h4 className="text-lg font-medium text-gray-900">{department.name}</h4>
                      {department.remarks && (
                        <p className="text-sm text-gray-600 mt-1">{department.remarks}</p>
                      )}
                      {department.clearedBy && department.clearedDate && (
                        <p className="text-xs text-gray-500 mt-1">
                          Cleared by {department.clearedBy} on {department.clearedDate}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(department.status)}`}>
                      {department.status.charAt(0).toUpperCase() + department.status.slice(1)}
                    </span>
                    {department.status === 'pending' && (
                      <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        Contact Department
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Clearance Instructions
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <ul className="list-disc list-inside space-y-1">
                  <li>Visit each department to complete your clearance requirements</li>
                  <li>Ensure all outstanding obligations are settled</li>
                  <li>Return all borrowed items (books, equipment, etc.)</li>
                  <li>Complete any pending academic requirements</li>
                  <li>Contact departments directly for specific requirements</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📞</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Contact Support
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Get help with clearance process
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📋</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Clearance Guide
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Step-by-step clearance instructions
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow cursor-pointer">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🔄</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Refresh Status
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Update clearance status
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}