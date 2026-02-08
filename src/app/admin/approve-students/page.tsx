'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';

interface User {
  id: number;
  name: string;
  email: string;
  student_id?: string;
  department?: string;
  year_level?: number;
  gender?: string;
  user_type: string;
  assigned_block?: string;
  status: string;
  created_at: string;
}

export default function ApproveUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/users/pending', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setUsers(data.data);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err: any) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: number, name: string, userType: string) => {
    if (!confirm(`Approve ${userType} ${name}?`)) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`✅ ${name} has been approved!`);
        fetchPendingUsers();
      } else {
        alert(`❌ Failed to approve: ${data.message}`);
      }
    } catch (err: any) {
      alert('❌ Failed to approve user');
    }
  };

  const handleReject = async (id: number, name: string, userType: string) => {
    const reason = prompt(`Reject ${userType} ${name}?\n\nReason for rejection (optional):`);
    if (reason === null) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/users/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason })
      });
      
      const data = await response.json();
      
      if (data.success) {
        alert(`❌ ${name} has been rejected`);
        fetchPendingUsers();
      } else {
        alert(`❌ Failed to reject: ${data.message}`);
      }
    } catch (err: any) {
      alert('❌ Failed to reject user');
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.student_id && user.student_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesType = filterType === 'all' || user.user_type === filterType;
    
    return matchesSearch && matchesType;
  });

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Approve Registrations</h1>
            <p className="text-gray-600">Review and approve pending student and supervisor registrations</p>
          </div>
          <div className="bg-blue-100 px-4 py-2 rounded-lg">
            <span className="text-blue-800 font-semibold">{users.length} Pending</span>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-4 items-center">
          <input
            type="text"
            placeholder="Search by name, email, or student ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Users</option>
            <option value="student">Students Only</option>
            <option value="supervisor">Supervisors Only</option>
          </select>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {filteredUsers.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Users</h3>
            <p className="text-gray-600">All registrations have been processed!</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <li key={user.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{user.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          user.user_type === 'student' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.user_type === 'student' ? '🎓 Student' : '👨‍💼 Supervisor'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <p><strong>Email:</strong> {user.email}</p>
                          {user.student_id && <p><strong>Student ID:</strong> {user.student_id}</p>}
                          {user.department && <p><strong>Department:</strong> {user.department}</p>}
                        </div>
                        <div>
                          {user.year_level && <p><strong>Year Level:</strong> {user.year_level}</p>}
                          {user.gender && <p><strong>Gender:</strong> {user.gender}</p>}
                          {user.assigned_block && <p><strong>Assigned Block:</strong> {user.assigned_block}</p>}
                          <p><strong>Registered:</strong> {new Date(user.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 ml-4">
                      <button
                        onClick={() => handleApprove(user.id, user.name, user.user_type)}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => handleReject(user.id, user.name, user.user_type)}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                      >
                        ❌ Reject
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </Layout>
  );
}