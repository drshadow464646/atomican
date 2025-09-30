
'use server';
/**
 * @fileOverview An AI flow to search for laboratory apparatus.
 * This has been refactored to use a direct API call for reliability.
 */
import { z } from 'zod';
import { callOpenRouterWithFallback } from './openrouter-fallback';

const ApparatusSchema = z.object({
  id: z.string().describe('A unique lowercase, kebab-case identifier for the equipment, e.g., "erlenmeyer-flask-250ml".'),
  name: z.string().describe('The common name of the equipment, including size if applicable, e.g., "Erlenmeyer Flask (250ml)".'),
  type: z.enum(['beaker', 'burette', 'pipette', 'graduated-cylinder', 'erlenmeyer-flask', 'volumetric-flask', 'test-tube', 'heating', 'measurement', 'other', 'glassware', 'vacuum', 'safety', 'thermometer', 'ph-meter', 'stand', 'clamp']).describe('The general category of the equipment.'),
  volume: z.number().optional().describe('The capacity of the equipment in milliliters (ml), if applicable.'),
  description: z.string().describe('A brief, one-sentence description of the equipment and its primary use.'),
});

const ApparatusSearchOutputSchema = z.array(ApparatusSchema);
export type ApparatusSearchOutput = z.infer<typeof ApparatusSearchOutputSchema>;

export async function searchApparatus(query: string): Promise<ApparatusSearchOutput> {
  const prompt = `You are a laboratory supply catalog AI. A user is searching for equipment with the query: "${query}".
Generate a list of 5 to 10 relevant pieces of laboratory equipment.

Your response MUST be only a valid JSON object. The JSON can either be an array of equipment items, or an object with a single key "equipment" which contains the array of items. The schema for each item in the array is:
{
  id: string (lowercase, kebab-case identifier, e.g., "erlenmeyer-flask-250ml"),
  name: string (common name, e.g., "Erlenmeyer Flask (250ml)"),
  type: 'beaker' | 'burette' | 'pipette' | 'graduated-cylinder' | 'erlenmeyer-flask' | 'volumetric-flask' | 'test-tube' | 'heating' | 'measurement' | 'other' | 'glassware' | 'vacuum' | 'safety' | 'thermometer' | 'ph-meter' | 'stand' | 'clamp',
  volume?: number (capacity in ml, if applicable),
  description: string (a brief one-sentence description)
}

Prioritize common and essential lab equipment. If the query is generic, list common items.
Do not include any other text, markdown formatting, or explanations.`;

  try {
    const textResponse = await callOpenRouterWithFallback(prompt);
    
    if (!textResponse) {
      throw new Error("The AI returned an empty response from both models.");
    }
    
    const parsedOutput = JSON.parse(textResponse);
    
    // The AI might return an array directly, or an object with an "equipment" key.
    // This handles both cases safely.
    const dataArray = Array.isArray(parsedOutput) ? parsedOutput : parsedOutput.equipment;

    if (!Array.isArray(dataArray)) {
        throw new Error("AI returned a JSON object, but the expected array was not found inside it.");
    }

    const validation = ApparatusSearchOutputSchema.safeParse(dataArray);
    if (!validation.success) {
      console.error("Zod validation error (Apparatus Search):", validation.error.errors);
      throw new Error("AI returned data in an unexpected format.");
    }

    // Add types that might be missing from the AI response
    return validation.data.map(item => ({
        ...item,
        type: item.type || 'other'
    }));


  } catch (error: any) {
    console.error("Error searching apparatus:", error);
    return []; // Return an empty array on error to prevent crashing the UI
  }
}
