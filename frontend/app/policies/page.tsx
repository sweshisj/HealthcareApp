// Frontend/app/policies/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Policy {
  id: number;
  policyNumber: string;
  coverageDetails: string;
  premium: number;
  startDate: string; // ISO string
  endDate: string;   // ISO string
  documentUrl: string;
}

export default function PoliciesPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      const fetchPolicies = async () => {
        try {
          // Set Authorization header for Axios
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get<Policy[]>('http://localhost:5193/api/Policies');
          setPolicies(response.data);
        } catch (err: unknown) {
          console.error("Failed to fetch policies:", err);
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) {
              // Token expired or invalid
              router.push('/login');
            } else {
              setError(err.response?.data || 'Failed to load policies.');
            }
          } else {
            setError('Failed to load policies.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchPolicies();
    }
  }, [user, token, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading Policies...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Healthcare Policies</h1>
      {policies.length === 0 ? (
        <p className="text-center text-gray-600">You currently have no active policies.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-600">
              <h2 className="text-xl font-semibold mb-2 text-blue-800">{policy.coverageDetails}</h2>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Policy No:</span> {policy.policyNumber}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Premium:</span> ${policy.premium.toFixed(2)} / month
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Start Date:</span> {new Date(policy.startDate).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-medium">End Date:</span> {new Date(policy.endDate).toLocaleDateString()}
              </p>
              {policy.documentUrl && (
                <a
                  href={policy.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                >
                  View Policy Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}