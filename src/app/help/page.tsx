'use client';

import { EnvelopeIcon, PhoneIcon, MapPinIcon, ClockIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { Nav, NavLink } from '@/components/UI';

const faqs = [
  { question: 'How do I apply for a dormitory room?', answer: 'Register for an account, complete your profile, and submit a dormitory application through the system.' },
  { question: 'When will I know my room assignment?', answer: 'Room assignments are typically processed within 2-3 business days after application approval.' },
  { question: 'Can I request a room change?', answer: 'Yes, you can submit a room change request through your dashboard if you have valid reasons.' },
  { question: 'How do I update my profile information?', answer: 'Go to your profile page and click the "Edit Profile" button to update your information.' },
  { question: 'What if I forget my password?', answer: 'Contact the system administrator or use the password reset feature on the login page.' },
];

export default function HelpPage() {
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
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">Contact</h1>
          <p className="mt-4 text-xl text-gray-500">Contact us for support with the Dormitory Management System</p>
        </div>

        {/* Contact Information */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="flex justify-center">
              <EnvelopeIcon className="h-12 w-12 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Email Support</h3>
            <p className="text-gray-600 mb-4">Contact us via email</p>
            <a href="mailto:support@institution.edu" className="text-blue-600 hover:text-blue-800">
              support@institution.edu
            </a>
          </div>

          <div className="text-center">
            <div className="flex justify-center">
              <PhoneIcon className="h-12 w-12 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phone Support</h3>
            <p className="text-gray-600 mb-4">Call us for immediate assistance</p>
            <a href="tel:+1234567890" className="text-blue-600 hover:text-blue-800">
              +1 (234) 567-8900
            </a>
          </div>

          <div className="text-center">
            <div className="flex justify-center">
              <MapPinIcon className="h-12 w-12 text-red-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Office Location</h3>
            <p className="text-gray-600 mb-4">Visit us in person</p>
            <p className="text-blue-600">
              Student Services Building<br />
              Room 201, Main Campus
            </p>
          </div>
        </div>

        {/* Support Hours */}
        <div className="mt-12">
          <div className="bg-blue-50 rounded-lg p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Support Hours</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Regular Hours</h3>
                <p className="text-gray-600">Monday - Friday: 8:00 AM - 5:00 PM</p>
                <p className="text-gray-600">Saturday: 9:00 AM - 1:00 PM</p>
                <p className="text-gray-600">Sunday: Closed</p>
              </div>
              <div className="text-center">
                <ClockIcon className="h-8 w-8 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Emergency Support</h3>
                <p className="text-gray-600">24/7 Emergency Line</p>
                <p className="text-blue-600 font-semibold">+1 (234) 567-8911</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Still Need Assistance?</h2>
          <p className="text-gray-600 mb-8">Our support team is here to assist you with any questions or issues.</p>
          <div className="space-x-4">
            <a href="mailto:support@institution.edu" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Email Support
            </a>
            <a href="tel:+1234567890" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200">
              Call Now
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}