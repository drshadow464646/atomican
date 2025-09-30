
'use server';
/**
 * @fileOverview A helper function to call the OpenRouter API with a fallback API key.
 */

const MODEL_TO_USE = "x-ai/grok-4-fast:free";

/**
 * Calls the OpenRouter API with a given prompt, cycling through available API keys
 * if rate-limiting or other errors occur.
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
    
  let lastError: any = null;

  for (let i = 0; i < apiKeys.length; i++) {
    const apiKey = apiKeys[i];
    try {
      console.log(`Attempting API call with key #${i + 1}`);
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
        // This will be caught by the catch block below and trigger a retry with the next key.
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // If successful, return the content and exit the loop.
      return result.choices[0]?.message?.content || null;

    } catch (error) {
      lastError = error;
      console.warn(`API key #${i + 1} failed: ${error.message}.`);
      // The loop will continue to the next key.
    }
  }
  
  // If the loop completes without a successful return, it means all keys failed.
  console.error("All API key attempts failed.");
  throw lastError; // Throw the last recorded error.
}
