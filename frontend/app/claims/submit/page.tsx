// Frontend/app/claims/submit/page.tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios'; 
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

interface Policy {
  id: number;
  policyNumber: string;
  coverageDetails: string;
}

// Define a more specific type for API error responses
interface ApiErrorResponse {
  type?: string;
  title?: string;
  status?: number;
  errors?: {
    [key: string]: string[]; // Validation errors, e.g., { "FieldName": ["Error message"] }
  };
  traceId?: string;
  // Add other properties if your API returns them
}

export default function SubmitClaimPage() {
  const { user, token, isLoading } = useAuth();
  const router = useRouter();
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selectedPolicyId, setSelectedPolicyId] = useState<number | ''>('');
  const [claimType, setClaimType] = useState('');
  const [dateOfService, setDateOfService] = useState('');
  const [providerName, setProviderName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [documentUrl, setDocumentUrl] = useState(''); // Simulated upload
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState(''); // State for error messages
  const [success, setSuccess] = useState(''); // State for success messages

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && token) {
      const fetchPolicies = async () => {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get<Policy[]>('http://localhost:5193/api/Policies');
          setPolicies(response.data);
          if (response.data.length > 0) {
            setSelectedPolicyId(response.data[0].id); // Auto-select first policy
          }
        } catch (err) { // Removed 'any' here
          console.error("Failed to fetch policies for claim submission:", err);
          
          // Use AxiosError type guard for more precise handling
          if (axios.isAxiosError(err) && err.response) {
            const apiError = err.response.data as ApiErrorResponse; // Cast to specific error type
            if (apiError.title) {
              setError(apiError.title);
            } else if (apiError.errors) {
              const validationErrors = Object.values(apiError.errors).flat().join('; ');
              setError(`Validation failed for policies: ${validationErrors}`);
            } else if (typeof err.response.data === 'string') {
              // Handle cases where the error response is a plain string
              setError(err.response.data);
            }
            else {
              setError('An unknown error occurred while fetching policies.');
            }
          } else if (err instanceof Error) {
            setError(`Failed to load policies: ${err.message}`);
          } else {
            setError('Failed to load policies for claim form.');
          }
        }
      };
      fetchPolicies();
    }
  }, [user, token, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors
    setSuccess(''); // Clear previous success messages
    setSubmitLoading(true);

    if (!selectedPolicyId) {
      setError("Please select a policy.");
      setSubmitLoading(false);
      return;
    }

    try {
      await axios.post('http://localhost:5193/api/Claims', {
        policyId: selectedPolicyId,
        claimType,
        dateOfService,
        providerName,
        amount: parseFloat(amount),
        description,
        documentUrl,
      });
      setSuccess('Claim submitted successfully! It is now being processed.');
      // Clear form upon successful submission
      setSelectedPolicyId(policies.length > 0 ? policies[0].id : '');
      setClaimType('');
      setDateOfService('');
      setProviderName('');
      setAmount('');
      setDescription('');
      setDocumentUrl('');
    } catch (err) { // Removed 'any' here
      console.error("Claim submission failed:", err);
      
      // Use AxiosError type guard for more precise handling
      if (axios.isAxiosError(err) && err.response) {
        const apiError = err.response.data as ApiErrorResponse; // Cast to specific error type
        if (apiError.title) {
          setError(apiError.title); // Use the title if available
        } else if (apiError.errors) {
          // Join validation errors if they exist (e.g., from ModelState validation)
          const validationErrors = Object.values(apiError.errors).flat().join('; ');
          setError(`Validation failed: ${validationErrors}`);
        } else if (typeof err.response.data === 'string') {
            setError(err.response.data); // Handle direct string error responses
        }
        else {
          setError('An unknown error occurred during claim submission.');
        }
      } else if (err instanceof Error) {
          // Catch general JavaScript errors
          setError(`Claim submission failed: ${err.message}`);
      }
      else {
        // Fallback for non-Axios errors or general network issues
        setError('Claim submission failed. Please try again.');
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user) {
    return null; // This will trigger the redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Submit a New Claim</h1>
      {/* Display error and success messages */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}
      {success && <p className="text-green-500 text-center mb-4">{success}</p>}

      <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl mx-auto">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="policyId" className="block text-gray-700 text-sm font-bold mb-2">
              Select Policy:
            </label>
            <select
              id="policyId"
              className="shadow border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={selectedPolicyId}
              onChange={(e) => setSelectedPolicyId(parseInt(e.target.value))}
              required
            >
              <option value="">-- Select a Policy --</option>
              {policies.map((policy) => (
                <option key={policy.id} value={policy.id}>
                  {policy.policyNumber} - {policy.coverageDetails}
                </option>
              ))}
            </select>
            {policies.length === 0 && <p className="text-sm text-red-500 mt-1">No policies found. Please ensure you have an active policy.</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="claimType" className="block text-gray-700 text-sm font-bold mb-2">
              Claim Type:
            </label>
            <input
              type="text"
              id="claimType"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={claimType}
              onChange={(e) => setClaimType(e.target.value)}
              placeholder="e.g., GP Visit, Dental Checkup, Prescription"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="dateOfService" className="block text-gray-700 text-sm font-bold mb-2">
              Date of Service:
            </label>
            <input
              type="date"
              id="dateOfService"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={dateOfService}
              onChange={(e) => setDateOfService(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="providerName" className="block text-gray-700 text-sm font-bold mb-2">
              Provider Name:
            </label>
            <input
              type="text"
              id="providerName"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              placeholder="e.g., Dr. Jane Doe, City Dental Clinic"
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="amount" className="block text-gray-700 text-sm font-bold mb-2">
              Amount ($):
            </label>
            <input
              type="number"
              id="amount"
              step="0.01"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />
          </div>

          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description:
            </label>
            <textarea
              id="description"
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the service/reason for claim."
              required
            ></textarea>
          </div>

          <div className="mb-6">
            <label htmlFor="documentUrl" className="block text-gray-700 text-sm font-bold mb-2">
              Supporting Document URL (Placeholder):
            </label>
            <input
              type="url"
              id="documentUrl"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              value={documentUrl}
              onChange={(e) => setDocumentUrl(e.target.value)}
              placeholder="e.g., https://example.com/receipt.pdf (for now)"
            />
            <p className="text-xs text-gray-500 mt-1">In a real application, this would be an actual file upload.</p>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={submitLoading}
            >
              {submitLoading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}