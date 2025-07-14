// Frontend/app/components/Navbar.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import { usePathname } from 'next/navigation'; // For active link styling

export default function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  const navLinkClass = (path: string) =>
    `block mt-4 lg:inline-block lg:mt-0 text-white hover:text-gray-200 mr-4 ${
      pathname === path ? 'font-bold' : ''
    }`;

  return (
    <nav className="flex items-center justify-between flex-wrap bg-blue-700 p-6">
      <div className="flex items-center flex-shrink-0 text-white mr-6">
        <Link href="/" className="font-semibold text-xl tracking-tight">
          Health Warlock
        </Link>
      </div>
      <div className="w-full block flex-grow lg:flex lg:items-center lg:w-auto">
        <div className="text-sm lg:flex-grow">
          {user ? (
            <>
              <Link href="/" className={navLinkClass('/')}>
                Home
              </Link>
              <Link href="/policies" className={navLinkClass('/policies')}>
                Policies
              </Link>
              <Link href="/claims/submit" className={navLinkClass('/claims/submit')}>
                Make Claim
              </Link>
              <Link href="/claims/history" className={navLinkClass('/claims/history')}>
                Claims History
              </Link>
              <Link href="/offers" className={navLinkClass('/offers')}>
                Offers
              </Link>
              <Link href="/live-chat" className={navLinkClass('/live-chat')}>
                    Live Chat
                  </Link>
              {/* Live chat link - could be an external service */}
            
            </>
          ) : (
            <>
              <Link href="/login" className={navLinkClass('/login')}>
                Login
              </Link>
              <Link href="/register" className={navLinkClass('/register')}>
                Register
              </Link>
            </>
          )}
        </div>
        <div>
          {user ? (
            <div className="text-white text-sm">
              Welcome, {user.firstName}!
              <button
                onClick={logout}
                className="inline-block text-sm px-4 py-2 leading-none border rounded text-white border-white hover:border-transparent hover:text-blue-700 hover:bg-white mt-4 lg:mt-0 ml-4"
              >
                Logout
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </nav>
  );
}