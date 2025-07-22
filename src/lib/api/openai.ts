export interface OpenAIResponse {
  response: string;
  model: string;
  usage: any;
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