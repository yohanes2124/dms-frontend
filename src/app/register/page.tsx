'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { authService } from '@/lib/auth';
import { Card, Button, Nav, NavLink } from '@/components/UI';
import { useNotification } from '@/contexts/NotificationContext';
import api from '@/lib/api';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  user_type: 'student' | 'supervisor' | 'admin';
  student_id?: string;
  department?: string;
  gender?: 'male' | 'female';
  year_level?: number;
  assigned_block?: string;
}

interface BlockInfo {
  block: string;
  supervisor_count: number;
  available_slots: number;
  is_full: boolean;
}

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [availableBlocks, setAvailableBlocks] = useState<BlockInfo[]>([]);
  const [loadingBlocks, setLoadingBlocks] = useState(false);
  const router = useRouter();
  const { showSuccess, showError, showInfo } = useNotification();
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormData>({
    defaultValues: { 
      user_type: 'student'
    }
  });

  const userType = watch('user_type');
  const gender = watch('gender');
  const password = watch('password');

  // Load available blocks when user selects supervisor type and gender
  useEffect(() => {
    if (userType === 'supervisor' && gender) {
      setLoadingBlocks(true);
      
      // Fetch gender-filtered block availability from backend
      api.get(`/blocks/availability?gender=${gender}`)
        .then(response => {
          const blocks = response.data.data || [];
          setAvailableBlocks(blocks);
        })
        .catch(error => {
          console.error('Failed to load blocks:', error);
          showError('Failed to load block availability. Please try again.', 5000);
          // Fallback to empty array if API fails
          setAvailableBlocks([]);
        })
        .finally(() => {
          setLoadingBlocks(false);
        });
    } else if (userType !== 'supervisor') {
      setAvailableBlocks([]);
    }
  }, [userType, gender, showError]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    
    // Show info notification when starting registration
    showInfo('Creating your account...', 2000);
    
    try {
      // Prepare registration data based on user type
      const registrationData: any = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
        user_type: data.user_type
      };

      // Add user-type specific fields
      if (data.user_type === 'student') {
        registrationData.student_id = data.student_id;
        registrationData.department = data.department;
        registrationData.gender = data.gender;
        registrationData.year_level = data.year_level;
      } else if (data.user_type === 'supervisor') {
        registrationData.assigned_block = data.assigned_block;
        registrationData.gender = data.gender; // Add gender for supervisors
      }

      // Remove undefined fields
      Object.keys(registrationData).forEach(key => {
        if (registrationData[key] === undefined) {
          delete registrationData[key];
        }
      });

      console.log('Sending registration data:', registrationData);
      
      const result = await authService.register(registrationData);
      
      // Check if account requires approval
      if (result.requires_approval) {
        showSuccess(`✅ Registration successful! Your account is pending admin approval. You will receive a notification once approved.`, 8000);
        
        // Redirect to login page with message
        setTimeout(() => {
          router.push('/login?message=pending_approval');
        }, 2000);
      } else {
        // Show success notification
        showSuccess(`🎉 Welcome ${result.user.name}! Your ${data.user_type} account has been created successfully.`, 5000);
        
        // Small delay to show the success message before redirect
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
      
    } catch (error: any) {
      console.error('Registration error caught:', error);
      console.error('Error type:', typeof error);
      console.error('Error constructor:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
      
      let errorMessage = 'Registration failed. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      // Show error notification with detailed message
      showError(`Registration failed: ${errorMessage}`, 8000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600">
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About System</NavLink>
        <NavLink href="/help">Contact</NavLink>
        <NavLink href="/login" variant="blue">Login</NavLink>
      </Nav>

      <div className="flex items-center justify-center py-6 px-4">
        <div className="max-w-3xl w-full">
        <Card>
          <div className="text-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Create your account</h2>
            <p className="text-sm text-gray-600">Dormitory Management System</p>
          </div>
        
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* User Type - Full Width */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">I am a <span className="text-red-500">*</span></label>
                <select {...register('user_type', { required: 'Please select your account type' })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                  <option value="">Choose your role...</option>
                  <option value="student">🎓 Student - Apply for dormitory accommodation</option>
                  <option value="supervisor">👨‍💼 Supervisor - Manage dormitory operations</option>
                </select>
                {errors.user_type && <p className="mt-1 text-sm text-red-600">{String(errors.user_type?.message)}</p>}
              </div>

              {/* Basic Info - Two Columns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name <span className="text-red-500">*</span></label>
                <input {...register('name', { required: 'Name is required' })} type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="e.g. Yohanes Mitiku" />
                {errors.name && <p className="mt-1 text-sm text-red-600">{String(errors.name?.message)}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address <span className="text-red-500">*</span></label>
                <input {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' } })} type="email" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="your.email@institution.edu" />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email?.message}</p>}
              </div>

              {/* Student Fields - Two Columns */}
              {userType === 'student' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Student ID <span className="text-red-500">*</span></label>
                    <input {...register('student_id', { required: userType === 'student' ? 'Student ID is required' : false })} type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter your student ID" />
                    {errors.student_id && <p className="mt-1 text-sm text-red-600">{errors.student_id?.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input {...register('department')} type="text" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter your department (optional)" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select {...register('gender', { required: userType === 'student' ? 'Gender is required' : false })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                      <option value="">Select your gender</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender?.message}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Year Level <span className="text-red-500">*</span></label>
                    <select {...register('year_level', { required: userType === 'student' ? 'Year level is required' : false, valueAsNumber: true })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                      <option value="">Select year level</option>
                      {[1,2,3,4,5,6].map(year => <option key={year} value={year}>{year}{year === 1 ? 'st' : year === 2 ? 'nd' : year === 3 ? 'rd' : 'th'} Year</option>)}
                    </select>
                    {errors.year_level && <p className="mt-1 text-sm text-red-600">{errors.year_level?.message}</p>}
                  </div>
                </>
              )}

              {/* Supervisor Fields - Full Width */}
              {userType === 'supervisor' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gender <span className="text-red-500">*</span></label>
                    <select {...register('gender', { required: userType === 'supervisor' ? 'Gender is required' : false })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                      <option value="">Select your gender</option>
                      <option value="male">👨 Male</option>
                      <option value="female">👩 Female</option>
                    </select>
                    {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender?.message}</p>}
                    <p className="mt-1 text-xs text-gray-500">You can only supervise blocks designated for your gender</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Block <span className="text-red-500">*</span></label>
                    
                    {/* Show message when gender is selected but no blocks available */}
                    {gender && availableBlocks.filter(blockInfo => !blockInfo.is_full).length === 0 && !loadingBlocks ? (
                      <div className="p-4 border border-orange-200 bg-orange-50 rounded-md">
                        <div className="text-center">
                          <div className="text-orange-400 text-lg mb-2">⚠️</div>
                          <h4 className="text-sm font-medium text-orange-800 mb-2">No Supervisor Positions Available</h4>
                          <p className="text-xs text-orange-700">
                            All {gender} dormitory blocks are currently fully staffed with 3 supervisors each. 
                            Please contact the administrator or check back later for openings.
                          </p>
                        </div>
                      </div>
                    ) : !gender ? (
                      <div className="p-3 border border-blue-200 bg-blue-50 rounded-md">
                        <p className="text-sm text-blue-800">
                          Please select your gender first to see available blocks for supervision.
                        </p>
                      </div>
                    ) : loadingBlocks ? (
                      <div className="p-3 border border-gray-200 bg-gray-50 rounded-md">
                        <p className="text-sm text-gray-600">Loading available blocks...</p>
                      </div>
                    ) : (
                      <select {...register('assigned_block', { required: userType === 'supervisor' ? 'Assigned block is required' : false })} className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white">
                        <option value="">Select block</option>
                        {availableBlocks
                          .filter(blockInfo => !blockInfo.is_full)
                          .map((blockInfo) => (
                            <option 
                              key={blockInfo.block} 
                              value={blockInfo.block}
                            >
                              Block {blockInfo.block} ({blockInfo.supervisor_count}/3 supervisors, {blockInfo.available_slots} slots available)
                            </option>
                          ))}
                      </select>
                    )}
                    {errors.assigned_block && <p className="mt-1 text-sm text-red-600">{errors.assigned_block?.message}</p>}
                  </div>
                </>
              )}

              {/* Password Fields - Two Columns */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password <span className="text-red-500">*</span></label>
                <input {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Password must be at least 6 characters' } })} type="password" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Enter your password" />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password?.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password <span className="text-red-500">*</span></label>
                <input {...register('password_confirmation', { required: 'Please confirm your password', validate: (value) => value === password || 'Passwords do not match' })} type="password" className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm" placeholder="Confirm your password" />
                {errors.password_confirmation && <p className="mt-1 text-sm text-red-600">{errors.password_confirmation?.message}</p>}
              </div>
            </div>

            <div className="flex justify-center">
              <Button 
                type="submit" 
                disabled={
                  isLoading || 
                  (userType === 'supervisor' && availableBlocks.filter(blockInfo => !blockInfo.is_full).length === 0 && !loadingBlocks)
                } 
                className="px-8 py-2"
              >
                {isLoading ? 'Creating your account...' : 
                 userType === 'supervisor' && availableBlocks.filter(blockInfo => !blockInfo.is_full).length === 0 && !loadingBlocks ? 
                 '❌ No Supervisor Positions Available' : 
                 '🚀 Start Your Dormitory Journey'}
              </Button>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">
                Already part of our community?{' '}
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                  Welcome back! Sign in here →
                </Link>
              </p>
            </div>
          </form>
        </Card>
        </div>
      </div>
    </div>
  );
}