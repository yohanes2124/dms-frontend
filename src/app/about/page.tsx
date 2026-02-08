'use client';

import { ShieldCheckIcon, BuildingOfficeIcon, DocumentTextIcon, ClockIcon, ChartBarIcon, UserGroupIcon } from '@heroicons/react/24/outline';
import { Nav, NavLink } from '@/components/UI';

const features = [
  { name: 'Secure Access', description: 'Safe and secure login system where students, supervisors, and administrators each see only what they need for their role.', icon: ShieldCheckIcon },
  { name: 'Easy Room Assignment', description: 'Smart system that matches students with the best available rooms based on their preferences and needs.', icon: BuildingOfficeIcon },
  { name: 'Simple Application Process', description: 'Easy step-by-step application process with automatic updates on your application status.', icon: DocumentTextIcon },
  { name: 'Live Updates', description: 'Get instant notifications about your application status, room assignments, and important announcements.', icon: ClockIcon },
  { name: 'Clear Reports', description: 'Easy-to-understand reports and statistics to help administrators make better decisions about dormitory management.', icon: ChartBarIcon },
  { name: 'Profile Management', description: 'Manage your personal information, update your profile, and keep your account details current and secure.', icon: UserGroupIcon },
];

const benefits = [
  { title: 'Efficiency', description: 'Streamlined processes reduce administrative workload and improve response times.' },
  { title: 'Transparency', description: 'Clear visibility into application status and room allocation processes.' },
  { title: 'Accessibility', description: 'User-friendly interface accessible from any device, anywhere.' },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <Nav>
        <NavLink href="/">Home</NavLink>
        <NavLink href="/about">About System</NavLink>
        <NavLink href="/help">Contact</NavLink>
        <NavLink href="/register" variant="blue">Register</NavLink>
        <NavLink href="/login" variant="blue">Login</NavLink>
      </Nav>

      <div className="max-w-7xl mx-auto py-16 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">About Smart DMS</h1>
          <p className="mt-4 text-xl text-gray-500">Comprehensive dormitory management made simple</p>
        </div>

        {/* System Overview */}
        <div className="mt-16">
          <div className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">System Overview</h2>
            <p className="text-gray-700 mb-4">
              The Smart Dormitory Management System (DMS) is a comprehensive web-based solution designed 
              specifically for managing dormitory operations. Built using modern technologies, 
              this system provides an intelligent, user-friendly platform for students, supervisors, and administrators.
            </p>
            <p className="text-gray-700">
              The system incorporates best practices in software engineering, database design, and user experience 
              to deliver a robust and scalable solution for educational institutions.
            </p>
          </div>
        </div>

        {/* Key Features */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Key Features</h2>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="bg-white shadow rounded-lg p-6">
                <div className="flex items-center mb-4">
                  <feature.icon className="h-8 w-8 text-blue-500 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">{feature.name}</h3>
                </div>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* System Benefits */}
        <div className="mt-12">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">System Benefits</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit) => (
                <div key={benefit.title} className="text-center">
                  <h3 className="text-lg font-semibold text-blue-900 mb-2">{benefit.title}</h3>
                  <p className="text-blue-700">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Get Started?</h2>
          <p className="text-gray-600 mb-8">Join thousands of students and administrators using Smart DMS.</p>
          <div className="space-x-4">
            <a href="/register" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Register Now
            </a>
            <a href="/help" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Contact Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}