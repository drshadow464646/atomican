
'use server';
/**
 * @fileOverview A flow for searching for lab apparatus using an AI model.
 *
 * - searchApparatus - A function that searches for apparatus based on a query.
 * - ApparatusSearchOutput - The return type for the searchApparatus function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';

const EquipmentSchema = z.object({
  id: z.string().describe('A unique identifier for the equipment, e.g., "beaker-250ml".'),
  name: z.string().describe('The common name of the equipment.'),
  type: z.enum(['beaker', 'burette', 'pipette', 'graduated-cylinder', 'erlenmeyer-flask', 'volumetric-flask', 'test-tube', 'funnel', 'heating', 'measurement', 'microscopy', 'other']).describe('The general category of the equipment.'),
  volume: z.number().optional().describe('The capacity in milliliters (ml) if applicable.'),
  description: z.string().describe('A brief description of the equipment and its primary use.'),
});

const ApparatusSearchOutputSchema = z.object({
  equipment: z.array(EquipmentSchema).describe('A list of lab apparatus that match the search query.'),
});

export type ApparatusSearchOutput = z.infer<typeof ApparatusSearchOutputSchema>;

export async function searchApparatus(query: string): Promise<ApparatusSearchOutput> {
  return apparatusSearchFlow(query);
}

const prompt = ai.definePrompt({
  name: 'apparatusSearchPrompt',
  input: { schema: z.string() },
  output: { schema: ApparatusSearchOutputSchema },
  prompt: `You are an expert lab technician acting as a laboratory equipment catalog search engine.
  A user will provide a search query. This could be a name (e.g., "beaker"), a function (e.g., "heating"), or a general category (e.g., "glassware").
  You MUST use the user's query to find matching laboratory apparatus from a comprehensive catalog.
  Return a list of 5-10 pieces of equipment that are a direct match for the query.

  **User Search Query:** {{input}}

  Filter your results based on this query. For each piece of equipment, provide a unique ID, its common name, its general type, its volume/capacity if applicable, and a brief description of its use.
  `,
});

const apparatusSearchFlow = ai.defineFlow(
  {
    name: 'apparatusSearchFlow',
    inputSchema: z.string(),
    outputSchema: ApparatusSearchOutputSchema,
  },
  async (query) => {
    try {
      const { output } = await prompt(query);
      if (!output) {
          return { equipment: [] };
      }
      return output;
    } catch (error) {
      console.error('Apparatus search flow failed:', error);
      return { equipment: [] };
    }
  }
);
