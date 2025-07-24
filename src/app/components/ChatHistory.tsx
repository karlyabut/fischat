"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { getUserChatHistory, deleteChatMessage, ChatMessage } from "@/lib/chat-history";
import DataVisualizationModal from "./DataVisualizationModal";

export default function ChatHistory() {
  const { data: session } = useSession();
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
  const [visualizationOpen, setVisualizationOpen] = useState(false);
  const [selectedVisualizationData, setSelectedVisualizationData] = useState<any>(null);
  const [selectedQuestion, setSelectedQuestion] = useState<string>("");

  useEffect(() => {
    if (session?.user?.email) {
      loadChatHistory();
    }
  }, [session?.user?.email]);

  const loadChatHistory = async () => {
    if (!session?.user?.email) return;

    setLoading(true);
    try {
      const history = await getUserChatHistory(session.user.email, 20);
      setChatHistory(history);
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await deleteChatMessage(messageId);
      setChatHistory(prev => prev.filter(msg => msg.id !== messageId));
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleVisualize = (message: ChatMessage) => {
    if (message.visualizationData) {
      setSelectedVisualizationData(message.visualizationData);
      setSelectedQuestion(message.question);
      setVisualizationOpen(true);
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString() + ' ' + new Date(date).toLocaleTimeString();
  };

  if (loading) {
    return (
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
        <h3 className="text-lg font-semibold mb-4 text-white">Chat History</h3>
        <div className="text-gray-400">Loading...</div>
      </div>
    );
  }

  if (chatHistory.length === 0) {
    return (
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
        <h3 className="text-lg font-semibold mb-4 text-white">Chat History</h3>
        <div className="text-gray-400">No chat history yet. Ask your first question!</div>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 border border-gray-700 rounded-lg bg-gray-900">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Chat History</h3>
          <button
            onClick={loadChatHistory}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Refresh
          </button>
        </div>

        <div className="space-y-4 max-h-96 overflow-y-auto">
          {chatHistory.map((message) => (
            <div key={message.id} className="border border-gray-600 rounded-lg p-3 bg-gray-800">
              <div className="flex justify-between items-start mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium text-gray-300">
                      {message.symbol || 'Unknown'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDate(message.createdAt)}
                    </span>
                  </div>
                  <div className="text-sm font-medium text-gray-100 mb-2">
                    {message.question}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteMessage(message.id!)}
                  className="text-xs text-red-400 hover:text-red-300 ml-2"
                >
                  Delete
                </button>
              </div>

              <div className="text-sm text-gray-300">
                {expandedMessage === message.id ? (
                  <div>
                    <div className="whitespace-pre-wrap mb-2">{message.answer}</div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setExpandedMessage(null)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Show less
                      </button>
                      {message.visualizationData && message.dataTypes?.hasFinancialData && (
                        <button
                          onClick={() => handleVisualize(message)}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Visualize Data
                        </button>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="line-clamp-3">{message.answer}</div>
                    <div className="flex gap-2 mt-1">
                      <button
                        onClick={() => setExpandedMessage(message.id!)}
                        className="text-blue-400 hover:text-blue-300 text-xs"
                      >
                        Show more
                      </button>
                      {message.visualizationData && message.dataTypes?.hasFinancialData && (
                        <button
                          onClick={() => handleVisualize(message)}
                          className="text-green-400 hover:text-green-300 text-xs"
                        >
                          Visualize Data
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {message.dataTypes && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {message.dataTypes.hasBasicData && (
                    <span className="px-2 py-1 bg-blue-900 text-blue-300 text-xs rounded border border-blue-700">Stock Data</span>
                  )}
                  {message.dataTypes.hasEarningsCalls && (
                    <span className="px-2 py-1 bg-green-900 text-green-300 text-xs rounded border border-green-700">Earnings Calls</span>
                  )}
                  {message.dataTypes.hasFinancialData && (
                    <span className="px-2 py-1 bg-purple-900 text-purple-300 text-xs rounded border border-purple-700">Financial Data</span>
                  )}
                  {message.dataTypes.hasCompanyInfo && (
                    <span className="px-2 py-1 bg-orange-900 text-orange-300 text-xs rounded border border-orange-700">Company Info</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <DataVisualizationModal
        isOpen={visualizationOpen}
        onClose={() => setVisualizationOpen(false)}
        visualizationData={selectedVisualizationData || {}}
        question={selectedQuestion}
      />
    </>
  );
} 