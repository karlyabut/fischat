interface OpenAIUsage {
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface OpenAIResponse {
  response: string;
  model: string;
  usage: OpenAIUsage;
}

export async function sendMessage(message: string, model: string = "gpt-4o"): Promise<OpenAIResponse> {
  const response = await fetch("/api/openai/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message, model }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  return response.json();
} 