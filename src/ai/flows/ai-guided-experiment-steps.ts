
'use server';
/**
 * @fileOverview Provides AI-driven generation of experiment steps for a virtual chemistry lab.
 *
 * - generateExperimentSteps - A function that creates a step-by-step procedure for a given experiment goal.
 * - GenerateExperimentStepsInput - The input type for the generateExperimentSteps function.
 * - GenerateExperimentStepsOutput - The return type for the generateExperimentSteps function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { gemini15Pro } from '@genkit-ai/googleai';

const GenerateExperimentStepsInputSchema = z.object({
  goal: z.string().describe('The overall goal of the chemistry experiment the user wants to perform.'),
});
export type GenerateExperimentStepsInput = z.infer<typeof GenerateExperimentStepsInputSchema>;

const GenerateExperimentStepsOutputSchema = z.object({
  title: z.string().describe('A concise title for the experiment.'),
  steps: z.array(z.string()).describe('A list of step-by-step instructions to complete the experiment.'),
  requiredChemicals: z.array(z.object({
    name: z.string().describe("The name of the chemical."),
    amount: z.string().describe("The amount and concentration, e.g., '100 mL of 0.1M'"),
  })).describe('A list of required chemicals for this experiment.'),
  requiredApparatus: z.array(z.object({
      name: z.string().describe("The name of the apparatus."),
      quantity: z.number().describe("The number of this item required."),
  })).describe('A list of required apparatus for this experiment.'),
});
export type GenerateExperimentStepsOutput = z.infer<typeof GenerateExperimentStepsOutputSchema>;

export async function generateExperimentSteps(input: GenerateExperimentStepsInput): Promise<GenerateExperimentStepsOutput> {
  return experimentStepsGenerationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'experimentStepsGenerationPrompt',
  input: {schema: GenerateExperimentStepsInputSchema},
  output: {
    schema: GenerateExperimentStepsOutputSchema,
    format: 'json',
  },
  model: gemini15Pro,
  prompt: `You are a virtual chemistry lab assistant. The user will provide a goal for an experiment.
Your task is to generate a clear, concise, step-by-step procedure to achieve this goal in a virtual lab setting.

Experiment Goal: {{{goal}}}

Your response MUST be in a JSON format that adheres to the specified output schema.
Generate a suitable title, a list of required chemicals (including name and amount), a list of required apparatus (including name and quantity), and the procedural steps.
The steps should be simple, direct, and easy to follow.

Example JSON output structure:
{
  "title": "Titration of HCl with NaOH",
  "requiredApparatus": [
    { "name": "Burette (50ml)", "quantity": 1 },
    { "name": "Beaker (250ml)", "quantity": 1 },
    { "name": "Pipette (10ml)", "quantity": 1 }
  ],
  "requiredChemicals": [
    { "name": "Hydrochloric Acid", "amount": "25 mL of 0.1M" },
    { "name": "Sodium Hydroxide", "amount": "50 mL of 0.1M" },
    { "name": "Phenolphthalein", "amount": "2-3 drops" }
  ],
  "steps": [
    "Clean all glassware with distilled water.",
    "Use the pipette to add 25mL of 0.1M HCl to the 250mL beaker.",
    "Add 2-3 drops of phenolphthalein indicator to the beaker.",
    "Fill the burette with 0.1M NaOH solution, ensuring the tip is free of air bubbles.",
    "Record the initial volume of the NaOH in the burette.",
    "Slowly add the NaOH from the burette to the beaker while swirling until a faint pink color persists.",
    "Record the final volume of the NaOH in the burette.",
    "Calculate the volume of NaOH used and determine the concentration of the acid."
  ]
}
`,
});

const experimentStepsGenerationFlow = ai.defineFlow(
  {
    name: 'experimentStepsGenerationFlow',
    inputSchema: GenerateExperimentStepsInputSchema,
    outputSchema: GenerateExperimentStepsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
