'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';

interface Backup {
  id: number;
  name: string;
  date: string;
  size: string;
  type: string;
  status: string;
}

export default function BackupPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [backups, setBackups] = useState<Backup[]>([
    {
      id: 1,
      name: 'Daily Backup - 2024-01-20',
      date: '2024-01-20 02:00:00',
      size: '45.2 MB',
      type: 'Automatic',
      status: 'Completed'
    },
    {
      id: 2,
      name: 'Manual Backup - 2024-01-19',
      date: '2024-01-19 14:30:00',
      size: '44.8 MB',
      type: 'Manual',
      status: 'Completed'
    }
  ]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    // TODO: Fetch backups from API
  }, []);

  // Check if user has permission to manage backups
  const canManageBackups = user && user.user_type === 'admin';

  if (!canManageBackups) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to access backup & restore.</p>
        </div>
      </Layout>
    );
  }

  const handleCreateBackup = async () => {
    setIsCreatingBackup(true);
    // TODO: Create backup via API
    setTimeout(() => {
      setIsCreatingBackup(false);
      alert('Backup created successfully!');
    }, 3000);
  };

  const handleRestore = (backupId: number) => {
    if (confirm('Are you sure you want to restore from this backup? This action cannot be undone.')) {
      // TODO: Restore from backup via API
      alert('Restore initiated. This may take several minutes.');
    }
  };

  const handleDownload = (backupId: number) => {
    // TODO: Download backup file
    alert('Backup download started.');
  };

  const handleDelete = (backupId: number) => {
    if (confirm('Are you sure you want to delete this backup?')) {
      setBackups(backups.filter(backup => backup.id !== backupId));
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Backup & Restore</h1>
          <button 
            onClick={handleCreateBackup}
            disabled={isCreatingBackup}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
          >
            {isCreatingBackup ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating...
              </>
            ) : (
              'Create Backup'
            )}
          </button>
        </div>

        {/* Backup Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">💾</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Backups
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {backups.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">📊</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Size
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    90.0 MB
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🕒</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Last Backup
                  </h3>
                  <p className="text-sm font-medium text-gray-600">
                    Jan 20, 2024
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">✅</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Status
                  </h3>
                  <p className="text-sm font-medium text-green-600">
                    All Good
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Backup List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Available Backups</h3>
            
            {backups.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Backups Available</h3>
                <p className="text-gray-600">Create your first backup to get started.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div key={backup.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-medium text-gray-900">{backup.name}</h4>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500">
                          <span>📅 {backup.date}</span>
                          <span>📦 {backup.size}</span>
                          <span>🏷️ {backup.type}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            backup.status === 'Completed' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {backup.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDownload(backup.id)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          Download
                        </button>
                        <button
                          onClick={() => handleRestore(backup.id)}
                          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => handleDelete(backup.id)}
                          className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Backup Settings */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Backup Settings</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Automatic Daily Backups
                  </label>
                  <p className="text-xs text-gray-500">
                    Create automatic backups every day at 2:00 AM
                  </p>
                </div>
                <input
                  type="checkbox"
                  defaultChecked={true}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Retain Backups (days)
                  </label>
                  <p className="text-xs text-gray-500">
                    Number of days to keep backups before auto-deletion
                  </p>
                </div>
                <input
                  type="number"
                  defaultValue={30}
                  className="w-20 px-3 py-1 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Critical Warning
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>
                  Restoring from a backup will overwrite all current data. This action cannot be undone. 
                  Always create a current backup before restoring from an older one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}