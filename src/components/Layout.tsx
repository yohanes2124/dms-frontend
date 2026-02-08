'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { authService, User } from '@/lib/auth';
import { NotificationBell } from './NotificationBell';
import MessageBanner from './MessageBanner';
import { useMessageBanner } from '@/contexts/MessageBannerContext';
import { usePageBanner } from '@/hooks/usePageBanner';
import {
  HomeIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentCheckIcon,
  ChartBarIcon,
  UserGroupIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  WrenchIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  roles: string[];
  children?: NavigationChild[];
}

interface NavigationChild {
  name: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
}

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { bannerState, hideBanner } = useMessageBanner();

  // Use the page banner hook to handle all banner logic
  usePageBanner();

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
  }, [router]);

  const handleLogout = async () => {
    await authService.logout();
    router.push('/login');
  };

  // Enhanced role-based navigation with grouped menus
  const getNavigationForRole = (userType: string): NavigationItem[] => {
    const baseNavigation: NavigationItem[] = [
      { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['student', 'supervisor', 'admin'] },
    ];

    if (userType === 'student') {
      return [
        ...baseNavigation,
        { 
          name: 'Dormitory Services', 
          icon: BuildingOfficeIcon, 
          roles: ['student'],
          children: [
            { name: 'Apply for Dormitory', href: '/applications/new', icon: DocumentTextIcon },
            { name: 'View Room Allocation', href: '/rooms/my-room', icon: BuildingOfficeIcon },
            { name: 'Check Room Availability', href: '/rooms/available', icon: BuildingOfficeIcon },
            { name: 'Request Room Change', href: '/change-requests/new', icon: ArrowsRightLeftIcon },
          ]
        },
        { 
          name: 'Clearance & Status', 
          icon: ClipboardDocumentCheckIcon, 
          roles: ['student'],
          children: [
            { name: 'Application Status', href: '/applications', icon: DocumentTextIcon },
            { name: 'My Change Requests', href: '/change-requests', icon: ArrowsRightLeftIcon },
            { name: 'Temporary Leave', href: '/temporary-leave', icon: ClipboardDocumentCheckIcon },
            { name: 'Clearance Status', href: '/clearance', icon: ClipboardDocumentCheckIcon },
            { name: 'Report Issue', href: '/issues/new', icon: WrenchIcon },
            { name: 'My Issues', href: '/issues', icon: ExclamationTriangleIcon },
            { name: 'Room Rules', href: '/rules', icon: DocumentTextIcon },
          ]
        },
        { 
          name: 'Account', 
          icon: Cog6ToothIcon, 
          roles: ['student'],
          children: [
            { name: 'Profile', href: '/user-profile', icon: UserGroupIcon },
            { name: 'Change Password', href: '/change-password', icon: Cog6ToothIcon },
          ]
        },
      ];
    }

    if (userType === 'supervisor') {
      return [
        ...baseNavigation,
        { 
          name: 'Supervisor Dashboard', 
          href: '/supervisor-dashboard', 
          icon: ChartBarIcon, 
          roles: ['supervisor'] 
        },
        { 
          name: 'Application Management', 
          icon: DocumentTextIcon, 
          roles: ['supervisor'],
          children: [
            { name: 'View Applications', href: '/applications', icon: DocumentTextIcon },
            { name: 'Approve / Reject Applications', href: '/applications/pending', icon: DocumentTextIcon },
            { name: 'View Change Requests', href: '/change-requests', icon: ArrowsRightLeftIcon },
          ]
        },
        { 
          name: 'Dormitory Monitoring', 
          icon: BuildingOfficeIcon, 
          roles: ['supervisor'],
          children: [
            { name: 'Monitor Occupancy', href: '/rooms/room-occupancy', icon: ChartBarIcon },
            { name: 'Room Status', href: '/rooms', icon: BuildingOfficeIcon },
            { name: 'Manage Issues', href: '/admin/issues', icon: Cog6ToothIcon },
          ]
        },
        { 
          name: 'Reports', 
          href: '/reports', 
          icon: ChartBarIcon, 
          roles: ['supervisor'] 
        },
        { 
          name: 'Account', 
          icon: Cog6ToothIcon, 
          roles: ['supervisor'],
          children: [
            { name: 'Profile', href: '/user-profile', icon: UserGroupIcon },
            { name: 'Change Password', href: '/change-password', icon: Cog6ToothIcon },
          ]
        },
      ];
    }

    if (userType === 'admin') {
      return [
        ...baseNavigation,
        { 
          name: 'User Management', 
          icon: UserGroupIcon, 
          roles: ['admin'],
          children: [
            { name: 'Approve Registrations', href: '/admin/approve-students', icon: ClipboardDocumentCheckIcon },
            { name: 'Manage Students', href: '/users/students', icon: UserGroupIcon },
            { name: 'Manage Supervisors', href: '/users/supervisors', icon: UserGroupIcon },
            { name: 'Manage Administrators', href: '/admin/administrators', icon: UserGroupIcon },
          ]
        },
        { 
          name: 'Dormitory Management', 
          icon: BuildingOfficeIcon, 
          roles: ['admin'],
          children: [
            { name: 'Manage Rooms', href: '/rooms', icon: BuildingOfficeIcon },
            { name: 'Manage Blocks', href: '/blocks', icon: BuildingOfficeIcon },
            { name: 'Room Allocation', href: '/allocations', icon: ArrowsRightLeftIcon },
          ]
        },
        { 
          name: 'Application Management', 
          href: '/applications', 
          icon: DocumentTextIcon, 
          roles: ['admin'] 
        },
        { 
          name: 'Issue Management', 
          href: '/admin/issues', 
          icon: Cog6ToothIcon, 
          roles: ['admin'] 
        },
        { 
          name: 'System Control', 
          icon: Cog6ToothIcon, 
          roles: ['admin'],
          children: [
            { name: 'Manage Room Rules', href: '/admin/rules', icon: DocumentTextIcon },
            { name: 'System Settings', href: '/settings', icon: Cog6ToothIcon },
            { name: 'Backup & Restore', href: '/backup', icon: Cog6ToothIcon },
          ]
        },
        { 
          name: 'Reports', 
          href: '/reports', 
          icon: ChartBarIcon, 
          roles: ['admin'] 
        },
      ];
    }

    return baseNavigation;
  };

  const navigation = getNavigationForRole(user?.user_type || 'student');

  const filteredNavigation = navigation.filter(item => 
    user && item.roles.includes(user.user_type)
  );

  const renderNavigationItem = (item: NavigationItem, isMobile = false) => {
    if (item.children) {
      return (
        <div key={item.name} className="space-y-1">
          <div className="px-2 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
            {item.name}
          </div>
          {item.children.map((child: NavigationChild) => (
            <Link
              key={child.name}
              href={child.href}
              className={`group flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                pathname === child.href
                  ? 'bg-blue-100 text-blue-900'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <child.icon className="mr-3 h-5 w-5" />
              {child.name}
            </Link>
          ))}
        </div>
      );
    }

    return (
      <Link
        key={item.name}
        href={item.href || '#'}
        className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
          pathname === item.href
            ? 'bg-blue-100 text-blue-900'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
        }`}
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <item.icon className="mr-3 h-6 w-6" />
        {item.name}
      </Link>
    );
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-80 max-w-xs flex-col bg-white shadow-xl">
          <div className="flex h-16 items-center justify-between px-4 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-lg font-semibold text-gray-900">Smart DMS</h1>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>
          <nav className="flex-1 px-3 py-4 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {filteredNavigation.map((item) => renderNavigationItem(item, true))}
            </div>
          </nav>
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center mb-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-col flex-grow bg-white border-r border-gray-200 shadow-sm h-full">
          <div className="flex h-16 items-center px-6 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-semibold text-gray-900">Smart DMS</h1>
          </div>
          <nav className="flex-1 px-4 py-6 overflow-y-auto min-h-0">
            <div className="space-y-2">
              {filteredNavigation.map((item) => renderNavigationItem(item))}
            </div>
          </nav>
          <div className="flex-shrink-0 p-4 border-t border-gray-200">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="ml-3 min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-700 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 capitalize">{user.user_type}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-3 py-2 text-sm font-medium text-gray-600 rounded-md hover:bg-gray-50 hover:text-gray-900"
            >
              <ArrowRightOnRectangleIcon className="mr-3 h-5 w-5" />
              Sign out
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 bg-white border-b border-gray-200 lg:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-400 hover:text-gray-600 p-2 -ml-2"
            >
              <Bars3Icon className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">Smart DMS</h1>
            <div className="flex items-center space-x-3">
              <NotificationBell />
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                <span className="text-sm font-medium text-white">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop top bar */}
        <div className="hidden lg:block sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-end px-6">
            <div className="flex items-center space-x-4">
              <NotificationBell />
              <div className="flex items-center space-x-3">
                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <span className="text-sm font-medium text-gray-700">{user?.name}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-4 lg:py-6">
          {/* Global Message Banner */}
          {bannerState.isVisible && (
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-6">
              <MessageBanner 
                message={bannerState.message}
                type={bannerState.type}
                dismissible={bannerState.dismissible}
                onDismiss={hideBanner}
              />
            </div>
          )}
          
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}