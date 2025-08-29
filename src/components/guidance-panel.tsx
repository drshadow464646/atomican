
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LabNotebook } from './lab-notebook';
import { Bot, Lightbulb, TestTube, Loader2, Pen, Sparkles } from 'lucide-react';
import type { AiSuggestion, LabLog } from '@/lib/experiment';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { cn } from '@/lib/utils';
import { Separator } from './ui/separator';

type GuidancePanelProps = {
  logs: LabLog[];
  onGetSuggestion: () => void;
  suggestion: AiSuggestion;
  isSuggestionLoading: boolean;
  isCollapsed: boolean;
  onAddCustomLog: (note: string) => void;
};

export function GuidancePanel({
  logs,
  onGetSuggestion,
  suggestion,
  isSuggestionLoading,
  isCollapsed,
  onAddCustomLog,
}: GuidancePanelProps) {
  const [customNote, setCustomNote] = useState('');

  const handleAddNote = () => {
    onAddCustomLog(customNote);
    setCustomNote('');
  };

  if (isCollapsed) {
    return (
       <div className="h-full flex items-center justify-center">
        <Bot className="h-8 w-8 text-muted-foreground" />
       </div>
    );
  }

  return (
    <Card className="h-full flex flex-col border-0 rounded-none">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bot className="h-5 w-5" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto pt-0">
        <Button onClick={onGetSuggestion} disabled={isSuggestionLoading}>
          {isSuggestionLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="mr-2 h-4 w-4" />
          )}
          Suggest Next Step
        </Button>
        <div className="space-y-3">
          {suggestion ? (
            <>
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertTitle>Suggestion</AlertTitle>
                <AlertDescription>{suggestion.nextStepSuggestion}</AlertDescription>
              </Alert>
              {suggestion.hint && (
                <Alert variant="default" className="bg-accent/20 border-accent/30">
                  <Lightbulb className="h-4 w-4 text-accent-foreground" />
                  <AlertTitle className='text-accent-foreground'>Hint</AlertTitle>
                  <AlertDescription className='text-accent-foreground/80'>{suggestion.hint}</AlertDescription>
                </Alert>
              )}
               {suggestion.rationale && (
                <Alert variant="default" className="border-blue-500/50 text-blue-900 dark:text-blue-300">
                  <Bot className="h-4 w-4" />
                  <AlertTitle>Rationale</AlertTitle>
                  <AlertDescription>{suggestion.rationale}</AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4 rounded-lg bg-muted">
              Click the button to get an AI-powered suggestion for your next step.
            </div>
          )}
        </div>
        
        <Separator className="my-2"/>
        
        <div className="flex-1 flex flex-col">
          <LabNotebook logs={logs} />
        </div>
        
         <div className="mt-auto pt-4 border-t">
            <h3 className="mb-2 font-medium">Add a Note</h3>
            <Textarea 
              placeholder="Record your observations..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleAddNote} className="w-full" variant="secondary">
              <Pen className="mr-2 h-4 w-4" />
              Add to Notebook
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
