'use server';

import { getExperimentStepSuggestion, ExperimentStepSuggestionInput } from "@/ai/flows/ai-guided-experiment-steps";
import type { ExperimentState } from "@/lib/experiment";

function formatExperimentData(state: ExperimentState): string {
    let data = "Current State:\n";
    if (state.beaker) {
        data += `- Beaker contains: ${state.beaker.solutions.map(s => `${s.volume}ml of ${s.chemical.name}`).join(', ')}\n`;
        if (state.beaker.indicator) {
            data += `- Indicator: ${state.beaker.indicator.name}\n`;
        }
    } else {
        data += "- Beaker is empty.\n";
    }

    if (state.burette) {
        data += `- Burette contains: ${state.burette.volume}ml of ${state.burette.chemical.name}\n`;
        data += `- Volume of titrant added: ${state.volumeAdded.toFixed(2)}ml\n`;
    } else {
        data += "- Burette is not set up.\n";
    }

    if (state.ph !== null) {
        data += `- Current pH: ${state.ph.toFixed(2)}\n`;
    }
    
    data += `- Solution color: ${state.color}\n`;

    return data;
}

export async function getSuggestion(currentStep: string, studentActions: string, state: ExperimentState) {
    const input: ExperimentStepSuggestionInput = {
        currentStep,
        studentActions,
        experimentData: formatExperimentData(state)
    };

    try {
        const suggestion = await getExperimentStepSuggestion(input);
        return suggestion;
    } catch (error) {
        console.error("Error getting AI suggestion:", error);
        return {
            nextStepSuggestion: "An error occurred while fetching the next step. Please check your setup and try again.",
            hint: "Ensure you have a stable internet connection and that the experiment state is valid.",
            rationale: `Error: ${error instanceof Error ? error.message : "Unknown error"}`,
        }
    }
}
