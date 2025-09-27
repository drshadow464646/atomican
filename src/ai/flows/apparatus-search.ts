
'use server';
/**
 * @fileOverview An AI flow to search for laboratory apparatus.
 * This has been refactored to use a direct API call for reliability.
 */
import { z } from 'zod';

const ApparatusSchema = z.object({
  id: z.string().describe('A unique lowercase, kebab-case identifier for the equipment, e.g., "erlenmeyer-flask-250ml".'),
  name: z.string().describe('The common name of the equipment, including size if applicable, e.g., "Erlenmeyer Flask (250ml)".'),
  type: z.enum(['beaker', 'burette', 'pipette', 'graduated-cylinder', 'erlenmeyer-flask', 'volumetric-flask', 'test-tube', 'funnel', 'heating', 'measurement', 'other', 'glassware', 'vacuum', 'safety']).describe('The general category of the equipment.'),
  volume: z.number().optional().describe('The capacity of the equipment in milliliters (ml), if applicable.'),
  description: z.string().describe('A brief, one-sentence description of the equipment and its primary use.'),
});

const ApparatusSearchOutputSchema = z.array(ApparatusSchema);
export type ApparatusSearchOutput = z.infer<typeof ApparatusSearchOutputSchema>;

export async function searchApparatus(query: string): Promise<ApparatusSearchOutput> {
  const prompt = `You are a laboratory supply catalog AI. A user is searching for equipment with the query: "${query}".
Generate a list of 5 to 10 relevant pieces of laboratory equipment.

Your response MUST be only a valid JSON object that conforms to the following schema, where the top-level key is "equipment":
{ "equipment": Array<{
  id: string (lowercase, kebab-case identifier, e.g., "erlenmeyer-flask-250ml"),
  name: string (common name, e.g., "Erlenmeyer Flask (250ml)"),
  type: 'beaker' | 'burette' | 'pipette' | 'graduated-cylinder' | 'erlenmeyer-flask' | 'volumetric-flask' | 'test-tube' | 'funnel' | 'heating' | 'measurement' | 'other' | 'glassware' | 'vacuum' | 'safety',
  volume?: number (capacity in ml, if applicable),
  description: string (a brief one-sentence description)
}>}

Prioritize common and essential lab equipment. If the query is generic, list common items.
Do not include any other text, markdown formatting, or explanations.`;

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
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API Error (Apparatus Search):", errorText);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const result = await response.json();
    const textResponse = result.choices[0]?.message?.content;
    
    if (!textResponse) {
      throw new Error("The AI returned an empty response.");
    }
    
    const parsedOutput = JSON.parse(textResponse);
    
    // The prompt now requests a specific key "equipment"
    const dataArray = parsedOutput.equipment;

    if (!Array.isArray(dataArray)) {
        throw new Error("AI returned a JSON object, but the 'equipment' array was not found inside it.");
    }

    const validation = ApparatusSearchOutputSchema.safeParse(dataArray);
    if (!validation.success) {
      console.error("Zod validation error (Apparatus Search):", validation.error.errors);
      throw new Error("AI returned data in an unexpected format.");
    }

    return validation.data;

  } catch (error: any) {
    console.error("Error searching apparatus:", error);
    return []; // Return an empty array on error to prevent crashing the UI
  }
}
