'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';

interface Block {
  id: number;
  name: string;
  description: string;
  gender?: 'male' | 'female';
  totalRooms: number;
  occupiedRooms: number;
  floors: number;
  facilities: string[];
  status: 'active' | 'maintenance' | 'inactive';
  createdDate: string;
  totalCapacity?: number;
  currentOccupancy?: number;
  supervisorCount?: number;
  hasRealRooms?: boolean;
}

export default function BlocksPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBlock, setEditingBlock] = useState<Block | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    gender: 'male' as 'male' | 'female',
    totalRooms: 1, // Default to 1 room minimum
    floors: 1,
    facilities: [] as string[],
    status: 'active' as 'active' | 'maintenance' | 'inactive'
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      // Add cache-busting timestamp
      const timestamp = new Date().getTime();
      
      // Fetch blocks
      const blocksResponse = await fetch(`http://localhost:8000/api/blocks?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      // Fetch rooms ONLY to get current occupancy (not capacity)
      const roomsResponse = await fetch(`http://localhost:8000/api/rooms?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });
      
      if (blocksResponse.ok && roomsResponse.ok) {
        const blocksData = await blocksResponse.json();
        const roomsData = await roomsResponse.json();
        
        if (blocksData.success && roomsData.success) {
          const rooms = roomsData.data.data || roomsData.data;
          
          // Calculate ONLY current occupancy per block (not capacity)
          const blockOccupancy: { [key: string]: number } = {};
          
          rooms.forEach((room: any) => {
            if (!blockOccupancy[room.block]) {
              blockOccupancy[room.block] = 0;
            }
            blockOccupancy[room.block] += parseInt(room.current_occupancy) || 0;
          });
          
          // Merge occupancy data with blocks
          const blocksWithCapacity = blocksData.data.map((block: Block) => {
            // ALWAYS calculate capacity from total_rooms field (editable by admin)
            // Formula: total_rooms × 6 students per room
            const calculatedCapacity = (block.totalRooms || 0) * 6;
            
            // Get current occupancy from actual room assignments
            const currentOccupancy = blockOccupancy[block.name] || 0;
            
            console.log(`Block ${block.name}: totalRooms=${block.totalRooms}, capacity=${calculatedCapacity}, occupancy=${currentOccupancy}`);
            
            return {
              ...block,
              totalCapacity: calculatedCapacity, // Based on editable total_rooms field
              currentOccupancy: currentOccupancy,
              hasRealRooms: false // Always show as calculated
            };
          });
          
          setBlocks(blocksWithCapacity);
        } else {
          console.error('Failed to fetch data:', blocksData.message || roomsData.message);
          alert(`Failed to load blocks: ${blocksData.message || roomsData.message}`);
        }
      } else {
        console.error('Failed to fetch blocks:', blocksResponse.statusText);
        try {
          const errorData = await blocksResponse.json();
          console.error('Error details:', errorData);
          alert(`Server error: ${errorData.message || blocksResponse.statusText}`);
        } catch {
          alert(`Server error: ${blocksResponse.statusText}. Please check if you're logged in as admin.`);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
      alert(`Network error: ${error.message}. Please check your connection and try again.`);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = () => {
    setEditingBlock(null);
    setFormData({
      name: '',
      description: '',
      gender: 'male',
      totalRooms: 0,
      floors: 1,
      facilities: [],
      status: 'active'
    });
    setShowModal(true);
  };

  const handleEditBlock = (block: Block) => {
    setEditingBlock(block);
    setFormData({
      name: block.name,
      description: block.description || '',
      gender: (block as any).gender || 'male',
      totalRooms: block.totalRooms,
      floors: block.floors,
      facilities: [...block.facilities],
      status: block.status
    });
    setShowModal(true);
  };

  const handleDeleteBlock = async (blockId: number) => {
    if (confirm('⚠️ WARNING: This will permanently delete the block and ALL its rooms!\n\nAny supervisors assigned to this block will be unassigned.\n\nAre you sure you want to continue?')) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:8000/api/blocks/${blockId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authService.getToken()}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
          alert(data.message);
          // Refresh the blocks list
          await fetchBlocks();
        } else {
          alert(`Failed to delete block: ${data.message}`);
        }
      } catch (error) {
        console.error('Error deleting block:', error);
        alert('Error deleting block. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Update the field - allow manual entry for totalRooms
    setFormData({
      ...formData,
      [name]: name === 'totalRooms' || name === 'floors' ? parseInt(value) || 0 : value
    });
  };

  const handleFacilityToggle = (facility: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facility)
        ? prev.facilities.filter(f => f !== facility)
        : [...prev.facilities, facility]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const url = editingBlock ? `http://localhost:8000/api/blocks/${editingBlock.id}` : 'http://localhost:8000/api/blocks';
      const method = editingBlock ? 'PUT' : 'POST';
      
      // Transform camelCase to snake_case for backend
      const backendData = {
        name: formData.name,
        description: formData.description,
        gender: formData.gender,
        total_rooms: formData.totalRooms, // Convert to snake_case
        floors: formData.floors,
        facilities: formData.facilities,
        status: formData.status
      };
      
      console.log('=== SUBMITTING BLOCK ===');
      console.log('URL:', url);
      console.log('Method:', method);
      console.log('Frontend Form Data:', JSON.stringify(formData, null, 2));
      console.log('Backend Data (snake_case):', JSON.stringify(backendData, null, 2));
      console.log('Total Rooms Value:', backendData.total_rooms, 'Type:', typeof backendData.total_rooms);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });
      
      const data = await response.json();
      console.log('=== RESPONSE ===');
      console.log('Status:', response.status);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      
      if (response.ok && data.success) {
        console.log('✅ Save successful! Refreshing blocks...');
        alert(editingBlock ? 'Block updated successfully!' : 'Block created successfully!');
        
        // Close modal first
        setShowModal(false);
        setEditingBlock(null);
        
        // Force a fresh fetch with cache bypass
        setLoading(true);
        await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
        await fetchBlocks();
        setLoading(false);
      } else {
        console.error('Failed to save block:', data);
        const errorMsg = data.message || 'Unknown error';
        const errors = data.errors ? '\n' + JSON.stringify(data.errors, null, 2) : '';
        alert(`Failed to save block: ${errorMsg}${errors}`);
      }
    } catch (error) {
      console.error('Error saving block:', error);
      alert(`Error saving block: ${error.message}. Please check console for details.`);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingBlock(null);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyPercentage = (occupied: number, total: number) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  const availableFacilities = [
    'Wi-Fi', 'Laundry', 'Common Room', 'Study Hall', 'Kitchen', 
    'Parking', 'Gym', 'AC', 'Elevator', 'Security', 'Garden'
  ];

  // Check if user has permission to manage blocks
  const canManageBlocks = user && user.user_type === 'admin';

  if (!canManageBlocks) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage blocks.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Manage Blocks</h1>
          <button 
            onClick={handleAddBlock}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Add New Block
          </button>
        </div>

        {/* Blocks Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
                <div className="p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-2 bg-gray-200 rounded mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {blocks.map((block) => (
            <div key={block.id} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium text-gray-900">{block.name}</h3>
                    {block.gender && (
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        block.gender === 'male' ? 'bg-blue-100 text-blue-800' : 'bg-pink-100 text-pink-800'
                      }`}>
                        {block.gender === 'male' ? '♂ Male' : '♀ Female'}
                      </span>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(block.status)}`}>
                    {block.status.charAt(0).toUpperCase() + block.status.slice(1)}
                  </span>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{block.description}</p>
                
                <div className="space-y-3">
                  {/* Student Capacity */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-blue-700 font-medium">
                        Student Capacity:
                      </span>
                      <span className="font-bold text-blue-900">
                        {block.currentOccupancy || 0}/{block.totalCapacity || 0} students
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${block.totalCapacity ? Math.round((block.currentOccupancy || 0) / block.totalCapacity * 100) : 0}%` 
                        }}
                      ></div>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      {block.totalCapacity ? (
                        <>
                          <span className="font-semibold">{block.totalCapacity - (block.currentOccupancy || 0)} spaces available</span>
                          <span className="text-gray-500 ml-2">
                            (Can accommodate {block.totalCapacity} total students)
                          </span>
                        </>
                      ) : (
                        <span className="text-orange-600">
                          ⚠️ Set total rooms to calculate capacity
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Room Occupancy:</span>
                    <span className="font-medium">
                      {block.occupiedRooms}/{block.totalRooms} ({getOccupancyPercentage(block.occupiedRooms, block.totalRooms)}%)
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${getOccupancyPercentage(block.occupiedRooms, block.totalRooms)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Floors:</span>
                    <span className="font-medium">{block.floors}</span>
                  </div>
                  
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {block.facilities.slice(0, 3).map((facility: string, index: number) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {facility}
                        </span>
                      ))}
                      {block.facilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{block.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-between">
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
            </div>
          ))}
        </div>
        )}

        {blocks.length === 0 && (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-5 sm:p-6">
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏢</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Blocks Found</h3>
                <p className="text-gray-600 mb-4">
                  Get started by creating your first dormitory block.
                </p>
                <button
                  onClick={handleAddBlock}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add New Block
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Block Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🏢</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Blocks
                  </h3>
                  <p className="text-2xl font-bold text-blue-600">
                    {blocks.length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">👥</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Total Capacity
                  </h3>
                  <p className="text-2xl font-bold text-green-600">
                    {blocks.reduce((sum, block) => sum + (block.totalCapacity || 0), 0)} students
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🎓</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    Current Students
                  </h3>
                  <p className="text-2xl font-bold text-orange-600">
                    {blocks.reduce((sum, block) => sum + (block.currentOccupancy || 0), 0)}
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
                    Available Spaces
                  </h3>
                  <p className="text-2xl font-bold text-purple-600">
                    {blocks.reduce((sum, block) => sum + ((block.totalCapacity || 0) - (block.currentOccupancy || 0)), 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingBlock ? 'Edit Block' : 'Add New Block'}
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Block Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Block A"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender *
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Number of Floors *
                    </label>
                    <input
                      type="number"
                      name="floors"
                      value={formData.floors}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter number of floors"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Brief description of the block"
                  />
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        🏗️ Automatic Room Creation System
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <p className="mb-2">
                          <strong>When you save this block, the system will automatically create {formData.totalRooms || 0} rooms!</strong>
                        </p>
                        <ul className="list-disc list-inside space-y-1">
                          <li><strong>Room Pattern:</strong> {formData.name || 'X'}101, {formData.name || 'X'}102, {formData.name || 'X'}201, etc.</li>
                          <li><strong>Distribution:</strong> {formData.floors || 1} floors, ~{Math.ceil((formData.totalRooms || 0) / (formData.floors || 1))} rooms per floor</li>
                          <li><strong>Capacity:</strong> Each room accommodates 4 students</li>
                          <li><strong>Facilities:</strong> Wi-Fi, Study Desk, Wardrobe, Shared Bathroom</li>
                        </ul>
                        <p className="mt-2 font-medium text-blue-800">
                          💡 No need to create rooms manually - they're generated automatically!
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Total Rooms * <span className="text-red-500">(Important: This determines how many rooms will be auto-created)</span>
                  </label>
                  <input
                    type="number"
                    name="totalRooms"
                    value={formData.totalRooms}
                    onChange={handleInputChange}
                    required
                    min="1"
                    max="100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter total number of rooms (1-100)"
                  />
                  <p className="text-xs text-orange-600 mt-1">
                    ⚠️ <strong>Set this carefully!</strong> This number determines the total student capacity: {formData.totalRooms || 0} rooms × 4 students = {(formData.totalRooms || 0) * 4} total capacity
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facilities
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {availableFacilities.map((facility) => (
                      <label key={facility} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={formData.facilities.includes(facility)}
                          onChange={() => handleFacilityToggle(facility)}
                          className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-700">{facility}</span>
                      </label>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                  >
                    {editingBlock ? 'Update Block' : 'Create Block'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                🏗️ Automatic Room Creation System
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p className="mb-2">
                  <strong>When you create a new block, rooms are automatically generated!</strong>
                </p>
                <ul className="list-disc list-inside space-y-1">
                  <li><strong>Room Numbering:</strong> BlockName + Floor + RoomNumber (e.g., E101, E102, E201, E202)</li>
                  <li><strong>Even Distribution:</strong> Rooms are spread evenly across all floors</li>
                  <li><strong>Standard Setup:</strong> Each room has 4-student capacity with essential facilities</li>
                  <li><strong>Gender Segregation:</strong> Rooms inherit the block's gender assignment</li>
                  <li><strong>No Manual Work:</strong> No need to create hundreds of rooms individually</li>
                </ul>
                <p className="mt-2 font-medium text-blue-800">
                  💡 This prevents empty blocks and ensures consistent room availability across all dormitories.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}