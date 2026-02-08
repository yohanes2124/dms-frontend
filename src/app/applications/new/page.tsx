'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { applicationsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';
import { useMessageBanner } from '@/contexts/MessageBannerContext';

interface ApplicationFormData {
  preferred_block: string;
  medical_conditions?: string;
}

interface AvailableBlock {
  name: string;
  description: string;
  totalCapacity: number;
  usedSpaces: number;
  remainingSpaces: number;
  hasSpace: boolean;
}

export default function ApplyDormitoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [error, setError] = useState('');
  const [availableBlocks, setAvailableBlocks] = useState<AvailableBlock[]>([]);
  const [formData, setFormData] = useState<ApplicationFormData>({
    preferred_block: '',
    medical_conditions: ''
  });
  
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { showSuccess, showError } = useNotification();
  const { showBanner } = useMessageBanner();

  // Fetch available blocks from database
  useEffect(() => {
    const fetchAvailableBlocks = async () => {
      try {
        setLoadingBlocks(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('http://localhost:8000/api/blocks/available', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (data.success && data.data) {
          const blocks = data.data
            .filter((block: any) => block.remainingSpaces > 0) // Only show blocks with available spaces
            .map((block: any) => ({
              name: block.name,
              description: block.description || `Block ${block.name}`,
              totalCapacity: block.totalCapacity || 0,
              usedSpaces: block.usedSpaces || 0,
              remainingSpaces: block.remainingSpaces || 0,
              hasSpace: block.hasSpace !== false
            }));
          
          setAvailableBlocks(blocks);
        } else {
          setAvailableBlocks([]);
        }
      } catch (error) {
        console.error('Error fetching blocks:', error);
        setAvailableBlocks([]);
      } finally {
        setLoadingBlocks(false);
      }
    };

    fetchAvailableBlocks();
  }, []);

  const handleInputChange = (field: keyof ApplicationFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.preferred_block) {
      setError('Please select a preferred block');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      const applicationData = {
        preferred_block: formData.preferred_block,
        special_requirements: [],
        emergency_contact_name: user?.name || 'Emergency Contact',
        emergency_contact_phone: '+251911000000',
        medical_conditions: formData.medical_conditions || null
      };

      await applicationsAPI.create(applicationData);
      showSuccess('Application submitted successfully! You will be notified of the status.');
      showBanner(
        "✅ Application Submitted! Your application is now pending review. Check your status in the Applications section.",
        'success',
        true
      );
      router.push('/applications');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit application';
      setError(errorMessage);
      showError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Check if user is a student
  if (!user || user.user_type !== 'student') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Restricted</h2>
            <p className="text-red-600">Only students can submit dormitory applications.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">🏠 Apply for Dormitory</h1>
          <p className="text-lg text-gray-600">Submit your dormitory accommodation request</p>
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              <strong>🎯 Purpose:</strong> This page is where you submit a request to get a dorm room. 
              The system does NOT give the room immediately — it just collects information for approval.
            </p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              <div className="text-sm text-red-800">{error}</div>
            </div>
          </div>
        )}

        {/* No Blocks Available Message */}
        {!loadingBlocks && availableBlocks.length === 0 && (
          <div className="mb-6 p-6 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
            <div className="text-6xl mb-4">🏠</div>
            <h3 className="text-xl font-semibold text-yellow-800 mb-2">No Blocks Available</h3>
            <p className="text-yellow-700">
              All dormitory blocks are currently full. Please check back later or contact the administration.
            </p>
          </div>
        )}

        {/* Application Form */}
        <form onSubmit={onSubmit} className="space-y-8">
          
          {/* 1️⃣ Student Information (Auto-filled) */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">👤</span>
              <h2 className="text-2xl font-bold text-gray-900">1️⃣ Student Information</h2>
              <span className="ml-3 text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Auto-filled</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍🎓 Full Name</label>
                <input
                  type="text"
                  value={user.name || 'Yohanes Mitiku'}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🆔 Student ID</label>
                <input
                  type="text"
                  value={user.student_id || 'STU-2024-001'}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏫 Department / Faculty</label>
                <input
                  type="text"
                  value={user.department || 'Computer Science'}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">👤 Gender</label>
                <input
                  type="text"
                  value={user.gender ? (user.gender.charAt(0).toUpperCase() + user.gender.slice(1)) : 'Not specified'}
                  disabled
                  className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                />
              </div>
            </div>
          </div>

          {/* 2️⃣ Dormitory Preferences */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center mb-6">
              <span className="text-3xl mr-3">🏢</span>
              <h2 className="text-2xl font-bold text-gray-900">2️⃣ Dormitory Preferences</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  🏢 Preferred Dorm Block <span className="text-red-500">*</span>
                </label>
                
                {loadingBlocks ? (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    Loading available blocks...
                  </div>
                ) : availableBlocks.length > 0 ? (
                  <select
                    value={formData.preferred_block}
                    onChange={(e) => handleInputChange('preferred_block', e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    required
                    disabled={availableBlocks.length === 0}
                  >
                    <option value="">Choose your preferred block</option>
                    {availableBlocks.map((block) => (
                      <option key={block.name} value={block.name}>
                        {block.name} ({block.remainingSpaces} spaces available)
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    No blocks available for application
                  </div>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  📝 Medical Conditions (Optional)
                </label>
                <textarea
                  value={formData.medical_conditions}
                  onChange={(e) => handleInputChange('medical_conditions', e.target.value)}
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Any medical conditions or special requirements"
                  disabled={availableBlocks.length === 0}
                />
                <p className="mt-1 text-xs text-gray-500">
                  This information helps us provide appropriate accommodation
                </p>
              </div>
            </div>
          </div>



          {/* 3️⃣ Submit Button */}
          <div className="bg-white p-8 rounded-xl shadow-lg border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Submit?</h3>
                <p className="text-sm text-gray-600">
                  After submission, your application status will be: <span className="font-semibold text-yellow-600">⏳ Pending</span>
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isLoading || availableBlocks.length === 0}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : availableBlocks.length === 0 ? (
                  '🏠 No Blocks Available'
                ) : (
                  '🏠 Apply for Dormitory'
                )}
              </button>
            </div>
          </div>
        </form>

        {/* What Happens After Applying */}
        <div className="mt-8 p-6 bg-green-50 rounded-lg border border-green-200">
          <div className="flex items-start">
            <span className="text-2xl mr-3">🔄</span>
            <div className="text-sm text-green-800">
              <p className="font-medium mb-2">🔁 What Happens AFTER Applying?</p>
              <div className="space-y-2 text-green-700">
                <p>• Your application will be saved in the database with status: <strong>⏳ Pending</strong></p>
                <p>• You will be redirected to <strong>Application Status</strong> page</p>
                <p>• Supervisors will review your application</p>
                <p>• You will see one of these statuses:</p>
                <div className="ml-4 space-y-1">
                  <p>  - <strong>⏳ Pending:</strong> Under review</p>
                  <p>  - <strong>✅ Approved:</strong> Room assigned</p>
                  <p>  - <strong>❌ Rejected:</strong> Application denied</p>
                </div>
                <p>• If approved, you will see your assigned block and room number</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}