import './globals.css';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar'; // We'll create this soon

export const metadata = {
  title: 'Health Warlock',
  description: 'Your personal healthcare management portal',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <Navbar /> {/* Add your Navbar here */}
          <main className="container mx-auto p-4">
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}