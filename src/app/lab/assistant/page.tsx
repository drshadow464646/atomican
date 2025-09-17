
'use client';

import { useState, useCallback, useTransition } from 'react';
import { GuidancePanel } from '@/components/guidance-panel';
import {
  type AiSuggestion,
} from '@/lib/experiment';
import { getSuggestion } from '@/app/actions';
import { useExperiment } from '@/hooks/use-experiment';
import { Card, CardContent } from '@/components/ui/card';

export default function AssistantPage() {
  const { 
    experimentState, 
    labLogs,
    handleAddCustomLog,
  } = useExperiment();

  const [aiSuggestion, setAiSuggestion] = useState<AiSuggestion>(null);
  const [isSuggestionLoading, startSuggestionTransition] = useTransition();

  const handleGetSuggestion = useCallback(() => {
    startSuggestionTransition(async () => {
      const studentActions = labLogs.map(log => log.text).join('\n');
      const currentStepDescription = labLogs.length > 0 ? labLogs[labLogs.length - 1].text : "Experiment just started.";
      const suggestion = await getSuggestion(currentStepDescription, studentActions, experimentState);
      setAiSuggestion(suggestion);
    });
  }, [labLogs, experimentState]);

  return (
    <div className="h-full flex items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl h-full">
         <GuidancePanel
            logs={labLogs}
            onGetSuggestion={handleGetSuggestion}
            suggestion={aiSuggestion}
            isSuggestionLoading={isSuggestionLoading}
            isCollapsed={false}
            onAddCustomLog={handleAddCustomLog}
          />
      </div>
    </div>
  );
}
