"use client";

import { useEffect } from "react";
import { ChatOpenAI } from "@langchain/openai";

export default function LangChainTest() {
  useEffect(() => {
    const testLangChain = async () => {

      try {
        const model = new ChatOpenAI({
          apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || "",
          modelName: "gpt-4o",
        });

        const response = await model.invoke("What is 2 + 2?");
        console.log("LangChain Response:", response.content);
      } catch (error) {
        console.error("LangChain Error:", error);
      }
    };

    testLangChain();
  }, []);

  return (
    <div className="p-4 border rounded">
      <h3 className="text-lg font-semibold mb-2">LangChain Test</h3>
      <p className="text-sm text-gray-600">
        Check the browser console for the LangChain response.
      </p>
    </div>
  );
} 