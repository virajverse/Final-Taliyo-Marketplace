'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white shadow-sm border border-gray-200 rounded-2xl p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 mx-auto flex items-center justify-center text-2xl mb-4">!</div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Something went wrong</h1>
        <p className="text-gray-600 mb-6">An unexpected error occurred. Please try again or return home.</p>
        <div className="flex items-center justify-center gap-3">
          <button onClick={() => reset()} className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700">Try again</button>
          <Link href="/" className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50">Go home</Link>
        </div>
      </div>
    </div>
  );
}
