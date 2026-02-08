'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface MessageBannerState {
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isVisible: boolean;
  dismissible: boolean;
}

interface MessageBannerContextType {
  bannerState: MessageBannerState;
  showBanner: (message: string, type?: 'info' | 'warning' | 'success' | 'error', dismissible?: boolean) => void;
  hideBanner: () => void;
  updateBanner: (updates: Partial<MessageBannerState>) => void;
}

const MessageBannerContext = createContext<MessageBannerContextType | undefined>(undefined);

interface MessageBannerProviderProps {
  children: ReactNode;
}

export function MessageBannerProvider({ children }: MessageBannerProviderProps) {
  const [bannerState, setBannerState] = useState<MessageBannerState>({
    message: "🎓 Welcome to Smart Dormitory Management System! Complete your profile and apply for accommodation today.",
    type: 'info',
    isVisible: true,
    dismissible: true,
  });

  const showBanner = useCallback((message: string, type: 'info' | 'warning' | 'success' | 'error' = 'info', dismissible: boolean = true) => {
    setBannerState({
      message,
      type,
      isVisible: true,
      dismissible,
    });
  }, []);

  const hideBanner = useCallback(() => {
    setBannerState(prev => ({ ...prev, isVisible: false }));
  }, []);

  const updateBanner = useCallback((updates: Partial<MessageBannerState>) => {
    setBannerState(prev => ({ ...prev, ...updates }));
  }, []);

  return (
    <MessageBannerContext.Provider value={{ bannerState, showBanner, hideBanner, updateBanner }}>
      {children}
    </MessageBannerContext.Provider>
  );
}

export function useMessageBanner() {
  const context = useContext(MessageBannerContext);
  if (context === undefined) {
    throw new Error('useMessageBanner must be used within a MessageBannerProvider');
  }
  return context;
}

// Predefined messages for different scenarios
export const BANNER_MESSAGES = {
  WELCOME_STUDENT: "🎓 Welcome Student! Apply for dormitory accommodation and track your application status.",
  WELCOME_SUPERVISOR: "👨‍💼 Welcome Supervisor! Review pending applications and manage room assignments.",
  WELCOME_ADMIN: "⚙️ Welcome Administrator! Oversee the entire dormitory management system.",
  APPLICATION_SUBMITTED: "✅ Application submitted successfully! Check your status in the Applications section.",
  PROFILE_INCOMPLETE: "⚠️ Please complete your profile information for better service and faster processing.",
  MAINTENANCE_MODE: "🔧 System maintenance scheduled for tonight 11 PM - 2 AM. Plan accordingly.",
  NEW_FEATURES: "🆕 New features available! Check out the updated room allocation system.",
};