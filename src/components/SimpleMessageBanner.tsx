'use client';

import React, { useState } from 'react';

interface SimpleMessageBannerProps {
  message?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  dismissible?: boolean;
}

export default function SimpleMessageBanner({ 
  message = "Welcome to Smart Dormitory Management System!",
  type = 'info',
  dismissible = true
}: SimpleMessageBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  const getBgColor = () => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700';
      case 'warning': return 'bg-yellow-100 border-yellow-400 text-yellow-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      default: return 'bg-blue-100 border-blue-400 text-blue-700';
    }
  };

  return (
    <div className={`border-l-4 p-4 ${getBgColor()}`}>
      <div className="flex">
        <div className="flex-1">
          <p className="text-sm font-medium">{message}</p>
        </div>
        {dismissible && (
          <div className="ml-auto">
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          </div>
        )}
      </div>
    </div>
  );
}