'use server';

import { generateExperimentSteps, GenerateExperimentStepsInput, GenerateExperimentStepsOutput } from "@/ai/flows/ai-guided-experiment-steps";

export async function getExperimentSteps(goal: string): Promise<GenerateExperimentStepsOutput> {
    const input: GenerateExperimentStepsInput = {
        goal,
    };

    try {
        const procedure = await generateExperimentSteps(input);
        return procedure;
    } catch (error) {
        console.error("Error getting AI-generated procedure:", error);
        return {
            title: "Error",
            steps: ["An error occurred while generating the procedure. Please check the console for more details and try again."],
            requiredChemicals: [],
            requiredApparatus: [],
        }
    }
}
