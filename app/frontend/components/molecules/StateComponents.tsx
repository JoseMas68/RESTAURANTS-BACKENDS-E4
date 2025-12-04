import React from 'react';

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}

export function SkeletonLoader() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-gray-200 rounded-lg h-48 animate-pulse"></div>
      ))}
    </div>
  );
}

export function ErrorAlert({ message }: { message: string }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
      <p className="font-semibold">Error</p>
      <p className="text-sm mt-1">{message}</p>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="text-center py-12">
      <p className="text-gray-600 text-lg font-semibold mb-2">{title}</p>
      <p className="text-gray-500">{description}</p>
    </div>
  );
}
