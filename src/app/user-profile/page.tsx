'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService, User } from '@/lib/auth';
import { authAPI } from '@/lib/api';

interface UserProfile extends User {
  emergency_contact?: string;
  emergency_phone?: string;
}

export default function UserProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        setProfile(user);
        setFormData(user);
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const validatePhone = (phone: string, operator: string): string | null => {
    if (!phone) return null;
    
    // Remove any spaces or formatting
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check if it's 10 digits starting with 0
    if (!/^0\d{9}$/.test(cleanPhone)) {
      return 'Phone number must be 10 digits starting with 0';
    }

    // Validate based on operator
    if (operator === 'ethiotelecom') {
      if (!/^09\d{8}$/.test(cleanPhone)) {
        return 'Ethio Telecom numbers must start with 09';
      }
    } else if (operator === 'safaricom') {
      if (!/^07\d{8}$/.test(cleanPhone)) {
        return 'Safaricom numbers must start with 07';
      }
    }

    return null;
  };

  const detectOperator = (phone: string): string => {
    if (!phone) return 'ethiotelecom';
    
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Check international format
    if (phone.startsWith('+251')) {
      const digits = phone.slice(4);
      if (digits.startsWith('9')) return 'ethiotelecom';
      if (digits.startsWith('7')) return 'safaricom';
    }
    
    // Check local format
    if (cleanPhone.startsWith('09')) return 'ethiotelecom';
    if (cleanPhone.startsWith('07')) return 'safaricom';
    
    return 'ethiotelecom';
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const getAgeWarning = (age: number): string | null => {
    if (age < 16) return 'Age seems too young for higher education admission';
    if (age > 70) return 'Please verify the date of birth';
    if (age < 18) return 'Student is under 18 years old';
    return null;
  };

  const formatPhoneForDisplay = (phone: string): string => {
    if (!phone) return '';
    // Display the phone number as stored (international format)
    return phone;
  };

  const extractPhoneDigits = (phone: string): string => {
    if (!phone) return '';
    // Extract digits for display in local format
    if (phone.startsWith('+251')) {
      const digits = phone.slice(4); // Remove +251
      return `0${digits}`; // Add leading 0 for local format
    }
    return phone;
  };

  const formatPhoneForStorage = (phone: string, operator: string = 'ethiotelecom'): string => {
    if (!phone) return '';
    
    // Clean the phone number - remove spaces, dashes, and non-digits
    let cleanPhone = phone.replace(/\D/g, '');
    
    // Handle different input formats
    if (cleanPhone.startsWith('251')) {
      cleanPhone = cleanPhone.slice(3); // Remove 251 prefix
    } else if (cleanPhone.startsWith('0')) {
      cleanPhone = cleanPhone.slice(1); // Remove leading 0
    }
    
    // Ensure we have 9 digits (after removing country code and leading 0)
    if (cleanPhone.length !== 9) {
      return phone; // Return original if not valid length
    }
    
    // Always format as +251 + 9 digits
    return `+251${cleanPhone}`;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-detect operator for phone number
    if (field === 'phone') {
      // Don't auto-detect, let user choose operator manually
    }
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.phone) {
      const phoneError = validatePhone(formData.phone, formData.mobile_operator || '');
      if (phoneError) {
        newErrors.phone = phoneError;
      }
    }

    if (formData.date_of_birth) {
      const age = calculateAge(formData.date_of_birth);
      const ageWarning = getAgeWarning(age);
      if (ageWarning && age < 16) {
        newErrors.date_of_birth = ageWarning;
      }
    }

    if (formData.emergency_phone) {
      const emergencyOperator = detectOperator(formData.emergency_phone);
      const emergencyDigits = extractPhoneDigits(formData.emergency_phone);
      const emergencyPhoneError = validatePhone(emergencyDigits, emergencyOperator);
      if (emergencyPhoneError) {
        newErrors.emergency_phone = emergencyPhoneError;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    console.log('Form data before validation:', formData);
    
    if (!validateForm()) {
      console.log('Form validation failed, errors:', errors);
      return;
    }

    setSaving(true);
    try {
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone ? formatPhoneForStorage(formData.phone, formData.mobile_operator || 'ethiotelecom') : '',
        mobile_operator: formData.mobile_operator || 'ethiotelecom',
        department: formData.department,
        date_of_birth: formData.date_of_birth,
        address: formData.address,
        emergency_contact: formData.emergency_contact,
        emergency_phone: formData.emergency_phone || '',
      };

      // Remove empty/undefined fields
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined || updateData[key] === null) {
          delete updateData[key];
        }
      });

      console.log('Sending update data:', updateData);
      console.log('Formatted phone:', updateData.phone);

      const response = await authAPI.updateProfile(updateData);
      
      if (response.data.success) {
        const updatedUser = response.data.data;
        setProfile(updatedUser);
        setIsEditing(false);
        // Update localStorage with new data
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error headers:', error.response?.headers);
      
      if (error.response?.data?.errors) {
        const backendErrors = error.response.data.errors;
        console.log('Backend validation errors:', backendErrors);
        
        // Convert backend errors to our format
        const formattedErrors: Record<string, string> = {};
        Object.entries(backendErrors).forEach(([field, messages]: [string, any]) => {
          if (Array.isArray(messages)) {
            formattedErrors[field] = messages[0];
          } else {
            formattedErrors[field] = messages;
          }
        });
        
        setErrors(formattedErrors);
      } else {
        // Show generic error message
        setErrors({ general: error.response?.data?.message || 'Failed to update profile' });
      }
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(profile || {});
    setErrors({});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-4 bg-gray-300 rounded w-3/4"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout>
        <div className="p-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Not Found</h1>
            <p className="text-gray-600">Unable to load profile information.</p>
          </div>
        </div>
      </Layout>
    );
  }

  const age = profile.date_of_birth ? calculateAge(profile.date_of_birth) : null;
  const ageWarning = age ? getAgeWarning(age) : null;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Edit Profile
                </button>
              ) : (
                <div className="space-x-2">
                  <button
                    onClick={handleCancel}
                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="p-6">
            {/* Display general errors */}
            {errors.general && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">⚠️</span>
                  <div className="text-sm text-red-800">{errors.general}</div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Personal Information</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.email && <p className="text-red-600 text-sm mt-1">{errors.email}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Operator</label>
                  {isEditing ? (
                    <div>
                      <select
                        value={formData.mobile_operator || ''}
                        onChange={(e) => handleInputChange('mobile_operator', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Select Operator</option>
                        <option value="ethiotelecom">Ethio Telecom</option>
                        <option value="safaricom">Sefaricom Ethiopia</option>
                      </select>
                    </div>
                  ) : (
                    <p className="text-gray-900">
                      {profile.mobile_operator === 'ethiotelecom' ? 'Ethio Telecom' : 
                       profile.mobile_operator === 'safaricom' ? 'Sefaricom Ethiopia' : 
                       'Not specified'}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                  {isEditing ? (
                    <div>
                      <div className="flex rounded-md shadow-sm">
                        <select
                          value={formData.mobile_operator || 'ethiotelecom'}
                          onChange={(e) => handleInputChange('mobile_operator', e.target.value)}
                          className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ethiotelecom">+251 🇪🇹 Ethio Telecom</option>
                          <option value="safaricom">+2517 📱 Safaricom</option>
                        </select>
                        <input
                          type="tel"
                          value={extractPhoneDigits(formData.phone || '')}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          placeholder="0911223344"
                          maxLength={10}
                          pattern="0[79][0-9]{8}"
                          className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      {errors.phone && <p className="text-red-600 text-sm mt-1">{errors.phone}</p>}
                      {formData.phone && !errors.phone && (
                        <p className="text-green-600 text-sm mt-1">
                          International format: {formatPhoneForStorage(formData.phone, formData.mobile_operator || 'ethiotelecom')}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900">{profile.phone || 'Not provided'}</p>
                      {profile.mobile_operator && (
                        <p className="text-sm text-gray-500">
                          {profile.mobile_operator === 'ethiotelecom' ? '🇪🇹 Ethio Telecom' : '📱 Safaricom Ethiopia'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="date"
                        value={formData.date_of_birth || ''}
                        onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.date_of_birth && <p className="text-red-600 text-sm mt-1">{errors.date_of_birth}</p>}
                      {formData.date_of_birth && !errors.date_of_birth && (
                        <div className="mt-1">
                          <p className="text-gray-600 text-sm">Age: {calculateAge(formData.date_of_birth)} years</p>
                          {(() => {
                            const currentAge = calculateAge(formData.date_of_birth);
                            const warning = getAgeWarning(currentAge);
                            if (warning && currentAge >= 16) {
                              return <p className="text-yellow-600 text-sm">{warning}</p>;
                            }
                            return null;
                          })()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900">{profile.date_of_birth || 'Not provided'}</p>
                      {age && (
                        <div className="mt-1">
                          <p className="text-gray-600 text-sm">Age: {age} years</p>
                          {ageWarning && <p className="text-yellow-600 text-sm">{ageWarning}</p>}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                  {isEditing ? (
                    <textarea
                      value={formData.address || ''}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <p className="text-gray-900">{profile.address || 'Not provided'}</p>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Name</label>
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={formData.emergency_contact || ''}
                        onChange={(e) => handleInputChange('emergency_contact', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.emergency_contact && <p className="text-red-600 text-sm mt-1">{errors.emergency_contact}</p>}
                    </div>
                  ) : (
                    <p className="text-gray-900">{profile.emergency_contact || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Contact Phone</label>
                  {isEditing ? (
                    <div>
                      <div className="flex rounded-md shadow-sm">
                        <select
                          value={detectOperator(formData.emergency_phone || '')}
                          onChange={(e) => {
                            // Update the emergency phone format when operator changes
                            const currentDigits = extractPhoneDigits(formData.emergency_phone || '');
                            const newPhone = formatPhoneForStorage(currentDigits, e.target.value);
                            setFormData(prev => ({ ...prev, emergency_phone: newPhone }));
                          }}
                          className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="ethiotelecom">+251 🇪🇹 Ethio Telecom</option>
                          <option value="safaricom">+2517 📱 Safaricom</option>
                        </select>
                        <input
                          type="tel"
                          value={extractPhoneDigits(formData.emergency_phone || '')}
                          onChange={(e) => {
                            const operator = detectOperator(formData.emergency_phone || '');
                            const newPhone = formatPhoneForStorage(e.target.value, operator);
                            handleInputChange('emergency_phone', newPhone);
                          }}
                          placeholder="0911223344"
                          maxLength={10}
                          pattern="0[79][0-9]{8}"
                          className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-none rounded-r-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                      </div>
                      {errors.emergency_phone && <p className="text-red-600 text-sm mt-1">{errors.emergency_phone}</p>}
                      {formData.emergency_phone && !errors.emergency_phone && (
                        <p className="text-green-600 text-sm mt-1">
                          International format: {formData.emergency_phone}
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-900">{profile.emergency_phone || 'Not provided'}</p>
                      {profile.emergency_phone && (
                        <p className="text-sm text-gray-500">
                          {detectOperator(profile.emergency_phone) === 'ethiotelecom' ? '🇪🇹 Ethio Telecom' : '📱 Safaricom Ethiopia'}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Account Information */}
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-md font-semibold text-gray-900 mb-3">Account Information</h3>
                  
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">User Type:</span>
                      <span className="ml-2 text-sm text-gray-900 capitalize">{profile.user_type}</span>
                    </div>
                    
                    <div>
                      <span className="text-sm font-medium text-gray-700">User ID:</span>
                      <span className="ml-2 text-sm text-gray-900">{profile.id}</span>
                    </div>

                    {profile.student_id && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Student ID:</span>
                        <span className="ml-2 text-sm text-gray-900">{profile.student_id}</span>
                      </div>
                    )}

                    {profile.department && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Department:</span>
                        <span className="ml-2 text-sm text-gray-900">{profile.department}</span>
                      </div>
                    )}

                    {profile.year_level && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Year Level:</span>
                        <span className="ml-2 text-sm text-gray-900">Year {profile.year_level}</span>
                      </div>
                    )}

                    {profile.assigned_block && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Assigned Block:</span>
                        <span className="ml-2 text-sm text-gray-900">{profile.assigned_block}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}