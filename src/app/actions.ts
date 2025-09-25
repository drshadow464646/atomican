'use server';

import { generateExperimentSteps, GenerateExperimentStepsInput, GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
    const input: GenerateExperimentStepsInput = {
        goal,
    };

    try {
        const procedure = await generateExperimentSteps(input);
        // Ensure the response has the expected structure, even on success.
        return {
            title: procedure.title || "Untitled Experiment",
            steps: procedure.steps || ["The AI did not provide any steps."],
            requiredChemicals: procedure.requiredChemicals || [],
            requiredApparatus: procedure.requiredApparatus || [],
        };
    } catch (error: any) {
        console.error("Error getting AI-generated procedure:", error);
        const errorMessage = error.message || "An unknown error occurred. Please check the server console for details.";
        // Return a complete, valid error object to prevent UI crashes.
        return {
            title: "Error Generating Procedure",
            steps: [errorMessage],
            requiredChemicals: [],
            requiredApparatus: [],
        }
    }
}
