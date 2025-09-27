
'use server';
/**
 * @fileOverview An AI flow to search for laboratory apparatus.
 *
 * - searchApparatus - A function that searches for apparatus based on a query.
 * - ApparatusSearchOutput - The return type for the searchApparatus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import type { Equipment } from '@/lib/experiment';

// Define the shape of a single apparatus item in the search results
const ApparatusSchema = z.object({
  id: z.string().describe('A unique lowercase, kebab-case identifier for the equipment, e.g., "erlenmeyer-flask-250ml".'),
  name: z.string().describe('The common name of the equipment, including size if applicable, e.g., "Erlenmeyer Flask (250ml)".'),
  type: z.enum(['beaker', 'burette', 'pipette', 'graduated-cylinder', 'erlenmeyer-flask', 'volumetric-flask', 'test-tube', 'funnel', 'heating', 'measurement', 'other', 'glassware', 'vacuum', 'safety']).describe('The general category of the equipment.'),
  volume: z.number().optional().describe('The capacity of the equipment in milliliters (ml), if applicable.'),
  description: z.string().describe('A brief, one-sentence description of the equipment and its primary use.'),
});

// The output of the flow will be an array of these apparatus items
const ApparatusSearchOutputSchema = z.array(ApparatusSchema);
export type ApparatusSearchOutput = z.infer<typeof ApparatusSearchOutputSchema>;

// This is the main exported function that the server action will call.
export async function searchApparatus(query: string): Promise<ApparatusSearchOutput> {
  return apparatusSearchFlow(query);
}

// Define the prompt for the AI model
const apparatusSearchPrompt = ai.definePrompt({
  name: 'apparatusSearchPrompt',
  input: { schema: z.string() },
  output: { schema: ApparatusSearchOutputSchema, format: 'json' },
  prompt: `You are a laboratory supply catalog AI. A user is searching for equipment.
Based on the user's query: "{{input}}", generate a list of 5 to 10 relevant pieces of laboratory equipment.

For each piece of equipment, provide its ID, name, type, an optional volume, and a description.
Ensure the 'type' field is one of the allowed values.
Prioritize common and essential lab equipment that would be found in a typical chemistry lab. If the query is generic, list common items.
Your response must be a valid JSON array.`,
});

// Define the Genkit flow that orchestrates the AI call
const apparatusSearchFlow = ai.defineFlow(
  {
    name: 'apparatusSearchFlow',
    inputSchema: z.string(),
    outputSchema: ApparatusSearchOutputSchema,
  },
  async (query) => {
    const { output } = await apparatusSearchPrompt(query, { model: 'x-ai/grok-4-fast:free' });
    
    // The output should already be parsed JSON, but we handle the case where it might be null.
    if (!output) {
      console.error("Apparatus search returned no output.");
      return [];
    }
    
    return output;
  }
);
