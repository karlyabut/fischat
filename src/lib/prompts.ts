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

interface StockData {
  quote: StockQuote;
  profile: CompanyProfile;
  symbol: string;
  earningsCalls?: EarningsCall[];
  incomeStatements?: FinancialStatement[];
  balanceSheets?: unknown[];
  cashFlowStatements?: unknown[];
}

export interface PromptParams {
  question: string;
  symbol?: string;
  stockData?: StockData;
  isEarningsCall?: boolean;
  isFinancialData?: boolean;
  isCompanyInfo?: boolean;
  timeRange?: string;
}

export const getSymbolExtractionPrompt = (question: string): string => `
Extract the stock symbol (ticker) from this question. Return ONLY the stock symbol in uppercase, nothing else.

Question: "${question}"

Common company mappings:
- Spotify → SPOT
- Airbnb → ABNB
- Meta/Facebook → META
- ServiceNow → NOW
- Crowdstrike → CRWD
- Tesla → TSLA
- Apple → AAPL
- Microsoft → MSFT
- Amazon → AMZN
- Google/Alphabet → GOOGL
- Netflix → NFLX
- Uber → UBER
- Lyft → LYFT
- Zoom → ZM
- Slack → WORK
- Palantir → PLTR
- Snowflake → SNOW
- MongoDB → MDB
- Datadog → DDOG
- Okta → OKTA
- Twilio → TWLO
- Shopify → SHOP
- Square/Block → SQ
- PayPal → PYPL
- Stripe → STRIPE (private)
- Coinbase → COIN
- Robinhood → HOOD
- DoorDash → DASH
- Instacart → CART
- Peloton → PTON
- Beyond Meat → BYND
- Moderna → MRNA
- Pfizer → PFE
- Johnson & Johnson → JNJ
- Walmart → WMT
- Target → TGT
- Costco → COST
- Home Depot → HD
- Nike → NKE
- Disney → DIS
- Warner Bros → WBD
- Paramount → PARA
- Comcast → CMCSA
- AT&T → T
- Verizon → VZ
- Bank of America → BAC
- JPMorgan → JPM
- Wells Fargo → WFC
- Goldman Sachs → GS
- Morgan Stanley → MS
- BlackRock → BLK
- Berkshire Hathaway → BRK.A
- Exxon → XOM
- Chevron → CVX
- Shell → SHEL
- BP → BP
- General Electric → GE
- Boeing → BA
- Ford → F
- General Motors → GM
- Toyota → TM
- Honda → HMC
- Volkswagen → VWAGY
- BMW → BMWYY
- Mercedes → MBGYY
- Ferrari → RACE
- Porsche → POAHY

Stock symbol:`;

export const getAnalysisPrompt = (params: PromptParams): string => {
  const { question, stockData, isEarningsCall, isFinancialData, isCompanyInfo } = params;
  
  return `
You are a senior financial analyst with expertise in analyzing company earnings calls, financial statements, and market data. 

Based on the following comprehensive stock data, please answer this question: "${question}"

Available Data:
${JSON.stringify(stockData, null, 2)}

Please provide a detailed, professional analysis that includes:

SUMMARY
Start with a concise 2-3 sentence summary that directly answers the user's question with the most important information.

${isCompanyInfo ? `
DETAILED ANALYSIS

Company Overview
1. Company overview and basic information
2. Leadership and management details
3. Business model and operations
4. Industry and market position
5. Company history and background
6. Contact information and locations
7. Key facts and figures about the company
` : ''}

${isEarningsCall ? `
DETAILED ANALYSIS

Earnings Call Analysis
1. Key insights from recent earnings calls and management commentary
2. Executive statements and strategic direction
3. Management's outlook and forward-looking statements
4. Important announcements or changes in strategy
5. Notable quotes from executives
` : ''}

${isFinancialData ? `
DETAILED ANALYSIS

Financial Performance Analysis
1. Historical financial performance and trends over the specified time period
2. Revenue growth analysis with specific numbers and percentages
3. Key financial metrics and their significance
4. Profitability trends and margin analysis
5. Cash flow and balance sheet insights
6. Deal flow and business development insights (if applicable)
7. Comparative analysis across time periods
` : ''}

${!isCompanyInfo && !isEarningsCall && !isFinancialData ? `
DETAILED ANALYSIS

Market Analysis
1. Company overview and business model context
2. Market position and competitive landscape
3. Risk factors and opportunities
4. Specific insights directly addressing the user's question
` : ''}

Key Takeaways
• Provide a summary of the most important points
• Include specific data points and metrics where available
• Highlight any significant trends or changes

Format your response in a clear, structured manner with bullet points where appropriate. If specific data is not available, acknowledge this and provide insights based on available information.

For company information questions, provide direct, factual answers with specific details when available.
For financial data questions, include specific numbers, percentages, and trends. Show calculations when relevant.
For earnings call questions, focus on management commentary and key takeaways with specific quotes when available.
`;
}; 