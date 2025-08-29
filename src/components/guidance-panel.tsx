'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LabNotebook } from './lab-notebook';
import { Bot, Lightbulb, TestTube, Loader2 } from 'lucide-react';
import type { AiSuggestion, LabLog } from '@/lib/experiment';

type GuidancePanelProps = {
  logs: LabLog[];
  onGetSuggestion: () => void;
  suggestion: AiSuggestion;
  isSuggestionLoading: boolean;
};

export function GuidancePanel({
  logs,
  onGetSuggestion,
  suggestion,
  isSuggestionLoading,
}: GuidancePanelProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bot className="h-6 w-6" />
          AI Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Button onClick={onGetSuggestion} disabled={isSuggestionLoading} className="w-full">
          {isSuggestionLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Lightbulb className="mr-2 h-4 w-4" />
          )}
          Suggest Next Step
        </Button>
        <div className="mt-4 space-y-3">
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
      </CardContent>
    </Card>
  );
}
