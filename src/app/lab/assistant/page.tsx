
'use client';

import { useState, useTransition } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Bot, FlaskConical, Beaker, List, Loader2, TestTube, AlertTriangle } from 'lucide-react';
import { getExperimentSteps } from '@/app/actions';
import type { GenerateExperimentStepsOutput } from '@/ai/flows/ai-guided-experiment-steps';
import { LabNotebook } from '@/components/lab-notebook';
import { useInventory } from '@/hooks/use-inventory'; // Using new lightweight hook
import { Textarea } from '@/components/ui/textarea';

export default function ProcedurePage() {
  const [goal, setGoal] = useState('Titration of HCl with NaOH');
  const [procedure, setProcedure] = useState<GenerateExperimentStepsOutput | null>(null);
  const [isGenerating, startGenerationTransition] = useTransition();
  const { labLogs, handleAddCustomLog } = useInventory(); // Using new lightweight hook
  const [customNote, setCustomNote] = useState('');

  const handleGenerate = () => {
    if (!goal) return;
    startGenerationTransition(async () => {
      const result = await getExperimentSteps(goal);
      setProcedure(result);
    });
  };

  const handleAddNote = () => {
    if (customNote.trim()) {
      handleAddCustomLog(customNote);
      setCustomNote('');
    }
  };

  const hasError = procedure?.title === 'Error Generating Procedure';
  
  return (
    <div className="min-h-screen bg-transparent text-foreground p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-glow">AI Assistant & Notebook</h1>
          <p className="text-muted-foreground mt-2 text-md md:text-lg">
            Generate experimental procedures and keep a log of your work.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column: Procedure Generator */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-2">
              <Input
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g., 'Titrate a strong acid with a strong base'"
                className="flex-1"
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <Button onClick={handleGenerate} disabled={isGenerating} className="w-full sm:w-auto">
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  'Generate Procedure'
                )}
              </Button>
            </div>
            
            {isGenerating && (
              <Card className="shadow-lg text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-center"><Loader2 className="h-6 w-6 animate-spin"/> Contacting AI Assistant</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                          The AI assistant is thinking...
                        </CardDescription>
                    </CardContent>
                </Card>
            )}

            {procedure && !isGenerating && (
              <Card className={`shadow-lg fade-in ${hasError ? 'border-destructive' : ''}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    {hasError && <AlertTriangle className="h-6 w-6 text-destructive" />}
                    {!hasError && <Bot className="h-6 w-6" />}
                    {procedure.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {!hasError && (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-2"><Beaker className="h-5 w-5" />Apparatus</h3>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {procedure.requiredApparatus?.map((item, index) => (
                              <li key={index}>{item.quantity} x {item.name}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h3 className="font-semibold flex items-center gap-2 mb-2"><FlaskConical className="h-5 w-5" />Chemicals</h3>
                          <ul className="list-disc list-inside text-muted-foreground">
                            {procedure.requiredChemicals?.map((item, index) => (
                              <li key={index}>{item.amount} {item.name}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </>
                  )}
                  
                  <div>
                    <h3 className="font-semibold flex items-center gap-2 mb-2"><List className="h-5 w-5" />Procedure</h3>
                    <ol className="list-decimal list-inside space-y-3">
                      {procedure.steps?.map((step, index) => (
                        <li key={index} className="pl-2">
                          {step}
                        </li>
                      ))}
                    </ol>
                  </div>

                </CardContent>
              </Card>
            )}

            {!procedure && !isGenerating && (
                <Card className="shadow-lg text-center">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 justify-center"><Bot className="h-6 w-6"/> Waiting for instructions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <CardDescription>
                        Enter a description of the experiment you want to perform and click &quot;Generate Procedure&quot; to get started.
                        </CardDescription>
                    </CardContent>
                </Card>
            )}
          </div>

          {/* Right Column: Lab Notebook */}
          <div className="flex flex-col gap-4">
            <LabNotebook logs={labLogs} />
            <div className="flex flex-col gap-2">
              <Textarea
                value={customNote}
                onChange={(e) => setCustomNote(e.target.value)}
                placeholder="Add a custom note to your lab log..."
                className="flex-1"
              />
              <Button onClick={handleAddNote}>Add Note</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
