// Frontend/app/live-chat/page.tsx
'use client';

import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function LiveChatPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [chatLog, setChatLog] = useState<string[]>([]);

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
      return;
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen text-xl">Loading...</div>;
  }

  if (!user) {
    return null; // Will redirect in useEffect
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      setChatLog((prev) => [...prev, `You: ${message}`]);
      setMessage('');
      // Simulate an agent response after a short delay
      setTimeout(() => {
        setChatLog((prev) => [...prev, `Agent: Thanks for your message! How can I assist you today?`]);
      }, 1500);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Live Chat Support</h1>
      <div className="bg-white rounded-lg shadow-md max-w-2xl mx-auto p-6">
        <p className="text-gray-700 mb-4 text-center">
          Connect with a Bupa support agent for immediate assistance.
        </p>

        {/* Basic Simulated Chat Interface */}
        <div className="border border-gray-300 rounded-md p-4 mb-4 h-64 overflow-y-auto bg-gray-50">
          {chatLog.length === 0 ? (
            <p className="text-gray-500 text-center py-8">Type your message below to start the chat.</p>
          ) : (
            chatLog.map((msg, index) => (
              <p key={index} className={`mb-2 ${msg.startsWith('You:') ? 'text-blue-700 text-right' : 'text-gray-800'}`}>
                {msg}
              </p>
            ))
          )}
        </div>

        <form onSubmit={handleSendMessage} className="flex gap-2">
          <input
            type="text"
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button
            type="submit"
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            Send
          </button>
        </form>

        <p className="text-sm text-gray-500 mt-4 text-center">
          *This is a simplified simulation. A real-world solution would integrate with a robust chat platform.
        </p>

        <div className="mt-6 text-center">
            <Link href="/" className="text-blue-500 hover:underline">
                Back to Home
            </Link>
        </div>
      </div>
    </div>
  );
}