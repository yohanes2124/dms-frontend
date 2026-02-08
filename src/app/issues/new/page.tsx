'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function ReportIssuePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [myRoom, setMyRoom] = useState<any>(null);

  const [formData, setFormData] = useState({
    category: 'other',
    priority: 'medium',
    title: '',
    description: ''
  });

  useEffect(() => {
    fetchMyRoom();
  }, []);

  const fetchMyRoom = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data.data.room_assignment) {
        setMyRoom(response.data.data.room_assignment);
      }
    } catch (err) {
      console.error('Failed to fetch room info:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const token = authService.getToken();
      const response = await axios.post(
        `${API_URL}/issues`,
        {
          ...formData,
          room_id: myRoom?.room_id || null
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setSuccess('Issue reported successfully!');
        setTimeout(() => {
          router.push('/issues');
        }, 1500);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit issue report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-5xl">🛠️</span>
            <h1 className="text-4xl font-bold text-gray-900">Report Issue</h1>
          </div>
          <p className="text-gray-600 text-lg">Submit a maintenance or facility issue report</p>
        </div>

        {/* Room Info Card */}
        {myRoom && (
          <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-lg p-5 mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📍</span>
              <div>
                <p className="text-sm text-blue-600 font-medium">Your Current Room</p>
                <p className="text-xl font-bold text-blue-900">
                  Room {myRoom.room?.room_number} • Block {myRoom.room?.block}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 px-6 py-4 rounded-lg mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Success</p>
                <p className="text-sm">{success}</p>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 space-y-6">
          {/* Category */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Issue Category *
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              required
            >
              <option value="plumbing">🚰 Plumbing (Water, Leaks, Drainage)</option>
              <option value="electrical">⚡ Electrical (Power, Lights, Outlets)</option>
              <option value="furniture">🪑 Furniture (Bed, Desk, Cabinet)</option>
              <option value="cleaning">🧹 Cleaning (Maintenance, Hygiene)</option>
              <option value="other">📦 Other</option>
            </select>
          </div>

          {/* Priority */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Priority Level *
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: 'low', label: '🟢 Low', desc: 'Can wait' },
                { value: 'medium', label: '🟡 Medium', desc: 'Soon' },
                { value: 'high', label: '🟠 High', desc: 'Urgent' },
                { value: 'urgent', label: '🔴 Urgent', desc: 'Critical' }
              ].map(option => (
                <label key={option.value} className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-gray-50" style={{borderColor: formData.priority === option.value ? '#3b82f6' : '#e5e7eb', backgroundColor: formData.priority === option.value ? '#eff6ff' : 'white'}}>
                  <input
                    type="radio"
                    name="priority"
                    value={option.value}
                    checked={formData.priority === option.value}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-4 h-4"
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{option.label}</p>
                    <p className="text-xs text-gray-500">{option.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Issue Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              placeholder="e.g., Broken shower head, Flickering light"
              required
              maxLength={255}
            />
            <p className="text-xs text-gray-500 mt-2">{formData.title.length}/255 characters</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Detailed Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base"
              rows={7}
              placeholder="Describe the issue in detail. Include when it started, what you've tried, and any other relevant information..."
              required
              maxLength={2000}
            />
            <p className="text-xs text-gray-500 mt-2">{formData.description.length}/2000 characters</p>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors text-base"
            >
              {loading ? '⏳ Submitting...' : '✅ Submit Report'}
            </button>
            <button
              type="button"
              onClick={() => router.push('/issues')}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-3">💡 Tips for Better Reports</h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>✓ Be specific about the issue location (e.g., "left side of shower")</li>
            <li>✓ Mention when the problem started</li>
            <li>✓ Describe any safety concerns immediately</li>
            <li>✓ Set appropriate priority level for faster response</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
}
