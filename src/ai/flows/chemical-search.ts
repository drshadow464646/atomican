
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
  prompt: `You are an expert chemist and act as a comprehensive chemical database and supplier's search engine.
  You have access to a vast catalog of chemicals, including core reagents, specialty reagents, and analytical standards.
  A user will provide a search query for a chemical.
  The query could be a name (common or IUPAC), formula, CAS number, or a general category (e.g., "strong acids", "deuterated solvents", "chiral auxiliaries").
  
  Based on the user's query, return a list of 5-10 highly relevant chemicals from your catalog.
  For each chemical, provide a unique ID (a simple lowercase, url-safe slug is fine, e.g. "hydrochloric-acid"), its common name, chemical formula, its general type, and a typical concentration if it's commonly sold as a solution.
  Ensure the results are accurate and diverse, reflecting the breadth of a real-world chemical supplier.

  User Search Query: {{{input}}}
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
