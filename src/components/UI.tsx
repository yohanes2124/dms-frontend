'use client';

import Link from 'next/link';
import { ReactNode } from 'react';

// Reusable Button Component
export const Button = ({ 
  children, 
  onClick, 
  type = 'button', 
  variant = 'primary', 
  disabled = false,
  className = ''
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'green' | 'danger';
  disabled?: boolean;
  className?: string;
}) => {
  const baseClasses = 'px-4 py-2 rounded-md text-sm font-medium transition-colors';
  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-300 hover:bg-gray-400 text-gray-700',
    green: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </button>
  );
};

// Reusable Input Component
export const Input = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
  error,
  required = false
}: {
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    />
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Reusable Card Component
export const Card = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string; 
}) => (
  <div className={`bg-white shadow-lg rounded-3xl border border-gray-200 p-8 ${className}`}>
    {children}
  </div>
);

// Navigation Component
export const Nav = ({ children }: { children: ReactNode }) => (
  <nav className="bg-white shadow">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-blue-600">Smart DMS</h1>
        </div>
        <div className="flex items-center space-x-4">
          {children}
        </div>
      </div>
    </div>
  </nav>
);

// Navigation Link Component
export const NavLink = ({ 
  href, 
  children, 
  variant = 'green' 
}: { 
  href: string; 
  children: ReactNode; 
  variant?: 'green' | 'blue'; 
}) => {
  const classes = variant === 'green' 
    ? 'bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium'
    : 'bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium';
  
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
};

// Error Message Component
export const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-md bg-red-50 p-4">
    <div className="text-sm text-red-700">{message}</div>
  </div>
);

// Loading Spinner Component
export const Loading = ({ text = 'Loading...' }: { text?: string }) => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p className="mt-2 text-gray-600">{text}</p>
    </div>
  </div>
);