"use client";

import { useState } from "react";
import { sendMessage } from "@/lib/api/openai";
import { getStockQuote, getCompanyProfile } from "@/lib/api/fmp";

export default function ApiTest() {
  const [openaiMessage, setOpenaiMessage] = useState("");
  const [openaiResponse, setOpenaiResponse] = useState("");
  const [stockSymbol, setStockSymbol] = useState("");
  const [stockData, setStockData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleOpenAI = async () => {
    if (!openaiMessage.trim()) return;

    setLoading(true);
    try {
      const result = await sendMessage(openaiMessage);
      setOpenaiResponse(result.response);
    } catch (error) {
      console.error("OpenAI Error:", error);
      setOpenaiResponse("Error: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const handleFMPQuote = async () => {
    if (!stockSymbol.trim()) return;

    setLoading(true);
    try {
      const result = await getStockQuote(stockSymbol);
      setStockData(result);
    } catch (error) {
      console.error("FMP Error:", error);
      setStockData({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const handleFMPProfile = async () => {
    if (!stockSymbol.trim()) return;

    setLoading(true);
    try {
      const result = await getCompanyProfile(stockSymbol);
      setStockData(result);
    } catch (error) {
      console.error("FMP Error:", error);
      setStockData({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6 border rounded-lg">
      <h2 className="text-xl font-bold">API Test Component</h2>

      {/* OpenAI Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">OpenAI API</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={openaiMessage}
            onChange={(e) => setOpenaiMessage(e.target.value)}
            placeholder="Enter your message..."
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleOpenAI}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? "Loading..." : "Send"}
          </button>
        </div>
        {openaiResponse && (
          <div className="p-3 bg-gray-100 rounded">
            <strong>Response:</strong> {openaiResponse}
          </div>
        )}
      </div>

      {/* FMP Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">FMP API</h3>
        <div className="flex gap-2">
          <input
            type="text"
            value={stockSymbol}
            onChange={(e) => setStockSymbol(e.target.value.toUpperCase())}
            placeholder="Enter stock symbol (e.g., AAPL)"
            className="flex-1 px-3 py-2 border rounded"
          />
          <button
            onClick={handleFMPQuote}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          >
            Quote
          </button>
          <button
            onClick={handleFMPProfile}
            disabled={loading}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
          >
            Profile
          </button>
        </div>
        {stockData && (
          <div className="p-3 bg-gray-100 rounded">
            <strong>Response:</strong>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(stockData, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 