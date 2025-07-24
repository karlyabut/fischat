"use client";

import StockAnalysis from "../components/StockAnalysis";
import ChatHistory from "../components/ChatHistory";

/**
 * MainContainer Component
 * 
 * Container component that wraps the main application layout including
 * StockAnalysis and ChatHistory components in a responsive grid layout.
 */
export default function MainContainer() {
  return (
    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Stock Analysis - takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <StockAnalysis />
          </div>

          {/* Chat History - takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <ChatHistory />
          </div>
        </div>
      </div>
    </main>
  );
} 