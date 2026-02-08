'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { applicationsAPI, roomsAPI } from '@/lib/api';
import { PlusIcon, EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';

interface Application {
  id: number;
  preferred_room_id?: number;
  preferred_block: string;
  application_date: string;
  status: string;
  priority_score: number;
  emergency_contact_name: string;
  emergency_contact_phone: string;
  medical_conditions?: string;
  special_requirements?: string[];
  student: {
    name: string;
    student_id: string;
    department: string;
  };
  preferred_room?: {
    room_number: string;
    block: string;
  };
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const user = authService.getCurrentUser();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await applicationsAPI.getAll();
      console.log('API Response:', response.data);
      
      // Handle paginated response structure
      const applicationsData = response.data.data?.data || response.data.data || [];
      console.log('Applications data:', applicationsData);
      
      setApplications(Array.isArray(applicationsData) ? applicationsData : []);
    } catch (err: any) {
      console.error('API Error:', err);
      setError(err.response?.data?.message || 'Failed to fetch applications');
      setApplications([]); // Ensure it's always an array
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this application?')) return;
    
    try {
      await applicationsAPI.approve(id.toString());
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve application');
    }
  };

  const handleReject = async (id: number) => {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;
    
    try {
      await applicationsAPI.reject(id.toString(), { reason });
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject application');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this application?')) return;
    
    try {
      await applicationsAPI.delete(id.toString());
      fetchApplications();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete application');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.user_type === 'student' ? 'My Applications' : 'Dormitory Applications'}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              {user?.user_type === 'student' 
                ? 'Manage your dormitory applications'
                : 'Review and manage student applications'
              }
            </p>
          </div>
          
          {user?.user_type === 'student' && (
            <Link
              href="/applications/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              New Application
            </Link>
          )}
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Applications List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {applications.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500">
                {user?.user_type === 'student' 
                  ? 'You have no applications yet.'
                  : 'No applications found.'
                }
              </div>
              {user?.user_type === 'student' && (
                <Link
                  href="/applications/new"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create your first application
                </Link>
              )}
            </div>
          ) : (
            <ul className="divide-y divide-gray-200">
              {applications.map((application) => (
                <li key={application.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                            {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center">
                            <p className="text-sm font-medium text-gray-900">
                              {user?.user_type === 'student' 
                                ? `Application #${application.id}`
                                : application.student.name
                              }
                            </p>
                            {user?.user_type !== 'student' && (
                              <p className="ml-2 text-sm text-gray-500">
                                ({application.student.student_id})
                              </p>
                            )}
                          </div>
                          <div className="mt-1 flex items-center text-sm text-gray-500">
                            <p>
                              Preferred: Block {application.preferred_block}
                              {application.preferred_room && ` • Room ${application.preferred_room.room_number}`}
                            </p>
                          </div>
                          <div className="mt-1 text-sm text-gray-500">
                            Applied: {new Date(application.application_date).toLocaleDateString()}
                            {application.priority_score > 0 && (
                              <span className="ml-2">• Priority: {application.priority_score}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/applications/${application.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          <EyeIcon className="h-5 w-5" />
                        </Link>
                        
                        {user?.user_type === 'student' && application.status === 'draft' && (
                          <>
                            <Link
                              href={`/applications/${application.id}/edit`}
                              className="text-green-600 hover:text-green-900"
                            >
                              <PencilIcon className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDelete(application.id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <TrashIcon className="h-5 w-5" />
                            </button>
                          </>
                        )}
                        
                        {(user?.user_type === 'supervisor' || user?.user_type === 'admin') && application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(application.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-green-600 hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(application.id)}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-red-600 hover:bg-red-700"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </Layout>
  );
}