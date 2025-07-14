// Frontend/app/offers/page.tsx
'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';

interface MemberOffer {
  id: number;
  title: string;
  description: string;
  expiryDate: string; // ISO string
  offerCode?: string;
  imageUrl?: string;
}

export default function OffersPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [offers, setOffers] = useState<MemberOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      const fetchOffers = async () => {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get<MemberOffer[]>('http://localhost:5193/api/MemberOffers');
          setOffers(response.data);
        } catch (err: unknown) {
          console.error("Failed to fetch offers:", err);
          if (axios.isAxiosError(err)) {
            if (err.response?.status === 401) {
              router.push('/login');
            } else {
              setError(err.response?.data || 'Failed to load member offers.');
            }
          } else {
            setError('Failed to load member offers.');
          }
        } finally {
          setLoading(false);
        }
      };
      fetchOffers();
    }
  }, [user, token, isLoading, router]);

  if (isLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen text-xl">
        Loading Member Offers...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-8">{error}</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Exclusive Member Offers</h1>
      {offers.length === 0 ? (
        <p className="text-center text-gray-600">No active offers available at the moment. Please check back later!</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-600">
              {offer.imageUrl && (
                <div className="mb-4 text-center">
                  <img src={offer.imageUrl} alt={offer.title} className="max-h-32 mx-auto rounded-md object-cover" />
                </div>
              )}
              <h2 className="text-xl font-semibold mb-2 text-green-800">{offer.title}</h2>
              <p className="text-gray-700 mb-3">{offer.description}</p>
              {offer.offerCode && (
                <p className="text-gray-800 font-bold mb-3">
                  Code: <span className="bg-green-100 text-green-800 px-2 py-1 rounded-md text-sm">{offer.offerCode}</span>
                </p>
              )}
              <p className="text-gray-600 text-sm">
                Expires: {new Date(offer.expiryDate).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}