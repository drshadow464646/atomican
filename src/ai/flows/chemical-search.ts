
'use server';
/**
 * @fileOverview A flow for searching for chemicals using an AI model.
 *
 * - searchChemicals - A function that searches for chemicals based on a query.
 * - ChemicalSearchOutput - The return type for the searchChemicals function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const ChemicalSchema = z.object({
    id: z.string().describe('A unique identifier for the chemical, e.g., CAS number or a simple slug.'),
    name: z.string().describe('The common name of the chemical.'),
    formula: z.string().describe('The chemical formula.'),
    type: z.enum(['acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other']).describe('The general type or category of the chemical.'),
    concentration: z.number().optional().describe('The molarity (mol/L) of the chemical if it is a solution.'),
});

const ChemicalSearchOutputSchema = z.object({
  chemicals: z.array(ChemicalSchema).describe('A list of chemicals that match the search query.'),
});

export type ChemicalSearchOutput = z.infer<typeof ChemicalSearchOutputSchema>;

export async function searchChemicals(query: string): Promise<ChemicalSearchOutput> {
  return chemicalSearchFlow(query);
}

const prompt = ai.definePrompt({
  name: 'chemicalSearchPrompt',
  input: { schema: z.string() },
  output: { schema: ChemicalSearchOutputSchema },
  prompt: `You are an expert chemist acting as a chemical database search engine.
A user will provide a search query. This could be a name (common or IUPAC), formula, CAS number, or a general category.

**IMPORTANT RULE:** You MUST use the user's query to find matching chemicals from a comprehensive catalog.
You MUST ONLY return chemicals that are a direct match for the user's search query.
If the user query is "copper sulphate", you should return "Copper(II) Sulfate", not Sodium Chloride.
If the user query is "strong acids", you must return a list of strong acids like HCl, H2SO4, etc.
If the user query is for "common lab chemicals", you can return a general list of common chemicals.
If no chemicals match the query, you MUST return an empty list.

**User Search Query:** {{input}}

For each chemical, provide a unique ID (e.g., "copper-ii-sulfate"), its common name, chemical formula, its general type, and concentration if it's a solution.
Return a list of 5-10 relevant results.
`,
});

const chemicalSearchFlow = ai.defineFlow(
  {
    name: 'chemicalSearchFlow',
    inputSchema: z.string(),
    outputSchema: ChemicalSearchOutputSchema,
  },
  async (query) => {
    try {
      const { output } = await prompt(query);
      if (!output) {
          console.log('AI returned no output, returning empty list.');
          return { chemicals: [] };
      }
      return output;
    } catch (error) {
      console.error('Chemical search flow failed:', error);
      // On error, return an empty list to prevent the app from crashing.
      return { chemicals: [] };
    }
  }
);
