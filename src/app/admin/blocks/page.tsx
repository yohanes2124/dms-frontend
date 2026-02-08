'use client';

import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/contexts/NotificationContext';

interface Block {
  id: number;
  name: string;
  description: string;
  gender: string;
  totalRooms: number;
  occupiedRooms: number;
  floors: number;
  facilities: string[];
  status: string;
  occupancyPercentage: number;
  totalCapacity: number;
  currentOccupancy: number;
}

export default function BlocksManagementPage() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gender: 'male',
    floors: 1,
    bedCount: 6,
    totalCapacity: 0,
    facilities: [] as string[],
    status: 'active'
  });

  const router = useRouter();
  const user = authService.getCurrentUser();
  const { showSuccess, showError } = useNotification();

  // Check if user is admin
  if (!user || user.user_type !== 'admin') {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center p-8 bg-red-50 rounded-lg border border-red-200">
            <div className="text-6xl mb-4">🚫</div>
            <h2 className="text-xl font-semibold text-red-800 mb-2">Access Restricted</h2>
            <p className="text-red-600">Only administrators can manage blocks.</p>
          </div>
        </div>
      </Layout>
    );
  }

  useEffect(() => {
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch blocks
      const blocksResponse = await fetch('http://localhost:8000/api/blocks', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const blocksData = await blocksResponse.json();
      
      if (blocksData.success) {
        // Calculate additional statistics for each block
        const blocksWithStats = await Promise.all(blocksData.data.map(async (block: any) => {
          // Fetch rooms for this block to get capacity info
          const roomsResponse = await fetch(`http://localhost:8000/api/rooms?block=${block.name}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          const roomsData = await roomsResponse.json();
          let totalCapacity = 0;
          let currentOccupancy = 0;
          
          if (roomsData.success && roomsData.data) {
            totalCapacity = roomsData.data.reduce((sum: number, room: any) => sum + (room.capacity || 0), 0);
            currentOccupancy = roomsData.data.reduce((sum: number, room: any) => sum + (room.current_occupancy || 0), 0);
          }
          
          return {
            ...block,
            totalCapacity,
            currentOccupancy,
            availableSpaces: totalCapacity - currentOccupancy
          };
        }));
        
        setBlocks(blocksWithStats);
      } else {
        showError('Failed to fetch blocks');
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      showError('Failed to fetch blocks');
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:8000/api/blocks', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Block created successfully');
        setShowAddModal(false);
        setFormData({
          name: '',
          description: '',
          gender: 'male',
          floors: 1,
          bedCount: 6,
          totalCapacity: 0,
          facilities: [],
          status: 'active'
        });
        fetchBlocks();
      } else {
        showError(data.message || 'Failed to create block');
      }
    } catch (error) {
      console.error('Error creating block:', error);
      showError('Failed to create block');
    }
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      description: block.description,
      gender: block.gender || 'male',
      floors: block.floors,
      bedCount: 6,
      totalCapacity: block.totalCapacity,
      facilities: block.facilities,
      status: block.status
    });
    setShowAddModal(true);
  };

  const handleUpdateBlock = async () => {
    if (!editingBlock) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/blocks/${editingBlock.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Block updated successfully');
        setShowAddModal(false);
        setEditingBlock(null);
        setFormData({
          name: '',
          description: '',
          gender: 'male',
          floors: 1,
          bedCount: 6,
          totalCapacity: 0,
          facilities: [],
          status: 'active'
        });
        fetchBlocks();
      } else {
        showError(data.message || 'Failed to update block');
      }
    } catch (error) {
      console.error('Error updating block:', error);
      showError('Failed to update block');
    }
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (!confirm('Are you sure you want to delete this block?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/blocks/${blockId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        showSuccess('Block deleted successfully');
        fetchBlocks();
      } else {
        showError(data.message || 'Failed to delete block');
      }
    } catch (error) {
      console.error('Error deleting block:', error);
      showError('Failed to delete block');
    }
  };

  const getGenderLabel = (gender: string) => {
    switch (gender) {
      case 'male': return 'Male';
      case 'female': return 'Female';
      case 'mixed': return 'Mixed';
      default: return '';
    }
  };

  const getGenderColor = (gender: string) => {
    switch (gender) {
      case 'male': return 'bg-blue-100 text-blue-800';
      case 'female': return 'bg-pink-100 text-pink-800';
      case 'mixed': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading blocks...</p>
          </div>
        </div>
      </Layout>
    );
  }

  const totalBlocks = blocks.length;
  const totalCapacity = blocks.reduce((sum, block) => sum + block.totalCapacity, 0);
  const currentStudents = blocks.reduce((sum, block) => sum + block.currentOccupancy, 0);
  const availableSpaces = totalCapacity - currentStudents;

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Manage Blocks</h1>
                <p className="mt-2 text-gray-600">Manage dormitory blocks and their configurations</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Block
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-3">🏢</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Blocks</p>
                  <p className="text-2xl font-bold text-gray-900">{totalBlocks}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-3">👥</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Capacity</p>
                  <p className="text-2xl font-bold text-gray-900">{totalCapacity} students</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-3">🎓</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Current Students</p>
                  <p className="text-2xl font-bold text-gray-900">{currentStudents}</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-3">📊</div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Available Spaces</p>
                  <p className="text-2xl font-bold text-gray-900">{availableSpaces}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Blocks Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocks.map((block) => (
              <div key={block.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{block.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getGenderColor(block.gender)}`}>
                          {getGenderLabel(block.gender)}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          block.status === 'active' ? 'bg-green-100 text-green-800' : 
                          block.status === 'maintenance' ? 'bg-yellow-100 text-yellow-800' : 
                          'bg-red-100 text-red-800'
                        }`}>
                          {block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                        </span>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditBlock(block)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteBlock(block.id)}
                        className="text-red-600 hover:text-red-800 text-sm font-medium"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <p className="text-gray-600 mb-4">{block.description}</p>

                  <div className="space-y-3">
                    <div>
                      <p className="text-sm font-medium text-gray-700">Student Capacity:</p>
                      <p className="text-lg font-semibold text-blue-600">
                        {block.currentOccupancy}/{block.totalCapacity} students
                      </p>
                      <p className="text-sm text-gray-500">
                        {block.totalCapacity - block.currentOccupancy} spaces available
                      </p>
                      <p className="text-xs text-gray-400">
                        (Can accommodate {block.totalCapacity} total students)
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Room Occupancy:</p>
                      <p className="text-lg font-semibold text-green-600">
                        {block.occupiedRooms}/{block.totalRooms} ({block.occupancyPercentage}%)
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Floors:</p>
                      <p className="text-sm text-gray-600">{block.floors}</p>
                    </div>

                    <div>
                      <p className="text-sm font-medium text-gray-700">Facilities:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {block.facilities && block.facilities.length > 0 ? (
                          block.facilities.map((facility: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                            >
                              {facility}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400">No facilities listed</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {blocks.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏢</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No blocks found</h3>
              <p className="text-gray-500 mb-4">Get started by creating your first dormitory block.</p>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Add New Block
              </button>
            </div>
          )}

          {/* Block Management Tips */}
          <div className="mt-12 bg-blue-50 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-4">Block Management Tips</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
              <div>
                <p className="font-medium mb-1">🏗️ Planning</p>
                <p>Consider gender separation, capacity needs, and facility requirements when creating blocks.</p>
              </div>
              <div>
                <p className="font-medium mb-1">👥 Capacity</p>
                <p>Monitor occupancy rates and plan for peak enrollment periods.</p>
              </div>
              <div>
                <p className="font-medium mb-1">🔧 Maintenance</p>
                <p>Schedule regular maintenance windows to keep facilities in good condition.</p>
              </div>
              <div>
                <p className="font-medium mb-1">📊 Analytics</p>
                <p>Use occupancy data to optimize room assignments and resource allocation.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              {editingBlock ? 'Edit Block' : 'Add New Block'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., A, B, C"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Male Dormitory Block A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Gender
                </label>
                <select
                  value={formData.gender || 'male'}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="mixed">Mixed</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floors
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={formData.floors}
                  onChange={(e) => setFormData({...formData, floors: parseInt(e.target.value)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Default Beds per Room
                </label>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="bedCount"
                      value="4"
                      checked={formData.bedCount === 4}
                      onChange={(e) => setFormData({...formData, bedCount: parseInt(e.target.value)})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">🛏️ 4-Bed Rooms</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="bedCount"
                      value="6"
                      checked={formData.bedCount === 6}
                      onChange={(e) => setFormData({...formData, bedCount: parseInt(e.target.value)})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-2 text-sm text-gray-700">🛏️ 6-Bed Rooms</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facilities (comma-separated)
                </label>
                <input
                  type="text"
                  value={Array.isArray(formData.facilities) ? formData.facilities.join(', ') : ''}
                  onChange={(e) => setFormData({...formData, facilities: e.target.value.split(',').map(f => f.trim()).filter(f => f)})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Wi-Fi, Laundry, Common Room"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({...formData, status: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingBlock(null);
                  setFormData({
                    name: '',
                    description: '',
                    gender: 'male',
                    floors: 1,
                    bedCount: 6,
                    totalCapacity: 0,
                    facilities: [],
                    status: 'active'
                  });
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Cancel
              </button>
              <button
                onClick={editingBlock ? handleUpdateBlock : handleAddBlock}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                {editingBlock ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}