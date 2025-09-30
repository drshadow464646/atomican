
'use server';
/**
 * @fileOverview A helper function to call the OpenRouter API with a fallback API key.
 */

const MODEL_TO_USE = "x-ai/grok-4-fast:free";

/**
 * Calls the OpenRouter API with a given prompt, attempting the primary API key first
 * and falling back to the secondary API key if the first call fails.
 * @param prompt The prompt to send to the model.
 * @returns The string content of the AI's response.
 * @throws An error if all API key attempts fail.
 */
export async function callOpenRouterWithFallback(prompt: string): Promise<string | null> {
    
  const apiKeys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_2,
  ].filter((key): key is string => !!key);

  if (apiKeys.length === 0) {
    throw new Error("No OpenRouter API key found in environment variables.");
  }
    
  const attemptCall = async (apiKey: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL_TO_USE,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || null;
  }

  let lastError: any = null;

  for (let i = 0; i < apiKeys.length; i++) {
    try {
      console.log(`Attempting API call with key #${i + 1}`);
      return await attemptCall(apiKeys[i]);
    } catch (error) {
      lastError = error;
      console.warn(`API key #${i + 1} failed: ${error.message}.`);
    }
  }
  
  console.error("All API key attempts failed.");
  throw lastError; // Throw the last error received
}
