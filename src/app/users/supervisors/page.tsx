'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';

interface Supervisor {
  id: number;
  name: string;
  email: string;
  assigned_block: string;
  phone?: string;
  status: string;
  created_at: string;
}

export default function ManageSupervisorsPage() {
  const [supervisors, setSupervisors] = useState<Supervisor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchSupervisors();
  }, []);

  const fetchSupervisors = async () => {
    try {
      const response = await adminAPI.getAllUsers();
      const allUsers = response.data.data;
      const supervisorUsers = allUsers.filter((user: any) => user.user_type === 'supervisor');
      setSupervisors(supervisorUsers);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch supervisors');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminAPI.updateUserStatus(id.toString(), { status });
      fetchSupervisors(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this supervisor?')) return;

    try {
      await adminAPI.deleteUser(id.toString());
      fetchSupervisors(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete supervisor');
    }
  };

  const filteredSupervisors = supervisors.filter(supervisor =>
    supervisor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supervisor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supervisor.assigned_block.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading supervisors...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Supervisors</h1>
          <div className="flex space-x-3">
            <input
              type="text"
              placeholder="Search supervisors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <div className="mb-4">
              <p className="text-sm text-gray-600">
                Total Supervisors: {filteredSupervisors.length}
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Supervisor
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Block
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Joined
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSupervisors.map((supervisor) => (
                    <tr key={supervisor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {supervisor.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {supervisor.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Block {supervisor.assigned_block}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {supervisor.phone || 'Not provided'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={supervisor.status}
                          onChange={(e) => handleStatusChange(supervisor.id, e.target.value)}
                          className={`text-sm border-gray-300 rounded-md ${
                            supervisor.status === 'active'
                              ? 'text-green-800 bg-green-100'
                              : supervisor.status === 'inactive'
                              ? 'text-yellow-800 bg-yellow-100'
                              : 'text-red-800 bg-red-100'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                          <option value="suspended">Suspended</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(supervisor.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <button
                          onClick={() => handleDelete(supervisor.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredSupervisors.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  {searchTerm ? 'No supervisors found matching your search.' : 'No supervisors found.'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Block Summary */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Block Coverage
            </h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {['A', 'B', 'C'].map((block) => {
                const blockSupervisor = supervisors.find(s => s.assigned_block === block && s.status === 'active');
                return (
                  <div key={block} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">Block {block}</p>
                        <p className="text-sm text-gray-500">
                          {blockSupervisor ? blockSupervisor.name : 'No active supervisor'}
                        </p>
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        blockSupervisor ? 'bg-green-400' : 'bg-red-400'
                      }`}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}