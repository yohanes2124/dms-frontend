'use client';

import { useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { useMessageBanner, BANNER_MESSAGES } from '@/contexts/MessageBannerContext';
import { authService } from '@/lib/auth';

// Page-specific banner messages
const PAGE_BANNERS: Record<string, { message: string; type: 'info' | 'warning' | 'success' | 'error' }> = {
  '/dashboard': {
    message: "🏠 Dashboard: Your central hub for all dormitory activities and updates.",
    type: 'info'
  },
  '/applications/new': {
    message: "📝 Application Form: Please fill out all required fields carefully. Your application will be reviewed by supervisors.",
    type: 'info'
  },
  '/applications': {
    message: "📋 Application Status: Track your dormitory application progress and history.",
    type: 'info'
  },
  '/applications/pending': {
    message: "⏳ Pending Applications: Review and approve/reject student applications.",
    type: 'warning'
  },
  '/rooms': {
    message: "🏢 Room Management: Manage dormitory rooms, capacity, and assignments.",
    type: 'info'
  },
  '/rooms/my-room': {
    message: "🛏️ My Room: View your current room assignment and roommate information.",
    type: 'info'
  },
  '/rooms/available': {
    message: "🔍 Available Rooms: Browse available dormitory rooms and their facilities.",
    type: 'info'
  },
  '/change-requests': {
    message: "🔄 Change Requests: Manage room and block change requests.",
    type: 'info'
  },
  '/change-requests/new': {
    message: "📝 Room Change Request: Submit a request to change your current room assignment.",
    type: 'info'
  },
  '/clearance': {
    message: "✅ Clearance Status: Monitor your dormitory clearance requirements and progress.",
    type: 'info'
  },
  '/reports': {
    message: "📊 Reports & Analytics: View comprehensive dormitory statistics and reports.",
    type: 'info'
  },
  '/users/students': {
    message: "👨‍🎓 Student Management: Manage student accounts and information.",
    type: 'info'
  },
  '/users/supervisors': {
    message: "👨‍💼 Supervisor Management: Manage supervisor accounts and assignments.",
    type: 'info'
  },
  '/admin/administrators': {
    message: "⚙️ Administrator Management: Manage system administrator accounts.",
    type: 'info'
  },
  '/profile': {
    message: "👤 Profile Settings: Update your personal information and preferences.",
    type: 'info'
  },
  '/user-profile': {
    message: "👤 Profile Settings: Update your personal information and preferences.",
    type: 'info'
  },
  '/settings': {
    message: "⚙️ System Settings: Configure system parameters and preferences.",
    type: 'info'
  },
  '/help': {
    message: "❓ Help & Support: Find answers to common questions and get assistance.",
    type: 'info'
  }
};

export function usePageBanner() {
  const pathname = usePathname();
  const { showBanner } = useMessageBanner();

  const updateBanner = useCallback(() => {
    const user = authService.getCurrentUser();
    
    // Get page-specific banner or use role-based default
    const pageBanner = PAGE_BANNERS[pathname];
    
    if (pageBanner) {
      showBanner(pageBanner.message, pageBanner.type, true);
    } else {
      // Fallback to role-based messages
      if (user?.user_type === 'student') {
        showBanner(BANNER_MESSAGES.WELCOME_STUDENT, 'info', true);
      } else if (user?.user_type === 'supervisor') {
        showBanner(BANNER_MESSAGES.WELCOME_SUPERVISOR, 'info', true);
      } else if (user?.user_type === 'admin') {
        showBanner(BANNER_MESSAGES.WELCOME_ADMIN, 'info', true);
      }
    }
  }, [pathname, showBanner]);

  useEffect(() => {
    updateBanner();
  }, [updateBanner]);
}

export default usePageBanner;