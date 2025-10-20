'use client';

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 mx-auto flex items-center justify-center text-2xl mb-4">404</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
        <p className="text-gray-600 mb-6">The page you are looking for might have been removed or is temporarily unavailable.</p>
        <Link href="/" className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Back to Home</Link>
      </div>
    </div>
  );
}
