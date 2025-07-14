// Frontend/app/login/page.tsx
'use client';

import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Link from 'next/link';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // This state will now always hold a string
  const { login } = useAuth(); // Get the login function from context

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    try {
      const response = await axios.post('http://localhost:5193/api/Auth/login', { // Adjust API URL if different
        email,
        password,
      });
      login(response.data.token); // Store the token and update auth state
    } catch (err: unknown) {
      // --- ALTERED CODE FOR ERROR HANDLING ---
      if (axios.isAxiosError(err) && err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        if (typeof err.response.data === 'string') {
          // If the backend sends a simple string error (e.g., "Invalid credentials.")
          setError(err.response.data);
        } else if (err.response.data && typeof err.response.data === 'object') {
          // If the backend sends a detailed error object (like validation errors)
          if (err.response.data.title) {
            // Use the general error title if available
            setError(err.response.data.title);
          } else if (err.response.data.errors) {
            // Extract and join specific validation error messages
            const errorMessages = Object.values(err.response.data.errors)
              .flat() // Flatten any arrays of error messages
              .join(', '); // Join multiple messages with a comma
            setError(errorMessages || 'Validation error. Please check your input.');
          } else {
            // Fallback for other unexpected object structures
            setError('An unknown server error occurred. Please try again.');
            console.error('Unhandled error response object:', err.response.data);
          }
        } else {
          // Fallback if data is not a string or a known object structure
          setError('An unexpected response format was received. Please try again.');
        }
      } else if (axios.isAxiosError(err) && err.request) {
        // The request was made but no response was received (e.g., network error)
        setError('Network error. No response from server. Check your connection or server status.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('An error occurred during the request. Please try again.');
        if (err instanceof Error) {
          console.error('Request setup error:', err.message);
        } else {
          console.error('Request setup error:', err);
        }
      }
      // --- END ALTERED CODE ---
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Login to Your Account</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
              Email:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
              Password:
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Only render if error is a non-empty string */}
          {error && <p className="text-red-500 text-xs italic mb-4">{error}</p>}
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              Sign In
            </button>
            <Link href="/register" className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800">
              Don&apos;t have an account? Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}