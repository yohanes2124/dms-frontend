'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { applicationsAPI } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useNotification } from '@/contexts/NotificationContext';

interface ApplicationFormData {
  preferred_block: string;
  preferred_floor?: string;
  special_needs: string[];
}

interface AvailableBlock {
  name: string;
  description: string;
  totalCapacity: number;
  usedSpaces: number;
  remainingSpaces: number;
  hasSpace: boolean;
  floors?: number;
}

export default function ApplyDormitoryPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingBlocks, setLoadingBlocks] = useState(true);
  const [availableBlocks, setAvailableBlocks] = useState<AvailableBlock[]>([]);
  const [selectedBlock, setSelectedBlock] = useState<AvailableBlock | null>(null);
  const [error, setError] = useState('');
  const router = useRouter();
  const user = authService.getCurrentUser();
  const { showSuccess, showError } = useNotification();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ApplicationFormData>();

  const watchedBlock = watch('preferred_block');

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
          const blocks = data.data.map((block: any) => ({
            name: block.name,
            description: block.description || `Block ${block.name}`,
            totalCapacity: block.totalCapacity || 0,
            usedSpaces: block.usedSpaces || 0,
            remainingSpaces: block.remainingSpaces || 0,
            hasSpace: block.hasSpace !== false,
            floors: block.floors || 4
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

  // Update selected block when user chooses a block
  useEffect(() => {
    if (watchedBlock && availableBlocks.length > 0) {
      const block = availableBlocks.find(b => b.name === watchedBlock);
      setSelectedBlock(block || null);
    } else {
      setSelectedBlock(null);
    }
  }, [watchedBlock, availableBlocks]);

  const onSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true);
    setError('');

    try {
      const applicationData = {
        preferred_block: data.preferred_block,
        preferred_floor: data.preferred_floor || null,
        special_requirements: data.special_needs.join(', '),
        application_reason: 'Standard dormitory application request',
        emergency_contact_name: user?.emergency_contact || 'Not provided',
        emergency_contact_phone: user?.emergency_phone || 'Not provided',
        emergency_contact_relationship: 'Parent',
      };

      await applicationsAPI.create(applicationData);
      showSuccess('Application submitted successfully! You will be notified of the status.');
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

        {/* Application Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">👨‍🎓 User Role</label>
                <input
                  type="text"
                  value="Student"
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
                    {...register('preferred_block', { required: 'Please select a preferred block' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  >
                    <option value="">Choose your preferred block</option>
                    {availableBlocks.map((block) => (
                      <option key={block.name} value={block.name}>
                        🏢 Block {block.name} - {block.remainingSpaces} spaces available
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="w-full p-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
                    No blocks available for application
                  </div>
                )}
                {errors.preferred_block && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {errors.preferred_block.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">🏗️ Floor (Optional)</label>
                <select
                  {...register('preferred_floor')}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  disabled={!selectedBlock}
                >
                  <option value="">No preference</option>
                  <option value="ground">🏠 Ground Floor</option>
                  {selectedBlock && Array.from({ length: selectedBlock.floors || 4 }, (_, i) => i + 1).map(floor => (
                    <option key={floor} value={`${floor}`}>
                      {floor === 1 ? '1️⃣' : floor === 2 ? '2️⃣' : floor === 3 ? '3️⃣' : floor === 4 ? '4️⃣' : floor === 5 ? '5️⃣' : '🔢'} Floor {floor}
                    </option>
                  ))}
                </select>
                {selectedBlock && (
                  <p className="mt-1 text-xs text-gray-500">
                    Block {selectedBlock.name} has {selectedBlock.floors || 4} floors
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">♿ Special Needs (Optional)</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      {...register('special_needs')}
                      type="checkbox"
                      value="near_class"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">🏫 Near classroom</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('special_needs')}
                      type="checkbox"
                      value="medical_condition"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">🏥 Medical condition</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      {...register('special_needs')}
                      type="checkbox"
                      value="disability_support"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">♿ Disability support</span>
                  </label>
                </div>
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
                disabled={isLoading}
                className="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center text-lg font-semibold"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                    Submitting...
                  </>
                ) : (
                  <>
                    🏠 Apply for Dormitory
                  </>
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