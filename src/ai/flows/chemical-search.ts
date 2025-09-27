
'use server';
/**
 * @fileOverview An AI flow to search for laboratory chemicals.
 *
 * - searchChemicals - A function that searches for chemicals based on a query.
 * - ChemicalSearchOutput - The return type for the searchChemicals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Define the shape of a single chemical item in the search results
const ChemicalSchema = z.object({
  id: z.string().describe('A unique lowercase, kebab-case identifier for the chemical, e.g., "hydrochloric-acid".'),
  name: z.string().describe('The common name of the chemical, e.g., "Hydrochloric Acid".'),
  formula: z.string().describe('The chemical formula, e.g., "HCl". Use Unicode subscripts where appropriate.'),
  type: z.enum(['acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other']).describe('The general category of the chemical.'),
  concentration: z.number().optional().describe('The molarity of the solution (mol/L), if it is a solution.'),
});

// The output of the flow will be an array of these chemical items
const ChemicalSearchOutputSchema = z.array(ChemicalSchema);
export type ChemicalSearchOutput = z.infer<typeof ChemicalSearchOutputSchema>;

// This is the main exported function that the server action will call.
export async function searchChemicals(query: string): Promise<ChemicalSearchOutput> {
  return chemicalSearchFlow(query);
}

// Define the prompt for the AI model
const chemicalSearchPrompt = ai.definePrompt({
  name: 'chemicalSearchPrompt',
  input: { schema: z.string() },
  output: { schema: ChemicalSearchOutputSchema, format: 'json' },
  prompt: `You are a chemical supply catalog AI. A user is searching for a chemical.
Based on the user's query: "{{input}}", generate a list of 5 to 10 relevant chemicals.

For each chemical, provide its ID, name, formula, type, and an optional concentration.
Ensure the 'type' field is one of the allowed values.
If the query is generic (e.g., "strong acid"), list common examples.
If it is a solution, provide a common concentration (e.g., 0.1M).
Your response must be a valid JSON array.`,
});

// Define the Genkit flow that orchestrates the AI call
const chemicalSearchFlow = ai.defineFlow(
  {
    name: 'chemicalSearchFlow',
    inputSchema: z.string(),
    outputSchema: ChemicalSearchOutputSchema,
  },
  async (query) => {
    const { output } = await chemicalSearchPrompt(query, { model: 'x-ai/grok-4-fast:free' });
    
    // The output should already be parsed JSON, but we handle the case where it might be null.
    if (!output) {
      console.error("Chemical search returned no output.");
      return [];
    }
    
    return output;
  }
);
