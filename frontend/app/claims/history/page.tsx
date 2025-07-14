// Frontend/app/claims/history/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Claim {
  id: number;
  policyId: number;
  claimType: string;
  dateOfService: string;
  providerName: string;
  amount: number;
  description: string;
  status: string;
  submissionDate: string;
  documentUrl: string;
}

export default function ClaimsHistoryPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      const fetchClaims = async () => {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get<Claim[]>('http://localhost:5193/api/Claims');
          setClaims(response.data);
        } catch (err: unknown) {
          console.error("Failed to fetch claims:", err);
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) {
              router.push('/login');
            } else {
              setError(err.response?.data || 'Failed to load claims history.');
            }
          } else {
            setError('Failed to load claims history.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchClaims();
    }
  }, [user, token, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading Claims History...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Your Claims History</h1>
      {claims.length === 0 ? (
        <p className="text-center text-gray-600">You have not submitted any claims yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {claims.map((claim) => (
            <div key={claim.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-indigo-600">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-indigo-800">{claim.claimType}</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  claim.status === 'Approved' ? 'bg-green-100 text-green-800' :
                  claim.status === 'Denied' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {claim.status}
                </span>
              </div>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Service Date:</span> {new Date(claim.dateOfService).toLocaleDateString()}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Provider:</span> {claim.providerName}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Amount Claimed:</span> ${claim.amount.toFixed(2)}
              </p>
              <p className="text-gray-700 mb-1">
                <span className="font-medium">Description:</span> {claim.description}
              </p>
              <p className="text-gray-700 mb-4">
                <span className="font-medium">Submitted On:</span> {new Date(claim.submissionDate).toLocaleString()}
              </p>
              {claim.documentUrl && (
                <a
                  href={claim.documentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-indigo-500 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded text-sm transition-colors"
                >
                  View Supporting Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}