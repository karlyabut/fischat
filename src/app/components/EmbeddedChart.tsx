"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface VisualizationData {
  operatingExpenses?: Array<{ label: string; value: number }>;
  costAndExpenses?: Array<{ label: string; value: number }>;
  interestIncome?: Array<{ label: string; value: number }>;
  interestExpense?: Array<{ label: string; value: number }>;
  netIncome?: Array<{ label: string; value: number }>;
}

interface EmbeddedChartProps {
  visualizationData: VisualizationData;
}

export default function EmbeddedChart({ visualizationData }: EmbeddedChartProps) {
  const [selectedMetric, setSelectedMetric] = useState<string>('netIncome');

  const availableMetrics = Object.keys(visualizationData).filter(key =>
    visualizationData[key as keyof VisualizationData] &&
    (visualizationData[key as keyof VisualizationData] as any[]).length > 0
  );

  const chartData = [...(visualizationData[selectedMetric as keyof VisualizationData] || [])]
    .sort((a, b) => new Date(a.label).getTime() - new Date(b.label).getTime());

  const metricLabels = {
    operatingExpenses: 'Operating Expenses',
    costAndExpenses: 'Cost and Expenses',
    interestIncome: 'Interest Income',
    interestExpense: 'Interest Expense',
    netIncome: 'Net Income'
  };

  const formatValue = (value: number) => {
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(2)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(2)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(2)}K`;
    }
    return `$${value.toFixed(2)}`;
  };

  const formatLabel = (label: string) => {
    return new Date(label).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short'
    });
  };

  return (
    <div className="p-4 border border-gray-700 rounded bg-gray-800">
      <h4 className="font-semibold mb-4 text-white">Financial Data Visualization</h4>

      {/* Metric Selection */}
      <div className="flex flex-wrap gap-2 mb-4">
        {availableMetrics.map(metric => (
          <button
            key={metric}
            onClick={() => setSelectedMetric(metric)}
            className={`px-3 py-1 rounded text-sm ${selectedMetric === metric
              ? 'bg-blue-600 text-white'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            {metricLabels[metric as keyof typeof metricLabels]}
          </button>
        ))}
      </div>

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="label"
                stroke="#9CA3AF"
                tickFormatter={formatLabel}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis
                stroke="#9CA3AF"
                tickFormatter={formatValue}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#1F2937',
                  border: '1px solid #374151',
                  borderRadius: '8px',
                  color: '#F9FAFB'
                }}
                formatter={(value: any) => [formatValue(value), metricLabels[selectedMetric as keyof typeof metricLabels]]}
                labelFormatter={formatLabel}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-80 flex items-center justify-center">
          <p className="text-gray-400">No data available for the selected metric</p>
        </div>
      )}
    </div>
  );
} 