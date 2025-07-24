interface StockQuote {
  price: number;
  marketCap: number;
  change: number;
  volume: number;
  [key: string]: unknown;
}

interface CompanyProfile {
  [key: string]: unknown;
}

interface FinancialStatement {
  date: string;
  operatingExpenses?: number;
  costAndExpenses?: number;
  interestIncome?: number;
  interestExpense?: number;
  netIncome?: number;
  [key: string]: unknown;
}

interface EarningsCall {
  [key: string]: unknown;
}

interface DataPoint {
  label: string;
  value: number;
  unit: string;
  type: 'revenue' | 'growth' | 'percentage' | 'ratio' | 'metric' | 'other';
  year?: number;
  period?: string;
}

interface VisualizationData {
  operatingExpenses?: Array<{label: string; value: number}>;
  costAndExpenses?: Array<{label: string; value: number}>;
  interestIncome?: Array<{label: string; value: number}>;
  interestExpense?: Array<{label: string; value: number}>;
  netIncome?: Array<{label: string; value: number}>;
}

interface DataTypes {
  hasEarningsCalls: boolean;
  hasFinancialData: boolean;
  hasCompanyInfo: boolean;
  hasBasicData: boolean;
}

export interface StockAnalysisResponse {
  analysis?: string;
  stockData?: {
    quote: StockQuote;
    profile: CompanyProfile;
    symbol: string;
    earningsCalls?: EarningsCall[];
    incomeStatements?: FinancialStatement[];
    balanceSheets?: unknown[];
    cashFlowStatements?: unknown[];
  };
  question?: string;
  symbol?: string;
  model?: string;
  usage?: unknown;
  dataTypes?: DataTypes;
  error?: string;
  dataPoints?: DataPoint[];
  visualizationData?: VisualizationData;
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