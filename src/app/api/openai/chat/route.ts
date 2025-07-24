import { OpenAI } from "openai";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const { message, model = "gpt-4o" } = await request.json();

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY ||process.env.NEXT_PUBLIC_OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: message }],
    });

    return NextResponse.json({
      response: response.choices[0]?.message?.content,
      model: response.model,
      usage: response.usage,
    });
  } catch (error) {
    console.error("OpenAI API Error:", error);
    return NextResponse.json(
      { error: "Failed to get response from OpenAI" },
      { status: 500 }
    );
  }
} 