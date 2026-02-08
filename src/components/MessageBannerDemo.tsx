'use client';

import React from 'react';
import { useMessageBanner, BANNER_MESSAGES } from '@/contexts/MessageBannerContext';

export default function MessageBannerDemo() {
  const { showBanner } = useMessageBanner();

  const demoMessages = [
    {
      label: 'Info Message',
      action: () => showBanner('📢 This is an informational message for all users.', 'info', true)
    },
    {
      label: 'Success Message',
      action: () => showBanner('✅ Operation completed successfully!', 'success', true)
    },
    {
      label: 'Warning Message',
      action: () => showBanner('⚠️ Please review your application before submitting.', 'warning', true)
    },
    {
      label: 'Error Message',
      action: () => showBanner('❌ An error occurred. Please try again.', 'error', true)
    },
    {
      label: 'Welcome Student',
      action: () => showBanner(BANNER_MESSAGES.WELCOME_STUDENT, 'info', true)
    },
    {
      label: 'Application Submitted',
      action: () => showBanner(BANNER_MESSAGES.APPLICATION_SUBMITTED, 'success', true)
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h3 className="text-lg font-semibold mb-4">Message Banner Demo</h3>
      <p className="text-sm text-gray-600 mb-4">
        Click any button below to test different banner messages:
      </p>
      <div className="grid grid-cols-2 gap-3">
        {demoMessages.map((demo, index) => (
          <button
            key={index}
            onClick={demo.action}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
          >
            {demo.label}
          </button>
        ))}
      </div>
    </div>
  );
}