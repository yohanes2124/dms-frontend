'use client';

import { useState } from 'react';
import { authService } from '@/lib/auth';

export default function TestRegistrationPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testRegistration = async () => {
    setLoading(true);
    setResult('Testing registration...');

    try {
      const testData = {
        name: 'Test Supervisor',
        email: `supervisor${Date.now()}@example.com`, // Unique email
        password: 'password123',
        password_confirmation: 'password123',
        user_type: 'supervisor',
        assigned_block: 'A',
        phone: '+251911234567'
      };

      console.log('Test supervisor data:', testData);
      
      const response = await authService.register(testData);
      setResult(`SUCCESS: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`ERROR: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testStudentRegistration = async () => {
    setLoading(true);
    setResult('Testing student registration...');

    try {
      const testData = {
        name: 'Test Student',
        email: `student${Date.now()}@example.com`, // Unique email
        password: 'password123',
        password_confirmation: 'password123',
        user_type: 'student',
        student_id: `STU${Date.now()}`,
        department: 'Computer Science',
        year_level: 2,
        phone: '+251911234568'
      };

      console.log('Test student data:', testData);
      
      const response = await authService.register(testData);
      setResult(`SUCCESS: ${JSON.stringify(response, null, 2)}`);
    } catch (error: any) {
      setResult(`ERROR: ${error.message}\n\nFull error: ${JSON.stringify(error, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Registration Debug Test</h1>
        
        <div className="space-x-4">
          <button
            onClick={testRegistration}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Supervisor Registration'}
          </button>

          <button
            onClick={testStudentRegistration}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Student Registration'}
          </button>
        </div>

        {result && (
          <div className="mt-8 p-6 bg-white rounded-lg border">
            <h2 className="text-xl font-semibold mb-4">Result:</h2>
            <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-4 rounded overflow-auto">
              {result}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}