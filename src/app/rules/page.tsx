'use client';

import { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { authService } from '@/lib/auth';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export default function RoomRulesPage() {
  const [rules, setRules] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const token = authService.getToken();
      const response = await axios.get(`${API_URL}/rules`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setRules(response.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rules');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'General': return '📋';
      case 'Safety': return '🛡️';
      case 'Visitors': return '👥';
      case 'Quiet Hours': return '🤫';
      case 'Cleanliness': return '🧹';
      default: return '📌';
    }
  };

  const categories = Object.keys(rules);
  const filteredCategories = selectedCategory === 'all' 
    ? categories 
    : categories.filter(cat => cat === selectedCategory);

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">📋 Dormitory Rules & Regulations</h1>
          <p className="text-gray-600 mt-2">Important rules for all residents</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            ❌ {error}
          </div>
        )}

        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rules Available</h3>
            <p className="text-gray-600">Rules will be posted here by the administration</p>
          </div>
        ) : (
          <>
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    selectedCategory === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {getCategoryIcon(category)} {category}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              {filteredCategories.map((category) => (
                <div key={category} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <span className="text-3xl">{getCategoryIcon(category)}</span>
                      {category}
                    </h2>
                  </div>
                  <div className="p-6 space-y-4">
                    {rules[category].map((rule: any, index: number) => (
                      <div key={rule.id} className="border-l-4 border-blue-500 pl-4 py-2">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {index + 1}. {rule.title}
                        </h3>
                        <p className="text-gray-700 leading-relaxed">{rule.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-yellow-900 mb-2">⚠️ Important Notice</h3>
              <p className="text-yellow-800">
                All residents are expected to follow these rules. Violations may result in warnings, 
                fines, or termination of dormitory privileges. If you have questions about any rule, 
                please contact your supervisor or the administration.
              </p>
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
