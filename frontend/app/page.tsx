// Frontend/app/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from './context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login'); // Redirect to login if not authenticated
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading...
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-2xl text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Welcome, {user.firstName} {user.email}!
        </h1>
        <p className="text-gray-600 mb-6">
          This is your personalized healthcare insurance dashboard.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/policies" className="bg-blue-500 text-white p-4 rounded-md shadow-sm hover:bg-blue-600 transition-colors block">
            <h3 className="font-bold text-lg">View My Policies</h3>
            <p className="text-sm">Access details about your current health insurance plans.</p>
          </Link>
          <Link href="/claims/submit" className="bg-green-500 text-white p-4 rounded-md shadow-sm hover:bg-green-600 transition-colors block">
            <h3 className="font-bold text-lg">Make a New Claim</h3>
            <p className="text-sm">Submit your medical claims quickly and easily.</p>
          </Link>
          <Link href="/claims/history" className="bg-purple-500 text-white p-4 rounded-md shadow-sm hover:bg-purple-600 transition-colors block">
            <h3 className="font-bold text-lg">Claims History</h3>
            <p className="text-sm">Review the status and details of your past claims.</p>
          </Link>
          <Link href="/offers" className="bg-yellow-500 text-white p-4 rounded-md shadow-sm hover:bg-yellow-600 transition-colors block">
            <h3 className="font-bold text-lg">Member Offers</h3>
            <p className="text-sm">Discover exclusive discounts and benefits.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}