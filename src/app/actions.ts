
'use server';

import type { GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

/**
 * Executes a direct API call to OpenRouter to generate experiment steps.
 * This bypasses the Genkit flow for greater reliability with the OpenRouter API.
 * @param goal The user's goal for the experiment.
 * @returns The generated experiment steps.
 */
export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
  const prompt = `You are a helpful chemistry lab assistant. Your role is to take a user's goal and generate a clear, concise, and safe experimental procedure. The user wants to: "${goal}".

You must provide a valid JSON object that conforms to the following schema:
- title: string (A short, descriptive title for the experiment.)
- requiredApparatus: Array<{name: string, quantity: number}> (A list of all laboratory equipment required for the experiment, with specific sizes like "250ml Beaker".)
- requiredChemicals: Array<{name: string, amount: string}> (A list of all chemicals and reagents required, with concentrations like "0.1M HCl".)
- steps: Array<string> (A step-by-step procedure for conducting the experiment.)

Prioritize safety and clarity in the procedure. Do not include any steps for cleaning up.

IMPORTANT: Your output MUST be only the JSON object, with no other text, markdown formatting, or explanations.`;

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "x-ai/grok-4-fast:free",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error:", errorText);
      throw new Error(`API request failed with status ${response.status}: ${errorText}`);
    }

    const result = await response.json();
    const textResponse = result.choices[0]?.message?.content;

    if (!textResponse) {
      throw new Error("The AI returned an empty response.");
    }
    
    // The model might still wrap the JSON in markdown, so we need to extract it.
    const jsonMatch = textResponse.match(/```json\n([\s\S]*?)\n```|({[\s\S]*})/);
    if (!jsonMatch) {
      console.error("Raw AI response:", textResponse);
      throw new Error("The AI returned a response that was not valid JSON.");
    }

    const jsonString = jsonMatch[1] || jsonMatch[2];
    const parsedOutput = JSON.parse(jsonString);

    // Here you might want to add Zod validation if you still need it
    // For now, we'll trust the structure.
    return parsedOutput as GenerateExperimentStepsOutput;

  } catch (error: any) {
    console.error("Error generating procedure:", error);
    return {
      title: 'Error Generating Procedure',
      requiredApparatus: [],
      requiredChemicals: [],
      steps: [
        'An error occurred while generating the procedure. Details below:',
        error.message || 'An unknown error occurred.',
      ],
    };
  }
}
