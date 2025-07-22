import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const symbol = searchParams.get("symbol");

    if (!symbol) {
      return NextResponse.json({ error: "Symbol is required" }, { status: 400 });
    }

    const apiKey = process.env.NEXT_PUBLIC_FMP_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "FMP API key not configured" }, { status: 500 });
    }

    const response = await fetch(
      `https://financialmodelingprep.com/api/v3/quote/${symbol}?apikey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`FMP API responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("FMP API Error:", error);
    return NextResponse.json(
      { error: "Failed to get quote from FMP" },
      { status: 500 }
    );
  }
} 