export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number;
  pe: number;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
}

export interface CompanyProfile {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
}

export async function getStockQuote(symbol: string): Promise<StockQuote[]> {
  const response = await fetch(`/api/fmp/quote?symbol=${encodeURIComponent(symbol)}`);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.statusText}`);
  }

  return response.json();
}

export async function getCompanyProfile(symbol: string): Promise<CompanyProfile[]> {
  const response = await fetch(`/api/fmp/company-profile?symbol=${encodeURIComponent(symbol)}`);
  
  if (!response.ok) {
    throw new Error(`FMP API error: ${response.statusText}`);
  }

  return response.json();
} 