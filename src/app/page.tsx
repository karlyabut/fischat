"use client";

import MainContainer from "./containers/MainContainer";
import ProtectedRoute from "./components/ProtectedRoute";
import { useSession, signOut } from "next-auth/react";

export default function Home() {
  const { data: session } = useSession();

  const formatDate = (date: Date | string) => {
    if (!date) return "N/A";
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString();
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-black">
        {/* Header with user info and sign out */}
        <header className="bg-gray-900 shadow-sm border-b border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-white">FisChat</h1>
              </div>

              {session && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-3">
                    {session.user?.image && (
                      <img
                        src={session.user.image}
                        alt="Profile"
                        className="w-8 h-8 rounded-full"
                      />
                    )}
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-200">
                        {session.user?.name || session.user?.email}
                      </div>
                      <div className="text-xs text-gray-400">
                        Member since {session.user?.createdAt ? formatDate(session.user.createdAt) : 'N/A'}
                      </div>
                      {session.user?.signInCount && (
                        <div className="text-xs text-gray-400">
                          {session.user.signInCount} sign-in{session.user.signInCount !== 1 ? 's' : ''}
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/auth/signin" })}
                    className="text-sm text-gray-300 hover:text-white px-3 py-1 rounded border border-gray-600 hover:bg-gray-800"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Main content using container component */}
        <MainContainer />
      </div>
    </ProtectedRoute>
  );
}
