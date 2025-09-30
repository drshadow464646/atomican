
'use server';
/**
 * @fileOverview A helper function to call the OpenRouter API with a fallback model.
 */

const PRIMARY_MODEL = "x-ai/grok-4-fast:free";
const FALLBACK_MODEL = "google/gemma-2-9b-it:free";

/**
 * Calls the OpenRouter API with a given prompt, attempting the primary model first
 * and falling back to the secondary model if the first call fails.
 * @param prompt The prompt to send to the model.
 * @returns The string content of the AI's response.
 * @throws An error if both model calls fail.
 */
export async function callOpenRouterWithFallback(prompt: string): Promise<string | null> {
    
  const attemptCall = async (model: string) => {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
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
        throw new Error(`API request to ${model} failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    return result.choices[0]?.message?.content || null;
  }

  try {
    // Attempt 1: Primary Model
    console.log(`Attempting to call primary model: ${PRIMARY_MODEL}`);
    return await attemptCall(PRIMARY_MODEL);
  } catch (error: any) {
    console.warn(`Primary model failed: ${error.message}. Attempting fallback.`);
    
    try {
      // Attempt 2: Fallback Model
      console.log(`Attempting to call fallback model: ${FALLBACK_MODEL}`);
      return await attemptCall(FALLBACK_MODEL);
    } catch (fallbackError: any) {
      console.error(`Fallback model also failed: ${fallbackError.message}`);
      // Throw the error from the FALLBACK model to see why it failed.
      throw fallbackError; 
    }
  }
}
