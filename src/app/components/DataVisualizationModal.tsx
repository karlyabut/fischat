"use client";

import EmbeddedChart from "./EmbeddedChart";

interface VisualizationData {
  operatingExpenses?: Array<{ label: string; value: number }>;
  costAndExpenses?: Array<{ label: string; value: number }>;
  interestIncome?: Array<{ label: string; value: number }>;
  interestExpense?: Array<{ label: string; value: number }>;
  netIncome?: Array<{ label: string; value: number }>;
}

interface DataVisualizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  visualizationData: VisualizationData;
  question: string;
}

export default function DataVisualizationModal({ isOpen, onClose, visualizationData, question }: DataVisualizationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white">Financial Data Visualization</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-300 mb-2">{question}</p>
        </div>

        <EmbeddedChart visualizationData={visualizationData} />
      </div>
    </div>
  );
} 