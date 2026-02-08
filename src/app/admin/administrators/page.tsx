'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminAPI } from '@/lib/api';
import Layout from '@/components/Layout';

interface Administrator {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  created_at: string;
}

export default function AdministratorsPage() {
  const [administrators, setAdministrators] = useState<Administrator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetchAdministrators();
  }, []);

  const fetchAdministrators = async () => {
    try {
      const response = await adminAPI.getAdministrators();
      setAdministrators(response.data.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch administrators');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    try {
      await adminAPI.updateUserStatus(id.toString(), { status });
      fetchAdministrators(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this administrator?')) return;

    try {
      await adminAPI.deleteUser(id.toString());
      fetchAdministrators(); // Refresh the list
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete administrator');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Loading administrators...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Administrators</h1>
          <Link
            href="/admin/administrators/create"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
          >
            Create New Admin
          </Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {administrators.map((admin) => (
              <li key={admin.id}>
                <div className="px-4 py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {admin.name}
                      </p>
                      <div className="ml-2 flex-shrink-0 flex">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            admin.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : admin.status === 'inactive'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {admin.status}
                        </span>
                      </div>
                    </div>
                    <div className="mt-2">
                      <div className="sm:flex sm:justify-between">
                        <div className="sm:flex">
                          <p className="flex items-center text-sm text-gray-500">
                            {admin.email}
                          </p>
                          {admin.phone && (
                            <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                              {admin.phone}
                            </p>
                          )}
                        </div>
                        <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                          <p>
                            Created {new Date(admin.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="ml-4 flex space-x-2">
                    <Link
                      href={`/admin/administrators/${admin.id}/edit`}
                      className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                    >
                      Edit
                    </Link>
                    <Link
                      href={`/admin/administrators/${admin.id}/reset-password`}
                      className="text-yellow-600 hover:text-yellow-900 text-sm font-medium"
                    >
                      Reset Password
                    </Link>
                    <select
                      value={admin.status}
                      onChange={(e) => handleStatusChange(admin.id, e.target.value)}
                      className="text-sm border-gray-300 rounded-md"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                      <option value="suspended">Suspended</option>
                    </select>
                    <button
                      onClick={() => handleDelete(admin.id)}
                      className="text-red-600 hover:text-red-900 text-sm font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {administrators.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No administrators found.</p>
          </div>
        )}
      </div>
    </Layout>
  );
}