'use client';

import React, { useState, useCallback } from 'react';
import { XMarkIcon, InformationCircleIcon, ExclamationTriangleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

interface MessageBannerProps {
  message?: string;
  type?: 'info' | 'warning' | 'success' | 'error';
  dismissible?: boolean;
  className?: string;
  onDismiss?: () => void;
}

export default function MessageBanner({ 
  message = "Welcome to Smart Dormitory Management System! Please complete your profile information for better service.",
  type = 'info',
  dismissible = true,
  className = "",
  onDismiss
}: MessageBannerProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    if (onDismiss) {
      onDismiss();
    }
  }, [onDismiss]);

  if (!isVisible) return null;

  const getStyles = () => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircleIcon,
          iconColor: 'text-green-400'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-yellow-400'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: ExclamationTriangleIcon,
          iconColor: 'text-red-400'
        };
      default: // info
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: InformationCircleIcon,
          iconColor: 'text-blue-400'
        };
    }
  };

  const styles = getStyles();
  const IconComponent = styles.icon;

  return (
    <div className={`border-l-4 p-4 ${styles.container} ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <IconComponent className={`h-5 w-5 ${styles.iconColor}`} aria-hidden="true" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm font-medium">
            {message}
          </p>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                onClick={handleDismiss}
                className={`inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:bg-opacity-20 hover:bg-gray-600 ${styles.iconColor}`}
              >
                <span className="sr-only">Dismiss</span>
                <XMarkIcon className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Export different message banner variants for easy use
export const InfoBanner = (props: Omit<MessageBannerProps, 'type'>) => (
  <MessageBanner {...props} type="info" />
);

export const SuccessBanner = (props: Omit<MessageBannerProps, 'type'>) => (
  <MessageBanner {...props} type="success" />
);

export const WarningBanner = (props: Omit<MessageBannerProps, 'type'>) => (
  <MessageBanner {...props} type="warning" />
);

export const ErrorBanner = (props: Omit<MessageBannerProps, 'type'>) => (
  <MessageBanner {...props} type="error" />
);