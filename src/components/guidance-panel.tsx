'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LabNotebook } from './lab-notebook';
import { Bot, Lightbulb, TestTube, Loader2, PanelLeftClose, PanelRightClose, Pen } from 'lucide-react';
import type { AiSuggestion, LabLog } from '@/lib/experiment';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

type GuidancePanelProps = {
  logs: LabLog[];
  onGetSuggestion: () => void;
  suggestion: AiSuggestion;
  isSuggestionLoading: boolean;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onAddCustomLog: (note: string) => void;
};

export function GuidancePanel({
  logs,
  onGetSuggestion,
  suggestion,
  isSuggestionLoading,
  isCollapsed,
  onToggleCollapse,
  onAddCustomLog,
}: GuidancePanelProps) {
  const [customNote, setCustomNote] = useState('');

  const handleAddNote = () => {
    onAddCustomLog(customNote);
    setCustomNote('');
  };

  if (isCollapsed) {
    return (
       <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={onToggleCollapse} className="h-full w-full border rounded-lg">
              <PanelLeftClose />
              <span className="sr-only">Open Guidance</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            <p>Open Guidance</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Assistant
        </CardTitle>
        <Button variant="ghost" size="icon" onClick={onToggleCollapse}>
          <PanelRightClose />
           <span className="sr-only">Collapse Guidance</span>
        </Button>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-4 overflow-y-auto">
        <Button onClick={onGetSuggestion} disabled={isSuggestionLoading} className="w-full">
          {isSuggestionLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Suggest Next Step
        </Button>
        <div className="space-y-3">
          {suggestion ? (
            <>
              <Alert>
                <TestTube className="h-4 w-4" />
                <AlertTitle>Next Step</AlertTitle>
                <AlertDescription>{suggestion.nextStepSuggestion}</AlertDescription>
              </Alert>
              {suggestion.hint && (
                <Alert variant="default" className="bg-accent/20">
                  <Lightbulb className="h-4 w-4" />
                  <AlertTitle>Hint</AlertTitle>
                  <AlertDescription>{suggestion.hint}</AlertDescription>
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
            <div className="text-center text-sm text-muted-foreground p-4">
              Click the button above to get a suggestion for your next step.
            </div>
          )}
        </div>
        <LabNotebook logs={logs} />
         <div className="mt-auto pt-4 border-t">
            <h3 className="mb-2 text-lg font-semibold">Add Custom Note</h3>
            <Textarea 
              placeholder="Record your observations..."
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              className="mb-2"
            />
            <Button onClick={handleAddNote} className="w-full">
              <Pen className="mr-2 h-4 w-4" />
              Add Note
            </Button>
        </div>
      </CardContent>
    </Card>
  );
}
