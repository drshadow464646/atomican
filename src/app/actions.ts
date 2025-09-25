'use server';

import { generateExperimentSteps, GenerateExperimentStepsInput, GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
    const input: GenerateExperimentStepsInput = {
        goal,
    };

    try {
        const procedure = await generateExperimentSteps(input);
        return procedure;
    } catch (error: any) {
        console.error("Error getting AI-generated procedure:", error);
        const errorMessage = error.message || "An unknown error occurred. Please check the server console for details.";
        return {
            title: "Error Generating Procedure",
            steps: [errorMessage],
            requiredChemicals: [],
            requiredApparatus: [],
        }
    }
}
