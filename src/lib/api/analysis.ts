export interface StockAnalysisResponse {
  analysis?: string;
  stockData?: {
    quote: any;
    profile: any;
    symbol: string;
    earningsCalls?: any[];
    incomeStatements?: any[];
    balanceSheets?: any[];
    cashFlowStatements?: any[];
  };
  question?: string;
  symbol?: string;
  model?: string;
  usage?: any;
  dataTypes?: {
    hasEarningsCalls: boolean;
    hasFinancialData: boolean;
    hasCompanyInfo: boolean;
    hasBasicData: boolean;
  };
  error?: string;
  dataPoints?: Array<{
    label: string;
    value: number;
    unit: string;
    type: 'revenue' | 'growth' | 'percentage' | 'ratio' | 'metric' | 'other';
    year?: number;
    period?: string;
  }>;
  visualizationData?: {
    operatingExpenses?: Array<{label: string; value: number}>;
    costAndExpenses?: Array<{label: string; value: number}>;
    interestIncome?: Array<{label: string; value: number}>;
    interestExpense?: Array<{label: string; value: number}>;
    netIncome?: Array<{label: string; value: number}>;
  };
}

export async function analyzeStock(
  question: string, 
  symbol?: string
): Promise<StockAnalysisResponse> {
  const response = await fetch("/api/analysis", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question, symbol }),
  });

  if (!response.ok) {
    throw new Error(`Stock analysis error: ${response.statusText}`);
  }

  return response.json();
} 