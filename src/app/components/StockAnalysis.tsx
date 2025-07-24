"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { analyzeStock } from "@/lib/api/analysis";
import { saveChatMessage } from "@/lib/chat-history";
import EmbeddedChart from "./EmbeddedChart";

export default function StockAnalysis() {
  const { data: session } = useSession();
  const [question, setQuestion] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showExamples, setShowExamples] = useState(false);
  const [showFullAnalysis, setShowFullAnalysis] = useState(false);

  const getSummary = (text: string) => {
    if (!text) return "";

    // Split into paragraphs and get the first few meaningful ones
    const paragraphs = text.split('\n\n').filter(p => p.trim());

    // Look for summary-like content (usually at the beginning or end)
    let summary = "";

    // First, try to find a paragraph that contains actual content after "SUMMARY"
    for (let i = 0; i < paragraphs.length; i++) {
      const para = paragraphs[i].trim();

      if (para.toLowerCase().startsWith('summary')) {
        // Extract content after "SUMMARY"
        const summaryContent = para.replace(/^summary\s*:?\s*/i, '').trim();
        if (summaryContent.length > 20) {
          summary = summaryContent;
          break;
        }
      }
    }

    // If no summary found, look for the first substantial paragraph
    if (!summary) {
      for (let i = 0; i < paragraphs.length; i++) {
        const para = paragraphs[i].trim();
        // Skip paragraphs that are just headers or too short
        if (para.length > 50 && para.length < 500 &&
          !para.toLowerCase().startsWith('detailed analysis') &&
          !para.toLowerCase().startsWith('company overview') &&
          !para.toLowerCase().startsWith('earnings call') &&
          !para.toLowerCase().startsWith('financial performance') &&
          !para.toLowerCase().startsWith('market analysis')) {
          summary = para;
          break;
        }
      }
    }

    // If still no summary, take the first 200 characters of the first paragraph
    if (!summary && paragraphs[0]) {
      const firstPara = paragraphs[0].trim();
      summary = firstPara.length > 200 ? firstPara.substring(0, 200) + "..." : firstPara;
    }

    return summary;
  };

  const handleAnalysis = async () => {
    if (!question.trim()) return;

    setLoading(true);
    setShowFullAnalysis(false); // Reset to summary view
    try {
      const result = await analyzeStock(question);
      console.log(result);
      setAnalysis(result);

      // Save chat history to Firebase
      if (session?.user?.email && !result.error && result.analysis) {
        try {
          await saveChatMessage({
            userId: session.user.id || session.user.email,
            userEmail: session.user.email,
            question: question,
            answer: result.analysis,
            symbol: result.symbol,
            stockData: result.stockData,
            dataTypes: result.dataTypes,
            model: result.model,
            usage: result.usage,
            dataPoints: result.dataPoints,
            visualizationData: result.visualizationData,
          });
          console.log("Chat history saved successfully");
        } catch (error) {
          console.error("Failed to save chat history:", error);
        }
      }
    } catch (error) {
      console.error("Analysis Error:", error);
      setAnalysis({ error: (error as Error).message });
    } finally {
      setLoading(false);
    }
  };

  const exampleQuestions = [
    "Who is the CEO of Apple?",
    "What does Tesla do?",
    "Where is Microsoft headquartered?",
    "How many employees does Amazon have?",
    "What industry is Netflix in?",
    "Who founded Meta?",
    "What is the website for Spotify?",
    "Summarize Spotify's latest conference call.",
    "What has Airbnb management said about profitability over the last few earnings calls?",
    "What are Mark Zuckerberg's and Satya Nadella's recent comments about AI?",
    "How many new large deals did ServiceNow sign in the last quarter?",
    "What was Crowdstrike revenue in the past 3, 5, and 10 years?",
    "What was Crowdstrike's revenue growth in the past 3, 5, and 10 years?",
    "What was Apple's profit margin over the last 5 years?",
    "What was Tesla's cash flow from operations in the past 3 years?",
    "What was Amazon's debt-to-equity ratio over the last 10 years?",
    "What was Microsoft's earnings per share growth in the past 5 years?",
    "What was Netflix's subscriber growth in the last quarter?",
    "What was Uber's revenue from rides vs food delivery?",
    "What was Palantir's government vs commercial revenue split?",
    "What was Snowflake's customer growth metrics?",
    "What was Zoom's profitability during the pandemic years?",
    "What was Shopify's merchant growth and revenue per merchant?",
    "What was Coinbase's trading volume and revenue trends?",
    "What was DoorDash's market share vs competitors?",
    "What was Peloton's subscriber retention rates?",
    "What was Moderna's vaccine revenue and pipeline?",
    "What was Disney's streaming subscriber growth?",
    "What was Nike's direct-to-consumer vs wholesale revenue?",
    "What was Walmart's e-commerce growth vs Amazon?",
    "What was JPMorgan's trading revenue vs investment banking?",
    "What was Exxon's capital expenditure trends?",
    "What was Boeing's order backlog and delivery rates?",
    "What was Ford's electric vehicle investment and sales?",
    "What was General Electric's restructuring progress?",
    "What was Berkshire Hathaway's investment portfolio changes?"
  ];

  return (
    <div className="space-y-6 p-6 border border-gray-800 rounded-lg bg-gray-900">
      <h2 className="text-xl font-bold text-center text-white">FisChat</h2>
      <p className="text-gray-300">
        Ask questions about any company and get AI-powered analysis using real financial data. Just mention the company name in your question!
      </p>

      {/* Input Section */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-200">Your Question</label>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g., Summarize Spotify's latest conference call, What was Tesla's revenue growth, etc."
            rows={3}
            className="w-full px-3 py-2 border border-gray-600 rounded bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Example Questions Toggle */}
        <div className="border border-gray-700 rounded bg-gray-800">
          <button
            onClick={() => setShowExamples(!showExamples)}
            className="w-full px-4 py-2 text-left flex items-center justify-between text-gray-200 hover:bg-gray-700"
          >
            <span className="font-medium">Example Questions</span>
            <span className="text-gray-400">
              {showExamples ? '▼' : '▶'}
            </span>
          </button>

          {showExamples && (
            <div className="p-4 border-t border-gray-700">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {exampleQuestions.map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setQuestion(example)}
                    className="px-3 py-2 text-sm text-left hover:bg-gray-700 rounded border border-gray-600 text-gray-200"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <button
          onClick={handleAnalysis}
          disabled={loading}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Analyzing..." : "Get AI Analysis"}
        </button>
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Analysis Results</h3>

          {analysis.error ? (
            <div className="p-3 bg-red-900 text-red-200 rounded border border-red-700">
              Error: {analysis.error}
            </div>
          ) : (
            <>
              {/* AI Analysis */}
              <div className="p-4 border border-gray-700 rounded bg-gray-800">
                <h4 className="font-semibold mb-2 text-white">AI Analysis</h4>
                <div className="text-sm">
                  {showFullAnalysis ? (
                    <div>
                      <div className="whitespace-pre-wrap text-gray-200 mb-3">
                        {analysis.analysis}
                      </div>
                      <button
                        onClick={() => setShowFullAnalysis(false)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Show Summary
                      </button>
                    </div>
                  ) : (
                    <div>
                      <div className="text-gray-200 mb-3 leading-relaxed">
                        {getSummary(analysis.analysis)}
                      </div>
                      <button
                        onClick={() => setShowFullAnalysis(true)}
                        className="text-blue-400 hover:text-blue-300 text-sm font-medium"
                      >
                        Show Full Analysis
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Financial Data Visualization */}
              {analysis.dataTypes.hasFinancialData && analysis.visualizationData && (
                <EmbeddedChart visualizationData={analysis.visualizationData} />
              )}

              {/* Stock Data Summary */}
              <div className="p-4 border border-gray-700 rounded bg-gray-800">
                <h4 className="font-semibold mb-2 text-white">Stock Data Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-gray-200">
                    <strong className="text-white">Price:</strong> ${analysis.stockData.quote.price}
                  </div>
                  <div className="text-gray-200">
                    <strong className="text-white">Change:</strong> {analysis.stockData.quote.change}%
                  </div>
                  <div className="text-gray-200">
                    <strong className="text-white">Market Cap:</strong> ${(analysis.stockData.quote.marketCap / 1e9).toFixed(2)}B
                  </div>
                  <div className="text-gray-200">
                    <strong className="text-white">Volume:</strong> {(analysis.stockData.quote.volume / 1e6).toFixed(2)}M
                  </div>
                </div>
              </div>

              {/* Data Sources Used */}
              <div className="p-4 border border-gray-700 rounded bg-gray-800">
                <h4 className="font-semibold mb-2 text-white">Data Sources Used</h4>
                <div className="flex flex-wrap gap-2">
                  {analysis.dataTypes.hasBasicData && (
                    <span className="px-2 py-1 border border-blue-600 text-blue-300 text-xs rounded bg-blue-900">Stock Quote & Profile</span>
                  )}
                  {analysis.dataTypes.hasEarningsCalls && (
                    <span className="px-2 py-1 border border-green-600 text-green-300 text-xs rounded bg-green-900">Earnings Calls</span>
                  )}
                  {analysis.dataTypes.hasFinancialData && (
                    <span className="px-2 py-1 border border-purple-600 text-purple-300 text-xs rounded bg-purple-900">Financial Statements</span>
                  )}
                  {analysis.dataTypes.hasCompanyInfo && (
                    <span className="px-2 py-1 border border-orange-600 text-orange-300 text-xs rounded bg-orange-900">Company Information</span>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Data Visualization Modal */}
      {/* Removed DataVisualization component as it's now embedded */}
    </div>
  );
} 