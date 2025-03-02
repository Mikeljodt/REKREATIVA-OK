import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-lg shadow-xl ${className}`}>
      {children}
    </div>
  );
}
