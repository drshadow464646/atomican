
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
  You MUST use the user's query to find matching chemicals from a comprehensive catalog.
  Return a list of 5-10 chemicals that are a direct match for the query.

  **User Search Query:** {{input}}

  Filter your results based on this query. For example, if the query is "Thulium(III) chloride", you should return "Thulium(III) chloride" and related compounds, not Hydrochloric Acid.
  For each chemical, provide a unique ID (e.g. "thulium-iii-chloride"), its common name, chemical formula, its general type, and concentration if it's a solution.
  `,
});

const chemicalSearchFlow = ai.defineFlow(
  {
    name: 'chemicalSearchFlow',
    inputSchema: z.string(),
    outputSchema: ChemicalSearchOutputSchema,
  },
  async (query) => {
    const { output } = await prompt(query);
    if (!output) {
        return { chemicals: [] };
    }
    return output;
  }
);
