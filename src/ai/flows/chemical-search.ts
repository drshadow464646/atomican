
'use server';
/**
 * @fileOverview An AI flow to search for laboratory chemicals.
 * This has been refactored to use a direct API call for reliability.
 */
import { z } from 'zod';
import { callOpenRouterWithFallback } from './openrouter-fallback';

const ChemicalSchema = z.object({
  id: z.string().describe('A unique lowercase, kebab-case identifier for the chemical, e.g., "hydrochloric-acid".'),
  name: z.string().describe('The common name of the chemical, e.g., "Hydrochloric Acid".'),
  formula: z.string().describe('The chemical formula, e.g., "HCl". Use Unicode subscripts where appropriate.'),
  type: z.enum(['acid', 'base', 'indicator', 'salt', 'solvent', 'oxidant', 'reductant', 'other']).describe('The general category of the chemical.'),
  concentration: z.number().optional().describe('The molarity of the solution (mol/L), if it is a solution.'),
});

const ChemicalSearchOutputSchema = z.array(ChemicalSchema);
export type ChemicalSearchOutput = z.infer<typeof ChemicalSearchOutputSchema>;

export async function searchChemicals(query: string): Promise<ChemicalSearchOutput> {
  const prompt = `You are a chemical supply catalog AI. A user is searching for a chemical with the query: "${query}".
Generate a list of 5 to 10 relevant chemicals.

Your response MUST be only a valid JSON object that conforms to the following schema, with "chemicals" as the top-level key:
{ "chemicals": Array<{
  id: string (lowercase, kebab-case identifier, e.g., "hydrochloric-acid"),
  name: string (common name, e.g., "Hydrochloric Acid"),
  formula: string (chemical formula, e.g., "HCl"),
  type: 'acid' | 'base' | 'indicator' | 'salt' | 'solvent' | 'oxidant' | 'reductant' | 'other',
  concentration?: number (molarity in mol/L, if applicable)
}>}

If the query is generic (e.g., "strong acid"), list common examples. If it is a solution, provide a common concentration (e.g., 0.1).
Do not include any other text, markdown formatting, or explanations.`;
  
  try {
    const textResponse = await callOpenRouterWithFallback(prompt);
    
    if (!textResponse) {
      throw new Error("The AI returned an empty response from both models.");
    }
    
    const parsedOutput = JSON.parse(textResponse);
    
    const dataArray = parsedOutput.chemicals || parsedOutput;

    if (!Array.isArray(dataArray)) {
        throw new Error("AI returned a JSON object, but the 'chemicals' array was not found inside it.");
    }

    const validation = ChemicalSearchOutputSchema.safeParse(dataArray);
    if (!validation.success) {
      console.error("Zod validation error (Chemical Search):", validation.error.errors);
      throw new Error("AI returned data in an unexpected format.");
    }

    return validation.data;

  } catch (error: any) {
    console.error("Error searching chemicals:", error);
    return []; // Return an empty array on error to prevent crashing the UI
  }
}
