import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";
import { getSymbolExtractionPrompt, getAnalysisPrompt } from "@/lib/prompts";

export async function POST(request: NextRequest) {
  try {
    const { question, symbol } = await request.json();

    if (!question) {
      return NextResponse.json({ 
        error: "Question is required" 
      }, { status: 400 });
    }

    const fmpApiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
    if (!fmpApiKey) {
      return NextResponse.json({ error: "FMP API key not configured" }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    // Extract symbol from question if not provided
    let extractedSymbol = symbol;
    if (!extractedSymbol) {
      const symbolExtractionPrompt = getSymbolExtractionPrompt(question);

      const symbolResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [{ role: "user", content: symbolExtractionPrompt }],
        temperature: 0,
        max_tokens: 10,
      });

      extractedSymbol = symbolResponse.choices[0]?.message?.content?.trim();
      
      if (!extractedSymbol) {
        return NextResponse.json({ 
          error: "Could not identify a stock symbol from your question. Please specify a company name or ticker symbol." 
        }, { status: 400 });
      }
    }

    // Determine what data to fetch based on the question
    const questionLower = question.toLowerCase();
    const isEarningsCall = questionLower.includes('conference call') || 
                          questionLower.includes('earnings call') ||
                          questionLower.includes('management said') ||
                          questionLower.includes('ceo') ||
                          questionLower.includes('executive') ||
                          questionLower.includes('transcript') ||
                          questionLower.includes('quarterly call') ||
                          questionLower.includes('annual call');
    
    const isFinancialData = questionLower.includes('revenue') || 
                           questionLower.includes('growth') || 
                           questionLower.includes('deals') ||
                           questionLower.includes('financial') ||
                           questionLower.includes('earnings') ||
                           questionLower.includes('profit') ||
                           questionLower.includes('income') ||
                           questionLower.includes('cash flow') ||
                           questionLower.includes('balance sheet') ||
                           questionLower.includes('debt') ||
                           questionLower.includes('assets') ||
                           questionLower.includes('liabilities') ||
                           questionLower.includes('margin') ||
                           questionLower.includes('ratio') ||
                           questionLower.includes('metric');

    const isCompanyInfo = questionLower.includes('who is the ceo') ||
                         questionLower.includes('who is ceo') ||
                         questionLower.includes('ceo of') ||
                         questionLower.includes('chief executive') ||
                         questionLower.includes('founder') ||
                         questionLower.includes('founded') ||
                         questionLower.includes('headquarters') ||
                         questionLower.includes('head office') ||
                         questionLower.includes('location') ||
                         questionLower.includes('address') ||
                         questionLower.includes('industry') ||
                         questionLower.includes('sector') ||
                         questionLower.includes('business') ||
                         questionLower.includes('company') ||
                         questionLower.includes('what does') ||
                         questionLower.includes('what is') ||
                         questionLower.includes('describe') ||
                         questionLower.includes('tell me about') ||
                         questionLower.includes('employees') ||
                         questionLower.includes('workforce') ||
                         questionLower.includes('website') ||
                         questionLower.includes('phone') ||
                         questionLower.includes('contact');

    // Determine time range for financial data
    let timeRange = "10"; // default to 10 years
    if (questionLower.includes('3 years') || questionLower.includes('past 3')) {
      timeRange = "3";
    } else if (questionLower.includes('5 years') || questionLower.includes('past 5')) {
      timeRange = "5";
    } else if (questionLower.includes('10 years') || questionLower.includes('past 10')) {
      timeRange = "10";
    } else if (questionLower.includes('quarter') || questionLower.includes('last quarter')) {
      timeRange = "4"; // 4 quarters
    }

    // Fetch basic stock data
    const [quoteResponse, profileResponse] = await Promise.all([
      fetch(`https://financialmodelingprep.com/api/v3/quote/${extractedSymbol}?apikey=${fmpApiKey}`),
      fetch(`https://financialmodelingprep.com/api/v3/profile/${extractedSymbol}?apikey=${fmpApiKey}`)
    ]);

    if (!quoteResponse.ok || !profileResponse.ok) {
      throw new Error(`FMP API error: ${quoteResponse.status} or ${profileResponse.status}`);
    }

    const [quoteData, profileData] = await Promise.all([
      quoteResponse.json(),
      profileResponse.json()
    ]);

    // Initialize data object
    let additionalData = {};

    // Fetch earnings call data if needed
    if (isEarningsCall) {
      try {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        // Get calls from current and previous year
        const [currentYearResponse, previousYearResponse] = await Promise.all([
          fetch(`https://financialmodelingprep.com/api/v3/earning_call_transcript/${extractedSymbol}?year=${currentYear}&apikey=${fmpApiKey}`),
          fetch(`https://financialmodelingprep.com/api/v3/earning_call_transcript/${extractedSymbol}?year=${previousYear}&apikey=${fmpApiKey}`)
        ]);
        
        let earningsData: any[] = [];
        
        if (currentYearResponse.ok) {
          const currentYearData = await currentYearResponse.json();
          earningsData = [...earningsData, ...currentYearData];
        }
        
        if (previousYearResponse.ok) {
          const previousYearData = await previousYearResponse.json();
          earningsData = [...earningsData, ...previousYearData];
        }
        
        if (earningsData.length > 0) {
          additionalData = { ...additionalData, earningsCalls: earningsData };
        }
      } catch (error) {
        console.warn("Failed to fetch earnings calls:", error);
      }
    }

    // Fetch financial statements if needed
    if (isFinancialData) {
      try {
        const [incomeResponse, balanceResponse, cashFlowResponse] = await Promise.all([
          fetch(`https://financialmodelingprep.com/api/v3/income-statement/${extractedSymbol}?period=annual&limit=${timeRange}&apikey=${fmpApiKey}`),
          fetch(`https://financialmodelingprep.com/api/v3/balance-sheet-statement/${extractedSymbol}?period=annual&limit=${timeRange}&apikey=${fmpApiKey}`),
          fetch(`https://financialmodelingprep.com/api/v3/cash-flow-statement/${extractedSymbol}?period=annual&limit=${timeRange}&apikey=${fmpApiKey}`)
        ]);

        if (incomeResponse.ok) {
          const incomeData = await incomeResponse.json();
          additionalData = { ...additionalData, incomeStatements: incomeData };
        }

        if (balanceResponse.ok) {
          const balanceData = await balanceResponse.json();
          additionalData = { ...additionalData, balanceSheets: balanceData };
        }

        if (cashFlowResponse.ok) {
          const cashFlowData = await cashFlowResponse.json();
          additionalData = { ...additionalData, cashFlowStatements: cashFlowData };
        }
      } catch (error) {
        console.warn("Failed to fetch financial statements:", error);
      }
    }

    // Combine all data
    const stockData = {
      quote: quoteData[0] || {},
      profile: profileData[0] || {},
      symbol: extractedSymbol.toUpperCase(),
      ...additionalData
    };

    const analysisPrompt = getAnalysisPrompt({
      question,
      stockData,
      isCompanyInfo,
      isEarningsCall,
      isFinancialData
    });

    const openaiResponse = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: analysisPrompt }],
      temperature: 0.3,
      max_tokens: 2500,
    });

    const analysisText = openaiResponse.choices[0]?.message?.content;

    // Extract data points from the analysis and financial data
    const extractDataPoints = (text: string, stockData: any) => {
      const dataPoints: Array<{
        label: string;
        value: number;
        unit: string;
        type: 'revenue' | 'growth' | 'percentage' | 'ratio' | 'metric' | 'other';
        year?: number;
        period?: string;
      }> = [];

      // Extract from financial statements if available
      if (stockData.incomeStatements && stockData.incomeStatements.length > 0) {
        const incomeData = stockData.incomeStatements;
        
        // Extract specific financial metrics
        incomeData.forEach((statement: any) => {
          if (statement.operatingExpenses) {
            dataPoints.push({
              label: `Operating Expenses ${statement.date ? statement.date.substring(0, 4) : ''}`,
              value: statement.operatingExpenses / 1000000000, // Convert to billions
              unit: 'billion',
              type: 'metric',
              year: statement.date ? parseInt(statement.date.substring(0, 4)) : undefined,
              period: statement.date ? statement.date.substring(0, 4) : undefined
            });
          }
          
          if (statement.costAndExpenses) {
            dataPoints.push({
              label: `Cost and Expenses ${statement.date ? statement.date.substring(0, 4) : ''}`,
              value: statement.costAndExpenses / 1000000000, // Convert to billions
              unit: 'billion',
              type: 'metric',
              year: statement.date ? parseInt(statement.date.substring(0, 4)) : undefined,
              period: statement.date ? statement.date.substring(0, 4) : undefined
            });
          }
          
          if (statement.interestIncome) {
            dataPoints.push({
              label: `Interest Income ${statement.date ? statement.date.substring(0, 4) : ''}`,
              value: statement.interestIncome / 1000000000, // Convert to billions
              unit: 'billion',
              type: 'metric',
              year: statement.date ? parseInt(statement.date.substring(0, 4)) : undefined,
              period: statement.date ? statement.date.substring(0, 4) : undefined
            });
          }
          
          if (statement.interestExpense) {
            dataPoints.push({
              label: `Interest Expense ${statement.date ? statement.date.substring(0, 4) : ''}`,
              value: statement.interestExpense / 1000000000, // Convert to billions
              unit: 'billion',
              type: 'metric',
              year: statement.date ? parseInt(statement.date.substring(0, 4)) : undefined,
              period: statement.date ? statement.date.substring(0, 4) : undefined
            });
          }
          
          if (statement.netIncome) {
            dataPoints.push({
              label: `Net Income ${statement.date ? statement.date.substring(0, 4) : ''}`,
              value: statement.netIncome / 1000000000, // Convert to billions
              unit: 'billion',
              type: 'revenue',
              year: statement.date ? parseInt(statement.date.substring(0, 4)) : undefined,
              period: statement.date ? statement.date.substring(0, 4) : undefined
            });
          }
        });
      }

      // Extract from stock quote data
      if (stockData.quote) {
        const quote = stockData.quote;
        
        if (quote.price) {
          dataPoints.push({
            label: 'Current Stock Price',
            value: quote.price,
            unit: 'dollar',
            type: 'metric',
            period: 'Current'
          });
        }
        
        if (quote.marketCap) {
          dataPoints.push({
            label: 'Market Cap',
            value: quote.marketCap / 1000000000, // Convert to billions
            unit: 'billion',
            type: 'metric',
            period: 'Current'
          });
        }
        
        if (quote.change) {
          dataPoints.push({
            label: 'Price Change',
            value: quote.change,
            unit: 'percent',
            type: 'growth',
            period: 'Current'
          });
        }
      }

      // Also extract from AI text for any additional data points
      const patterns = [
        // Revenue patterns: $X.XB, $X.XM, $X.X billion, etc.
        {
          regex: /\$(\d+(?:\.\d+)?)\s*(B|M|billion|million|K|thousand)/gi,
          type: 'revenue' as const,
          unitMap: { 'B': 'billion', 'M': 'million', 'K': 'thousand', 'billion': 'billion', 'million': 'million', 'thousand': 'thousand' }
        },
        // Percentage patterns: X.X%, X.X percent
        {
          regex: /(\d+(?:\.\d+)?)\s*%/gi,
          type: 'percentage' as const,
          unitMap: { '%': 'percent' }
        },
        // Growth patterns: X.X% growth, increased by X.X%
        {
          regex: /(\d+(?:\.\d+)?)\s*%\s*(growth|increase|decrease|decline)/gi,
          type: 'growth' as const,
          unitMap: { '%': 'percent', 'growth': 'growth', 'increase': 'increase', 'decrease': 'decrease', 'decline': 'decline' }
        },
        // Ratio patterns: X.X ratio, X.Xx multiple
        {
          regex: /(\d+(?:\.\d+)?)\s*(ratio|multiple|x)/gi,
          type: 'ratio' as const,
          unitMap: { 'ratio': 'ratio', 'multiple': 'multiple', 'x': 'times' }
        },
        // Year patterns: 2023, 2022, etc.
        {
          regex: /(20\d{2})/g,
          type: 'other' as const,
          unitMap: { 'year': 'year' }
        }
      ];

      // Extract context around numbers
      const extractContext = (text: string, matchIndex: number, matchLength: number) => {
        const start = Math.max(0, matchIndex - 100);
        const end = Math.min(text.length, matchIndex + matchLength + 100);
        const context = text.substring(start, end);
        
        // Try to extract a meaningful label
        const lines = context.split('\n');
        for (const line of lines) {
          if (line.includes('$') || line.includes('%') || line.includes('ratio')) {
            // Clean up the line to create a label
            const cleanLine = line
              .replace(/[^\w\s]/g, ' ')
              .replace(/\s+/g, ' ')
              .trim()
              .substring(0, 50);
            return cleanLine;
          }
        }
        return 'Data Point';
      };

      // Process each pattern
      patterns.forEach(pattern => {
        let match;
        while ((match = pattern.regex.exec(text)) !== null) {
          const value = parseFloat(match[1]);
          const unit = match[2] || match[3] || match[4] || '';
          
          // Simple unit mapping
          let mappedUnit = unit;
          if (unit === 'B') mappedUnit = 'billion';
          else if (unit === 'M') mappedUnit = 'million';
          else if (unit === 'K') mappedUnit = 'thousand';
          else if (unit === '%') mappedUnit = 'percent';
          else if (unit === 'x') mappedUnit = 'times';
          
          // Extract context for label
          const label = extractContext(text, match.index, match[0].length);
          
          // Determine if it's a year
          let year: number | undefined;
          if (pattern.type === 'other' && /^20\d{2}$/.test(match[1])) {
            year = parseInt(match[1]);
          }

          dataPoints.push({
            label,
            value,
            unit: mappedUnit,
            type: pattern.type,
            year,
            period: year ? `${year}` : undefined
          });
        }
      });

      // Remove duplicates and sort by value
      const uniqueDataPoints = dataPoints.filter((point, index, self) => 
        index === self.findIndex(p => 
          p.value === point.value && p.label === point.label && p.type === point.type
        )
      );

      return uniqueDataPoints.sort((a, b) => b.value - a.value);
    };

    // Transform data points into visualization format
    const transformDataForVisualization = (stockData: any) => {
      const visualizationData: any = {};
      
      if (stockData.incomeStatements && stockData.incomeStatements.length > 0) {
        const incomeData = stockData.incomeStatements;
        
        // Initialize visualization data structure
        const metrics = ['operatingExpenses', 'costAndExpenses', 'interestIncome', 'interestExpense', 'netIncome'];
        
        metrics.forEach(metric => {
          visualizationData[metric] = [];
          
          incomeData.forEach((statement: any) => {
            if (statement[metric]) {
              visualizationData[metric].push({
                label: statement.date || 'Unknown',
                value: statement[metric]
              });
            }
          });
          
          // Sort by date (newest first)
          visualizationData[metric].sort((a: any, b: any) => new Date(b.label).getTime() - new Date(a.label).getTime());
        });
      }
      
      return visualizationData;
    };

    const dataPoints = extractDataPoints(analysisText || '', stockData);
    const visualizationData = transformDataForVisualization(stockData);

    return NextResponse.json({
      analysis: analysisText,
      stockData: stockData,
      question: question,
      symbol: extractedSymbol.toUpperCase(),
      model: openaiResponse.model,
      usage: openaiResponse.usage,
      dataTypes: {
        hasEarningsCalls: isEarningsCall,
        hasFinancialData: isFinancialData,
        hasCompanyInfo: isCompanyInfo,
        hasBasicData: true
      },
      dataPoints: dataPoints,
      visualizationData: visualizationData
    });

  } catch (error) {
    console.error("Stock Analysis Error:", error);
    return NextResponse.json(
      { error: "Failed to analyze stock data" },
      { status: 500 }
    );
  }
} 