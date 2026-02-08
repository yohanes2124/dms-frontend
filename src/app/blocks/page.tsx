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
    totalRooms: 1,
    floors: 1,
    facilities: [] as string[],
    status: 'active' as 'active' | 'maintenance' | 'inactive'
  });

  useEffect(() => {
    setUser(authService.getCurrentUser());
    fetchBlocks();
  }, []);

  const fetchBlocks = async () => {
    setLoading(true);
    try {
      const timestamp = new Date().getTime();

      const blocksResponse = await fetch(`http://localhost:8000/api/blocks?_=${timestamp}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        }
      });

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

          const blockOccupancy: { [key: string]: number } = {};

          rooms.forEach((room: any) => {
            if (!blockOccupancy[room.block]) {
              blockOccupancy[room.block] = 0;
            }
            blockOccupancy[room.block] += parseInt(room.current_occupancy) || 0;
          });

          const blocksWithCapacity = blocksData.data.map((block: Block) => {
            const calculatedCapacity = (block.totalRooms || 0) * 6;
            const currentOccupancy = blockOccupancy[block.name] || 0;

            return {
              ...block,
              totalCapacity: calculatedCapacity,
              currentOccupancy: currentOccupancy,
              hasRealRooms: false
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
    } catch (error: unknown) {
      console.error('Error fetching blocks:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Network error: ${message}. Please check your connection and try again.`);
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
          await fetchBlocks();
        } else {
          alert(`Failed to delete block: ${data.message}`);
        }
      } catch (error: unknown) {
        console.error('Error deleting block:', error);
        const message = error instanceof Error ? error.message : String(error);
        alert(`Error deleting block: ${message}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
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

      const backendData = {
        name: formData.name,
        description: formData.description,
        gender: formData.gender,
        total_rooms: formData.totalRooms,
        floors: formData.floors,
        facilities: formData.facilities,
        status: formData.status
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(backendData)
      });

      const data = await response.json();
      if (response.ok && data.success) {
        alert(editingBlock ? 'Block updated successfully!' : 'Block created successfully!');
        setShowModal(false);
        setEditingBlock(null);
        await fetchBlocks();
      } else {
        const errorMsg = data.message || 'Unknown error';
        const errors = data.errors ? '\n' + JSON.stringify(data.errors, null, 2) : '';
        alert(`Failed to save block: ${errorMsg}${errors}`);
      }
    } catch (error: unknown) {
      console.error('Error saving block:', error);
      const message = error instanceof Error ? error.message : String(error);
      alert(`Error saving block: ${message}`);
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getOccupancyPercentage = (occupied: number, total: number) => {
    return total > 0 ? Math.round((occupied / total) * 100) : 0;
  };

  const availableFacilities = [
    'Wi-Fi', 'Laundry', 'Common Room', 'Study Hall', 'Kitchen', 
    'Parking', 'Gym', 'AC', 'Elevator', 'Security', 'Garden'
  ];

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

  // The rest of your JSX (blocks grid, modal, etc.) remains unchanged
  return <Layout>{/* your JSX code here */}</Layout>;
}
