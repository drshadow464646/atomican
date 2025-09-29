
'use server';
/**
 * @fileOverview An AI flow to predict the outcome of a chemical reaction.
 * This has been refactored to use a direct API call for reliability.
 */
import { z } from 'zod';
import type { ReactionPrediction, Solution } from '@/lib/experiment';
import { ChemicalSchema, SolutionSchema } from '@/lib/experiment';
import { callOpenRouterWithFallback } from './openrouter-fallback';

const ReactionPredictionSchema = z.object({
  products: z.array(SolutionSchema).describe('The resulting solutions after the reaction. This should include unreacted chemicals and newly formed products.'),
  ph: z.number().describe('The final pH of the resulting mixture.'),
  color: z.string().describe("The final color of the solution as a CSS color string (e.g., 'hsl(300 100% 80% / 0.5)' or 'transparent')."),
  gasProduced: z.string().nullable().describe('The chemical formula of any gas produced (e.g., "CO2", "H2"), or null if no gas.'),
  precipitateFormed: z.string().nullable().describe('The name or formula of any solid precipitate formed, or null if none.'),
  isExplosive: z.boolean().describe('Whether the reaction is dangerously explosive.'),
  temperatureChange: z.number().describe('The change in temperature in Celsius. Positive for exothermic, negative for endothermic.'),
  description: z.string().describe('A brief, one-sentence chemical explanation of what happened in the reaction.'),
  equation: z.string().describe("A string representing the balanced chemical equation for the reaction, e.g., '2HCl + Ca(OH)₂ → CaCl₂ + 2H₂O'.")
});

export async function predictReaction(solutions: Solution[]): Promise<ReactionPrediction> {
  const reactantDesc = solutions.map(s => `${s.volume}ml of ${s.chemical.concentration ? `${s.chemical.concentration}M` : ''} ${s.chemical.name} (${s.chemical.formula})`).join(' and ');
  const prompt = `You are a chemistry expert AI. Predict the outcome of mixing the following solutions: ${reactantDesc}.

Your response MUST be only a valid JSON object that conforms to the following schema:
{
  "products": [{
    "chemical": {
      "id": "string (kebab-case)",
      "name": "string",
      "formula": "string",
      "type": "'acid' | 'base' | 'indicator' | 'salt' | 'solvent' | 'oxidant' | 'reductant' | 'other'",
      "concentration": "number (optional)"
    },
    "volume": "number (in ml)"
  }],
  "ph": "number (The final pH of the mixture.)",
  "color": "string (The final CSS color of the solution, e.g., 'hsl(300 100% 80% / 0.5)')",
  "gasProduced": "string | null (Formula of gas, e.g., 'CO2', or null.)",
  "precipitateFormed": "string | null (Name of precipitate, or null.)",
  "isExplosive": "boolean",
  "temperatureChange": "number (in Celsius)",
  "description": "string (A one-sentence chemical explanation.)",
  "equation": "string (The balanced chemical equation, e.g., 'HCl + NaOH → NaCl + H₂O'.)"
}

Consider acid-base neutralization, redox reactions, precipitation, and gas evolution. For indicators like phenolphthalein, calculate the color based on the final pH. The sum of product volumes must equal the sum of reactant volumes. If no reaction occurs, return the original solutions combined, with pH calculated for the mixture, and an equation like 'No Reaction'.`;

  try {
    const textResponse = await callOpenRouterWithFallback(prompt);

    if (!textResponse) {
      throw new Error("The AI returned an empty response from both models.");
    }
    
    const parsedOutput = JSON.parse(textResponse);
    const validation = ReactionPredictionSchema.safeParse(parsedOutput);

    if (!validation.success) {
      console.error("Zod validation error (Reaction Prediction):", validation.error.errors);
      throw new Error("AI returned data in an unexpected format.");
    }

    return validation.data;

  } catch (error: any) {
    console.error("Error predicting reaction:", error);
    // Return a "no reaction" state on error
    const totalVolume = solutions.reduce((acc, s) => acc + s.volume, 0);
    return {
      products: [{chemical: {id: 'error', name: 'Error', formula: 'Error', type: 'other'}, volume: totalVolume}],
      ph: 7,
      color: 'hsl(0 100% 50% / 0.3)',
      gasProduced: null,
      precipitateFormed: null,
      isExplosive: false,
      temperatureChange: 0,
      description: `An error occurred while predicting the reaction: ${error.message}`,
      equation: 'Error',
    };
  }
}
