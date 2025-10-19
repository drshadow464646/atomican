
'use server';
/**
 * @fileOverview A helper function to call the OpenRouter API with a fallback model and API key.
 */

const MODELS_TO_TRY = [
  "z-ai/glm-4.5-air:free",
  "cognitivecomputations/dolphin-mistral-24b-venice-edition:free",
];

/**
 * Calls the OpenRouter API with a given prompt, cycling through available models and API keys
 * if rate-limiting or other errors occur.
 * @param prompt The prompt to send to the model.
 * @returns The string content of the AI's response.
 * @throws An error if all attempts fail.
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

  // We will try each model with the corresponding key.
  // If there are more models than keys, the last key will be reused.
  for (let i = 0; i < MODELS_TO_TRY.length; i++) {
    const model = MODELS_TO_TRY[i];
    // Use the corresponding key, or the last available key if we run out.
    const apiKey = apiKeys[Math.min(i, apiKeys.length - 1)];

    try {
      console.log(`Attempting API call with model: ${model} and key #${Math.min(i, apiKeys.length - 1) + 1}`);
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: model,
          messages: [{ role: "user", content: prompt }],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API request failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      // If successful, return the content and exit the loop.
      return result.choices[0]?.message?.content || null;

    } catch (error) {
      lastError = error;
      console.warn(`Attempt with model ${model} failed: ${error.message}.`);
      // The loop will continue to the next model/key combination.
    }
  }
  
  // If the loop completes without a successful return, it means all attempts failed.
  console.error("All API model/key attempts failed.");
  throw lastError; // Throw the last recorded error.
}
