import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { MessageBannerProvider } from '@/contexts/MessageBannerContext'
import { NotificationContainer } from '@/components/Notifications'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Smart Dormitory Management System',
  description: 'A comprehensive web-based solution for managing dormitory operations',
  keywords: ['dormitory', 'management', 'student', 'housing'],
  authors: [{ name: 'Smart DMS Team' }],
  creator: 'Smart DMS Team',
  publisher: 'Smart DMS',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Smart DMS',
  },
  openGraph: {
    type: 'website',
    siteName: 'Smart Dormitory Management System',
    title: 'Smart DMS - Dormitory Management System',
    description: 'Comprehensive dormitory management system for students, supervisors, and administrators',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#2563eb',
}

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Smart DMS" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-tap-highlight" content="no" />
      </head>
      <body className={inter.className}>
        <NotificationProvider>
          <MessageBannerProvider>
            {children}
            <NotificationContainer />
          </MessageBannerProvider>
        </NotificationProvider>
      </body>
    </html>
  )
}