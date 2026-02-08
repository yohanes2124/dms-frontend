'use client';

import { useState } from 'react';
import { authAPI } from '@/lib/api';

export default function TestPhoneValidationPage() {
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testPhoneValidation = async () => {
    setLoading(true);
    setResult('Testing phone validation...');

    try {
      const testData = {
        name: 'Test User',
        phone: '+251911223344',
        mobile_operator: 'ethiotelecom'
      };

      console.log('Testing with data:', testData);
      
      const response = await authAPI.updateProfile(testData);
      setResult(`SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Validation test error:', error.response?.data);
      setResult(`ERROR: ${error.message}\n\nStatus: ${error.response?.status}\n\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  const testSafaricomPhone = async () => {
    setLoading(true);
    setResult('Testing Safaricom phone validation...');

    try {
      const testData = {
        name: 'Test User',
        phone: '+251701223344',
        mobile_operator: 'safaricom'
      };

      console.log('Testing Safaricom with data:', testData);
      
      const response = await authAPI.updateProfile(testData);
      setResult(`SUCCESS: ${JSON.stringify(response.data, null, 2)}`);
    } catch (error: any) {
      console.error('Safaricom validation test error:', error.response?.data);
      setResult(`ERROR: ${error.message}\n\nStatus: ${error.response?.status}\n\nResponse: ${JSON.stringify(error.response?.data, null, 2)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Phone Validation Debug Test</h1>
        
        <div className="space-x-4 mb-8">
          <button
            onClick={testPhoneValidation}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Ethio Telecom (+251911223344)'}
          </button>

          <button
            onClick={testSafaricomPhone}
            disabled={loading}
            className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test Safaricom (+251701223344)'}
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