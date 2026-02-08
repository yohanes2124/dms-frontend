'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';

interface Room {
  id: number;
  room_number: string;
  block: string;
  floor: number;
  capacity: number;
  current_occupancy: number;
  room_type: string;
  status: 'available' | 'occupied' | 'maintenance' | 'reserved';
  facilities: string[];
  students: string[];
}

export default function RoomsPage() {
  const [user, setUser] = useState(authService.getCurrentUser());
  const [rooms, setRooms] = useState<Room[]>([]);
  const [blocks, setBlocks] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBlock, setFilterBlock] = useState<string>('all');

  useEffect(() => {
    fetchRooms();
    fetchBlocks();
  }, []);

  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/rooms', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Transform the data to match our interface
          const transformedRooms = (data.data.data || data.data).map((room: any) => ({
            id: room.id,
            room_number: room.room_number,
            block: room.block,
            floor: parseInt(room.room_number.match(/\d/)?.[0] || '1'),
            capacity: room.capacity,
            current_occupancy: room.current_occupancy,
            room_type: room.room_type,
            status: room.status,
            facilities: Array.isArray(room.facilities) ? room.facilities : 
                       (typeof room.facilities === 'string' ? JSON.parse(room.facilities) : []),
            students: [] // We'll need to fetch this separately if needed
          }));
          setRooms(transformedRooms);
        }
      } else {
        console.error('Failed to fetch rooms');
      }
    } catch (error) {
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBlocks = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/blocks', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
          const blockNames = data.data.map((block: any) => block.name).sort();
          setBlocks(blockNames);
        }
      }
    } catch (error) {
      console.error('Error fetching blocks:', error);
    }
  };

  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [formData, setFormData] = useState<{
    room_number: string;
    block: string;
    floor: number;
    capacity: number;
    room_type: string;
    status: 'available' | 'occupied' | 'maintenance' | 'reserved';
    facilities: string[];
  }>({
    room_number: '',
    block: '',
    floor: 1,
    capacity: 4,
    room_type: 'four',
    status: 'available',
    facilities: []
  });

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleAddRoom = () => {
    setEditingRoom(null);
    setFormData({
      room_number: '',
      block: '',
      floor: 1,
      capacity: 4,
      room_type: 'four',
      status: 'available',
      facilities: []
    });
    setShowModal(true);
  };

  const handleEditRoom = (room: Room) => {
    console.log('✅ Edit button clicked for room:', room.room_number); // Debug log
    console.log('🔍 Room status:', room.status); // Debug log
    
    setEditingRoom(room);
    const newFormData = {
      room_number: room.room_number,
      block: room.block,
      floor: room.floor,
      capacity: room.capacity,
      room_type: room.room_type,
      status: room.status,
      facilities: [...room.facilities]
    };
    
    console.log('📝 Setting form data:', newFormData); // Debug log
    setFormData(newFormData);
    setShowModal(true);
    console.log('✅ Edit modal should now be open'); // Debug log
  };

  const handleDeleteRoom = async (roomId: number) => {
    console.log('🗑️ Delete button clicked for room ID:', roomId); // Debug log
    const roomToDelete = rooms.find(room => room.id === roomId);
    
    if (!roomToDelete) {
      console.error('❌ Room not found for deletion');
      return;
    }
    
    const confirmDelete = confirm(`Are you sure you want to delete Room ${roomToDelete.room_number}? This action cannot be undone.`);
    console.log('🤔 User confirmed deletion:', confirmDelete); // Debug log
    
    if (confirmDelete) {
      setActionLoading(roomId);
      console.log('⏳ Starting deletion process...'); // Debug log
      
      // Simulate API call delay
      setTimeout(() => {
        setRooms(prevRooms => {
          const newRooms = prevRooms.filter(room => room.id !== roomId);
          console.log('✅ Room deleted successfully. Remaining rooms:', newRooms.length); // Debug log
          return newRooms;
        });
        setActionLoading(null);
        alert(`Room ${roomToDelete.room_number} has been deleted successfully.`);
      }, 500);
    }
  };

  const handleViewRoom = (room: Room) => {
    setSelectedRoom(room);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    console.log(`🔄 Field changed: ${name} = ${value}`); // Debug log
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: name === 'floor' || name === 'capacity' 
          ? parseInt(value) || 0 
          : value
      };
      
      // Auto-set room_type based on capacity
      if (name === 'capacity') {
        const capacity = parseInt(value) || 4;
        newData.room_type = capacity === 6 ? 'six' : 'four';
      }
      
      console.log('📝 Updated form data:', newData); // Debug log
      return newData;
    });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value as 'available' | 'occupied' | 'maintenance' | 'reserved';
    console.log(`🔄 Status changing to: ${newStatus}`); // Debug log
    
    setFormData(prev => {
      const newData = { ...prev, status: newStatus };
      console.log('📝 Updated form data with new status:', newData); // Debug log
      return newData;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form:', formData); // Debug log
    
    if (editingRoom) {
      console.log('Updating existing room:', editingRoom.id); // Debug log
      setRooms(rooms.map(room => 
        room.id === editingRoom.id 
          ? { 
              ...room, 
              ...formData,
              current_occupancy: room.current_occupancy,
              students: room.students
            }
          : room
      ));
      alert(`Room ${formData.room_number} has been updated successfully.`);
    } else {
      console.log('Creating new room'); // Debug log
      const newRoom: Room = {
        id: Math.max(...rooms.map(r => r.id)) + 1,
        ...formData,
        current_occupancy: 0,
        students: []
      };
      setRooms([...rooms, newRoom]);
      alert(`Room ${formData.room_number} has been created successfully.`);
    }
    
    setShowModal(false);
    setEditingRoom(null);
  };

  const closeModal = () => {
    console.log('🚪 Closing modal'); // Debug log
    setShowModal(false);
    setEditingRoom(null);
    setSelectedRoom(null);
    
    // Reset form data to default values
    setFormData({
      room_number: '',
      block: '',
      floor: 1,
      capacity: 4,
      room_type: 'four',
      status: 'available',
      facilities: []
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800';
      case 'occupied':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'reserved':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyPercentage = (occupied: number, capacity: number) => {
    return capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  };

  const availableFacilities = [
    'Wi-Fi', 'AC', 'Study Desk', 'Wardrobe', 'Private Bath', 
    'Balcony', 'Mini Fridge', 'TV', 'Microwave', 'Safe'
  ];
  
  const filteredRooms = rooms.filter(room => {
    const statusMatch = filterStatus === 'all' || room.status === filterStatus;
    const blockMatch = filterBlock === 'all' || room.block === filterBlock;
    return statusMatch && blockMatch;
  });

  const canManageRooms = user && (user.user_type === 'admin' || user.user_type === 'supervisor');

  if (!canManageRooms) {
    return (
      <Layout>
        <div className="text-center py-12">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don't have permission to manage rooms.</p>
        </div>
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <div className="ml-4 text-lg">Loading rooms...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Rooms Management</h1>
          <div className="flex gap-2">
            <button 
              onClick={fetchRooms}
              disabled={loading}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
            >
              {loading ? 'Refreshing...' : '🔄 Refresh'}
            </button>
            <button 
              onClick={handleAddRoom}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Add New Room
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="occupied">Occupied</option>
                <option value="maintenance">Maintenance</option>
                <option value="reserved">Reserved</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Filter by Block</label>
              <select
                value={filterBlock}
                onChange={(e) => setFilterBlock(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Blocks</option>
                {blocks.map(block => (
                  <option key={block} value={block}>{block}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-end">
              <button
                onClick={() => {
                  setFilterStatus('all');
                  setFilterBlock('all');
                }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Room Statistics */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🏠</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Total Rooms</h3>
                  <p className="text-2xl font-bold text-blue-600">{rooms.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">✅</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Available</h3>
                  <p className="text-2xl font-bold text-green-600">
                    {rooms.filter(r => r.status === 'available').length}
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
                  <h3 className="text-lg font-medium text-gray-900">Occupied</h3>
                  <p className="text-2xl font-bold text-red-600">
                    {rooms.filter(r => r.status === 'occupied').length}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-6">
              <div className="flex items-center">
                <div className="text-3xl mr-4">🔧</div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">Maintenance</h3>
                  <p className="text-2xl font-bold text-yellow-600">
                    {rooms.filter(r => r.status === 'maintenance').length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rooms Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredRooms.length > 0 ? (
            filteredRooms.map((room) => (
              <div key={room.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900">
                      Room {room.room_number}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(room.status)}`}>
                      {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                    </span>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Block:</span> {room.block}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Floor:</span> {room.floor}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Type:</span> {room.room_type}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Capacity:</span> {room.capacity}
                    </p>
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Occupancy:</span> {room.current_occupancy}/{room.capacity}
                    </p>
                  </div>

                  {/* Occupancy Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>Occupancy</span>
                      <span>{getOccupancyPercentage(room.current_occupancy, room.capacity)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${getOccupancyPercentage(room.current_occupancy, room.capacity)}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Facilities */}
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Facilities:</p>
                    <div className="flex flex-wrap gap-1">
                      {room.facilities.slice(0, 3).map((facility, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {facility}
                        </span>
                      ))}
                      {room.facilities.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          +{room.facilities.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Students */}
                  {room.students.length > 0 && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-500 mb-2">Current Students:</p>
                      <div className="space-y-1">
                        {room.students.map((student, index) => (
                          <div key={index} className="text-xs text-gray-700">• {student}</div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewRoom(room)}
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                      title="View room details"
                    >
                      👁️ View Details
                    </button>
                    <div className="space-x-2">
                      <button
                        onClick={() => handleEditRoom(room)}
                        className="bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95"
                        title="Edit this room"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteRoom(room.id)}
                        disabled={actionLoading === room.id}
                        className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded text-sm font-medium transition-all duration-200 hover:shadow-md active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100"
                        title="Delete this room"
                      >
                        {actionLoading === room.id ? (
                          <span className="flex items-center">
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-700 mr-1"></div>
                            Deleting...
                          </span>
                        ) : (
                          '🗑️ Delete'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full bg-white shadow overflow-hidden sm:rounded-md">
              <div className="px-4 py-5 sm:p-6">
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🏠</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rooms Found</h3>
                  <p className="text-gray-600 mb-4">
                    {rooms.length === 0 
                      ? "Get started by adding your first room."
                      : "No rooms match your current filters."
                    }
                  </p>
                  {rooms.length === 0 && (
                    <button
                      onClick={handleAddRoom}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                    >
                      Add New Room
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Add/Edit Room Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingRoom ? 'Edit Room' : 'Add New Room'}
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
                      Room Number *
                    </label>
                    <input
                      type="text"
                      name="room_number"
                      value={formData.room_number}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., A-201"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Block *
                    </label>
                    <input
                      type="text"
                      name="block"
                      value={formData.block}
                      onChange={handleInputChange}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="e.g., Block A"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Floor *
                    </label>
                    <input
                      type="number"
                      name="floor"
                      value={formData.floor}
                      onChange={handleInputChange}
                      required
                      min="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Beds *
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="capacity"
                          value="4"
                          checked={formData.capacity === 4}
                          onChange={(e) => {
                            const capacity = parseInt(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              capacity,
                              room_type: capacity === 6 ? 'six' : 'four'
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">🛏️ 4-Bed Room</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name="capacity"
                          value="6"
                          checked={formData.capacity === 6}
                          onChange={(e) => {
                            const capacity = parseInt(e.target.value);
                            setFormData(prev => ({
                              ...prev,
                              capacity,
                              room_type: capacity === 6 ? 'six' : 'four'
                            }));
                          }}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">🛏️ 6-Bed Room</span>
                      </label>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Room type will be set automatically (4 = Four, 6 = Six)
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleStatusChange}
                      className="w-full px-3 py-2 border-2 border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white hover:border-gray-400"
                    >
                      <option value="available">✅ Available</option>
                      <option value="occupied">👥 Occupied</option>
                      <option value="maintenance">🔧 Maintenance</option>
                      <option value="reserved">📋 Reserved</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">
                      Current status: <span className="font-medium capitalize text-blue-600">{formData.status}</span>
                    </p>
                    {/* Debug info - remove in production */}
                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs">
                      <strong>Debug:</strong> Status = "{formData.status}"
                    </div>
                  </div>
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
                    {editingRoom ? 'Update Room' : 'Create Room'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Room Details Modal */}
        {selectedRoom && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Room {selectedRoom.room_number} Details
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-gray-700">Block</p>
                    <p className="text-gray-900">{selectedRoom.block}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Floor</p>
                    <p className="text-gray-900">{selectedRoom.floor}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Room Type</p>
                    <p className="text-gray-900">{selectedRoom.room_type}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Status</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedRoom.status)}`}>
                      {selectedRoom.status.charAt(0).toUpperCase() + selectedRoom.status.slice(1)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Capacity</p>
                    <p className="text-gray-900">{selectedRoom.capacity} students</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Current Occupancy</p>
                    <p className="text-gray-900">{selectedRoom.current_occupancy}/{selectedRoom.capacity}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Facilities</p>
                  <div className="flex flex-wrap gap-2">
                    {selectedRoom.facilities.map((facility, index) => (
                      <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                        {facility}
                      </span>
                    ))}
                  </div>
                </div>
                
                {selectedRoom.students.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Current Students</p>
                    <div className="space-y-2">
                      {selectedRoom.students.map((student, index) => (
                        <div key={index} className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-sm font-medium text-white">
                              {student.charAt(0)}
                            </span>
                          </div>
                          <span className="text-gray-900">{student}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 mt-6">
                <button
                  onClick={closeModal}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    closeModal();
                    handleEditRoom(selectedRoom);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Edit Room
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}