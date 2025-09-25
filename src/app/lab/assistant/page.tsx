
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bot, Check, ChevronsRight, FlaskConical, Loader2, List, Sparkles } from 'lucide-react';
import type { GenerateExperimentStepsOutput } from '@/ai/flows/ai-guided-experiment-steps';
import { getExperimentSteps } from '@/app/actions';
import { useExperiment } from '@/hooks/use-experiment';

export default function ProcedurePage() {
  const [goal, setGoal] = useState('Titration of HCl with NaOH');
  const [procedure, setProcedure] = useState<GenerateExperimentStepsOutput | null>(null);
  const [isGenerating, startGenerationTransition] = useTransition();
  const { handleAddChemicalToInventory, handleAddEquipmentToInventory } = useExperiment();

  const handleGenerate = () => {
    startGenerationTransition(async () => {
      const result = await getExperimentSteps(goal);
      setProcedure(result);
    });
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Procedure Generator</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Describe your experiment goal, and the AI will generate a step-by-step procedure.
          </p>
        </header>
        
        <div className="flex flex-col md:flex-row gap-2 mb-8 max-w-2xl mx-auto">
          <Input 
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="e.g., 'Titrate a strong acid with a strong base'"
            onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
          />
          <Button onClick={handleGenerate} disabled={isGenerating}>
            {isGenerating ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="mr-2 h-4 w-4" />
            )}
            Generate
          </Button>
        </div>

        {isGenerating && (
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="mt-2 text-muted-foreground">Generating procedure...</p>
          </div>
        )}

        {procedure && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>{procedure.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {procedure.title !== 'Error Generating Procedure' ? (
                <>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="h-5 w-5" />Required Apparatus</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {procedure.requiredApparatus.map((item, index) => <li key={index}>{item.name} (x{item.quantity})</li>)}
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><ChevronsRight className="h-5 w-5" />Required Chemicals</h3>
                    <ul className="list-disc list-inside text-muted-foreground space-y-1">
                      {procedure.requiredChemicals.map((item, index) => <li key={index}>{item.name} - {item.amount}</li>)}
                    </ul>
                  </div>
                </>
              ) : null}
              <div>
                <h3 className="font-semibold flex items-center gap-2 mb-2"><List className="h-5 w-5" />Procedure</h3>
                <ol className="list-decimal list-inside space-y-3">
                  {procedure.steps.map((step, index) => (
                    <li key={index} className="pl-2">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </CardContent>
            {procedure.title !== 'Error' && (
              <CardFooter>
                  <p className="text-xs text-muted-foreground">Note: This is an AI-generated procedure. Always follow safety guidelines.</p>
              </CardFooter>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

